import { BackendResponse } from 'kubeflow';
import { Config } from './config';
import { NotebookResponseObject } from './notebook';
import { PodDefault } from './poddefault';
import { PvcResponseObject } from './volume';
import { VolumeResponseObject } from './volume/interfaces';

export interface JWABackendResponse extends BackendResponse {
  notebooks?: NotebookResponseObject[];
  pvcs?: PvcResponseObject[];
  config?: Config;
  poddefaults?: PodDefault[];
  vendors?: string[];
}

export interface VWABackendResponse extends BackendResponse {
  pvcs?: VolumeResponseObject[];
}