package main

import (
	"log"
	"net/http"
	"reflect"

	v1alpha1 "github.com/StatCan/kubeflow-apis/apis/kubeflow/v1alpha1"
	"github.com/gorilla/mux"
	"k8s.io/apimachinery/pkg/labels"
)

type poddefaultresponse struct {
	v1alpha1.PodDefault
	Label       string `json:"label"`
	Description string `json:"desc"`
}

type poddefaultsresponse struct {
	APIResponseBase
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

	resp := &poddefaultsresponse{
		APIResponseBase: APIResponseBase{
			Success: true,
			Status:  http.StatusOK,
		},
		PodDefaults: make([]poddefaultresponse, 0),
	}

	for _, pd := range pds {
		desc := pd.Spec.Desc
		if desc == "" {
			desc = pd.Name
		}

		resp.PodDefaults = append(resp.PodDefaults, poddefaultresponse{
			PodDefault:  *pd,
			Label:       reflect.ValueOf(pd.Spec.Selector.MatchLabels).MapKeys()[0].String(),
			Description: desc,
		})
	}

	s.respond(w, r, resp)
}
