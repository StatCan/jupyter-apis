package main

import (
	"log"
	"net/http"
	"sort"

	"k8s.io/apimachinery/pkg/labels"
)

type namespacesresponse struct {
	APIResponse
	Namespaces []string `json:"namespaces"`
}

// GetNamespaces returns the namespaces in the environment.
func (s *server) GetNamespaces(w http.ResponseWriter, r *http.Request) {
	log.Printf("loading namespaces")

	namespaces, err := s.listers.namespaces.List(labels.Everything())
	if err != nil {
		s.error(w, r, err)
		return
	}

	sort.Sort(namespacesByName(namespaces))

	resp := namespacesresponse{
		APIResponse: APIResponse{
			Success: true,
		},
		Namespaces: make([]string, 0),
	}

	for _, namespace := range namespaces {
		resp.Namespaces = append(resp.Namespaces, namespace.Name)
	}

	s.respond(w, r, resp)
}
