import { Injectable } from '@angular/core';
import { BackendService, SnackBarService, SnackType } from 'kubeflow';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  NotebookResponseObject,
  NotebookRawObject,
  JWABackendResponse,
  Config,
  PodDefault,
  NotebookFormObject,
  PVCResponseObject,
  VWABackendResponse,
  PVCPostObject,
  GetPVCResponseObject,
} from '../types';
import { V1Namespace } from '@kubernetes/client-node';
import { V1PersistentVolumeClaim, V1Pod } from '@kubernetes/client-node';
import { EventObject } from '../types/event';
@Injectable({
  providedIn: 'root',
})
export class JWABackendService extends BackendService {
  constructor(public http: HttpClient, public snackBar: SnackBarService) {
    super(http, snackBar);
  }

  // GET
  private getNotebooksSingleNamespace(
    namespace: string,
  ): Observable<NotebookResponseObject[]> {
    const url = `api/namespaces/${namespace}/notebooks`;

    return this.http.get<JWABackendResponse>(url).pipe(
      catchError(error => this.handleError(error)),
      map((resp: JWABackendResponse) => resp.notebooks),
    );
  }

  private getNotebooksAllNamespaces(
    namespaces: string[],
  ): Observable<NotebookResponseObject[]> {
    return this.getObjectsAllNamespaces(
      this.getNotebooksSingleNamespace.bind(this),
      namespaces,
    );
  }

  public getNotebooks(
    ns: string | string[],
  ): Observable<NotebookResponseObject[]> {
    if (Array.isArray(ns)) {
      return this.getNotebooksAllNamespaces(ns);
    }

    return this.getNotebooksSingleNamespace(ns);
  }

  public getNotebook(
    namespace: string,
    notebookName: string,
  ): Observable<NotebookRawObject> {
    const url = `api/namespaces/${namespace}/notebooks/${notebookName}`;

    return this.http.get<JWABackendResponse>(url).pipe(
      catchError(error => this.handleError(error)),
      map((resp: JWABackendResponse) => resp.notebook),
    );
  }

  public getNotebookPod(notebook: NotebookRawObject): Observable<V1Pod> {
    const namespace = notebook.metadata.namespace;
    const notebookName = notebook.metadata.name;
    const url = `api/namespaces/${namespace}/notebooks/${notebookName}/pod`;

    return this.http.get<JWABackendResponse>(url).pipe(
      catchError(error => this.handleErrorExtended(error, [404])),
      map((resp: JWABackendResponse) => resp.pod),
    );
  }

  public getPodLogs(pod: V1Pod): Observable<string[]> {
    const namespace = pod.metadata.namespace;
    const notebookName = pod.metadata.labels['notebook-name'];
    const podName = pod.metadata.name;
    const url = `api/namespaces/${namespace}/notebooks/${notebookName}/pod/${podName}/logs`;
    return this.http.get<JWABackendResponse>(url).pipe(
      catchError(error => this.handleErrorExtended(error, [404, 400])),
      map((resp: JWABackendResponse) => resp.logs),
    );
  }

  public getNotebookEvents(
    notebook: NotebookRawObject,
  ): Observable<EventObject[]> {
    const namespace = notebook.metadata.namespace;
    const notebookName = notebook.metadata.name;
    const url = `api/namespaces/${namespace}/notebooks/${notebookName}/events`;

    return this.http.get<JWABackendResponse>(url).pipe(
      catchError(error => this.handleErrorExtended(error, [404])),
      map((resp: JWABackendResponse) => resp.events),
    );
  }

  public getConfig(): Observable<Config> {
    const url = `api/config`;

    return this.http.get<JWABackendResponse>(url).pipe(
      catchError(error => this.handleError(error)),
      map(data => data.config),
    );
  }

  private getNamespacedPVCs(
    namespace: string,
  ): Observable<PVCResponseObject[]> {
    const url = `api/namespaces/${namespace}/pvcs`;

    return this.http.get<VWABackendResponse>(url).pipe(
      catchError(error => this.handleError(error)),
      map((resp: VWABackendResponse) => {
        let pvcsCopy = JSON.parse(JSON.stringify(resp.pvcs));
        pvcsCopy = pvcsCopy.filter(pvc =>
          pvc.labels?.['blob.aaw.statcan.gc.ca/automount'] === 'true'
            ? false
            : true,
        );
        return pvcsCopy;
      }),
    );
  }

  private getPVCsAllNamespaces(
    namespaces: string[],
  ): Observable<PVCResponseObject[]> {
    return this.getObjectsAllNamespaces(
      this.getNamespacedPVCs.bind(this),
      namespaces,
    );
  }

  public getPVCs(ns: string | string[]): Observable<PVCResponseObject[]> {
    if (!Array.isArray(ns)) {
      return this.getNamespacedPVCs(ns);
    }

    return this.getPVCsAllNamespaces(ns);
  }

  public getPVC(
    namespace: string,
    pvcName: string,
  ): Observable<GetPVCResponseObject> {
    const url = `api/namespaces/${namespace}/pvcs/${pvcName}`;

    return this.http.get<VWABackendResponse>(url).pipe(
      catchError(error => this.handleError(error)),
      map((resp: VWABackendResponse) => ({
        pvc: resp.pvc,
        notebooks: resp.notebooks,
      })),
    );
  }

