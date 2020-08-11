package main

import (
	"log"
	"net/http"
	"reflect"

	"github.com/gorilla/mux"
	"k8s.io/apimachinery/pkg/labels"
)

type poddefaultresponse struct {
	Label       string `json:"label"`
	Description string `json:"desc"`
}

type poddefaultsresponse struct {
	APIResponse
	PodDefaults []poddefaultresponse `json:"poddefaults"`
}

// GetPodDefaults returns PodDefaults for the given namespace.
func (s *server) GetPodDefaults(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	namespace := vars["namespace"]

	log.Printf("loading poddefaults for %q", namespace)

	pds, err := s.listers.podDefaults.PodDefaults(namespace).List(labels.Everything())
	if err != nil {
		s.error(w, r, err)
		return
	}

	resp := poddefaultsresponse{
		APIResponse: APIResponse{
			Success: true,
		},
		PodDefaults: make([]poddefaultresponse, 0),
	}

	for _, pd := range pds {
		resp.PodDefaults = append(resp.PodDefaults, poddefaultresponse{
			Label:       reflect.ValueOf(pd.Spec.Selector.MatchLabels).MapKeys()[0].String(),
			Description: pd.Spec.Desc,
		})
	}

	s.respond(w, r, resp)
}
