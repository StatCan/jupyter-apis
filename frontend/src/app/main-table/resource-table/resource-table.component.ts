import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { Resource } from "src/app/utils/types";

@Component({
  selector: "app-resource-table",
  templateUrl: "./resource-table.component.html",
  styleUrls: ["./resource-table.component.scss", "../main-table.component.scss"]
})
export class ResourceTableComponent implements OnInit {
  @Input() notebooks: Resource[];
  @Output() deleteNotebookEvent = new EventEmitter<Resource>();

  displayedColumns: string[] = [
    "status",
    "name",
    "age",
    "image",
    "cpu",
    "memory",
    "volumes",
    "actions"
  ];
  dataSource = new MatTableDataSource();
  constructor() {}

  ngOnInit() {  }

  ngOnDestroy() {  }

  // Resource (Notebook) Actions
  connectResource(rsrc: Resource): void {
    window.open(`/notebook/${rsrc.namespace}/${rsrc.name}/`);
  }

  deleteResource(rsrc:Resource){
    this.deleteNotebookEvent.emit(rsrc);
  }
}
