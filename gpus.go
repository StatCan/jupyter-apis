package main

import (
	"net/http"
)

type gpusresponse struct {
	APIResponseBase
	Vendors []string `json:"vendors"`
}

// GetGPUVendors returns the GPU vendors
func (s *server) GetGPUVendors(w http.ResponseWriter, r *http.Request) {
	vendors := []string{}

	for _, vendor := range s.Config.SpawnerFormDefaults.GPUs.Value.Vendors {
		vendors = append(vendors, vendor.LimitsKey)
	}

	s.respond(w, r, &gpusresponse{
		APIResponseBase: APIResponseBase{
			Success: true,
			Status:  http.StatusOK,
		},
		Vendors: vendors,
	})
}
