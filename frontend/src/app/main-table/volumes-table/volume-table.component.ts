import {Component, Input, Output, EventEmitter, OnChanges, SimpleChanges} from "@angular/core";
import {MatTableDataSource} from "@angular/material/table";
import {Volume} from "../../utils/types";
import {MatDialog} from "@angular/material/dialog";
import {ConfirmDialogComponent} from "../confirm-dialog/confirm-dialog.component";
import {first} from "rxjs/operators";

export type PvcWithStatus = {
  pvc: Volume;
  mountedBy: string | null;
}

@Component({
  selector: "app-volume-table",
  templateUrl: "./volume-table.component.html",
  styleUrls: ["./volume-table.component.scss", "../main-table.component.scss"]
})
export class VolumeTableComponent implements OnChanges {
  @Input() pvcProperties: PvcWithStatus[];
  @Output() deletePvcEvent = new EventEmitter<PvcWithStatus>();

  // Table data
  displayedColumns: string[] = ["status", "name", "size", "mountedBy", "actions"];
  dataSource = new MatTableDataSource();

  deleteStatus: Set<string> = new Set<string>();

  constructor(
    private dialog: MatDialog
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.pvcProperties) {
      const pvcNames = (changes.pvcProperties
        .currentValue as PvcWithStatus[]).map(p => p.pvc.name);
      this.deleteStatus.forEach(name => {
        if (!pvcNames.includes(name)) {
          this.deleteStatus.delete(name);
        }
      });
    }
  }

  deletePvc(pvc: PvcWithStatus): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: "fit-content",
      data: {
        title: "You are about to delete the volume: " + pvc.pvc.name,
        message:
          "Are you sure you want to delete this volume? " +
          "This action can't be undone.",
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
        this.deleteStatus.add(pvc.pvc.name);
        this.deletePvcEvent.emit(pvc);
      });
  }

  checkDeletionStatus(pvc: PvcWithStatus): boolean {
    return this.deleteStatus.has(pvc.pvc.name);
  }
}
