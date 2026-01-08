import { ActionConfig } from './action';
import { get as getAttributeValue } from 'lodash';

export interface MenuIconConfig extends ActionConfig {
  matIcon: string;
}

export class MenuIconValue {
  name: string;
  tooltip: string;
  color: string;
  field: string;
  matIcon: string;

  private defaultValues: MenuIconConfig = {
    name: '',
    tooltip: '',
    color: '',
    field: '',
    matIcon: '',
  };

  constructor(config: MenuIconConfig) {
    const { name, tooltip, color, field, matIcon } = {
      ...this.defaultValues,
      ...config,
    };

    this.name = name;
    this.tooltip = tooltip;
    this.color = color;
    this.field = field;
    this.matIcon = matIcon;
    this.tooltip = tooltip;
  }

  getItems(row: any): any[] {
    return getAttributeValue(row, this.field);
  }
}
