package main

import (
	"fmt"
	"sort"
	"time"

	kubeflowv1 "github.com/StatCan/kubeflow-apis/apis/kubeflow/v1"
	corev1 "k8s.io/api/core/v1"
	v1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/labels"
)

// notebookPhase is the phase of a notebook.
type notebookPhase string

// statusKey is a string linking to a status message
type statusKey string

// status represents the status of a notebook.
type status struct {
	Message string        `json:"message"`
	Phase   notebookPhase `json:"phase"`
	State   string        `json:"state"`
	Key     statusKey     `json:"key"`
}

const (
	// NotebookPhaseReady represents the ready phase of a notebook.
	NotebookPhaseReady notebookPhase = "ready"

	// NotebookPhaseWaiting represents the waiting phase of a notebook.
	NotebookPhaseWaiting notebookPhase = "waiting"

	// NotebookPhaseWarning represents the warning phase of a notebook.
	NotebookPhaseWarning notebookPhase = "warning"

	// NotebookPhaseError represents the error phase of a notebook.
	NotebookPhaseError notebookPhase = "error"

	// NotebookPhaseUnitialized represents the uninitialized phase of a notebook.
	NotebookPhaseUnitialized notebookPhase = "uninitialized"

	// NotebookPhaseUnavailable represents the unavailable phase of a notebook.
	NotebookPhaseUnavailable notebookPhase = "unavailable"

	// NotebookPhaseTerminating represents the terminating phase of a notebook.
	NotebookPhaseTerminating notebookPhase = "terminating"

	// NotebookPhaseStopped represents the stopped phase of a notebook.
	NotebookPhaseStopped notebookPhase = "stopped"
)

const STOP_ANNOTATION = "kubeflow-resource-stopped"

// defines status message keys, which are used for translations in the frontend
const (
	waitingStatus statusKey = "waitingStatus"

	notebookDeleting statusKey = "notebookDeleting"

	notebookStopping statusKey = "notebookStopping"

	noPodsRunning statusKey = "noPodsRunning"

	running statusKey = "running"

	noInformation statusKey = "noInformation"

	errorCondition statusKey = "errorCondition"

	errorEvent statusKey = "errorEvent"

	schedulingPod statusKey = "schedulingPod"
)

var statusMessages = map[statusKey]string{
	waitingStatus:    "Waiting for StatefulSet to create the underlying Pod.",
	noPodsRunning:    "No Pods are currently running for this Notebook Server.",
	notebookStopping: "Notebook Server is stopping.",
	notebookDeleting: "Deleting this Notebook Server.",
	running:          "Running",
	noInformation:    "Couldn't find any information for the status of this notebook.",
	errorCondition:   "An error has occured. Click on the notebook name for more information.",
	errorEvent:       "An error has occured. Click on the notebook name for more information.",
	schedulingPod:    "Scheduling the Pod.",
}

func createStatus(phase notebookPhase, message string, state string, key statusKey) status {
	return status{
		Phase:   phase,
		Message: message,
		State:   state,
		Key:     key,
	}
}

// Return status and reason. Status may be:
// [ready|waiting|warning|terminating|stopped]
func (s *server) processStatus(notebook *kubeflowv1.Notebook) (status, error) {
	// In case the Notebook has no status
	statusPhase, statusMessage, statusKey := getEmptyStatus(notebook)
	if statusPhase != "" {
		return createStatus(statusPhase, statusMessage, "", statusKey), nil
	}

	// In case the Notebook is being stopped
	statusPhase, statusMessage, statusKey = getStoppedStatus(notebook)
	if statusPhase != "" {
		return createStatus(statusPhase, statusMessage, "", statusKey), nil
	}

	// In case the Notebook is being deleted
	statusPhase, statusMessage, statusKey = getDeletedStatus(notebook)
	if statusPhase != "" {
		return createStatus(statusPhase, statusMessage, "", statusKey), nil
	}

	// In case the Notebook is ready
	statusPhase, statusMessage, statusKey = checkReadyNotebook(notebook)
	if statusPhase != "" {
		return createStatus(statusPhase, statusMessage, "", statusKey), nil
	}

	// Extract information about the status from the containerState of the
	// Notebook's status
	statusPhase, statusMessage, statusKey = getStatusFromContainerState(notebook)
	if statusPhase != "" {
		return createStatus(statusPhase, statusMessage, "", statusKey), nil
	}

	// Extract information about the status from the conditions of the
	// Notebook's status
	statusPhase, statusMessage, statusKey = getStatusFromConditions(notebook)
	if statusPhase != "" {
		return createStatus(statusPhase, statusMessage, "", statusKey), nil
	}

	// Try to extract information about why the notebook is not starting
	// from the notebook's events (see find_error_event)
	notebookEvents, err := s.getNotebookEvents(notebook)
	if err != nil {
		return status{}, err
	}
	statusEvent, reasonEvent, statusKey := getStatusFromEvents(notebookEvents)
	if statusEvent != "" {
		return createStatus(statusEvent, reasonEvent, "", statusKey), nil
	}

	// In case there no Events available, show a generic message
	statusPhase = NotebookPhaseWarning
	statusMessage = statusMessages[noInformation]

	return createStatus(statusPhase, statusMessage, "", noInformation), nil
}

