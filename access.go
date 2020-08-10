package main

import (
	"fmt"
	"log"
	"net/http"
	"net/url"

	"github.com/gorilla/mux"
	authorizationv1 "k8s.io/api/authorization/v1"
	v1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// kubeflowUserHandler returns an http.Handler which
// wraps the provided handler h, and will
// load the User ID of the user from the specific
// header in the request and add it to the HTTP request information.
func kubeflowUserHandler(header string, h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		user := r.Header.Get(header)
		if user != "" {
			// Add the User information to the request.
			r.URL.User = url.User(user)
		}

		h.ServeHTTP(w, r)
	})
}

// checkAccess is a middleware HTTP handler function that will verify the
// provided user's access against the Kubernetes API server. It loads the
// user's ID from the `kubeflow-userid` Header, generated a SubjectAccessReview
// request and submits it to the Kubernetes API server. The API server will
// return whether the user is permitted to perform the requested action.
//
// subjectAccessReviewTemplate: A authorization.k8s.io/v1 SubjectAccessReview
//                              object used as a template for the request.
//		Note: the spec.User and Spec.ResourceAttributes.Namespace are REPLACED by this function.
// next: The next handler to call if the user is authorized to access the desired resource
func (s *server) checkAccess(subjectAccessReviewTemplate authorizationv1.SubjectAccessReview, next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)

		// Make a copy of the template, so we don't replace content in the templated version
		sar := subjectAccessReviewTemplate.DeepCopy()

		// Load the user from kubeflow-userid. If there is no user provided,
		// then do not continue to process the request.
		user := r.URL.User.Username()
		if user == "" {
			log.Printf("no user found")
			s.respond(w, r, APIResponse{
				Success: false,
				Log:     "no user found",
			})
			return
		}

		// Update the SubjectAccessReview request with the namespace and user information
		sar.Spec.ResourceAttributes.Namespace = vars["namespace"]
		sar.Spec.User = user

		// Submit the SubjectAccessReview to the Kubernetes API server
		resp, err := s.clientsets.kubernetes.AuthorizationV1().SubjectAccessReviews().Create(r.Context(), sar, v1.CreateOptions{})
		if err != nil {
			s.error(w, r, err)
			return
		}

		// If the user is not permitted, log and return the error and do not process the request
		if !resp.Status.Allowed {
			msg := fmt.Sprintf("User %s is not permitted to %s %s.%s.%s for namespace: %s", sar.Spec.User, sar.Spec.ResourceAttributes.Verb, sar.Spec.ResourceAttributes.Group, sar.Spec.ResourceAttributes.Version, sar.Spec.ResourceAttributes.Resource, sar.Spec.ResourceAttributes.Namespace)

			log.Println(msg)

			s.respond(w, r, APIResponse{
				Success: false,
				Log:     msg,
			})
			return
		}

		// Finally, if the user is authorized
		next(w, r)
	}
}
