package main

import (
	"log"
	"net/http"
	"strconv"

	storagev1 "k8s.io/api/storage/v1"
	v1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

type defaultstorageclassresponse struct {
	APIResponse
	DefaultStorageClass string `json:"defaultStorageClass"`
}

// GetDefaultStorageClass returns the default storage class for the cluster.
func (s *server) GetDefaultStorageClass(w http.ResponseWriter, r *http.Request) {
	scs, err := s.clientsets.kubernetes.StorageV1().StorageClasses().List(r.Context(), v1.ListOptions{})
	if err != nil {
		s.error(w, r, err)
		return
	}

	var defaultsc *storagev1.StorageClass

	// Identify the default storage class based on the annotations
	for _, sc := range scs.Items {
		if val, ok := sc.Annotations["storageclass.kubernetes.io/is-default-class"]; ok {
			bval, err := strconv.ParseBool(val)
			if err != nil {
				log.Printf("failed to parse annotation value: %s - %v", sc.Name, err)
				continue
			}

			if bval {
				defaultsc = &sc
				break
			}
		}

		if val, ok := sc.Annotations["storageclass.beta.kubernetes.io/is-default-class"]; ok {
			bval, err := strconv.ParseBool(val)
			if err != nil {
				log.Printf("failed to parse annotation value: %s - %v", sc.Name, err)
				continue
			}

			if bval {
				defaultsc = &sc
				break
			}
		}
	}

	resp := defaultstorageclassresponse{
		APIResponse: APIResponse{
			Success: true,
		},
	}

	if defaultsc != nil {
		log.Printf("found default storageclass %q", defaultsc.Name)
		resp.DefaultStorageClass = defaultsc.Name
	}

	s.respond(w, r, resp)
}
