import { Component, Input, Output, EventEmitter } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { Resource } from "src/app/utils/types";
import {MatDialog} from "@angular/material/dialog";
import {ConfirmDialogComponent} from "../confirm-dialog/confirm-dialog.component";
import {first} from "rxjs/operators";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: "app-resource-table",
  templateUrl: "./resource-table.component.html",
  styleUrls: ["./resource-table.component.scss", "../main-table.component.scss"]
})
export class ResourceTableComponent{
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
    private dialog: MatDialog,
    private translate: TranslateService
  ) { }

  // Resource (Notebook) Actions
  connectResource(rsrc: Resource): void {
    window.open(`/notebook/${rsrc.namespace}/${rsrc.name}/`);
  }

  deleteResource(rsrc: Resource): void {
    const yesAnswer = this.translate.instant("resourceTable.deleteDialogYes");
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: "fit-content",
      data: {
        title: this.translate.instant("resourceTable.deleteDialogTitle") + rsrc.name,
        message:
          this.translate.instant("resourceTable.deleteDialogMessage"),
        yes: yesAnswer,
        no: this.translate.instant("resourceTable.deleteDialogNo")
      }
    });
    dialogRef
      .afterClosed()
      .pipe(first())
      .subscribe(result => {
        if (result !== yesAnswer) {
          return;
        }
        this.deleteNotebookEvent.emit(rsrc);
      });
  }

}
