package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"regexp"
	"sort"
	"strings"

	kubeflowv1 "github.com/StatCan/kubeflow-controller/pkg/apis/kubeflowcontroller/v1"
	"github.com/andanhm/go-prettytime"
	"github.com/gorilla/mux"
	"gopkg.in/inf.v0"
	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/resource"
	v1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/labels"
)

const DefaultServiceAccountName string = "default-editor"
const SharedMemoryVolumeName string = "dshm"
const SharedMemoryVolumePath string = "/dev/shm"
const EnvKfLanguage string = "KF_LANG"

type volumetype string

const (
	VolumeTypeExisting volumetype = "Existing"
	VolumeTypeNew      volumetype = "New"
)

type volumerequest struct {
	Type          volumetype                        `json:"type"`
	Name          string                            `json:"name"`
	TemplatedName string                            `json:"templatedName"`
	Class         string                            `json:"class"`
	ExtraFields   map[string]interface{}            `json:"extraFields"`
	Path          string                            `json:"path"`
	Size          resource.Quantity                 `json:"size"`
	Mode          corev1.PersistentVolumeAccessMode `json:"mode"`
}

type gpurequest struct {
	Quantity string `json:"num"`
	Vendor   string `json:"vendor"`
}

type newnotebookrequest struct {
	Name               string            `json:"name"`
	Namespace          string            `json:"namespace"`
	Image              string            `json:"image"`
	CustomImage        string            `json:"customImage"`
	CustomImageCheck   bool              `json:"customImageCheck"`
	CPU                resource.Quantity `json:"cpu"`
	Memory             resource.Quantity `json:"memory"`
	GPUs               gpurequest        `json:"gpus"`
	NoWorkspace        bool              `json:"noWorkspace"`
	Workspace          volumerequest     `json:"workspace"`
	DataVolumes        []volumerequest   `json:"datavols"`
	EnableSharedMemory bool              `json:"shm"`
	Configurations     []string          `json:"configurations"`
	Language           string            `json:"language"`
}

type notebookresponse struct {
	Age        string            `json:"age"`
	CPU        *inf.Dec          `json:"cpu"`
	GPU        resource.Quantity `json:"gpu"`
	GPUVendor  GPUVendor         `json:"gpuvendor"`
	Image      string            `json:"image"`
	Memory     resource.Quantity `json:"memory"`
	Name       string            `json:"name"`
	Namespace  string            `json:"namespace"`
	Reason     string            `json:"reason"`
	ShortImage string            `json:"shortImage"`
	Status     Status            `json:"status"`
	Volumes    []string          `json:"volumes"`
}

type notebooksresponse struct {
	APIResponse
	Notebooks []notebookresponse `json:"notebooks"`
}

//
// EVENT_TYPE_NORMAL = "Normal"
// EVENT_TYPE_WARNING = "Warning"
//
// STATUS_ERROR = "error"
// STATUS_WARNING = "warning"
// STATUS_RUNNING = "running"
// STATUS_WAITING = "waiting"
//

type Status string
type GPUVendor string

const (
	StatusWaiting Status = "waiting"
	StatusRunning Status = "running"
	StatusError   Status = "error"
	StatusWarning Status = "warning"

	GPUVendorNvidia GPUVendor = "nvidia"
	GPUVendorAMD    GPUVendor = "amd"
)

func processStatus(notebook *kubeflowv1.Notebook, events []*corev1.Event) (Status, string) {
	// Notebook is being deleted
	if notebook.DeletionTimestamp != nil {
		return StatusWaiting, "Deleting Notebook Server"
	}

	// Return Container State if it's available
	if notebook.Status.ContainerState.Running != nil && notebook.Status.ReadyReplicas != 0 {
		return StatusRunning, "Running"
	}
	if notebook.Status.ContainerState.Terminated != nil {
		return StatusError, "The Pod has Terminated"
	}
	status, reason := StatusWarning, ""

	if notebook.Status.ContainerState.Waiting != nil {
		status, reason = StatusWaiting, notebook.Status.ContainerState.Waiting.Reason
		if notebook.Status.ContainerState.Waiting.Reason == "ImagePullBackoff" {
			status, reason = StatusError, notebook.Status.ContainerState.Waiting.Reason
		}
	} else {
		status, reason = StatusWaiting, "Scheduling the Pod"
	}

	// Process events
	for _, event := range events {
		if event.Type == corev1.EventTypeWarning {
			return StatusWarning, event.Message
		}
	}

	return status, reason

}

