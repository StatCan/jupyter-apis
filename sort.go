package main

import (
	kubeflowv1 "github.com/StatCan/kubeflow-controller/pkg/apis/kubeflowcontroller/v1"
	corev1 "k8s.io/api/core/v1"
)

// Events by Timestamp
type eventsByTimestamp []*corev1.Event

func (events eventsByTimestamp) Len() int {
	return len(events)
}

func (events eventsByTimestamp) Less(a, b int) bool {
	return events[b].CreationTimestamp.Before(&events[a].CreationTimestamp)
}

func (events eventsByTimestamp) Swap(a, b int) {
	events[a], events[b] = events[b], events[a]
}

// Notebooks by Name
type notebooksByName []*kubeflowv1.Notebook

func (notebooks notebooksByName) Len() int {
	return len(notebooks)
}

func (notebooks notebooksByName) Less(a, b int) bool {
	return notebooks[a].Name < notebooks[b].Name
}

func (notebooks notebooksByName) Swap(a, b int) {
	notebooks[a], notebooks[b] = notebooks[b], notebooks[a]
}

// PersistentVolumeClaims by Name
type persistentVolumeClaimsByName []*corev1.PersistentVolumeClaim

func (pvcs persistentVolumeClaimsByName) Len() int {
	return len(pvcs)
}

func (pvcs persistentVolumeClaimsByName) Less(a, b int) bool {
	return pvcs[a].Name < pvcs[b].Name
}

func (pvcs persistentVolumeClaimsByName) Swap(a, b int) {
	pvcs[a], pvcs[b] = pvcs[b], pvcs[a]
}

// Namespaces by Name
type namespacesByName []*corev1.Namespace

func (namespaces namespacesByName) Len() int {
	return len(namespaces)
}

func (namespaces namespacesByName) Less(a, b int) bool {
	return namespaces[a].Name < namespaces[b].Name
}

func (namespaces namespacesByName) Swap(a, b int) {
	namespaces[a], namespaces[b] = namespaces[b], namespaces[a]
}
