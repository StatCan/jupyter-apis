import { ActionIconValue } from './action-icon-value';
import { ActionButtonValue } from './action-button';
import { MenuIconValue } from './menu-icon-value';

export class ActionListValue {
  constructor(
    public actions: (ActionIconValue | ActionButtonValue | MenuIconValue)[],
  ) {}
}

export interface ActionConfig {
  name: string;
  tooltip?: string;
  color: string;
  field?: string;
}
