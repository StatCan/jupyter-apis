package main

import (
	"encoding/json"
	"log"
	"net/http"
)

// APIResponse contains the basic fields of a response from the APIs.
type APIResponse struct {
	Success bool   `json:"success"`
	Log     string `json:"log"`
}

// respond response returns a JSON response to the client.
func (s *server) respond(w http.ResponseWriter, r *http.Request, resp interface{}) {
	w.WriteHeader(http.StatusOK)
	encoder := json.NewEncoder(w)
	err := encoder.Encode(resp)

	if err != nil {
		log.Printf("error writing response: %v", err)
	}
}

// error servers an error response to the client.
func (s *server) error(w http.ResponseWriter, r *http.Request, err error) {
	log.Printf("returning error response: %v", err)

	w.WriteHeader(http.StatusInternalServerError)
	encoder := json.NewEncoder(w)
	werr := encoder.Encode(APIResponse{
		Success: false,
		Log:     err.Error(),
	})

	if werr != nil {
		log.Printf("error writing error response: %v", werr)
	}
}
