package main

import (
	"net/http"

	corev1 "k8s.io/api/core/v1"
)

type SpawnerFormDefaults struct {
	Image            Image           `yaml:"image" json:"image"`
	ImageGroupOne    ImageGroup      `yaml:"imageGroupOne" json:"imageGroupOne"`
	ImageGroupTwo    ImageGroup      `yaml:"imageGroupTwo" json:"imageGroupTwo"`
	ImageGroupThree  ImageGroup      `yaml:"imageGroupThree" json:"imageGroupThree"`
	AllowCustomImage bool            `yaml:"allowCustomImage" json:"allowCustomImage"`
	ImagePullPolicy  ImagePullPolicy `yaml:"imagePullPolicy" json:"imagePullPolicy"`
	CPU              CPU             `yaml:"cpu" json:"cpu"`
	Memory           CPU             `yaml:"memory" json:"memory"`
	WorkspaceVolume  WorkspaceVolume `yaml:"workspaceVolume" json:"workspaceVolume"`
	DataVolumes      DataVolumes     `yaml:"dataVolumes" json:"dataVolumes"`
	GPUs             GPUs            `yaml:"gpus" json:"gpus"`
	Shm              Shm             `yaml:"shm" json:"shm"`
	Configurations   Configurations  `yaml:"configurations" json:"configurations"`
	AffinityConfig   AffinityConfig  `yaml:"affinityConfig" json:"affinityConfig"`
	TolerationGroup  TolerationGroup `yaml:"tolerationGroup" json:"tolerationGroup"`
	HideRegistry     bool            `yaml:"hideRegistry" json:"hideRegistry"`
	HideTag          bool            `yaml:"hideTag" json:"hideTag"`
}

type AffinityConfig struct {
	Value    string                 `yaml:"value" json:"value"`
	Options  []AffinityConfigOption `yaml:"options" json:"options"`
	ReadOnly bool                   `yaml:"readOnly" json:"readOnly"`
}

type AffinityConfigOption struct {
	ConfigKey   string          `yaml:"configKey" json:"configKey"`
	DisplayName string          `yaml:"displayName" json:"displayName"`
	Affinity    corev1.Affinity `yaml:"affinity" json:"affinity"`
}

type LabelSelectorMatchExpression struct {
	Key      string `yaml:"key" json:"key"`
	Operator string `yaml:"operator" json:"operator"`
}

type CPU struct {
	Value       string `yaml:"value" json:"value"`
	LimitFactor string `yaml:"limitFactor" json:"limitFactor"`
	ReadOnly    bool   `yaml:"readOnly" json:"readOnly"`
}

type Configurations struct {
	Value    []string `yaml:"value" json:"value"`
	ReadOnly bool     `yaml:"readOnly" json:"readOnly"`
}

type DataVolumes struct {
	Value    []ValueElement `yaml:"value" json:"value"`
	ReadOnly bool           `yaml:"readOnly" json:"readOnly"`
}

type ValueElement struct {
	Value ValueValue `yaml:"value" json:"value"`
}

type ValueValue struct {
	//this has to change
	Type        ImagePullPolicy `yaml:"type" json:"type"`
	Name        ImagePullPolicy `yaml:"name" json:"name"`
	Size        ImagePullPolicy `yaml:"size" json:"size"`
	MountPath   ImagePullPolicy `yaml:"mountPath" json:"mountPath"`
	AccessModes ImagePullPolicy `yaml:"accessModes" json:"accessModes"`
	Class       ImagePullPolicy `yaml:"class" json:"class"`
}

type ImagePullPolicy struct {
	Value string `yaml:"value" json:"value"`
}

type GPUs struct {
	Value    GpusValue `yaml:"value" json:"value"`
	ReadOnly bool      `yaml:"readOnly" json:"readOnly"`
}

type GpusValue struct {
	Num     string   `yaml:"num" json:"num"`
	Vendors []Vendor `yaml:"vendors" json:"vendors"`
	Vendor  string   `yaml:"vendor" json:"vendor"`
}

type Vendor struct {
	LimitsKey string `yaml:"limitsKey" json:"limitsKey"`
	UIName    string `yaml:"uiName" json:"uiName"`
}

type Image struct {
	Value        string   `yaml:"value" json:"value"`
	Options      []string `yaml:"options" json:"options"`
	ReadOnly     bool     `yaml:"readOnly" json:"readOnly"`
	HideRegistry bool     `yaml:"hideRegistry" json:"hideRegistry"`
	HideVersion  bool     `yaml:"hideVersion" json:"hideVersion"`
}

type ImageGroup struct {
	DisabledMessage  map[string]string `yaml:"disabledMessage" json:"disabledMessage,omitempty"`
	EnabledCondition *EnabledCondition `yaml:"enabledCondition" json:"enabledCondition,omitempty"`
	Value            string            `yaml:"value" json:"value"`
	Options          []string          `yaml:"options" json:"options"`
}

type EnabledCondition struct {
	Labels map[string]string `yaml:"labels" json:"labels,omitempty"`
}

type Shm struct {
	Value    bool `yaml:"value" json:"value"`
	ReadOnly bool `yaml:"readOnly" json:"readOnly"`
}

type TolerationGroup struct {
	Value    string                  `yaml:"value" json:"value"`
	Options  []TolerationGroupOption `yaml:"options" json:"options"`
	ReadOnly bool                    `yaml:"readOnly" json:"readOnly"`
}

type TolerationGroupOption struct {
	GroupKey    string              `yaml:"groupKey" json:"groupKey"`
	DisplayName string              `yaml:"displayName" json:"displayName"`
	Tolerations []corev1.Toleration `yaml:"tolerations" json:"tolerations"`
}

type WorkspaceVolume struct {
	// this has to change
	Value    ValueValue `yaml:"value" json:"value"`
	ReadOnly bool       `yaml:"readOnly" json:"readOnly"`
}

type Configuration struct {
	SpawnerFormDefaults SpawnerFormDefaults `yaml:"spawnerFormDefaults" json:"spawnerFormDefaults"`
}

type configresponse struct {
	APIResponseBase
	Config SpawnerFormDefaults `json:"config"`
}

func (s *server) GetConfig(w http.ResponseWriter, r *http.Request) {
	s.respond(w, r, &configresponse{
		APIResponseBase: APIResponseBase{
			Success: true,
			Status:  http.StatusOK,
		},
		Config: s.Config.SpawnerFormDefaults,
	})
}
