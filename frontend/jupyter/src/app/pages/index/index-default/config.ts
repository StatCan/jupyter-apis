import {
  PropertyValue,
  StatusValue,
  ActionListValue,
  ActionIconValue,
  ActionButtonValue,
  TRUNCATE_TEXT_SIZE,
  MenuValue,
  DialogConfig,
  ComponentValue,
} from 'kubeflow';
import { ServerTypeComponent } from './server-type/server-type.component';

// --- Configs for the Confirm Dialogs ---
export function getDeleteDialogConfig(name: string): DialogConfig {
  return { // TODO key + param
    title: {
      key: 'jupyter.dialog.deleteDialogTitle',
      params: { name: name }
      },
    message: 'jupyter.dialog.deleteDialogMessage',
    accept: 'common.deleteCaps',
    confirmColor: 'warn',
    cancel: 'common.cancelCaps',
    error: '',
    applying: 'common.deletingCaps',
    width: '600px',
  };
}

export function getStopDialogConfig(name: string): DialogConfig {
  return { // TODO key + param
    title: {
      key: 'jupyter.dialog.stopDialogTitle',
      params: { name: name },
    },
    message: 'jupyter.dialog.stopDialogMessage',
    accept: 'common.stopCaps',
    confirmColor: 'primary',
    cancel: 'common.cancelCaps',
    error: '',
    applying: 'common.stoppingCaps',
    width: '600px',
  };
}

// --- Config for the Resource Table ---
export const defaultConfig = {
  icon: 'computer',
  title: 'Notebook Servers',
  newButtonText: 'NEW SERVER',
  title: 'jupyter.index.notebookServers',
  newButtonText: 'jupyter.index.newServersCaps',
  columns: [
    {
      matHeaderCellDef: 'common.status',
      matColumnDef: 'status',
      value: new StatusValue(),
    },
    {
      matHeaderCellDef: 'common.name',
      matColumnDef: 'name',
      value: new PropertyValue({
        field: 'name',
        truncate: TRUNCATE_TEXT_SIZE.SMALL,
        tooltipField: 'name',
      }),
    },
    {
      matHeaderCellDef: 'common.type',
      matColumnDef: 'type',
      value: new ComponentValue({
        component: ServerTypeComponent,
      }),
    },
    {
      matHeaderCellDef: 'common.age',
      matColumnDef: 'age',
      value: new PropertyValue({ field: 'age' }),
    },
    {
      matHeaderCellDef: 'common.image',
      matColumnDef: 'image',
      value: new PropertyValue({
        field: 'shortImage',
        tooltipField: 'image',
        truncate: TRUNCATE_TEXT_SIZE.MEDIUM,
      }),
    },
    {
      matHeaderCellDef: 'common.gpus',
      matColumnDef: 'gpus',
      value: new PropertyValue({
        field: 'gpus.count',
        tooltipField: 'gpus.message',
      }),
    },
    {
      matHeaderCellDef: 'jupyter.index.cpus',
      matColumnDef: 'cpu',
      value: new PropertyValue({ field: 'cpu' }),
    },
    {
      matHeaderCellDef: 'jupyter.index.memory',
      matColumnDef: 'memory',
      value: new PropertyValue({ field: 'memory' }),
    },
    {
      matHeaderCellDef: 'common.volumes',
      matColumnDef: 'volumes',
      value: new MenuValue({ field: 'volumes', itemsIcon: 'storage' }),
    },
    {
      matHeaderCellDef: '',
      matColumnDef: 'actions',
      value: new ActionListValue([
        new ActionButtonValue({
          name: 'connect',
          tooltip: 'jupyter.index.connectTooltip',
          color: 'primary',
          field: 'connectAction',
          text: 'common.connectCaps',
        }),
        new ActionIconValue({
          name: 'start-stop',
          tooltipInit: 'jupyter.index.stopNotebookServer',
          tooltipReady: 'jupyter.index.startNotebookServer',
          color: '',
          field: 'startStopAction',
          iconInit: 'material:stop',
          iconReady: 'material:play_arrow',
        }),
        new ActionIconValue({
          name: 'delete',
          tooltip: 'jupyter.index.deleteTooltip',
          color: '',
          field: 'deleteAction',
          iconReady: 'material:delete',
        }),
      ]),
    },
  ],
};

export const defaultVolumeConfig = {
  icon: 'storage',
  title: 'Notebook Volumes',
  columns: [
    {
      matHeaderCellDef: 'Status',
      matColumnDef: 'status',
      value: new StatusValue(),
    },
    {
      matHeaderCellDef: 'Name',
      matColumnDef: 'name',
      value: new PropertyValue({
        field: 'name',
        truncate: TRUNCATE_TEXT_SIZE.SMALL,
        tooltipField: 'name',
      }),
    },
    {
      matHeaderCellDef: 'Size',
      matColumnDef: 'size',
      value: new PropertyValue({ field: 'size' }),
    },
    {
      matHeaderCellDef: 'Used By',
      matColumnDef: 'usedBy',
      value: new PropertyValue({ field: 'usedBy' }),
    },
    {
      matHeaderCellDef: '',
      matColumnDef: 'actions',
      value: new ActionListValue([
        new ActionIconValue({
          name: 'delete',
          tooltip: 'Delete Volume',
          color: 'warn',
          field: 'deleteAction',
          iconReady: 'material:delete',
        }),
      ]),
    },
  ],
};
