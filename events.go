package main

import (
	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/labels"
)

func (s *server) listEvents(namespace string, kind string, name string) ([]*corev1.Event, error) {
	// Had to use s.lister.events.Events here instead of s.clientsets.kubernetes.CoreV1().Events(namespace)
	// because the latter eventually results in []corev1.Event instead of []*corev1.Event
	// which led to issue with manipulating the data latter on.
	allevents, err := s.listers.events.Events(namespace).List(labels.Everything())

	// Filter past events
	events := make([]*corev1.Event, 0)
	for _, event := range allevents {
		if event.InvolvedObject.Kind == kind && event.InvolvedObject.Name == name {
			events = append(events, event)
		}
	}
	return events, err
}
