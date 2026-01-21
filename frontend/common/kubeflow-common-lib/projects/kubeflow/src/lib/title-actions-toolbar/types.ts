export interface ToolbarButtonConfig {
  icon?: string;
  text: string;
  disabled?: boolean;
  color?: string;
  stroked?: boolean;
  tooltip?: string;
  fn: () => any;
}

export class ToolbarButton {
  icon: string;
  text: string;
  disabled: boolean;
  color: string;
  stroked: boolean;
  tooltip: string;
  fn: () => any;

  private defaults: ToolbarButtonConfig = {
    icon: '',
    text: '',
    disabled: false,
    color: 'primary',
    stroked: false,
    tooltip: '',
    fn: () => {},
  };

  constructor(config: ToolbarButtonConfig) {
    const { icon, text, disabled, color, stroked, tooltip, fn } = {
      ...this.defaults,
      ...config,
    };

    this.icon = icon;
    this.text = text;
    this.disabled = disabled;
    this.color = color;
    this.tooltip = tooltip;
    this.fn = fn;
    this.stroked = stroked;
  }

  public namespaceChanged(ns: string | string[], resourceName: string) {
    // enable the button on single namespace
    if (!Array.isArray(ns)) {
      this.disabled = false;
      this.tooltip = '';
      return;
    }

    // all-namespaces was selected
    this.disabled = true;
    this.tooltip = $localize`Select a namespace in which to create a new ${resourceName}.`;
  }
}
