import { BackendResponse } from 'kubeflow';
import { Config } from './config';
import { NotebookResponseObject } from './notebook';
import { PodDefault } from './poddefault';
import { V1Namespace } from '@kubernetes/client-node';
import { VolumeResponseObject } from './volume/interfaces';

export interface JWABackendResponse extends BackendResponse {
  notebooks?: NotebookResponseObject[];
  pvcs?: VolumeResponseObject[];
  config?: Config;
  poddefaults?: PodDefault[];
  vendors?: string[];
  namespace?: V1Namespace;
}

export interface VWABackendResponse extends BackendResponse {
  pvcs?: VolumeResponseObject[];
}