func processGPU(notebook *kubeflowv1.Notebook) (resource.Quantity, GPUVendor) {
	if limit, ok := notebook.Spec.Template.Spec.Containers[0].Resources.Limits["nvidia.com/gpu"]; ok {
		return limit, GPUVendorNvidia
	}
	if limit, ok := notebook.Spec.Template.Spec.Containers[0].Resources.Limits["amd.com/gpu"]; ok {
		return limit, GPUVendorAMD
	}
	return resource.Quantity{}, ""
}

func (s *server) GetNotebooks(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	namespace := vars["namespace"]

	log.Printf("loading notebooks for %q", namespace)

	notebooks, err := s.listers.notebooks.Notebooks(namespace).List(labels.Everything())
	if err != nil {
		s.error(w, r, err)
		return
	}

	sort.Sort(notebooksByName(notebooks))

	resp := notebooksresponse{
		APIResponse: APIResponse{
			Success: true,
		},
		Notebooks: make([]notebookresponse, 0),
	}

	for _, notebook := range notebooks {
		// Load events
		allevents, err := s.listers.events.Events(notebook.Namespace).List(labels.Everything())
		if err != nil {
			log.Printf("failed to load events for %s/%s: %v", notebook.Namespace, notebook.Name, err)
		}

		// Filter past events
		events := make([]*corev1.Event, 0)
		for _, event := range allevents {
			if event.InvolvedObject.Kind != "Notebook" || event.InvolvedObject.Name != notebook.Name || event.CreationTimestamp.Before(&notebook.CreationTimestamp) {
				continue
			}

			events = append(events, event)
		}
		sort.Sort(eventsByTimestamp(events))

		imageparts := strings.SplitAfter(notebook.Spec.Template.Spec.Containers[0].Image, "/")

		// Process current status + reason
		status, reason := processStatus(notebook, events)

		// Process GPU information
		gpu, gpuVendor := processGPU(notebook)

		volumes := []string{}
		for _, vol := range notebook.Spec.Template.Spec.Volumes {
			volumes = append(volumes, vol.Name)
		}

		cpulimit := resource.Zero.AsDec()
		if req, ok := notebook.Spec.Template.Spec.Containers[0].Resources.Requests[corev1.ResourceCPU]; ok {
			cpulimit = req.AsDec()
		}

		resp.Notebooks = append(resp.Notebooks, notebookresponse{
			Age:        prettytime.Format(notebook.CreationTimestamp.Time),
			Name:       notebook.Name,
			Namespace:  notebook.Namespace,
			Image:      notebook.Spec.Template.Spec.Containers[0].Image,
			ShortImage: imageparts[len(imageparts)-1],
			CPU:        cpulimit,
			Memory:     notebook.Spec.Template.Spec.Containers[0].Resources.Requests[corev1.ResourceMemory],
			Reason:     reason,
			Status:     status,
			Volumes:    volumes,
			GPU:        gpu,
			GPUVendor:  gpuVendor,
		})
	}

	s.respond(w, r, resp)
}

