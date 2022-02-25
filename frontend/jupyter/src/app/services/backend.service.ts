import { Injectable } from '@angular/core';
import { BackendService, SnackBarService } from 'kubeflow';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import {
  NotebookResponseObject,
  JWABackendResponse,
  Config,
  Volume,
  PodDefault,
  NotebookFormObject,
  NotebookProcessedObject,
} from '../types';

@Injectable({
  providedIn: 'root',
})
export class JWABackendService extends BackendService {
  constructor(public http: HttpClient, public snackBar: SnackBarService) {
    super(http, snackBar);
  }

  // GET
  public getNotebooks(namespace: string): Observable<NotebookResponseObject[]> {
    const url = `api/namespaces/${namespace}/notebooks`;

    return this.http.get<JWABackendResponse>(url).pipe(
      catchError(error => this.handleError(error)),
      map((resp: JWABackendResponse) => {
        return resp.notebooks;
      }),
    );
  }

  public getConfig(): Observable<Config> {
    const url = `api/config`;

    return this.http.get<JWABackendResponse>(url).pipe(
      catchError(error => this.handleError(error)),
      map(data => {
        return data.config;
      }),
    );
  }

  public getVolumes(ns: string): Observable<Volume[]> {
    // Get existing PVCs in a namespace
    const url = `api/namespaces/${ns}/pvcs`;

    return this.http.get<JWABackendResponse>(url).pipe(
      catchError(error => this.handleError(error)),
      map(data => {
        return data.pvcs;
      }),
    );
  }

  public getPodDefaults(ns: string): Observable<PodDefault[]> {
    // Get existing PodDefaults in a namespace
    const url = `api/namespaces/${ns}/poddefaults`;

    return this.http.get<JWABackendResponse>(url).pipe(
      catchError(error => this.handleError(error)),
      map(data => {
        return data.poddefaults;
      }),
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
      map(_ => {
        return 'posted';
      }),
    );
  }

  // PATCH
  public startNotebook(notebook: NotebookProcessedObject): Observable<string> {
    const name = notebook.name;
    const namespace = notebook.namespace;
    const url = `api/namespaces/${namespace}/notebooks/${name}`;

    return this.http
      .patch<JWABackendResponse>(url, { stopped: false })
      .pipe(
        catchError(error => this.handleError(error)),
        map(_ => {
          return 'started';
        }),
      );
  }

  public stopNotebook(notebook: NotebookProcessedObject): Observable<string> {
    const name = notebook.name;
    const namespace = notebook.namespace;
    const url = `api/namespaces/${namespace}/notebooks/${name}`;

    return this.http
      .patch<JWABackendResponse>(url, { stopped: true })
      .pipe(
        catchError(error => this.handleError(error, false)),
        map(_ => {
          return 'stopped';
        }),
      );
  }

  // DELETE
  public deleteNotebook(namespace: string, name: string) {
    const url = `api/namespaces/${namespace}/notebooks/${name}`;

    return this.http
      .delete<JWABackendResponse>(url)
      .pipe(catchError(error => this.handleError(error, false)));
  }
}

export type AggregateCostResponse = {
  code: number;
  data: {
    [namespace: string]: {
      aggregation: string;
      environment: string;
      cpuAllocationAverage: number;
      cpuCost: number;
      cpuEfficiency: number;
      efficiency: number;
      gpuAllocationAverage: number;
      gpuCost: number;
      ramAllocationAverage: number;
      ramCost: number;
      ramEfficiency: number;
      pvAllocationAverage: number;
      pvCost: number;
      networkCost: number;
      sharedCost: number;
      totalCost: number;
    };
  };
  message: string;
};

@Injectable()
export class KubecostService {
  constructor(private http: HttpClient) {}

  getAggregateCost(ns: string): Observable<AggregateCostResponse> {
    const url = `/api/namespaces/${ns}/cost/aggregated`;

    return this.http
      .get<AggregateCostResponse | JWABackendResponse>(url, {
        params: {
          aggregation: "namespace",
          namespace: ns,
          window: "1d"
        }
      })
      .pipe(
        tap(res => this.handleBackendError(res)),
        catchError(err => this.handleError(err))
      ) as Observable<AggregateCostResponse>;
  }

  private handleBackendError(response: AggregateCostResponse | JWABackendResponse) {
    if (this.isResp(response) || response.code < 200 || response.code >= 300) {
      throw response;
    }
  }

  private handleError(
    error: HttpErrorResponse | AggregateCostResponse | JWABackendResponse
  ): Observable<never> {
    const message = this.isResp(error) ? error.log : error.message;
    return throwError(new Error(message));
  }

  private isResp(
    obj: HttpErrorResponse | AggregateCostResponse | JWABackendResponse
  ): obj is JWABackendResponse {
    return (obj as JWABackendResponse).success !== undefined;
  }
}
