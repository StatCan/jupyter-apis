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

	// Events
	eventsInformer := factory.Core().V1().Events()
	go eventsInformer.Informer().Run(ctx.Done())

	s.listers.events = eventsInformer.Lister()

	// StorageClasses
	storageClassesInformer := factory.Storage().V1().StorageClasses()
	go storageClassesInformer.Informer().Run(ctx.Done())

	s.listers.storageClasses = storageClassesInformer.Lister()

	// PersistentVolumeClaims
	pvcInformer := factory.Core().V1().PersistentVolumeClaims()
	go pvcInformer.Informer().Run(ctx.Done())

	s.listers.persistentVolumeClaims = pvcInformer.Lister()

	// PodDefaults
	podDefaultsInformer := kubeflowFactory.Kubeflow().V1alpha1().PodDefaults()
	go podDefaultsInformer.Informer().Run(ctx.Done())

	s.listers.podDefaults = podDefaultsInformer.Lister()

	// Notebooks
	notebooksInformer := kubeflowFactory.Kubeflow().V1().Notebooks()
	go notebooksInformer.Informer().Run(ctx.Done())

	s.listers.notebooks = notebooksInformer.Lister()

	// Wait until sync
	log.Printf("synching caches...")
	tctx, _ := context.WithTimeout(ctx, time.Minute)
	if !cache.WaitForCacheSync(tctx.Done(), eventsInformer.Informer().HasSynced, storageClassesInformer.Informer().HasSynced, pvcInformer.Informer().HasSynced, podDefaultsInformer.Informer().HasSynced, notebooksInformer.Informer().HasSynced) {
		return fmt.Errorf("timeout synching caches")
	}
	log.Printf("done synching caches")

	return nil
}
