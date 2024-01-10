package main

import (
	"context"
	"flag"
	"log"
	"net/http"
	"net/url"
	"os"
	"os/signal"
	"path/filepath"
	"time"

	kubeflowv1 "github.com/StatCan/kubeflow-apis/apis/kubeflow/v1"
	kubeflowv1alpha1 "github.com/StatCan/kubeflow-apis/apis/kubeflow/v1alpha1"
	kubeflow "github.com/StatCan/kubeflow-apis/clientset/versioned"
	kubeflowv1listers "github.com/StatCan/kubeflow-apis/listers/kubeflow/v1"
	kubeflowv1alpha1listers "github.com/StatCan/kubeflow-apis/listers/kubeflow/v1alpha1"
	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"gopkg.in/yaml.v2"
	authorizationv1 "k8s.io/api/authorization/v1"
	corev1 "k8s.io/api/core/v1"
	"k8s.io/client-go/kubernetes"
	v1listers "k8s.io/client-go/listers/core/v1"
	storagev1listers "k8s.io/client-go/listers/storage/v1"
	_ "k8s.io/client-go/plugin/pkg/client/auth/azure"
	"k8s.io/client-go/tools/clientcmd"
	"k8s.io/client-go/util/homedir"
)

var kubeconfig string
var spawnerConfigPath string
var userIDHeader string
var staticDirectory string
var listenAddr string
var kubecostURL string

type listers struct {
	namespaces             v1listers.NamespaceLister
	events                 v1listers.EventLister
	storageClasses         storagev1listers.StorageClassLister
	persistentVolumeClaims v1listers.PersistentVolumeClaimLister
	podDefaults            kubeflowv1alpha1listers.PodDefaultLister
	notebooks              kubeflowv1listers.NotebookLister
	pods                   v1listers.PodLister
}

type clientsets struct {
	kubernetes *kubernetes.Clientset
	kubeflow   *kubeflow.Clientset
}

type server struct {
	Config Configuration

	clientsets clientsets
	listers    listers

	kubecostURL *url.URL
}

