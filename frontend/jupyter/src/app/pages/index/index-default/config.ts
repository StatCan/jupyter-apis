import {
  PropertyValue,
  StatusValue,
  ActionListValue,
  ActionIconValue,
  ActionButtonValue,
  MenuValue,
  ComponentValue,
  TableConfig,
  DateTimeValue,
  LinkValue,
  LinkType,
  TableColumn,
} from 'kubeflow';
import { ServerTypeComponent } from './server-type/server-type.component';
import { quantityToScalar } from '@kubernetes/client-node/dist/util';
import { ProtBComponent } from './protb-icon/protb-icon.component';
import { tableConfig } from '../config';
import { DeleteButtonComponent } from '../columns/delete-button/delete-button.component';

// --- Config for the Resource Table ---
export const defaultConfig: TableConfig = {
  dynamicNamespaceColumn: true,
  columns: [
    {
      matHeaderCellDef: $localize`Status`,
      matColumnDef: 'status',
      value: new StatusValue(),
      sort: true,
    },
    {
      matHeaderCellDef: $localize`Name`,
      matColumnDef: 'name',
      style: { width: '25%' },
      value: new LinkValue({
        field: 'link',
        popoverField: 'name',
        truncate: true,
        linkType: LinkType.Internal,
      }),
      sort: true,
    },
    {
      matHeaderCellDef: '',
      matColumnDef: 'prot-b',
      value: new ComponentValue({
        component: ProtBComponent,
      }),
      sort: true,
    },
    {
      matHeaderCellDef: $localize`Type`,
      matColumnDef: 'type',
      value: new ComponentValue({
        component: ServerTypeComponent,
      }),
      sort: true,
      sortingPreprocessorFn: element => element.serverType,
      filteringPreprocessorFn: element => {
        if (element.serverType === 'group-one') {
          return 'rstudio';
        } else if (element.serverType === 'group-two') {
          return 'ubuntu';
        } else if (element.serverType === 'group-three') {
          return 'sas';
        } else {
          return 'jupyterlab';
        }
      },
    },
    {
      matHeaderCellDef: $localize`Created at`,
      matColumnDef: 'age',
      style: { width: '12%' },
      textAlignment: 'right',
      value: new DateTimeValue({ field: 'age' }),
      sort: true,
    },
    {
      matHeaderCellDef: $localize`Last activity`,
      matColumnDef: 'last_activity',
      textAlignment: 'right',
      value: new DateTimeValue({ field: 'last_activity' }),
      sort: true,
    },
    {
      matHeaderCellDef: $localize`Image`,
      matColumnDef: 'image',
      style: { width: '30%' },
      value: new PropertyValue({
        field: 'shortImage',
        popoverField: 'image',
        truncate: true,
        style: { maxWidth: '300px' },
      }),
      sort: true,
    },
    {
      matHeaderCellDef: $localize`GPUs`,
      matColumnDef: 'gpus',
      style: { width: '8%' },
      textAlignment: 'right',
      value: new PropertyValue({
        field: 'gpus.count',
        tooltipField: 'gpus.message',
      }),
      sort: true,
    },
    {
      matHeaderCellDef: $localize`CPUs`,
      matColumnDef: 'cpu',
      style: { width: '8%' },
      textAlignment: 'right',
      value: new PropertyValue({ field: 'cpu' }),
      sort: true,
      sortingPreprocessorFn: quantityToScalar,
    },
    {
      matHeaderCellDef: $localize`Memory`,
      matColumnDef: 'memory',
      style: { width: '8%' },
      textAlignment: 'right',
      value: new PropertyValue({ field: 'memory' }),
      sort: true,
      sortingPreprocessorFn: quantityToScalar,
    },

    {
      matHeaderCellDef: '',
      matColumnDef: 'actions',
      value: new ActionListValue([
        new ActionButtonValue({
          name: 'connect',
          tooltip: $localize`Connect to this notebook server`,
          color: 'primary',
          field: 'connectAction',
          text: $localize`CONNECT`,
        }),
        new ActionIconValue({
          name: 'start-stop',
          tooltipInit: $localize`Stop this notebook server`,
          tooltipReady: $localize`Start this notebook server`,
          color: '',
          field: 'startStopAction',
          iconInit: 'material:stop',
          iconReady: 'material:play_arrow',
        }),
        new ActionIconValue({
          name: 'delete',
          tooltip: $localize`Delete this notebook server`,
          color: '',
          field: 'deleteAction',
          iconReady: 'material:delete',
        }),
      ]),
    },
  ],
};

const customDeleteCol: TableColumn = {
  matHeaderCellDef: '',
  matColumnDef: 'customDelete',
  style: { width: '40px' },
  value: new ComponentValue({
    component: DeleteButtonComponent,
  }),
};

export const defaultVolumeConfig: TableConfig = {
  title: tableConfig.title,
  dynamicNamespaceColumn: true,
  newButtonText: tableConfig.newButtonText,
  columns: tableConfig.columns.concat(customDeleteCol),
};

// --- Config for the Cost Table ---
export const defaultCostConfig = {
  columns: [
    {
      matHeaderCellDef: $localize`CPUs`,
      matColumnDef: 'cpus',
      value: new PropertyValue({ field: 'cpuCost' }),
    },
    {
      matHeaderCellDef: $localize`GPUs`,
      matColumnDef: 'gpus',
      value: new PropertyValue({ field: 'gpuCost' }),
    },
    {
      matHeaderCellDef: $localize`RAM`,
      matColumnDef: 'ram',
      value: new PropertyValue({ field: 'ramCost' }),
    },
    {
      matHeaderCellDef: $localize`Storage`,
      matColumnDef: 'storage',
      value: new PropertyValue({ field: 'pvCost' }),
    },
    //AAW: Commented out shared cost
    //{
    //  matHeaderCellDef: $localize`Shared`,
    //  matColumnDef: 'shared',
    //  value: new PropertyValue({ field: 'sharedCost' }),
    //},
    {
      matHeaderCellDef: $localize`Total`,
      matColumnDef: 'total',
      value: new PropertyValue({ field: 'totalCost' }),
    },
  ],
};
