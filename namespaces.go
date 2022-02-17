package main

import (
	"log"
	"net/http"
	"sort"

	"k8s.io/apimachinery/pkg/labels"
)

type namespacesresponse struct {
	APIResponseBase
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

	resp := &namespacesresponse{
		APIResponseBase: APIResponseBase{
			Success: true,
			Status:  http.StatusOK,
		},
		Namespaces: make([]string, 0),
	}

	for _, namespace := range namespaces {
		resp.Namespaces = append(resp.Namespaces, namespace.Name)
	}

	s.respond(w, r, resp)
}
