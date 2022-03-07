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
  title: 'jupyter.volumeTable.notebookVolumes',
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
      matHeaderCellDef: 'common.size',
      matColumnDef: 'size',
      value: new PropertyValue({ field: 'size' }),
    },
    {
      matHeaderCellDef: 'jupyter.volumeTable.usedBy',
      matColumnDef: 'usedBy',
      value: new PropertyValue({ field: 'usedBy' }),
    },
    {
      matHeaderCellDef: '',
      matColumnDef: 'actions',
      value: new ActionListValue([
        new ActionIconValue({
          name: 'delete',
          tooltip: 'jupyter.volumeTable.tooltipDeleteVolume',
          color: 'warn',
          field: 'deleteAction',
          iconReady: 'material:delete',
        }),
      ]),
  },
  ],
};

export function getDeleteVolumeDialogConfig(name: string): DialogConfig {
  return { // TODO key + param
    title: {
      key: 'jupyter.volumeTable.tooltipDeleteVolumeName',
      params: { name: name }
      },
    message: 'jupyter.volumeTable.deleteDialogMessage',
    accept: 'common.deleteCaps',
    confirmColor: 'warn',
    cancel: 'common.cancelCaps',
    error: '',
    applying: 'common.deletingCaps',
    width: '600px',
  };
}

// --- Config for the Cost Table ---
export const defaultCostConfig = {
  icon: 'attach_money',
  title: 'Cost',
  columns: [
    {
      matHeaderCellDef: 'Compute',
      matColumnDef: 'compute',
      value: new PropertyValue({ field: 'cpuCost' }),
    },
    {
      matHeaderCellDef: 'GPUs',
      matColumnDef: 'gpus',
      value: new PropertyValue({ field: 'gpuCost' }),
    },
    {
      matHeaderCellDef: 'Storage',
      matColumnDef: 'storage',
      value: new PropertyValue({ field: 'pvCost' }),
    },
    {
      matHeaderCellDef: 'Total',
      matColumnDef: 'total',
      value: new PropertyValue({ field: 'totalCost' }),
    },
  ],
};
