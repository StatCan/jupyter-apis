package main

import (
	"log"
	"net/http"
	"strconv"

	storagev1 "k8s.io/api/storage/v1"
	"k8s.io/apimachinery/pkg/labels"
)

type storageclassesresponse struct {
	APIResponseBase
	StorageClasses []string `json:"storageClasses"`
}

type defaultstorageclassresponse struct {
	APIResponseBase
	DefaultStorageClass string `json:"defaultStorageClass"`
}

// GetStorageClasses returns the list of storage classes for the cluster
func (s *server) GetStorageClasses(w http.ResponseWriter, r *http.Request) {
	scs, err := s.listers.storageClasses.List(labels.Everything())
	if err != nil {
		s.error(w, r, err)
		return
	}

	var storageclasses []string

	// Identify the default storage class based on the annotations
	for _, sc := range scs {
		storageclasses = append(storageclasses, sc.Name)
	}

	log.Printf("found storage classes")
	resp := &storageclassesresponse{
		APIResponseBase: APIResponseBase{
			Success: true,
			Status:  http.StatusOK,
		},
		StorageClasses: storageclasses,
	}

	s.respond(w, r, resp)
}

// GetDefaultStorageClass returns the default storage class for the cluster.
func (s *server) GetDefaultStorageClass(w http.ResponseWriter, r *http.Request) {
	scs, err := s.listers.storageClasses.List(labels.Everything())
	if err != nil {
		s.error(w, r, err)
		return
	}

	var defaultsc *storagev1.StorageClass

	// Identify the default storage class based on the annotations
	for _, sc := range scs {
		if val, ok := sc.Annotations["storageclass.kubernetes.io/is-default-class"]; ok {
			bval, err := strconv.ParseBool(val)
			if err != nil {
				log.Printf("failed to parse annotation value: %s - %v", sc.Name, err)
				continue
			}

			if bval {
				defaultsc = sc
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
				defaultsc = sc
				break
			}
		}
	}

	resp := &defaultstorageclassresponse{
		APIResponseBase: APIResponseBase{
			Success: true,
			Status:  http.StatusOK,
		},
	}

	if defaultsc != nil {
		log.Printf("found default storageclass %q", defaultsc.Name)
		resp.DefaultStorageClass = defaultsc.Name
	}

	s.respond(w, r, resp)
}
