import { Injectable } from '@angular/core';
import {
  ConfirmDialogService,
  FormDialogService,
  DIALOG_RESP,
  FormDialogResponse,
  SnackBarConfig,
  SnackBarService,
  SnackType,
} from 'kubeflow';
import {
  getConfirmExpandVolumeDialogConfig,
  getDeleteDialogConfig,
  getDeleteVolumeDialogConfig,
  getExpandVolumeDialogConfig,
  getStopDialogConfig,
} from './config';
import { JWABackendService } from './backend.service';
import { Observable } from 'rxjs';
import { PVCProcessedObject } from '../types';

@Injectable({
  providedIn: 'root',
})
export class ActionsService {
  constructor(
    public backend: JWABackendService,
    public confirmDialog: ConfirmDialogService,
    public formDialog: FormDialogService,
    private snackBar: SnackBarService,
  ) {}

  deleteNotebook(namespace: string, name: string): Observable<string> {
    return new Observable(subscriber => {
      const deleteDialogConfig = getDeleteDialogConfig(name);

      const ref = this.confirmDialog.open(deleteDialogConfig);
      const delSub = ref.componentInstance.applying$.subscribe(applying => {
        if (!applying) {
          return;
        }

        // Close the open dialog only if the DELETE request succeeded
        this.backend.deleteNotebook(namespace, name).subscribe({
          next: _ => {
            ref.close(DIALOG_RESP.ACCEPT);
            const object = `${namespace}/${name}`;
            const message = $localize`Delete request was sent.`;
            const config: SnackBarConfig = {
              data: {
                msg: `${object}: ${message}`,
                snackType: SnackType.Info,
              },
              duration: 5000,
            };
            this.snackBar.open(config);
          },
          error: err => {
            const errorMsg = $localize`Error ${err}`;
            deleteDialogConfig.error = errorMsg;
            ref.componentInstance.applying$.next(false);
            subscriber.next(`fail`);
          },
        });

        // DELETE request has succeeded
        ref.afterClosed().subscribe(result => {
          delSub.unsubscribe();
          subscriber.next(result);
          subscriber.complete();
        });
      });
    });
  }

  connectToNotebook(namespace: string, name: string): void {
    // Open new tab to work on the Notebook
    window.open(`/notebook/${namespace}/${name}/`);
  }

  startNotebook(namespace: string, name: string): Observable<string> {
    return new Observable(subscriber => {
      this.backend.startNotebook(namespace, name).subscribe(response => {
        const config: SnackBarConfig = {
          data: {
            msg: $localize`Starting Notebook server '${name}'...`,
            snackType: SnackType.Info,
          },
        };
        this.snackBar.open(config);

        subscriber.next(response);
        subscriber.complete();
      });
    });
  }

  stopNotebook(namespace: string, name: string): Observable<string> {
    return new Observable(subscriber => {
      const stopDialogConfig = getStopDialogConfig(name);
      const ref = this.confirmDialog.open(stopDialogConfig);
      const stopSub = ref.componentInstance.applying$.subscribe(applying => {
        if (!applying) {
          return;
        }

        // Close the open dialog only if the request succeeded
        this.backend.stopNotebook(namespace, name).subscribe({
          next: _ => {
            ref.close(DIALOG_RESP.ACCEPT);

            const config: SnackBarConfig = {
              data: {
                msg: $localize`Stopping Notebook server '${name}'...`,
                snackType: SnackType.Info,
              },
            };
            this.snackBar.open(config);
          },
          error: err => {
            const errorMsg = $localize`Error ${err}`;
            stopDialogConfig.error = errorMsg;
            ref.componentInstance.applying$.next(false);
            subscriber.next(`fail`);
          },
        });

        // request has succeeded
        ref.afterClosed().subscribe(result => {
          stopSub.unsubscribe();
          subscriber.next(result);
          subscriber.complete();
        });
      });
    });
  }

  deleteVolume(name: string, namespace: string): Observable<string> {
    return new Observable(subscriber => {
      const deleteDialogConfig = getDeleteVolumeDialogConfig(name);

      const ref = this.confirmDialog.open(deleteDialogConfig);
      const delSub = ref.componentInstance.applying$.subscribe(applying => {
        if (!applying) {
          return;
        }

        // Close the open dialog only if the DELETE request succeeded
        this.backend.deletePVC(namespace, name).subscribe({
          next: _ => {
            ref.close(DIALOG_RESP.ACCEPT);

            const object = `${namespace}/${name}`;
            const message = $localize`Delete request was sent.`;
            const config: SnackBarConfig = {
              data: {
                msg: `${object}: ${message}`,
                snackType: SnackType.Info,
              },
            };
            this.snackBar.open(config);
          },
          error: err => {
            const errorMsg = $localize`Error ${err}`;
            deleteDialogConfig.error = errorMsg;
            ref.componentInstance.applying$.next(false);
            subscriber.next('fail');
          },
        });

        // DELETE request has succeeded
        ref.afterClosed().subscribe(result => {
          delSub.unsubscribe();
          subscriber.next(result);
          subscriber.complete();
        });
      });
    });
  }

