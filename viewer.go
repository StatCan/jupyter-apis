package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path"
	"reflect"
	"strings"
	"text/template"

	"github.com/gorilla/mux"
	corev1 "k8s.io/api/core/v1"
	v1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime/schema"
)

const KIND string = "PVCViewer"
const GROUP string = "kubeflow.org"
const VERSION string = "v1alpha1"
const PLURAL string = "pvcviewers"

var VIEWER []string = []string{GROUP, VERSION, PLURAL}

var VIEWER_SPEC_PATH string = path.Join("/etc/config", "viewer-spec.yaml")

const POD_PARENT_VIEWER_LABEL_KEY string = "app.kubernetes.io/name"

type pvcviewer struct {
	Metadata map[string]string `json:"metadata"`
	Status   map[string]string `json:"status"`
}

type pvcviewerrequest struct {
	Name string `json:"name"`
}

func loadViewerTemplate(filePath string) (*map[string]interface{}, error) {
	yaml, err := os.ReadFile(filePath)
	if err != nil {
		return nil, err
	}

	var template map[string]interface{}
	if err := json.Unmarshal(yaml, &template); err != nil {
		return nil, err
	}

	return &template, nil
}

/*
Load the viewer template and substitute environment variables.

This allows the user to change the viewer template without having to
rebuild the image.

Args:

	name: The name of the viewer.
	namespace: The namespace of the viewer.

Returns:

	A dictionary representing the Kubernetes viewer object.
*/
func createViewerTemplate(name string, namespace string) (*unstructured.Unstructured, error) {
	viewerTemplate, err := loadViewerTemplate(VIEWER_SPEC_PATH)
	if err != nil {
		return nil, err
	}

	variables := map[string]string{}
	for _, envVar := range os.Environ() {
		pair := strings.SplitN(envVar, "=", 2)
		variables[pair[0]] = pair[1]
	}
	variables["PVC_NAME"] = name
	variables["NAMESPACE"] = namespace
	variables["NAME"] = name

	spec, err := substituteEnvVariables(viewerTemplate, variables)
	if err != nil {
		return nil, err
	}

	viewer := &unstructured.Unstructured{
		Object: map[string]interface{}{
			"apiVersion": fmt.Sprintf("%s/%s", GROUP, VERSION),
			"kind":       KIND,
			"metadata": map[string]interface{}{
				"name":      name,
				"namespace": namespace,
			},
			"spec": spec,
		},
	}

	return viewer, nil
}

/*
Substitute environment variables in the templates recusively

Most likely, the type for "data" of the first iteration will be a "map[string]interface{}"
because we are loading in a yaml file
*/
func substituteEnvVariables(data interface{}, variables map[string]string) (interface{}, error) {
	switch temp := data.(type) {
	case map[string]interface{}:
		// if the data is a map, iterate through
		for i, val := range temp {
			subbed, err := substituteEnvVariables(val, variables)
			if err != nil {
				return nil, err
			}
			temp[i] = subbed
		}
		return temp, nil
	case []interface{}:
		// if the data is an array, iterate through
		for i, val := range temp {
			subbed, err := substituteEnvVariables(val, variables)
			if err != nil {
				return nil, err
			}
			temp[i] = subbed
		}
		return temp, nil
	case string:
		// if the data is a string, replace the vars in the template
		template, err := template.New("pvcviewer").Parse(temp)
		if err != nil {
			return nil, err
		}
		var buffer bytes.Buffer
		err = template.Execute(&buffer, variables)
		if err != nil {
			return nil, err
		}
		return buffer.String(), nil
	default:
		return temp, nil
	}
}

// Returns True if the pod is a viewer pod, False otherwise.
func isViewerPod(pod corev1.Pod) bool {
	return getOwningViewer(pod) != ""
}

/*
Return a string representing the status of that viewer. If a deletion
timestamp is set we want to return a `Terminating` state.
*/
func viewerStatus(viewer pvcviewer) notebookPhase {
	if reflect.ValueOf(viewer).IsZero() {
		return NotebookPhaseUnitialized
	}

	if _, ok := viewer.Metadata["deletionTimestamp"]; ok {
		return NotebookPhaseTerminating
	}

	if _, ok := viewer.Status["ready"]; ok {
		return NotebookPhaseReady
	}

	return NotebookPhaseWaiting
}

// Returns the viewer's name that owns the given pod.
func getOwningViewer(pod corev1.Pod) string {
	return pod.Labels[POD_PARENT_VIEWER_LABEL_KEY]
}

// Deletes a viewer
func (s *server) deleteViewer(viewer string, namespace string) error {
	log.Printf("Deleting viewer %s/%s...", namespace, viewer)

	propagation := v1.DeletePropagationForeground
	err := s.dynamic.Resource(schema.GroupVersionResource{
		Group:    GROUP,
		Version:  VERSION,
		Resource: PLURAL,
	}).Namespace(namespace).Delete(context.TODO(), viewer, v1.DeleteOptions{
		PropagationPolicy: &propagation,
	})
	if err != nil {
		return err
	}
	log.Printf("Successfully deleted viewer %s/%s", namespace, viewer)

	return nil
}

// Endpoint to post a viewer
func (s *server) PostPvcViewer(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	namespace := vars["namespace"]

	// Read the incoming notebook
	body, err := io.ReadAll(r.Body)
	if err != nil {
		s.error(w, r, err)
		return
	}
	defer r.Body.Close()

	log.Printf("received viewer body %s for namespace %s", body, namespace)

	var req pvcviewerrequest
	err = json.Unmarshal(body, &req)
	if err != nil {
		s.error(w, r, err)
		return
	}

	viewer, err := createViewerTemplate(req.Name, namespace)
	if err != nil {
		s.error(w, r, err)
		return
	}

	log.Printf("Creating PVCViewer '%s'...", viewer)

	_, err = s.dynamic.Resource(schema.GroupVersionResource{
		Group:    GROUP,
		Version:  VERSION,
		Resource: PLURAL,
	}).Namespace(namespace).Create(context.TODO(), viewer, v1.CreateOptions{})
	if err != nil {
		s.error(w, r, err)
		return
	}

	log.Printf("Successfully created PVCViewer %s/%s", namespace, req.Name)

	s.respond(w, r, &APIResponseBase{
		Success: true,
		Status:  http.StatusOK,
	})
}

// Endpoint to delete a viewer
func (s *server) DeletePvcViewer(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	namespace := vars["namespace"]
	viewer := vars["viewer"]

	err := s.deleteViewer(viewer, namespace)
	if err != nil {
		s.error(w, r, err)
		return
	}

	s.respond(w, r, &APIResponseBase{
		Success: true,
		Status:  http.StatusOK,
	})
}