func (s *server) handleVolume(ctx context.Context, req volumerequest, notebook *kubeflowv1.Notebook) error {
	var pvc = corev1.PersistentVolumeClaim{}
	if req.Type == VolumeTypeNew {
		if _, ok := notebook.GetObjectMeta().GetLabels()["notebook.statcan.gc.ca/protected-b"]; ok {
			pvc = corev1.PersistentVolumeClaim{
				ObjectMeta: v1.ObjectMeta{
					Name:      req.Name,
					Namespace: notebook.Namespace,
					Labels:    map[string]string{"data.statcan.gc.ca/classification": "protected-b"},
				},
				Spec: corev1.PersistentVolumeClaimSpec{
					AccessModes: []corev1.PersistentVolumeAccessMode{req.Mode},
					Resources: corev1.ResourceRequirements{
						Requests: corev1.ResourceList{
							corev1.ResourceStorage: req.Size,
						},
					},
				},
			}
		} else {
			// Create the PVC
			pvc = corev1.PersistentVolumeClaim{
				ObjectMeta: v1.ObjectMeta{
					Name:      req.Name,
					Namespace: notebook.Namespace,
				},
				Spec: corev1.PersistentVolumeClaimSpec{
					AccessModes: []corev1.PersistentVolumeAccessMode{req.Mode},
					Resources: corev1.ResourceRequirements{
						Requests: corev1.ResourceList{
							corev1.ResourceStorage: req.Size,
						},
					},
				},
			}
		}
		// Add the storage class, if set and not set to an "empty" value
		if req.Class != "" && req.Class != "{none}" && req.Class != "{empty}" {
			pvc.Spec.StorageClassName = &req.Class
		}

		if _, err := s.clientsets.kubernetes.CoreV1().PersistentVolumeClaims(notebook.Namespace).Create(ctx, &pvc, v1.CreateOptions{}); err != nil {
			return err
		}
	} else if req.Type != VolumeTypeExisting {
		return fmt.Errorf("unknown volume type %q", req.Type)
	}

	// Add the volume and volume mount ot the notebook spec
	notebook.Spec.Template.Spec.Volumes = append(notebook.Spec.Template.Spec.Volumes, corev1.Volume{
		Name: req.Name,
		VolumeSource: corev1.VolumeSource{
			PersistentVolumeClaim: &corev1.PersistentVolumeClaimVolumeSource{
				ClaimName: req.Name,
			},
		},
	})

	notebook.Spec.Template.Spec.Containers[0].VolumeMounts = append(notebook.Spec.Template.Spec.Containers[0].VolumeMounts, corev1.VolumeMount{
		Name:      req.Name,
		MountPath: req.Path,
	})

	return nil
}

