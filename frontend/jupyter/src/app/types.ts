import { BackendResponse } from 'kubeflow';

export interface JWABackendResponse extends BackendResponse {
  notebooks?: NotebookResponseObject[];
  pvcs?: Volume[];
  config?: Config;
  poddefaults?: PodDefault[];
  vendors?: string[];
}

export interface VWABackendResponse extends BackendResponse {
  pvcs?: VolumeResponseObject[];
}

export type ServerType = 'jupyter' | 'group-one' | 'group-two';

export interface NotebookResponseObject { //The notebook table
  name: string;
  namespace: string;
  serverType: ServerType;
  status: Status;
  reason: string;
  age: string;
  image: string;
  volumes: string[];
  cpu: string;
  memory: string;
  gpus: {
    count: number;
    message: string;
  };
  environment: string;
  shortImage: string;
  language: string;
}

export interface NotebookProcessedObject extends NotebookResponseObject {
  deleteAction?: string;
  connectAction?: string;
  startStopAction?: string;
}

export interface NotebookFormObject {
  name: string;
  namespace: string;
  image: string;
  imageGroupOne: string;
  imageGroupTwo: string;
  allowCustomImage: boolean;
  imagePullPolicy: string;
  customImage?: string;
  customImageCheck: boolean;
  serverType: string;
  cpu: number | string;
  cpuLimit: number | string;
  memory: number | string;
  memoryLimit: number | string;
  gpus: GPU;
  environment?: string;
  noWorkspace: boolean;
  workspace: Volume;
  datavols: Volume[];
  language: string;
  shm: boolean;
  configurations: PodDefault[];
}

export interface Volume {
  name: string;
  size: number;
  namepsace?: string;
  class?: string;
  mode: string;
  type?: string;
  path: string;
  extraFields?: { [key: string]: any };
  templatedName?: string;
}

// Backend response type
export interface Resp {
  namespaces?: string[];
  notebooks?: Resource[];
  storageclasses?: string[];
  defaultStorageClass?: string;
  pvcs?: Volume[];
  config?: any;
  poddefaults?: PodDefault[];
  success: boolean;
  log?: string;
}

// Notebooks received from backend
export interface Resource {
  name: string;
  namespace: string;
  status: string;
  reason: string;
  age: string;
  image: string;
  volumes: string[];
  cpu: string;
  memory: string;
  shortImage: string;
}

export function emptyVolume(): Volume {
  return {
    type: '',
    name: '',
    size: 1,
    path: '',
    mode: '',
    extraFields: {},
    templatedName: '',
  };
}

// Types of the Configuration with default values from backend
export interface PodDefault {
  label: string;
  desc: string;
}

export interface AffinityConfig {
  configKey: string;
  displayName: string;
  affinity: object;
}

export interface TolerationGroup {
  groupKey: string;
  displayName: string;
  tolerations: Toleration[];
}

export interface Toleration {
  key: string;
  operator: string;
  value: string;
  effect: string;
  tolerationSeconds?: bigint;
}

export interface GPUVendor {
  limitsKey: string;
  uiName: string;
}

export interface GPU {
  vendor?: string;
  num?: string;
  vendors?: GPUVendor[];
}

export interface Config {
  image?: {
    value: string;
    options: string[];
  };

  imageGroupOne?: {
    value: string;
    options: string[];
  };

  imageGroupTwo?: {
    value: string;
    options: string[];
  };

  hideRegistry?: boolean;

  hideTag?: boolean;

  allowCustomImage?: boolean;

  imagePullPolicy?: {
    value: string;
    readOnly?: boolean;
  };

  cpu?: {
    value: string;
    limitFactor: string;
    readOnly?: boolean;
  };

  memory?: {
    value: string;
    limitFactor: string;
    readOnly?: boolean;
  };

  environment?: {
    value: string;
    readOnly?: boolean;
  };

  workspaceVolume?: {
    value: ConfigVolume;
    readOnly?: boolean;
  };

  dataVolumes?: {
    value: {
      value: ConfigVolume;
    }[];
    readOnly?: boolean;
  };

  affinityConfig?: {
    value: string;
    options: AffinityConfig[];
    readOnly?: boolean;
  };

  tolerationGroup?: {
    value: string;
    options: TolerationGroup[];
    readOnly?: boolean;
  };

  shm?: {
    value: boolean;
    readOnly?: boolean;
  };

  gpus?: {
    value?: GPU;
    readOnly?: boolean;
  };

  configurations?: {
    value: string[];
    readOnly?: boolean;
  };
}

// Everything about volumes
export interface ConfigVolume {
  type: {
    value: string;
  };
  name: {
    value: string;
  };
  size: {
    value: string;
  };
  mountPath: {
    value: string;
  };
  accessModes: {
    value: string;
  };
  language?: {
    value: string;
    readOnly?: boolean;
  }
}

export interface VolumeResponseObject {
  name: string;
  size: number;
  namespace?: string;
  extraFields?: { [key: string]: any };
  usedBy?: string | null;
  status?: Status;
}


export interface VolumeProcessedObject extends VolumeResponseObject {
  deleteAction?: string;
}

export interface Status {
  phase: string;
  state: string;
  message: string;
  key: {
    Key: string;
    Params?: string[];
  }
}
export interface AggregateCostObject {
  cpuCost?: string;
  gpuCost?: string;
  pvCost?: string;
  total?: string;
};
