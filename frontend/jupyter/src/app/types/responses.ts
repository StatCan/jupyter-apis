import { V1Pod } from '@kubernetes/client-node';
import { BackendResponse } from 'kubeflow';
import { Config } from './config';
import { EventObject } from './event';
import { NotebookRawObject, NotebookResponseObject } from './notebook';
import { PodDefault } from './poddefault';
import { VolumeResponseObject } from './volume';
import { V1Namespace } from '@kubernetes/client-node';

export interface JWABackendResponse extends BackendResponse {
  notebook?: NotebookRawObject;
  notebooks?: NotebookResponseObject[];
  logs: string[];
  pvcs?: VolumeResponseObject[];
  config?: Config;
  poddefaults?: PodDefault[];
  namespace?: V1Namespace;
  vendors?: string[];
  pod?: V1Pod;
  events?: EventObject[];
}

export interface VWABackendResponse extends BackendResponse {
  pvcs?: VolumeResponseObject[];
}