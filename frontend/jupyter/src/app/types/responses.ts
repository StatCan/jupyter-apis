import { V1PersistentVolumeClaim, V1Pod } from '@kubernetes/client-node';
import { BackendResponse } from 'kubeflow';
import { Config } from './config';
import { EventObject } from './event';
import { NotebookRawObject, NotebookResponseObject } from './notebook';
import { PodDefault } from './poddefault';
import { PVCResponseObject } from './volume';
import { V1Namespace } from '@kubernetes/client-node';

export interface JWABackendResponse extends BackendResponse {
  notebook?: NotebookRawObject;
  notebooks?: NotebookResponseObject[];
  logs: string[];
  pvcs?: PVCResponseObject[];
  config?: Config;
  poddefaults?: PodDefault[];
  namespace?: V1Namespace;
  vendors?: string[];
  pod?: V1Pod;
  events?: EventObject[];
}

export interface VWABackendResponse extends BackendResponse {
  pvcs?: PVCResponseObject[];
  pvc?: V1PersistentVolumeClaim;
  events?: EventObject[];
  pods?: V1Pod[];
}
