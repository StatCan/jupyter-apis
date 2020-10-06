package main

import (
	"log"
	"net/http"
	"sort"

	"github.com/gorilla/mux"
	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/resource"
	"k8s.io/apimachinery/pkg/labels"
	v1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

type pvcresponse struct {
	Class     string                            `json:"class"`
	Mode      corev1.PersistentVolumeAccessMode `json:"mode"`
	Name      string                            `json:"name"`
	Namespace string                            `json:"namespace"`
	Size      resource.Quantity                 `json:"size"`
}

type pvcsresponse struct {
	APIResponse
	PersistentVolumeClaims []pvcresponse `json:"pvcs"`
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

	resp := pvcsresponse{
		APIResponse: APIResponse{
			Success: true,
		},
		PersistentVolumeClaims: make([]pvcresponse, 0),
	}

	for _, pvc := range pvcs {
		size := pvc.Spec.Resources.Requests.Storage()

		resp.PersistentVolumeClaims = append(resp.PersistentVolumeClaims, pvcresponse{
			Class:     *pvc.Spec.StorageClassName,
			Mode:      pvc.Spec.AccessModes[0],
			Name:      pvc.Name,
			Namespace: pvc.Namespace,
			Size:      *size,
		})
	}

	s.respond(w, r, resp)
}

//TODO: Delete pvc
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

	s.respond(w, r, APIResponse{
		Success: true,
	})
}

