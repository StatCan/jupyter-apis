import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { Pvc } from "../../utils/types";

@Component({
  selector: "app-volume-table",
  templateUrl: "./volume-table.component.html",
  styleUrls: ["./volume-table.component.scss","../main-table.component.scss"]
})

export class VolumeTableComponent implements OnInit {
  @Input() custompvcs: Pvc[];
  @Output() deletePvcEvent = new EventEmitter<Pvc>();

  // Table data
  displayedColumns: string[] = [
    "name",
    "namespace",
    "isMounted",
    "actions"
  ];
  dataSource = new MatTableDataSource();

  constructor() { }

  ngOnInit() {  }

  ngOnDestroy() {  }

  deletePvc(pvc: Pvc){
    this.deletePvcEvent.emit(pvc);
  }
}
