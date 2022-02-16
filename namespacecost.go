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

	log.Printf("loading namespace costs for %q", namespace)

	u, _ := s.kubecostURL.Parse("model/aggregatedCostModel")

	params := url.Values{}
	params.Add("namespace", namespace)
	params.Add("window", "1d")
	params.Add("aggregation", "namespace")
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
