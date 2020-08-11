package main

import "net/http"

type ConfigurationsConfiguration struct {
	Value    []string `yaml:"value" json:"value"`
	ReadOnly bool     `yaml:"readOnly" json:"readOnly"`
}

type SharedMemoryConfiguration struct {
	Value    bool `yaml:"value" json:"value"`
	ReadOnly bool `yaml:"readOnly" json:"readOnly"`
}

type GPUVendorConfiguration struct {
	LimitsKey string `yaml:"limitsKey" json:"limitsKey"`
	UIName    string `yaml:"uiName" json:"uiName"`
}

type GPUValueConfiguration struct {
	Quantity string                   `yaml:"num" json:"num"`
	Vendors  []GPUVendorConfiguration `yaml:"vendors" json:"vendors"`
	Vendor   string                   `yaml:"vendor" json:"vendor"`
}

type GPUConfiguration struct {
	Value    GPUValueConfiguration `yaml:"value" json:"value"`
	ReadOnly bool                  `yaml:"readOnly" json:"readOnly"`
}

type ValueConfiguration struct {
	Value string `yaml:"value" json:"value"`
}

type VolumeValueConfiguration struct {
	Type        ValueConfiguration `yaml:"type" json:"type"`
	Name        ValueConfiguration `yaml:"name" json:"name"`
	Size        ValueConfiguration `yaml:"size" json:"size"`
	MountPath   ValueConfiguration `yaml:"mountPath" json:"mountPath"`
	AccessModes ValueConfiguration `yaml:"accessModes" json:"accessModes"`
	Class       ValueConfiguration `yaml:"class" json:"class"`
}

type DataVolumesConfiguration struct {
	Values   []VolumeValueConfiguration `yaml:"value" json:"value"`
	ReadOnly bool                       `yaml:"readOnly" json:"readOnly"`
}

type WorkspaceVolumeConfiguration struct {
	Value    VolumeValueConfiguration `yaml:"value" json:"value"`
	ReadOnly bool                     `yaml:"readOnly" json:"readOnly"`
}

type ResourceConfiguration struct {
	Value    string `yaml:"value" json:"value"`
	ReadOnly bool   `yaml:"readOnly" json:"readOnly"`
}

type ImageConfiguration struct {
	Value        string   `yaml:"value" json:"value"`
	Options      []string `yaml:"options" json:"options"`
	ReadOnly     bool     `yaml:"readOnly" json:"readOnly"`
	HideRegistry bool     `yaml:"hideRegistry" json:"hideRegistry"`
	HideVersion  bool     `yaml:"hideVersion" json:"hideVersion"`
}

type SpawnerFormDefaults struct {
	Image           ImageConfiguration           `yaml:"image" json:"image"`
	CPU             ResourceConfiguration        `yaml:"cpu" json:"cpu"`
	Memory          ResourceConfiguration        `yaml:"memory" json:"memory"`
	WorkspaceVolume WorkspaceVolumeConfiguration `yaml:"workspaceVolume" json:"workspaceVolume"`
	DataVolumes     DataVolumesConfiguration     `yaml:"dataVolumes" json:"dataVolumes"`
	GPUs            GPUConfiguration             `yaml:"gpus" json:"gpus"`
	SharedMemory    SharedMemoryConfiguration    `yaml:"shm" json:"shm"`
	Configurations  ConfigurationsConfiguration  `yaml:"configurations" json:"configurations"`
}

type Configuration struct {
	SpawnerFormDefaults SpawnerFormDefaults `yaml:"spawnerFormDefaults" json:"spawnerFormDefaults"`
}

type configresponse struct {
	APIResponse
	Config SpawnerFormDefaults `json:"config"`
}

func (s *server) GetConfig(w http.ResponseWriter, r *http.Request) {
	s.respond(w, r, configresponse{
		APIResponse: APIResponse{
			Success: true,
		},
		Config: s.Config.SpawnerFormDefaults,
	})
}
