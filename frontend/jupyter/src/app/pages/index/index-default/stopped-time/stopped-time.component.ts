import { Component } from '@angular/core';
import { TableColumnComponent } from 'kubeflow/lib/resource-table/component-value/component-value.component';
import { NotebookProcessedObject } from 'src/app/types';

@Component({
  selector: 'app-stopped-time',
  templateUrl: './stopped-time.component.html',
  styleUrls: ['./stopped-time.component.scss'],
})
export class StoppedTimeComponent implements TableColumnComponent {
  lastStoppedDatetime: string = "";
  isCulled: boolean = false;
  constructor() {}

  set element(notebook: NotebookProcessedObject) {
    console.log(notebook);
    this.lastStoppedDatetime = notebook.lastStopped;
    this.isCulled = notebook.isCulled;
  }

  getCulledTooltipMessage(): string {
    return $localize`This notebook server was last stopped because of inactivity`;
  }
}