  public getPVCEvents(pvc: V1PersistentVolumeClaim): Observable<EventObject[]> {
    const namespace = pvc.metadata.namespace;
    const pvcName = pvc.metadata.name;
    const url = `api/namespaces/${namespace}/pvcs/${pvcName}/events`;

    return this.http.get<VWABackendResponse>(url).pipe(
      catchError(error => this.handleError(error)),
      map((resp: VWABackendResponse) => resp.events),
    );
  }

  public getPodsUsingPVC(pvc: V1PersistentVolumeClaim): Observable<V1Pod[]> {
    const namespace = pvc.metadata.namespace;
    const pvcName = pvc.metadata.name;
    const url = `api/namespaces/${namespace}/pvcs/${pvcName}/pods`;

    return this.http.get<VWABackendResponse>(url).pipe(
      catchError(error => this.handleError(error)),
      map((resp: VWABackendResponse) => resp.pods),
    );
  }

  public getPodDefaults(ns: string): Observable<PodDefault[]> {
    // Get existing PodDefaults in a namespace
    const url = `api/namespaces/${ns}/poddefaults`;

    return this.http.get<JWABackendResponse>(url).pipe(
      catchError(error => this.handleError(error)),
      map(data => data.poddefaults),
    );
  }

  public getGPUVendors(): Observable<string[]> {
    // Get installed GPU vendors
    const url = `api/gpus`;

    return this.http.get<JWABackendResponse>(url).pipe(
      catchError(error => this.handleError(error)),
      map(data => data.vendors),
    );
  }

  // POST
  public createNotebook(notebook: NotebookFormObject): Observable<string> {
    const url = `api/namespaces/${notebook.namespace}/notebooks`;

    return this.http.post<JWABackendResponse>(url, notebook).pipe(
      catchError(error => this.handleError(error)),
      map(_ => 'posted'),
    );
  }

  public createViewer(namespace: string, viewer: string) {
    const url = `api/namespaces/${namespace}/viewers`;

    return this.http
      .post<VWABackendResponse>(url, { name: viewer })
      .pipe(catchError(error => this.handleError(error)));
  }

  public createPVC(namespace: string, pvc: PVCPostObject) {
    const url = `api/namespaces/${namespace}/pvcs`;

    return this.http
      .post<VWABackendResponse>(url, pvc)
      .pipe(catchError(error => this.handleError(error)));
  }

  // PATCH
  public startNotebook(namespace: string, name: string): Observable<string> {
    const url = `api/namespaces/${namespace}/notebooks/${name}`;

    return this.http.patch<JWABackendResponse>(url, { stopped: false }).pipe(
      catchError(error => this.handleError(error)),
      map(_ => 'started'),
    );
  }

  public stopNotebook(namespace: string, name: string): Observable<string> {
    const url = `api/namespaces/${namespace}/notebooks/${name}`;

    return this.http.patch<JWABackendResponse>(url, { stopped: true }).pipe(
      catchError(error => this.handleError(error, false)),
      map(_ => 'stopped'),
    );
  }

  public updateKeepAlive(namespace: string, name: string, timehours: string): Observable<string> {
    const url = `api/namespaces/${namespace}/notebooks/${name}/keepalive/${timehours}`;

    return this.http.patch<JWABackendResponse>(url, { stopped: false }).pipe(
      catchError(error => this.handleError(error)),
      map(_ => 'started'),
    );
  }

  // DELETE
  public deleteNotebook(namespace: string, name: string) {
    const url = `api/namespaces/${namespace}/notebooks/${name}`;

    return this.http
      .delete<JWABackendResponse>(url)
      .pipe(catchError(error => this.handleError(error, false)));
  }

  public deletePVC(namespace: string, pvc: string) {
    const url = `api/namespaces/${namespace}/pvcs/${pvc}`;

    return this.http
      .delete<VWABackendResponse>(url)
      .pipe(catchError(error => this.handleError(error, false)));
  }

  public deleteViewer(namespace: string, pvc: string) {
    const url = `api/namespaces/${namespace}/viewers/${pvc}`;

    return this.http
      .delete<VWABackendResponse>(url)
      .pipe(catchError(error => this.handleError(error, false)));
  }

  // ---------------------------Error Handling---------------------------------

  public handleErrorExtended(
    error: HttpErrorResponse | ErrorEvent | string,
    codes: number[] = [],
  ): Observable<never> {
    if (
      error instanceof HttpErrorResponse &&
      codes.includes(error.error.status)
    ) {
      // Error code is expected so we do not open a snackBar dialog
      return this.handleError(error, false);
    } else {
      return this.handleError(error);
    }
  }

  // Override common service's getErrorMessage
  // in order to incldue the error.status in error message
  public getErrorMessage(
    error: HttpErrorResponse | ErrorEvent | string,
  ): string {
    if (typeof error === 'string') {
      return error;
    }

    if (error instanceof HttpErrorResponse) {
      if (this.getBackendErrorLog(error) !== undefined) {
        return `[${error.status}] ${this.getBackendErrorLog(error)}`;
      }

      return `${error.status}: ${error.message}`;
    }

    if (error instanceof ErrorEvent) {
      return error.message;
    }

    return $localize`Unexpected error encountered`;
  }
}
