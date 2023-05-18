package main

import (
	"fmt"
	"log"
	"net/http"
	"sort"

	kf_v1 "github.com/StatCan/kubeflow-apis/apis/kubeflow/v1"
	"github.com/andanhm/go-prettytime"
	"github.com/gorilla/mux"
	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/resource"
	v1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/labels"
)

type pvcresponse struct {
	Name      string                              `json:"name"`
	Namespace string                              `json:"namespace"`
	Status    pvcStatus                           `json:"status"`
	Age       string                              `json:"age"`
	Capacity  resource.Quantity                   `json:"capacity"`
	Modes     []corev1.PersistentVolumeAccessMode `json:"modes"`
	Class     string                              `json:"class"`
	Notebooks []string                            `json:"notebooks"`
	Labels    map[string]string                   `json:"labels"`
}

type pvcsresponse struct {
	APIResponseBase
	PersistentVolumeClaims []pvcresponse `json:"pvcs"`
}

// pvcPhase is the phase of a PVC
type pvcPhase string

// status represents the status of a PVC.
type pvcStatus struct {
	Message string   `json:"message"`
	Phase   pvcPhase `json:"phase"`
	State   string   `json:"state"`
	Key     string   `json:"key"`
}

const (
	PvcPhaseReady         pvcPhase = "ready"
	PvcPhaseWaiting       pvcPhase = "waiting"
	PvcPhaseWarning       pvcPhase = "warning"
	PvcPhaseError         pvcPhase = "error"
	PvcPhaseUninitialized pvcPhase = "uninitialized"
	PvcPhaseUnavailable   pvcPhase = "unavailable"
	PvcPhaseTerminating   pvcPhase = "terminating"
	PvcPhaseStopped       pvcPhase = "stopped"
)

// Set the status of the pvc
func GetPvcStatus(pvc *corev1.PersistentVolumeClaim, allevents []*corev1.Event) pvcStatus {
	// If pvc is being deleted
	if pvc.DeletionTimestamp != nil {
		return pvcStatus{
			Message: "Deleting Volume...",
			Phase:   PvcPhaseTerminating,
			Key:     "pvcDeleting",
		}
	}

	if pvc.Status.Phase == "Bound" {
		return pvcStatus{
			Message: "Bound",
			Phase:   PvcPhaseReady,
			Key:     "pvcBound",
		}
	}

	// The PVC is in Pending state, we check the Events to find out why
	evs := make([]*corev1.Event, 0)
	for _, event := range allevents {
		if event.InvolvedObject.Kind != "PersistentVolumeClaim" || event.InvolvedObject.Name != pvc.Name {
			continue
		}

		evs = append(evs, event)
	}
	sort.Sort(eventsByTimestamp(evs))

	// If there are no events, then the PVC was just created
	if len(evs) == 0 {
		return pvcStatus{
			Message: "Provisioning Volume...",
			Phase:   PvcPhaseWaiting,
			Key:     "pvcProvisioning",
		}
	}

	msg := fmt.Sprintf("Pending: %s", evs[0].Message)
	key := "pvcPending"
	state := evs[0].Reason
	var phase pvcPhase
	if evs[0].Reason == "WaitForFirstConsumer" {
		phase = PvcPhaseUnavailable
		msg = "Pending: This volume will be bound when its first consumer" +
			" is created. E.g., when you first browse its contents, or" +
			" attach it to a notebook server"
		key = "pvcPendingUnavailable"
	} else if evs[0].Reason == "Provisioning" {
		phase = PvcPhaseWaiting
	} else if evs[0].Reason == "FailedBinding" {
		phase = PvcPhaseWarning
	} else if evs[0].Type == "Warning" {
		phase = PvcPhaseWarning
	} else if evs[0].Type == "Normal" {
		phase = PvcPhaseReady
	}

	return pvcStatus{
		Message: msg,
		Phase:   phase,
		State:   state,
		Key:     key,
	}
}

func Contains(s []string, e string) bool {
	for _, a := range s {
		if a == e {
			return true
		}
	}
	return false
}

func GetNotebookPvcs(nb *kf_v1.Notebook) []string {
	pvcs := make([]string, 0)
	if len(nb.Spec.Template.Spec.Volumes) == 0 {
		return pvcs
	}
	vols := nb.Spec.Template.Spec.Volumes
	for _, vol := range vols {
		if vol.PersistentVolumeClaim == nil {
			continue
		}
		pvcs = append(pvcs, vol.PersistentVolumeClaim.ClaimName)
	}
	return pvcs
}

func GetNotebooksUsingPvc(pvc string, notebooks []*kf_v1.Notebook) []string {
	//Return a list of Notebooks that are using the given PVC.
	mountedNotebooks := make([]string, 0)

	for _, nb := range notebooks {
		pvcs := GetNotebookPvcs(nb)
		if Contains(pvcs, pvc) {
			mountedNotebooks = append(mountedNotebooks, nb.Name)
		}
	}

	return mountedNotebooks
}

// GetPersistentVolumeClaims returns the PVCs in the requested namespace.
func (s *server) GetPersistentVolumeClaims(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	namespace := vars["namespace"]

	log.Printf("loading persistent volume claims for %q", namespace)

	pvcs, err := s.listers.persistentVolumeClaims.PersistentVolumeClaims(namespace).List(labels.Everything())
	if err != nil {
		s.error(w, r, err)
		return
	}

	sort.Sort(persistentVolumeClaimsByName(pvcs))

	notebooks, err := s.listers.notebooks.Notebooks(namespace).List(labels.Everything())
	if err != nil {
		s.error(w, r, err)
		return
	}

	sort.Sort(notebooksByName(notebooks))

	resp := pvcsresponse{
		APIResponseBase: APIResponseBase{
			Success: true,
			Status:  http.StatusOK,
		},
		PersistentVolumeClaims: make([]pvcresponse, 0),
	}

	for _, pvc := range pvcs {
		size := pvc.Status.Capacity.Storage()
		if size == nil {
			size = pvc.Spec.Resources.Requests.Storage()
		}

		allevents, err := s.listers.events.Events(pvc.Namespace).List(labels.Everything())
		if err != nil {
			log.Printf("failed to load events for %s/%s: %v", pvc.Namespace, pvc.Name, err)
		}

		status := GetPvcStatus(pvc, allevents)
		notebooksList := GetNotebooksUsingPvc(pvc.Name, notebooks)
		resp.PersistentVolumeClaims = append(resp.PersistentVolumeClaims, pvcresponse{
			Name:      pvc.Name,
			Namespace: pvc.Namespace,
			Status:    status,
			Age:       prettytime.Format(pvc.CreationTimestamp.Time),
			Capacity:  *size,
			Modes:     pvc.Spec.AccessModes,
			Class:     *pvc.Spec.StorageClassName,
			Notebooks: notebooksList,
			Labels:    pvc.Labels,
		})
	}

	s.respond(w, r, &resp)
}

// TODO: Delete pvc
func (s *server) DeletePvc(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	namespace := vars["namespace"]
	pvc := vars["pvc"]

	log.Printf("deleting pvc %q for %q", pvc, namespace)

	propagation := v1.DeletePropagationForeground
	err := s.clientsets.kubernetes.CoreV1().PersistentVolumeClaims(namespace).Delete(r.Context(), pvc, v1.DeleteOptions{
		PropagationPolicy: &propagation,
	})
	if err != nil {
		s.error(w, r, err)
		return
	}

	s.respond(w, r, &APIResponseBase{
		Success: true,
		Status:  http.StatusOK,
	})
}
