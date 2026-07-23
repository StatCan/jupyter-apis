import { ActionIconValue } from './action-icon-value';
import { ActionButtonValue } from './action-button';
import { MenuIconValue } from './menu-icon-value';
import { ComponentValue } from './component-value';

export class ActionListValue {
  constructor(
    public actions: (ActionIconValue | ActionButtonValue | MenuIconValue | ComponentValue)[],
  ) {}
}

export interface ActionConfig {
  name: string;
  tooltip?: string;
  color: string;
  field?: string;
}
