import { Component } from '@angular/core';
import { TableColumnComponent } from 'kubeflow/lib/resource-table/component-value/component-value.component';

@Component({
  selector: 'app-size',
  templateUrl: './size.component.html',
  styleUrls: ['./size.component.scss'],
})
export class SizeComponent implements TableColumnComponent {
  private data: any;

  set element(data: any) {
    this.data = data;
  }
  get element() {
    return this.data;
  }

  constructor() {}

  isPendingResize(): boolean {
    return this.element.pendingResize != '0';
  }

  getResizeTooltipMessage(): string {
    return $localize`Resize pending: This volume will be resized to ${this.element.pendingResize} once used with a running notebook server`;
  }
}
