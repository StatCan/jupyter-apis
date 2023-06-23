import { AffinityConfig } from './affinity';
import { GPU } from './gpu';
import { TolerationGroup } from './toleration';
import { Volume } from './volume';

export interface Config {
  image?: {
    value: string;
    options: string[];
  };

  imageGroupOne?: {
    disabledMessage?: Map<string, string>;
    enabledCondition?: { labels: Map<string, string> };
    value: string;
    options: string[];
  };

  imageGroupTwo?: {
    disabledMessage?: Map<string, string>;
    enabledCondition?: { labels: Map<string, string> };
    value: string;
    options: string[];
  };

  imageGroupThree?: {
    disabledMessage?: Map<string, string>;
    enabledCondition?: { labels: Map<string, string> };
    value: string;
    options: string[];
  };

  hideRegistry?: boolean;

  hideTag?: boolean;

  allowCustomImage?: boolean;

  imagePullPolicy?: {
    value: string;
    readOnly?: boolean;
  };

  cpu?: {
    value: string;
    gpuDefault: string;
    limitFactor: string;
    readOnly?: boolean;
  };

  memory?: {
    value: string;
    gpuDefault: string;
    limitFactor: string;
    readOnly?: boolean;
  };

  environment?: {
    value: string;
    readOnly?: boolean;
  };

  workspaceVolume?: {
    value: Volume;
    readOnly?: boolean;
  };

  dataVolumes?: {
    value: Volume[];
    readOnly?: boolean;
  };

  affinityConfig?: {
    value: string;
    options: AffinityConfig[];
    readOnly?: boolean;
  };

  tolerationGroup?: {
    value: string;
    options: TolerationGroup[];
    readOnly?: boolean;
  };

  shm?: {
    value: boolean;
    readOnly?: boolean;
  };

  gpus?: {
    value?: GPU;
    readOnly?: boolean;
  };

  configurations?: {
    value: string[];
    readOnly?: boolean;
  };
}
