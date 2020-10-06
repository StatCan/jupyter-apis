import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";

import { Observable, throwError } from "rxjs";
import { tap, catchError } from "rxjs/operators";
import { environment } from "src/environments/environment";

import {
  Resp,
  SnackType
} from "../utils/types";
import { SnackBarService } from "./snack-bar.service";

export type AggregateCostResponse = {
  code: number,
  data: {
    [namespace: string]: {
      aggregation: string,
      environment: string,
      cpuAllocationAverage: number,
      cpuCost: number,
      cpuEfficiency: number,
      efficiency: number,
      gpuAllocationAverage: number,
      gpuCost: number,
      ramAllocationAverage: number,
      ramCost: number,
      ramEfficiency: number,
      pvAllocationAverage: number,
      pvCost: number,
      networkCost: number,
      sharedCost: number,
      totalCost: number
    }
  },
  message: string
}

@Injectable()
export class KubecostService {

  constructor(private http: HttpClient, private snackBar: SnackBarService) { }

  getAggregateCost(ns: string): Observable<AggregateCostResponse> {
    const url = `${environment.kubecostUrl}/model/aggregatedCostModel`;

    return this.http.get<AggregateCostResponse>(url, {
      params: {
        aggregation: 'namespace',
        namespace: ns,
        window: '1d'
      }
    }).pipe(
      tap(res => this.handleBackendError(res)),
      catchError(err => this.handleError(err))
    );
  }



  // ---------------------------Error Handling----------------------------------
  private handleBackendError(response: { code: number }) {
    if (response.code < 200 || response.code >= 300) {
      throw response;
    }
  }

  private handleError(error: HttpErrorResponse | Resp): Observable<never> {
    // The backend returned an unsuccessful response code.
    // The response body may contain clues as to what went wrong,
    if (error instanceof HttpErrorResponse) {
      this.snackBar.show(
        `${error.status}: There was an error trying to connect ` +
        `to the backend API. ${error.message}`,
        SnackType.Error
      );
      return throwError(error.message);
    } else {
      // Backend error thrown from handleBackendError
      const backendError = error as Resp;
      this.snackBar.show(backendError.log, SnackType.Error);
      return throwError(backendError.log);
    }
  }
}
