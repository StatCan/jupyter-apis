package main

import (
	"context"
	"flag"
	"log"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"sync"
	"time"

	notebooksclient "github.com/StatCan/jupyter-apis/notebooks"
	notebooksv1 "github.com/StatCan/jupyter-apis/notebooks/api/v1"
	kubeflowv1alpha1 "github.com/StatCan/kubeflow-controller/pkg/apis/kubeflowcontroller/v1alpha1"
	kubeflow "github.com/StatCan/kubeflow-controller/pkg/generated/clientset/versioned"
	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	authorizationv1 "k8s.io/api/authorization/v1"
	corev1 "k8s.io/api/core/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/clientcmd"
	"k8s.io/client-go/util/homedir"
)

var kubeconfig string
var userIDHeader string

type clientsets struct {
	kubernetes *kubernetes.Clientset
	kubeflow   *kubeflow.Clientset
	notebooks  *notebooksclient.Clientset
}

type server struct {
	mux sync.Mutex

	clientsets clientsets
}

func main() {
	var err error

	// Setup the default path to the of the kubeconfig file.
	// TODO: This breaks the in-cluster config and needs to be commented out in those instances. Need to find a fix.
	if home := homedir.HomeDir(); home != "" {
		flag.StringVar(&kubeconfig, "kubeconfig", filepath.Join(home, ".kube", "config"), "(optional) absolute path to the kubeconfig file")
	} else {
		flag.StringVar(&kubeconfig, "kubeconfig", "", "absolute path to the kubeconfig file")
	}

	flag.StringVar(&userIDHeader, "userid-header", "kubeflow-userid", "header in the request which identifies the incoming user")

	// Construct the configuration based on the provided flags.
	// If no config file is provided, then the in-cluster config is used.
	config, err := clientcmd.BuildConfigFromFlags("", kubeconfig)
	if err != nil {
		log.Fatal(err)
	}

	s := server{}

	// Generate the Kubernetes clientset
	s.clientsets.kubernetes, err = kubernetes.NewForConfig(config)
	if err != nil {
		log.Fatal(err)
	}

	// Generate the Kubeflow clientset
	s.clientsets.kubeflow, err = kubeflow.NewForConfig(config)
	if err != nil {
		log.Fatal(err)
	}

	// Generate the Notebooks clientset
	s.clientsets.notebooks, err = notebooksclient.NewForConfig(config)
	if err != nil {
		log.Fatal(err)
	}

	// Generate the Gorilla Mux router
	router := mux.NewRouter()

	// Setup route handlers
	router.HandleFunc("/api/storageclasses/default", s.GetDefaultStorageClass).Methods("GET")
	router.HandleFunc("/api/namespaces/{namespace}/notebooks", s.checkAccess(authorizationv1.SubjectAccessReview{
		Spec: authorizationv1.SubjectAccessReviewSpec{
			ResourceAttributes: &authorizationv1.ResourceAttributes{
				Group:    notebooksv1.GroupVersion.Group,
				Verb:     "list",
				Resource: "notebooks",
				Version:  notebooksv1.GroupVersion.Version,
			},
		},
	}, s.GetNotebooks)).Methods("GET")
	router.HandleFunc("/api/namespaces/{namespace}/pvcs", s.checkAccess(authorizationv1.SubjectAccessReview{
		Spec: authorizationv1.SubjectAccessReviewSpec{
			ResourceAttributes: &authorizationv1.ResourceAttributes{
				Group:    corev1.SchemeGroupVersion.Group,
				Verb:     "list",
				Resource: "persistentvolumeclaims",
				Version:  corev1.SchemeGroupVersion.Version,
			},
		},
	}, s.GetPersistentVolumeClaims)).Methods("GET")
	router.HandleFunc("/api/namespaces/{namespace}/poddefaults", s.checkAccess(authorizationv1.SubjectAccessReview{
		Spec: authorizationv1.SubjectAccessReviewSpec{
			ResourceAttributes: &authorizationv1.ResourceAttributes{
				Group:    kubeflowv1alpha1.SchemeGroupVersion.Group,
				Verb:     "list",
				Resource: "poddefaults",
				Version:  kubeflowv1alpha1.SchemeGroupVersion.Version,
			},
		},
	}, s.GetPodDefaults)).Methods("GET")

	// Setup the server, with:
	//  Add combined logging handler
	//  Default Read/Write timeouts every 15s
	srv := &http.Server{
		Handler:      kubeflowUserHandler(userIDHeader, handlers.CombinedLoggingHandler(os.Stdout, router)),
		Addr:         "0.0.0.0:8080",
		WriteTimeout: 15 * time.Second,
		ReadTimeout:  15 * time.Second,
	}

	log.Printf("listening on %s", srv.Addr)

	// Run our server in a goroutine so that it doesn't block
	//  (this lets us capture the shutdown request and gracefully exit)
	go func() {
		if err := srv.ListenAndServe(); err != nil {
			log.Println(err)
		}
	}()

	c := make(chan os.Signal, 1)

	// We'll accept graceful shutdowns when quit via SIGINT (Ctrl+C)
	// SIGKILL, SIGQUIT or SIGTERM (Ctrl+/) will not be caught
	signal.Notify(c, os.Interrupt)

	// Block until we receive our signal
	<-c

	// Create a deadline to wait for
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	// Doesn't block if no connections, but will otherwise wait
	// until the timeout deadline
	srv.Shutdown(ctx)

	// Optionally, you could run srv.Shutdown in a goroutine and block on
	// <-ctx.Done() if your application should wait for other services
	// to finalize based on context cancellation

	log.Println("shutting down")
	os.Exit(0)
}
