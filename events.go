package main

import (
	"context"
	"fmt"

	corev1 "k8s.io/api/core/v1"
	v1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func getEventsFieldSelector(kind string, name string) string {
	return fmt.Sprintf("involvedObject.kind=%s,involvedObject.name=%s", kind, name)
}

func (s *server) listEvents(namespace string, fieldSelector string) (*corev1.EventList, error) {
	eventOpts := v1.ListOptions{
		FieldSelector: fieldSelector,
	}
	events, err := s.clientsets.kubernetes.CoreV1().Events(namespace).List(context.TODO(), eventOpts)
	return events, err
}
