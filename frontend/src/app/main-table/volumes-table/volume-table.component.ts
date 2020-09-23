import {Component, Input, Output, EventEmitter} from "@angular/core";
import {MatTableDataSource} from "@angular/material/table";
import {Pvc} from "../../utils/types";

@Component({
  selector: "app-volume-table",
  templateUrl: "./volume-table.component.html",
  styleUrls: ["./volume-table.component.scss", "../main-table.component.scss"]
})
export class VolumeTableComponent {
  @Input() custompvcs: Pvc[];
  @Output() deletePvcEvent = new EventEmitter<Pvc>();

  // Table data
  displayedColumns: string[] = ["name", "size", "mountedBy", "actions"];
  dataSource = new MatTableDataSource();

  deletePvc(pvc: Pvc) {
    this.deletePvcEvent.emit(pvc);
  }
}
