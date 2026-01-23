import { Params } from '@angular/router';
import { V1PersistentVolumeClaim, V1Volume } from '@kubernetes/client-node';
import { Status, STATUS_TYPE } from 'kubeflow';

export interface PVCResponseObject {
  age: {
    uptime: string;
    timestamp: string;
  };
  capacity: string;
  class: string;
  modes: string[];
  name: string;
  namespace: string;
  status: Status;
  notebooks: string[];
  usage: string;
  usedBytes: string;
  viewer: {
    status: STATUS_TYPE;
    url: string;
  };

  extraFields?: { [key: string]: any };
  usedBy?: string | null;
  labels?: { [key: string]: any };
}

export interface PVCUsageDataObject {
  name: string;
  usage: string;
  usedBytes: string;
}

export interface GetPVCResponseObject {
  pvc: V1PersistentVolumeClaim;
  notebooks: string[];
}

export interface Volume {
  name: string;
  mount: string;
  newPvc?: V1PersistentVolumeClaim;
  existingSource?: V1Volume;
}

export interface PVCProcessedObject extends PVCResponseObject {
  deleteAction?: string;
  editAction?: string;
  closePVCViewerAction?: string;
  openPVCViewerAction?: string;
  ageValue?: string;
  ageTooltip?: string;
  usageRounded?: string;
  usedBytesFormatted?: string;
  link: {
    text: string;
    url: string;
    queryParams?: Params | null;
  };
}

export interface PVCPostObject {
  name: string;
  type: string;
  size: string | number;
  class: string;
  mode: string;
  snapshot: string;
}
