package main

import (
	"context"
	"fmt"
	"log"
	"time"

	kubeflowinformers "github.com/StatCan/kubeflow-controller/pkg/generated/informers/externalversions"
	"k8s.io/client-go/informers"
	"k8s.io/client-go/tools/cache"
)

func (s *server) setupListers(ctx context.Context) error {
	factory := informers.NewSharedInformerFactory(s.clientsets.kubernetes, 5*time.Minute)
	kubeflowFactory := kubeflowinformers.NewSharedInformerFactory(s.clientsets.kubeflow, time.Minute*5)

	// Namespaces
	namespacesInformer := factory.Core().V1().Namespaces()
	s.listers.namespaces = namespacesInformer.Lister()

	// Events
	eventsInformer := factory.Core().V1().Events()
	s.listers.events = eventsInformer.Lister()

	// StorageClasses
	storageClassesInformer := factory.Storage().V1().StorageClasses()
	s.listers.storageClasses = storageClassesInformer.Lister()

	// PersistentVolumeClaims
	pvcInformer := factory.Core().V1().PersistentVolumeClaims()
	s.listers.persistentVolumeClaims = pvcInformer.Lister()

	// PodDefaults
	podDefaultsInformer := kubeflowFactory.Kubeflow().V1alpha1().PodDefaults()
	s.listers.podDefaults = podDefaultsInformer.Lister()

	// Notebooks
	notebooksInformer := kubeflowFactory.Kubeflow().V1().Notebooks()
	s.listers.notebooks = notebooksInformer.Lister()

	go factory.Start(ctx.Done())
	go kubeflowFactory.Start(ctx.Done())

	// Wait until sync
	log.Printf("synching caches...")
	tctx, _ := context.WithTimeout(ctx, time.Minute)
	if !cache.WaitForCacheSync(tctx.Done(), namespacesInformer.Informer().HasSynced, eventsInformer.Informer().HasSynced, storageClassesInformer.Informer().HasSynced, pvcInformer.Informer().HasSynced, podDefaultsInformer.Informer().HasSynced, notebooksInformer.Informer().HasSynced) {
		return fmt.Errorf("timeout synching caches")
	}
	log.Printf("done synching caches")

	return nil
}
