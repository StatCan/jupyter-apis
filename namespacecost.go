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

	u, _ := s.kubecostURL.Parse("model/allocation/summary")

	params := url.Values{}
	params.Add("filterNamespaces", namespace)
	params.Add("window", window)
	params.Add("aggregate", "namespace")
	params.Add("shareNamespaces", "aad-pod-identity-system,argocd-operator-system,azure-blob-csi-system,boathouse-system,cert-manager-system,cloud-main-system,daaas-system,default,eck-operator-system,fdi-gateway-protected-b-system,fdi-gateway-system,fdi-gateway-unclassified-system,fluentd-system,gatekeeper-system,gitea-default,goofys-injector-system,hive-system,ingress-general-system,istio-operator-system,istio-system,kiali-system,knative-eventing,knative-serving,jfrog-system,kube-public,kube-system,kubeflow,kubecost-system,minio-gateway-premium-oidc-system,minio-gateway-premium-ro-system,minio-gateway-premium-system,minio-gateway-protected-b-system,minio-gateway-standard-oidc-system,minio-gateway-standard-ro-system,minio-gateway-standard-system,monitoring-system,notebook-cleanup-system,nvidia-system,oauth2-proxy-system,profiles-argocd-system,prometheus-system,s3proxy-default,shared-daaas-system,solr-operator-system,statcan-system,trino-protb-system,trino-system,vault-agent-system,vault-system,velero-system")
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