func (s *server) NewNotebook(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	namespace := vars["namespace"]

	// Read the incoming notebook
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		s.error(w, r, err)
		return
	}
	defer r.Body.Close()

	var req newnotebookrequest
	err = json.Unmarshal(body, &req)
	if err != nil {
		s.error(w, r, err)
		return
	}

	image := req.Image
	if req.CustomImageCheck {
		image = req.CustomImage
	}
	if s.Config.SpawnerFormDefaults.Image.ReadOnly {
		image = s.Config.SpawnerFormDefaults.Image.Value
	}

	// Setup the notebook
	// TODO: Work with default CPU/memory limits from config
	notebook := kubeflowv1.Notebook{
		ObjectMeta: v1.ObjectMeta{
			Name:      req.Name,
			Namespace: namespace,
			Labels:    make(map[string]string),
		},
		Spec: kubeflowv1.NotebookSpec{
			Template: kubeflowv1.NotebookTemplateSpec{
				Spec: corev1.PodSpec{
					ServiceAccountName: DefaultServiceAccountName,
					Containers: []corev1.Container{
						{
							Name:  req.Name,
							Image: image,
							Resources: corev1.ResourceRequirements{
								Requests: corev1.ResourceList{},
								Limits:   corev1.ResourceList{},
							},
						},
					},
				},
			},
		},
	}

	// Resources
	if s.Config.SpawnerFormDefaults.CPU.ReadOnly {
		val, err := resource.ParseQuantity(s.Config.SpawnerFormDefaults.CPU.Value)
		if err != nil {
			s.error(w, r, err)
			return
		}

		notebook.Spec.Template.Spec.Containers[0].Resources.Requests[corev1.ResourceCPU] = val
		notebook.Spec.Template.Spec.Containers[0].Resources.Limits[corev1.ResourceCPU] = val
	} else {
		notebook.Spec.Template.Spec.Containers[0].Resources.Requests[corev1.ResourceCPU] = req.CPU
		notebook.Spec.Template.Spec.Containers[0].Resources.Limits[corev1.ResourceCPU] = req.CPU
	}

	if s.Config.SpawnerFormDefaults.Memory.ReadOnly {
		val, err := resource.ParseQuantity(s.Config.SpawnerFormDefaults.Memory.Value)
		if err != nil {
			s.error(w, r, err)
			return
		}

		notebook.Spec.Template.Spec.Containers[0].Resources.Requests[corev1.ResourceMemory] = val
		notebook.Spec.Template.Spec.Containers[0].Resources.Limits[corev1.ResourceMemory] = val
	} else {
		notebook.Spec.Template.Spec.Containers[0].Resources.Requests[corev1.ResourceMemory] = req.Memory
		notebook.Spec.Template.Spec.Containers[0].Resources.Limits[corev1.ResourceMemory] = req.Memory
	}

	// Add workspace volume
	if s.Config.SpawnerFormDefaults.WorkspaceVolume.ReadOnly {
		size, err := resource.ParseQuantity(s.Config.SpawnerFormDefaults.WorkspaceVolume.Value.Size.Value)
		if err != nil {
			s.error(w, r, err)
			return
		}

		workspaceVol := volumerequest{
			Name:  s.Config.SpawnerFormDefaults.WorkspaceVolume.Value.Name.Value,
			Size:  size,
			Path:  s.Config.SpawnerFormDefaults.WorkspaceVolume.Value.MountPath.Value,
			Mode:  corev1.PersistentVolumeAccessMode(s.Config.SpawnerFormDefaults.WorkspaceVolume.Value.AccessModes.Value),
			Class: s.Config.SpawnerFormDefaults.WorkspaceVolume.Value.Class.Value,
		}
		err = s.handleVolume(r.Context(), workspaceVol, &notebook)
		if err != nil {
			s.error(w, r, err)
			return
		}
	} else if !req.NoWorkspace {
		req.Workspace.Path = s.Config.SpawnerFormDefaults.WorkspaceVolume.Value.MountPath.Value
		err = s.handleVolume(r.Context(), req.Workspace, &notebook)
		if err != nil {
			s.error(w, r, err)
			return
		}
	}

	if s.Config.SpawnerFormDefaults.DataVolumes.ReadOnly {
		for _, volreq := range s.Config.SpawnerFormDefaults.DataVolumes.Values {
			size, err := resource.ParseQuantity(s.Config.SpawnerFormDefaults.WorkspaceVolume.Value.Size.Value)
			if err != nil {
				s.error(w, r, err)
				return
			}

			vol := volumerequest{
				Name:  volreq.Name.Value,
				Size:  size,
				Path:  volreq.MountPath.Value,
				Mode:  corev1.PersistentVolumeAccessMode(volreq.AccessModes.Value),
				Class: volreq.Class.Value,
			}
			err = s.handleVolume(r.Context(), vol, &notebook)
			if err != nil {
				s.error(w, r, err)
				return
			}
		}
	} else {
		for _, volreq := range req.DataVolumes {
			err = s.handleVolume(r.Context(), volreq, &notebook)
			if err != nil {
				s.error(w, r, err)
				return
			}
		}
	}

	// Add shared memory, if enabled
	if (s.Config.SpawnerFormDefaults.SharedMemory.ReadOnly && s.Config.SpawnerFormDefaults.SharedMemory.Value) || (!s.Config.SpawnerFormDefaults.SharedMemory.ReadOnly && req.EnableSharedMemory) {
		notebook.Spec.Template.Spec.Volumes = append(notebook.Spec.Template.Spec.Volumes, corev1.Volume{
			Name: SharedMemoryVolumeName,
			VolumeSource: corev1.VolumeSource{
				EmptyDir: &corev1.EmptyDirVolumeSource{
					Medium: corev1.StorageMediumMemory,
				},
			},
		})

		notebook.Spec.Template.Spec.Containers[0].VolumeMounts = append(notebook.Spec.Template.Spec.Containers[0].VolumeMounts, corev1.VolumeMount{
			Name:      SharedMemoryVolumeName,
			MountPath: SharedMemoryVolumePath,
		})
	}

	// Add GPU
	if s.Config.SpawnerFormDefaults.GPUs.ReadOnly {
		if s.Config.SpawnerFormDefaults.GPUs.Value.Quantity != "none" {
			qty, err := resource.ParseQuantity(s.Config.SpawnerFormDefaults.GPUs.Value.Quantity)
			if err != nil {
				s.error(w, r, err)
				return
			}

			notebook.Spec.Template.Spec.Containers[0].Resources.Requests[corev1.ResourceName(s.Config.SpawnerFormDefaults.GPUs.Value.Vendor)] = qty
			notebook.Spec.Template.Spec.Containers[0].Resources.Limits[corev1.ResourceName(s.Config.SpawnerFormDefaults.GPUs.Value.Vendor)] = qty
		}
	} else {
		if req.GPUs.Quantity != "none" {
			qty, err := resource.ParseQuantity(req.GPUs.Quantity)
			if err != nil {
				s.error(w, r, err)
				return
			}

			notebook.Spec.Template.Spec.Containers[0].Resources.Requests[corev1.ResourceName(req.GPUs.Vendor)] = qty
			notebook.Spec.Template.Spec.Containers[0].Resources.Limits[corev1.ResourceName(req.GPUs.Vendor)] = qty
		}
	}

	// Add configuration items
	if s.Config.SpawnerFormDefaults.Configurations.ReadOnly {
		for _, config := range s.Config.SpawnerFormDefaults.Configurations.Value {
			notebook.ObjectMeta.Labels[config] = "true"
		}
	} else {
		for _, config := range req.Configurations {
			notebook.ObjectMeta.Labels[config] = "true"
		}
	}

	//Add Language
	//Validate that the language format is valid (language[_territory])
	match, err := regexp.MatchString("^[[:alpha:]]{2}(_[[:alpha:]]{2})?$", req.Language)
	if err != nil || !match {
		var errLanguageFormat = errors.New("Error: the value of KF_LANG environment variable ('" + req.Language + "') is not a valid format (e.g 'en', 'en_US', ...)")
		s.error(w, r, errLanguageFormat)
		return
	}
	notebook.Spec.Template.Spec.Containers[0].Env = append(notebook.Spec.Template.Spec.Containers[0].Env, corev1.EnvVar{
		Name:  EnvKfLanguage,
		Value: req.Language,
	})

	log.Printf("creating notebook %q for %q", notebook.ObjectMeta.Name, namespace)

	// Submit the notebook to the API server
	_, err = s.clientsets.kubeflow.KubeflowV1().Notebooks(namespace).Create(r.Context(), &notebook, v1.CreateOptions{})
	if err != nil {
		s.error(w, r, err)
		return
	}

	s.respond(w, r, APIResponse{
		Success: true,
	})
}

func (s *server) DeleteNotebook(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	namespace := vars["namespace"]
	notebook := vars["notebook"]

	log.Printf("deleting notebook %q for %q", notebook, namespace)

	propagation := v1.DeletePropagationForeground
	err := s.clientsets.kubeflow.KubeflowV1().Notebooks(namespace).Delete(r.Context(), notebook, v1.DeleteOptions{
		PropagationPolicy: &propagation,
	})
	if err != nil {
		s.error(w, r, err)
		return
	}

	s.respond(w, r, APIResponse{
		Success: true,
	})
}
