package main

import (
	"io"
	"log"
	"net/http"
	"net/url"

	"github.com/gorilla/mux"
)

func (s *server) GetCost(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	namespace := vars["namespace"]
	window := r.URL.Query().Get("window")
	log.Printf("loading namespace costs for %q", namespace)

	u, _ := s.kubecostURL.Parse("model/allocation")

	params := url.Values{}
	params.Add("filterNamespaces", namespace)
	params.Add("window", window)
	params.Add("aggregate", "namespace")
	params.Add("idle", "false")
	params.Add("accumulate", "true")
	u.RawQuery = params.Encode()

	resp, err := http.Get(u.String())
	if err != nil {
		s.error(w, r, err)
		return
	}
	defer resp.Body.Close()

	var status = resp.StatusCode
	var contentType = resp.Header.Get("Content-Type")

	w.Header().Add("Content-Type", contentType)
	w.WriteHeader(status)
	io.Copy(w, resp.Body)
}
