import { V1PersistentVolumeClaim, V1Volume } from '@kubernetes/client-node';
import { Status } from 'kubeflow';

export interface Volume {
  name: string;
  mount: string;
  newPvc?: V1PersistentVolumeClaim;
  existingSource?: V1Volume;
}

export interface VolumeResponseObject {
  name: string;
  size: number;
  namespace?: string;
  extraFields?: { [key: string]: any };
  usedBy?: string | null;
  status?: Status;
  labels?: { [key: string]: any };
}


export interface VolumeProcessedObject extends VolumeResponseObject {
  deleteAction?: string;
  protB?: boolean;
}
