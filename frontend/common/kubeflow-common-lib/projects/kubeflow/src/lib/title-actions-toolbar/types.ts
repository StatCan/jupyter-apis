export interface ToolbarButtonConfig {
  icon?: string;
  text: string;
  disabled?: boolean;
  color?: string;
  stroked?: boolean;
  tooltip?: string;
  fn: () => any;
  menu?: ToolbarButton[];
}

export class ToolbarButton {
  icon: string;
  text: string;
  disabled: boolean;
  color: string;
  stroked: boolean;
  tooltip: string;
  fn: () => any;
  menu: ToolbarButton[];

  private defaults: ToolbarButtonConfig = {
    icon: '',
    text: '',
    disabled: false,
    color: 'primary',
    stroked: false,
    tooltip: '',
    fn: () => {},
    menu: [],
  };

  constructor(config: ToolbarButtonConfig) {
    const { icon, text, disabled, color, stroked, tooltip, fn, menu } = {
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
    this.menu = menu;
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
