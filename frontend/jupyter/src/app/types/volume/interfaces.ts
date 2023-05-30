import { V1PersistentVolumeClaim, V1Volume } from '@kubernetes/client-node';
import { Status } from 'kubeflow';

export interface VolumeResponseObject {
  name: string;
  size: string;
  mode: string;
  namespace?: string;
  extraFields?: { [key: string]: any };
  usedBy?: string | null;
  status?: Status;
  labels?: { [key: string]: any };
}

export interface Volume {
  name: string;
  mount: string;
  newPvc?: V1PersistentVolumeClaim;
  existingSource?: V1Volume;
}

export interface VolumeProcessedObject extends VolumeResponseObject {
  deleteAction?: string;
  protB?: boolean;
}