func getEmptyStatus(notebook *kubeflowv1.Notebook) (notebookPhase, string, statusKey) {
	currentTime := time.Now()
	notebookCreationTime := notebook.CreationTimestamp.Time
	delta := currentTime.Sub(notebookCreationTime)

	containerState := notebook.Status.ContainerState
	conditions := notebook.Status.Conditions

	// If the Notebook has no status, the status will be waiting
	// (instead of warning) and we will show a generic message for the first 10 seconds
	if containerState == (v1.ContainerState{}) && len(conditions) == 0 && delta.Seconds() <= 10 {
		statusPhase := NotebookPhaseWaiting
		statusMessage := statusMessages[waitingStatus]
		return statusPhase, statusMessage, waitingStatus
	}

	return "", "", ""
}

func getStoppedStatus(notebook *kubeflowv1.Notebook) (notebookPhase, string, statusKey) {
	if _, ok := notebook.Annotations[STOP_ANNOTATION]; ok {
		// If the Notebook is stopped, the status will be stopped
		if notebook.Status.ReadyReplicas == 0 {
			statusPhase := NotebookPhaseStopped
			statusMessage := statusMessages[noPodsRunning]
			return statusPhase, statusMessage, noPodsRunning
		} else {
			//If the Notebook is being stopped, the status will be waiting
			statusPhase := NotebookPhaseWaiting
			statusMessage := statusMessages[notebookStopping]
			return statusPhase, statusMessage, notebookStopping
		}
	}

	return "", "", ""
}

func getDeletedStatus(notebook *kubeflowv1.Notebook) (notebookPhase, string, statusKey) {
	// If the Notebook is being deleted, the status will be terminating
	if notebook.DeletionTimestamp != nil {
		statusPhase := NotebookPhaseTerminating
		statusMessage := statusMessages[notebookDeleting]
		return statusPhase, statusMessage, notebookDeleting
	}

	return "", "", ""
}

func checkReadyNotebook(notebook *kubeflowv1.Notebook) (notebookPhase, string, statusKey) {
	// If the Notebook is running, the status will be ready
	if notebook.Status.ReadyReplicas == 1 {
		statusPhase := NotebookPhaseReady
		statusMessage := statusMessages[running]
		return statusPhase, statusMessage, running
	}

	return "", "", ""
}

func getStatusFromContainerState(notebook *kubeflowv1.Notebook) (notebookPhase, string, statusKey) {
	// https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#container-states
	// Check the status
	containerState := notebook.Status.ContainerState

	if containerState.Waiting == nil {
		return "", "", ""
	}

	// If the Notebook is initializing, the status will be waiting
	if containerState.Waiting.Reason == "PodInitializing" {
		statusPhase := NotebookPhaseWaiting
		statusMessage := statusMessages[schedulingPod]
		return statusPhase, statusMessage, schedulingPod
	} else {
		// In any other case, the status will be warning with a "reason:
		// message" showing on hover
		statusPhase := NotebookPhaseWarning

		reason := containerState.Waiting.Reason
		if reason == "" {
			reason = "Undefined"
		}
		message := containerState.Waiting.Message
		if message == "" {
			message = "No available message for container state."
		}

		statusMessage := fmt.Sprintf("%s : %s", reason, message)

		return statusPhase, statusMessage, ""
	}
}

func getStatusFromConditions(notebook *kubeflowv1.Notebook) (notebookPhase, string, statusKey) {
	for _, condition := range notebook.Status.Conditions {
		if condition.Reason != "" {
			statusPhase := NotebookPhaseWarning
			statusMessage := statusMessages[errorCondition]
			return statusPhase, statusMessage, errorCondition
		}
	}

	return "", "", ""
}

func (s *server) getNotebookEvents(notebook *kubeflowv1.Notebook) ([]*corev1.Event, error) {
	// Load events
	allevents, err := s.listers.events.Events(notebook.Namespace).List(labels.Everything())
	if err != nil {
		return []*corev1.Event{}, err
	}

	// Filter past events
	events := make([]*corev1.Event, 0)
	for _, event := range allevents {
		if event.InvolvedObject.Kind != "Notebook" || event.InvolvedObject.Name != notebook.Name || event.CreationTimestamp.Before(&notebook.CreationTimestamp) {
			continue
		}

		events = append(events, event)
	}
	sort.Sort(eventsByTimestamp(events))

	return events, nil
}

func getStatusFromEvents(notebookEvents []*corev1.Event) (notebookPhase, string, statusKey) {
	for _, e := range notebookEvents {
		if e.Type == corev1.EventTypeWarning {
			return NotebookPhaseWarning, statusMessages[errorEvent], errorEvent
		}
	}

	return "", "", ""
}
