import { Component } from '@angular/core';
import { TableColumnComponent } from 'kubeflow/lib/resource-table/component-value/component-value.component';
import { NotebookProcessedObject } from 'src/app/types';

@Component({
  selector: 'app-default-icon',
  templateUrl: './default-icon.component.html',
  styleUrls: ['./default-icon.component.scss'],
})
export class DefaultComponent implements TableColumnComponent {
  isDefault: boolean = false;

  constructor() {}

  set element(elem: NotebookProcessedObject) {
    this.isDefault = elem?.default ? true : false;
  }

  public isDefaultNotebook() {
    return this.isDefault;
  }
}
