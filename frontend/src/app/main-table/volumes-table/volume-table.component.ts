import {Component, Input, Output, EventEmitter, OnChanges, SimpleChanges} from "@angular/core";
import {MatTableDataSource} from "@angular/material/table";
import {Volume} from "../../utils/types";
import {MatDialog} from "@angular/material/dialog";
import {ConfirmDialogComponent} from "../confirm-dialog/confirm-dialog.component";
import {first} from "rxjs/operators";
import {TranslateService} from "@ngx-translate/core";

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

  constructor(private dialog: MatDialog, private translate: TranslateService) {}

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
    const yesAnswer = this.translate.instant("volumeTable.deleteDialogYes");
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: "fit-content",
      data: {
        title:
          this.translate.instant("volumeTable.deleteDialogTitle") +
          pvc.pvc.name,
        message: this.translate.instant("volumeTable.deleteDialogMessage"),
        yes: yesAnswer,
        no: this.translate.instant("volumeTable.deleteDialogNo")
      }
    });

    dialogRef
      .afterClosed()
      .pipe(first())
      .subscribe(result => {
        if (result !== yesAnswer) {
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
