import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { Resource } from "src/app/utils/types";
import {MatDialog} from "@angular/material/dialog";
import {ConfirmDialogComponent} from "../confirm-dialog/confirm-dialog.component";
import {first} from "rxjs/operators";

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

  constructor(
    private dialog: MatDialog
  ) {}

  ngOnInit() {  }

  ngOnDestroy() {  }

  // Resource (Notebook) Actions
  connectResource(rsrc: Resource): void {
    window.open(`/notebook/${rsrc.namespace}/${rsrc.name}/`);
  }
  
  deleteResource(rsrc: Resource): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: "fit-content",
      data: {
        title: "You are about to delete Notebook Server: " + rsrc.name,
        message:
          "Are you sure you want to delete this Notebook Server? " +
          "Your data might be lost if the Server is not backed by persistent storage.",
        yes: "delete",
        no: "cancel"
      }
    });
    dialogRef
      .afterClosed()
      .pipe(first())
      .subscribe(result => {
        if (result !== "delete") {
          return;
        }
        this.deleteNotebookEvent.emit(rsrc);
      });
  }

}
