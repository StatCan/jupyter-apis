package notebooks

import (
	"context"

	notebooksv1 "github.com/StatCan/jupyter-apis/notebooks/api/v1"
	meta_v1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/rest"
)

func (c *NotebookV1Client) Notebooks(namespace string) NotebookInterface {
	return &notebookConfigClient{
		client: c.restClient,
		ns:     namespace,
	}
}

type NotebookV1Client struct {
	restClient rest.Interface
}

type NotebookInterface interface {
	Create(ctx context.Context, obj *notebooksv1.Notebook) (*notebooksv1.Notebook, error)
	Update(ctx context.Context, obj *notebooksv1.Notebook) (*notebooksv1.Notebook, error)
	Delete(ctx context.Context, name string, options *meta_v1.DeleteOptions) error
	Get(ctx context.Context, name string) (*notebooksv1.Notebook, error)
	List(ctx context.Context) (*notebooksv1.NotebookList, error)
}

type notebookConfigClient struct {
	client rest.Interface
	ns     string
}

func (c *notebookConfigClient) Create(ctx context.Context, obj *notebooksv1.Notebook) (*notebooksv1.Notebook, error) {
	result := &notebooksv1.Notebook{}
	err := c.client.Post().
		Namespace(c.ns).Resource("notebooks").
		Body(obj).Do(ctx).Into(result)
	return result, err
}

func (c *notebookConfigClient) Update(ctx context.Context, obj *notebooksv1.Notebook) (*notebooksv1.Notebook, error) {
	result := &notebooksv1.Notebook{}
	err := c.client.Put().
		Namespace(c.ns).Resource("notebooks").
		Body(obj).Do(ctx).Into(result)
	return result, err
}

func (c *notebookConfigClient) Delete(ctx context.Context, name string, options *meta_v1.DeleteOptions) error {
	return c.client.Delete().
		Namespace(c.ns).Resource("notebooks").
		Name(name).Body(options).Do(ctx).
		Error()
}

func (c *notebookConfigClient) Get(ctx context.Context, name string) (*notebooksv1.Notebook, error) {
	result := &notebooksv1.Notebook{}
	err := c.client.Get().
		Namespace(c.ns).Resource("notebooks").
		Name(name).Do(ctx).Into(result)
	return result, err
}

func (c *notebookConfigClient) List(ctx context.Context) (*notebooksv1.NotebookList, error) {
	result := &notebooksv1.NotebookList{}
	err := c.client.Get().
		Namespace(c.ns).Resource("notebooks").
		Do(ctx).Into(result)
	return result, err
}
