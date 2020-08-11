package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"sort"
	"strings"

	notebooksv1 "github.com/StatCan/jupyter-apis/notebooks/api/v1"
	"github.com/andanhm/go-prettytime"
	"github.com/gorilla/mux"
	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/resource"
	v1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

const DefaultServiceAccountName string = "default-editor"
const SharedMemoryVolumeName string = "dshm"
const SharedMemoryVolumePath string = "/dev/shm"
const WorkspacePath string = "/home/jovyan"

type volumetype string

const (
	VolumeTypeExisting volumetype = "Existing"
	VolumeTypeNew      volumetype = "New"
)

type volumerequest struct {
	Type          volumetype             `json:"type"`
	Name          string                 `json:"name"`
	TemplatedName string                 `json:"templatedName"`
	Class         string                 `json:"class"`
	ExtraFields   map[string]interface{} `json:"extraFields"`
	Path          string                 `json:"path"`
}

type newnotebookrequest struct {
	Name             string            `json:"name"`
	Namespace        string            `json:"namespace"`
	Image            string            `json:"image"`
	CustomImage      string            `json:"customImage"`
	CustomImageCheck bool              `json:"customImageCheck"`
	CPU              resource.Quantity `json:"cpu"`
	Memory           resource.Quantity `json:"memory"`
	// TODO: GPU
	NoWorkspace        bool            `json:"noWorkspace"`
	Workspace          volumerequest   `json:"workspace"`
	DataVolumes        []volumerequest `json:"datavols"`
	EnableSharedMemory bool            `json:"shm"`
	Configurations     []string        `json:"configurations"`
}

type notebookresponse struct {
	Age        string            `json:"age"`
	CPU        resource.Quantity `json:"cpu"`
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

type EventsByTimestamp []corev1.Event

func (e EventsByTimestamp) Len() int {
	return len(e)
}

func (e EventsByTimestamp) Less(a, b int) bool {
	return e[b].CreationTimestamp.Before(&e[a].CreationTimestamp)
}

func (e EventsByTimestamp) Swap(a, b int) {
	e[a], e[b] = e[b], e[a]
}

func processStatus(notebook notebooksv1.Notebook, events []corev1.Event) (Status, string) {
	// Notebook is being deleted
	if notebook.DeletionTimestamp != nil {
		return StatusWaiting, "Deleting Notebook Server"
	}

	// Return Container State if it's available
	if notebook.Status.ContainerState.Running != nil {
		return StatusRunning, "Running"
	} else if notebook.Status.ContainerState.Terminated != nil {
		return StatusError, "The Pod has Terminated"
	} else {
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

	return "", ""
}

func processGPU(notebook notebooksv1.Notebook) (resource.Quantity, GPUVendor) {
	if limit, ok := notebook.Spec.Template.Spec.Containers[0].Resources.Limits["nvidia.com/gpu"]; ok {
		return limit, GPUVendorNvidia
	} else if limit, ok := notebook.Spec.Template.Spec.Containers[0].Resources.Limits["amd.com/gpu"]; ok {
		return limit, GPUVendorAMD
	}

	return resource.Quantity{}, ""
}

func (s *server) GetNotebooks(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	namespace := vars["namespace"]

	log.Printf("loading notebooks for %q", namespace)

	notebooks, err := s.clientsets.notebooks.V1().Notebooks(namespace).List(r.Context())
	if err != nil {
		s.error(w, r, err)
		return
	}

	resp := notebooksresponse{
		APIResponse: APIResponse{
			Success: true,
		},
		Notebooks: make([]notebookresponse, 0),
	}

	for _, notebook := range notebooks.Items {
		// Load events
		allevents, err := s.clientsets.kubernetes.CoreV1().Events(notebook.Namespace).List(r.Context(), v1.ListOptions{
			FieldSelector: fmt.Sprintf("involvedObject.kind=Notebook,involvedObject.name=%s", notebook.Name),
		})
		if err != nil {
			log.Printf("failed to load events for %s/%s: %v", notebook.Namespace, notebook.Name, err)
		}

		// Filter past events
		events := make([]corev1.Event, 0)
		for _, event := range allevents.Items {
			if !event.CreationTimestamp.Before(&notebook.CreationTimestamp) {
				events = append(events, event)
			}
		}
		sort.Sort(EventsByTimestamp(events))

		imageparts := strings.SplitAfter(notebook.Spec.Template.Spec.Containers[0].Image, "/")

		// Process current status + reason
		status, reason := processStatus(notebook, events)

		// Process GPU information
		gpu, gpuVendor := processGPU(notebook)

		volumes := []string{}
		for _, vol := range notebook.Spec.Template.Spec.Volumes {
			volumes = append(volumes, vol.Name)
		}

		resp.Notebooks = append(resp.Notebooks, notebookresponse{
			Age:        prettytime.Format(notebook.CreationTimestamp.Time),
			Name:       notebook.Name,
			Namespace:  notebook.Namespace,
			Image:      notebook.Spec.Template.Spec.Containers[0].Image,
			ShortImage: imageparts[len(imageparts)-1],
			CPU:        notebook.Spec.Template.Spec.Containers[0].Resources.Requests[corev1.ResourceCPU],
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

func (s *server) handleVolume(req volumerequest, notebook *notebooksv1.Notebook) error {
	if req.Type == VolumeTypeExisting {
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
	} else if req.Type == VolumeTypeNew {
		return fmt.Errorf("unsupported volume type %q", req.Type)
	} else {
		return fmt.Errorf("unknown volume type %q", req.Type)
	}

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

	// Setup the notebook
	// TODO: Work with default CPU/memory limits from config
	// TODO: Add GPU support
	notebook := notebooksv1.Notebook{
		ObjectMeta: v1.ObjectMeta{
			Name:      req.Name,
			Namespace: namespace,
		},
		Spec: notebooksv1.NotebookSpec{
			Template: notebooksv1.NotebookTemplateSpec{
				Spec: corev1.PodSpec{
					ServiceAccountName: DefaultServiceAccountName,
					Containers: []corev1.Container{
						corev1.Container{
							Name:  req.Name,
							Image: image,
							Resources: corev1.ResourceRequirements{
								Limits: corev1.ResourceList{
									corev1.ResourceCPU:    req.CPU,
									corev1.ResourceMemory: req.Memory,
								},
								Requests: corev1.ResourceList{
									corev1.ResourceCPU:    req.CPU,
									corev1.ResourceMemory: req.Memory,
								},
							},
						},
					},
				},
			},
		},
	}

	// Add workspace volume
	if !req.NoWorkspace {
		req.Workspace.Path = WorkspacePath
		err = s.handleVolume(req.Workspace, &notebook)
		if err != nil {
			s.error(w, r, err)
			return
		}
	}

	for _, volreq := range req.DataVolumes {
		err = s.handleVolume(volreq, &notebook)
		if err != nil {
			s.error(w, r, err)
			return
		}
	}

	// Add shared memory, if enabled
	if req.EnableSharedMemory {
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

	log.Printf("creating notebook %q for %q", notebook.ObjectMeta.Name, namespace)

	// Submit the notebook to the API server
	_, err = s.clientsets.notebooks.V1().Notebooks(namespace).Create(r.Context(), &notebook)
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
	err := s.clientsets.notebooks.V1().Notebooks(namespace).Delete(r.Context(), notebook, &v1.DeleteOptions{
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
