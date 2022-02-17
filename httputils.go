package main

import (
	"encoding/json"
	"log"
	"net/http"
)

// APIResponseBase contains the basic fields of a response from the APIs.
type APIResponseBase struct {
	Success bool   `json:"success"`
	Status  int    `json:"status"`
	Log     string `json:"log,omitempty"`
	User    string `json:"user"`
}

// GetStatus returns the status of the response.
func (r *APIResponseBase) GetStatus() int {
	return r.Status
}

// GetUser returns the user in the response object.
func (r *APIResponseBase) GetUser() string {
	return r.User
}

// SetUser sets the user in the response object.
func (r *APIResponseBase) SetUser(user string) {
	r.User = user
}

// APIResponse represents the response to an API call.
type APIResponse interface {
	GetStatus() int

	GetUser() string
	SetUser(string)
}

// respond response returns a JSON response to the client.
func (s *server) respond(w http.ResponseWriter, r *http.Request, resp APIResponse) {
	if resp.GetUser() == "" && r.URL != nil && r.URL.User != nil {
		resp.SetUser(r.URL.User.Username())
	}

	status := resp.GetStatus()
	if status == 0 {
		status = http.StatusOK
	}

	w.Header().Add("Content-Type", "application/json")
	w.WriteHeader(status)
	encoder := json.NewEncoder(w)
	err := encoder.Encode(resp)

	if err != nil {
		log.Printf("error writing response: %v", err)
	}
}

// error servers an error response to the client.
func (s *server) error(w http.ResponseWriter, r *http.Request, err error) {
	log.Printf("returning error response: %v", err)

	s.respond(w, r, &APIResponseBase{
		Success: false,
		Status:  http.StatusInternalServerError,
		Log:     err.Error(),
	})
}
