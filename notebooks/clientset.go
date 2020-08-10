package notebooks

import (
	notebooksv1 "github.com/StatCan/jupyter-apis/notebooks/api/v1"
	meta_v1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/apimachinery/pkg/runtime/serializer"
	"k8s.io/client-go/rest"
)

var SchemeGroupVersion = schema.GroupVersion{Group: notebooksv1.GroupVersion.Group, Version: notebooksv1.GroupVersion.Version}

func addKnownTypes(scheme *runtime.Scheme) error {
	scheme.AddKnownTypes(SchemeGroupVersion,
		&notebooksv1.Notebook{},
	)
	meta_v1.AddToGroupVersion(scheme, SchemeGroupVersion)
	return nil
}

type Clientset struct {
	v1 *NotebookV1Client
}

func NewForConfig(cfg *rest.Config) (*Clientset, error) {
	clientset := &Clientset{}

	var err error
	clientset.v1, err = newV1Client(cfg)
	if err != nil {
		return nil, err
	}

	return clientset, nil
}

func newV1Client(cfg *rest.Config) (*NotebookV1Client, error) {
	scheme := runtime.NewScheme()
	SchemeBuilder := runtime.NewSchemeBuilder(addKnownTypes)
	if err := SchemeBuilder.AddToScheme(scheme); err != nil {
		return nil, err
	}
	config := *cfg
	config.GroupVersion = &SchemeGroupVersion
	config.APIPath = "/apis"
	config.ContentType = runtime.ContentTypeJSON
	config.NegotiatedSerializer = serializer.WithoutConversionCodecFactory{CodecFactory: serializer.NewCodecFactory(scheme)}
	client, err := rest.RESTClientFor(&config)
	if err != nil {
		return nil, err
	}
	return &NotebookV1Client{restClient: client}, nil
}

func (c Clientset) V1() *NotebookV1Client {
	return c.v1
}
