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

enum PvcStatus {
  DELETING,
  MOUNTED,
  UNMOUNTED
}

@Component({
  selector: "app-volume-table",
  templateUrl: "./volume-table.component.html",
  styleUrls: ["./volume-table.component.scss", "../main-table.component.scss"]
})
export class VolumeTableComponent implements OnChanges {
  @Input() pvcProperties: PvcWithStatus[];
  @Output() deletePvcEvent = new EventEmitter<PvcWithStatus>();

  PvcStatus = PvcStatus;

  // Table data
  displayedColumns: string[] = [
    "status",
    "name",
    "size",
    "mountedBy",
    "actions"
  ];
  dataSource = new MatTableDataSource();

  deletionStatus: Set<string> = new Set<string>();

  constructor(private dialog: MatDialog) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.pvcProperties) {
      const pvcNames = (changes.pvcProperties
        .currentValue as PvcWithStatus[]).map(p => p.pvc.name);
      this.deletionStatus.forEach(name => {
        if (!pvcNames.includes(name)) {
          this.deletionStatus.delete(name);
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
        this.deletionStatus.add(pvc.pvc.name);
        this.deletePvcEvent.emit(pvc);
      });
  }

  pvcStatus(pvc: PvcWithStatus): PvcStatus {
    if (this.deletionStatus.has(pvc.pvc.name)) {
      return PvcStatus.DELETING;
    }
    return pvc.mountedBy ? PvcStatus.MOUNTED : PvcStatus.UNMOUNTED;
  }
}