  private openExpandVolumeSnackbar(pvc: PVCProcessedObject) {
    const object = `${pvc.namespace}/${pvc.name}`;
    const message = $localize`Expand request was sent.`;
    const config: SnackBarConfig = {
      data: {
        msg: `${object}: ${message}`,
        snackType: SnackType.Info,
      },
    };
    this.snackBar.open(config);
  }

  private confirmExpandVolume(
    pvc: PVCProcessedObject,
    newSize: number,
  ): Observable<string> {
    return new Observable(subscriber => {
      const confirmExpandDialogConfig = getConfirmExpandVolumeDialogConfig(
        pvc.name,
        newSize,
      );

      const confirmRef = this.confirmDialog.open(confirmExpandDialogConfig);
      const confirmExpandSub = confirmRef.componentInstance.applying$.subscribe(
        (applying: any) => {
          if (!applying) {
            return;
          }

          // Close the open dialog only if the DELETE request succeeded
          this.backend.expandPVC(pvc.namespace, pvc.name, newSize).subscribe({
            next: _ => {
              confirmRef.close(DIALOG_RESP.ACCEPT);

              this.openExpandVolumeSnackbar(pvc);
            },
            error: err => {
              const errorMsg = $localize`Error ${err}`;
              confirmExpandDialogConfig.error = errorMsg;
              confirmRef.componentInstance.applying$.next(false);
              subscriber.next('fail');
            },
          });
        },
      );

      // request has succeeded
      confirmRef.afterClosed().subscribe((result: string | undefined) => {
        confirmExpandSub.unsubscribe();
        subscriber.next(result);
        subscriber.complete();
      });
    });
  }

  expandVolume(pvc: PVCProcessedObject): Observable<string> {
    return new Observable(subscriber => {
      const expandDialogConfig = getExpandVolumeDialogConfig(
        pvc.name,
        pvc.capacity,
      );

      const ref = this.formDialog.open(expandDialogConfig);
      const expandSub = ref.componentInstance.applying$.subscribe(
        (res: FormDialogResponse) => {
          if (!res.applying) {
            return;
          }

          // if the size is bigger than 128, then show a confirmDialog before submiting the expand action
          if (res.newSize < 128) {
            this.backend
              .expandPVC(pvc.namespace, pvc.name, res.newSize)
              .subscribe({
                next: _ => {
                  ref.close(DIALOG_RESP.ACCEPT);

                  this.openExpandVolumeSnackbar(pvc);
                },
                error: err => {
                  const errorMsg = $localize`Error ${err}`;
                  expandDialogConfig.error = errorMsg;
                  ref.componentInstance.applying$.next({
                    applying: false,
                    newSize: res.newSize,
                  });
                  subscriber.next('fail');
                },
              });
          } else {
            this.confirmExpandVolume(pvc, res.newSize).subscribe(result => {
              // remove the applying status from the form dialog in case of cancelling the confirm dialog
              ref.componentInstance.isApplying = false;
              
              if (result !== DIALOG_RESP.ACCEPT) {
                return;
              } else {
                ref.close(DIALOG_RESP.ACCEPT);
              }
            });
          }
        },
      );

      // request has succeeded
      ref.afterClosed().subscribe((result: string | undefined) => {
        expandSub.unsubscribe();
        subscriber.next(result);
        subscriber.complete();
      });
    });
  }

  // This only updates the time, it is NOT the dialog
  updateKeepAlive(
    namespace: string,
    name: string,
    timehours: string,
  ): Observable<string> {
    return new Observable(subscriber => {
      this.backend
        .updateKeepAlive(namespace, name, timehours)
        .subscribe(response => {
          const config: SnackBarConfig = {
            data: {
              msg: $localize`Delaying the auto-shutdown delay of ${timehours} hours to '${name}'...`,
              snackType: SnackType.Info,
            },
          };
          this.snackBar.open(config);

          subscriber.next(response);
          subscriber.complete();
        });
    });
  }
}
