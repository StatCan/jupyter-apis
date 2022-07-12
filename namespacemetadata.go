package main

import (
	"log"
	"net/http"

	"github.com/gorilla/mux"
	corev1 "k8s.io/api/core/v1"
)

type namespacemetadataresponse struct {
	APIResponseBase
	Namespace corev1.Namespace `json:"namespace"`
}

// GetNamespaces returns the namespaces in the environment.
func (s *server) GetNamespaceMetadata(w http.ResponseWriter, r *http.Request) {
	log.Printf("loading namespace metadata")

	vars := mux.Vars(r)
	namespace := vars["namespace"]

	ns, err := s.listers.namespaces.Get(namespace)
	if err != nil {
		s.error(w, r, err)
		return
	}

	resp := &namespacemetadataresponse{
		APIResponseBase: APIResponseBase{
			Success: true,
			Status:  http.StatusOK,
		},
	}

	if ns != nil {
		resp.Namespace.Name = ns.Name
		resp.Namespace.Labels = ns.Labels
	}
	
	s.respond(w, r, resp)
}