func main() {
	var err error
	gctx, gcancel := context.WithCancel(context.Background())

	// Check if we are running inside the cluster, and default to using that instead of kubeconfig if that's the case
	_, err = os.Stat("/var/run/secrets/kubernetes.io/serviceaccount")

	// Setup the default path to the of the kubeconfig file
	if home := homedir.HomeDir(); os.IsNotExist(err) && home != "" {
		flag.StringVar(&kubeconfig, "kubeconfig", filepath.Join(home, ".kube", "config"), "(optional) absolute path to the kubeconfig file")
	} else {
		flag.StringVar(&kubeconfig, "kubeconfig", "", "absolute path to the kubeconfig file")
	}

	flag.StringVar(&userIDHeader, "userid-header", "kubeflow-userid", "header in the request which identifies the incoming user")
	flag.StringVar(&spawnerConfigPath, "spawner-config", "/etc/config/spawner_ui_config.yaml", "path to the spawner configuration file")
	flag.StringVar(&staticDirectory, "static-dir", "static/", "path to the static assets")
	flag.StringVar(&listenAddr, "listen-addr", lookupEnvironment("LISTEN_ADDRESS", "127.0.0.1:5000"), "server listen address")
	flag.StringVar(&kubecostURL, "kubecost-url", lookupEnvironment("KUBECOST_URL", "http://127.0.0.1:9090"), "Url to connect to Kubecost API")

	// Parse flags
	flag.Parse()

	// Setup the server
	s := server{}

	// Parse config
	cfdata, err := os.ReadFile(spawnerConfigPath)
	if err != nil {
		log.Fatal(err)
	}

	err = yaml.Unmarshal(cfdata, &s.Config)
	if err != nil {
		log.Fatal(err)
	}

	// Parse kubecostURL
	s.kubecostURL, err = url.Parse(kubecostURL)
	if err != nil {
		log.Fatal(err)
	}

	// Construct the configuration based on the provided flags.
	// If no config file is provided, then the in-cluster config is used.
	config, err := clientcmd.BuildConfigFromFlags("", kubeconfig)
	if err != nil {
		log.Fatal(err)
	}

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

	_ = s.setupListers(gctx)

	// Generate the Gorilla Mux router
	router := mux.NewRouter()

	// Setup route handlers
	router.HandleFunc("/api/config", s.GetConfig).Methods("GET")
	router.HandleFunc("/api/gpus", s.GetGPUVendors).Methods("GET")

	router.HandleFunc("/api/storageclasses", s.GetStorageClasses).Methods("GET")
	router.HandleFunc("/api/storageclasses/default", s.GetDefaultStorageClass).Methods("GET")

	router.HandleFunc("/api/namespaces/{namespace}/cost/allocation", s.checkAccess(authorizationv1.SubjectAccessReview{
		Spec: authorizationv1.SubjectAccessReviewSpec{
			ResourceAttributes: &authorizationv1.ResourceAttributes{
				Group:    corev1.SchemeGroupVersion.Group,
				Verb:     "list",
				Resource: "pods",
				Version:  corev1.SchemeGroupVersion.Version,
			},
		},
	}, s.GetCost)).Methods("GET")

	router.HandleFunc("/api/namespaces", s.checkAccess(authorizationv1.SubjectAccessReview{
		Spec: authorizationv1.SubjectAccessReviewSpec{
			ResourceAttributes: &authorizationv1.ResourceAttributes{
				Group:    corev1.SchemeGroupVersion.Group,
				Verb:     "list",
				Resource: "namespaces",
				Version:  corev1.SchemeGroupVersion.Version,
			},
		},
	}, s.GetNamespaces)).Methods("GET")

	router.HandleFunc("/api/namespaces/{namespace}", s.checkAccess(authorizationv1.SubjectAccessReview{
		Spec: authorizationv1.SubjectAccessReviewSpec{
			ResourceAttributes: &authorizationv1.ResourceAttributes{
				Group:    corev1.SchemeGroupVersion.Group,
				Verb:     "get",
				Resource: "namespaces",
				Version:  corev1.SchemeGroupVersion.Version,
			},
		},
	}, s.GetNamespaceMetadata)).Methods("GET")

	router.HandleFunc("/api/namespaces/{namespace}/notebooks", s.checkAccess(authorizationv1.SubjectAccessReview{
		Spec: authorizationv1.SubjectAccessReviewSpec{
			ResourceAttributes: &authorizationv1.ResourceAttributes{
				Group:    kubeflowv1.SchemeGroupVersion.Group,
				Verb:     "list",
				Resource: "notebooks",
				Version:  kubeflowv1.SchemeGroupVersion.Version,
			},
		},
	}, s.GetNotebooks)).Methods("GET")

	router.HandleFunc("/api/namespaces/{namespace}/notebooks/default", s.checkAccess(authorizationv1.SubjectAccessReview{
		Spec: authorizationv1.SubjectAccessReviewSpec{
			ResourceAttributes: &authorizationv1.ResourceAttributes{
				Group:    kubeflowv1.SchemeGroupVersion.Group,
				Verb:     "create",
				Resource: "notebooks",
				Version:  kubeflowv1.SchemeGroupVersion.Version,
			},
		},
	}, s.NewDefaultNotebook)).Headers("Content-Type", "application/json").Methods("POST")

	router.HandleFunc("/api/namespaces/{namespace}/notebooks", s.checkAccess(authorizationv1.SubjectAccessReview{
		Spec: authorizationv1.SubjectAccessReviewSpec{
			ResourceAttributes: &authorizationv1.ResourceAttributes{
				Group:    kubeflowv1.SchemeGroupVersion.Group,
				Verb:     "create",
				Resource: "notebooks",
				Version:  kubeflowv1.SchemeGroupVersion.Version,
			},
		},
	}, s.NewNotebook)).Headers("Content-Type", "application/json").Methods("POST")

	router.HandleFunc("/api/namespaces/{namespace}/notebooks/{notebook}", s.checkAccess(authorizationv1.SubjectAccessReview{
		Spec: authorizationv1.SubjectAccessReviewSpec{
			ResourceAttributes: &authorizationv1.ResourceAttributes{
				Group:    kubeflowv1.SchemeGroupVersion.Group,
				Verb:     "get",
				Resource: "notebooks",
				Version:  kubeflowv1.SchemeGroupVersion.Version,
			},
		},
	}, s.GetNotebook)).Methods("GET")

	router.HandleFunc("/api/namespaces/{namespace}/notebooks/{notebook}/pod", s.checkAccess(authorizationv1.SubjectAccessReview{
		Spec: authorizationv1.SubjectAccessReviewSpec{
			ResourceAttributes: &authorizationv1.ResourceAttributes{
				Group:    corev1.SchemeGroupVersion.Group,
				Verb:     "list",
				Resource: "pods",
				Version:  corev1.SchemeGroupVersion.Version,
			},
		},
	}, s.GetNotebookPod)).Methods("GET")

	router.HandleFunc("/api/namespaces/{namespace}/notebooks/{notebook}/pod/{pod}/logs", s.checkAccess(authorizationv1.SubjectAccessReview{
		Spec: authorizationv1.SubjectAccessReviewSpec{
			ResourceAttributes: &authorizationv1.ResourceAttributes{
				Group:    corev1.SchemeGroupVersion.Group,
				Verb:     "get",
				Resource: "pods",
				Version:  corev1.SchemeGroupVersion.Version,
			},
		},
	}, s.GetNotebookPodLogs)).Methods("GET")

	router.HandleFunc("/api/namespaces/{namespace}/notebooks/{notebook}/events", s.checkAccess(authorizationv1.SubjectAccessReview{
		Spec: authorizationv1.SubjectAccessReviewSpec{
			ResourceAttributes: &authorizationv1.ResourceAttributes{
				Group:    corev1.SchemeGroupVersion.Group,
				Verb:     "list",
				Resource: "events",
				Version:  corev1.SchemeGroupVersion.Version,
			},
		},
	}, s.GetNotebookEvents)).Methods("GET")

	router.HandleFunc("/api/namespaces/{namespace}/notebooks/{notebook}", s.checkAccess(authorizationv1.SubjectAccessReview{
		Spec: authorizationv1.SubjectAccessReviewSpec{
			ResourceAttributes: &authorizationv1.ResourceAttributes{
				Group:    kubeflowv1.SchemeGroupVersion.Group,
				Verb:     "update",
				Resource: "notebooks",
				Version:  kubeflowv1.SchemeGroupVersion.Version,
			},
		},
	}, s.UpdateNotebook)).Methods("PATCH")

	router.HandleFunc("/api/namespaces/{namespace}/notebooks/{notebook}", s.checkAccess(authorizationv1.SubjectAccessReview{
		Spec: authorizationv1.SubjectAccessReviewSpec{
			ResourceAttributes: &authorizationv1.ResourceAttributes{
				Group:    kubeflowv1.SchemeGroupVersion.Group,
				Verb:     "delete",
				Resource: "notebooks",
				Version:  kubeflowv1.SchemeGroupVersion.Version,
			},
		},
	}, s.DeleteNotebook)).Methods("DELETE")

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

	router.HandleFunc("/api/namespaces/{namespace}/pvcs/{pvc}", s.checkAccess(authorizationv1.SubjectAccessReview{
		Spec: authorizationv1.SubjectAccessReviewSpec{
			ResourceAttributes: &authorizationv1.ResourceAttributes{
				Group:    corev1.SchemeGroupVersion.Group,
				Verb:     "delete",
				Resource: "persistentvolumeclaims",
				Version:  corev1.SchemeGroupVersion.Version,
			},
		},
	}, s.DeletePvc)).Methods("DELETE")

	router.HandleFunc("/api/namespaces/{namespace}/pvcs/{pvc}", s.checkAccess(authorizationv1.SubjectAccessReview{
		Spec: authorizationv1.SubjectAccessReviewSpec{
			ResourceAttributes: &authorizationv1.ResourceAttributes{
				Group:    corev1.SchemeGroupVersion.Group,
				Verb:     "get",
				Resource: "persistentvolumeclaims",
				Version:  corev1.SchemeGroupVersion.Version,
			},
		},
	}, s.GetPvc)).Methods("GET")

	router.HandleFunc("/api/namespaces/{namespace}/pvcs/{pvc}/pods", s.checkAccess(authorizationv1.SubjectAccessReview{
		Spec: authorizationv1.SubjectAccessReviewSpec{
			ResourceAttributes: &authorizationv1.ResourceAttributes{
				Group:    corev1.SchemeGroupVersion.Group,
				Verb:     "list",
				Resource: "pods",
				Version:  corev1.SchemeGroupVersion.Version,
			},
		},
	}, s.GetPvcPods)).Methods("GET")

	router.HandleFunc("/api/namespaces/{namespace}/pvcs/{pvc}/events", s.checkAccess(authorizationv1.SubjectAccessReview{
		Spec: authorizationv1.SubjectAccessReviewSpec{
			ResourceAttributes: &authorizationv1.ResourceAttributes{
				Group:    corev1.SchemeGroupVersion.Group,
				Verb:     "list",
				Resource: "events",
				Version:  corev1.SchemeGroupVersion.Version,
			},
		},
	}, s.GetPvcEvents)).Methods("GET")

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
		Addr:         listenAddr,
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

	// Cancel global context
	gcancel()

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

func lookupEnvironment(name string, defaultValue string) string {
	if value, isSet := os.LookupEnv(name); isSet {
		return value
	}
	return defaultValue
}
