import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError,  tap } from 'rxjs/operators';
import {
  JWABackendResponse,
} from '../types';

interface AllocationCostData {
  [namespace: string]: {
    "name": string,
    "properties": object,
    "window": object,
    "start": string,
    "end": string,
    "minutes": number,
    "cpuCores": number,
    "cpuCoreRequestAverage": number,
    "cpuCoreUsageAverage": number,
    "cpuCoreHours": number,
    "cpuCost": number,
    "cpuCostAdjustment": number,
    "cpuEfficiency": number,
    "gpuCount": number,
    "gpuHours": number,
    "gpuCost": number,
    "gpuCostAdjustment": number,
    "networkTransferBytes": number,
    "networkReceiveBytes": number,
    "networkCost": number,
    "networkCostAdjustment": number,
    "loadBalancerCost": number,
    "loadBalancerCostAdjustment": number,
    "pvBytes": number,
    "pvByteHours": number,
    "pvCost": number,
    "pvs": object,
    "pvCostAdjustment": number,
    "ramBytes": number,
    "ramByteRequestAverage": number,
    "ramByteUsageAverage": number,
    "ramByteHours": number,
    "ramCost": number,
    "ramCostAdjustment": number,
    "ramEfficiency": number,
    "sharedCost": number,
    "externalCost": number,
    "totalCost": number,
    "totalEfficiency": number,
    "rawAllocationOnly": object
  }
};

export type AllocationCostResponse = {
    code: number;
    data: Array<AllocationCostData>;
    message: string;
  };


@Injectable()
export class KubecostService {
  constructor(private http: HttpClient) {}

  getAllocationCost(ns: string, window:string="1d"): Observable<AllocationCostResponse> {
    const url = `api/namespaces/${ns}/cost/allocation`;

    return this.http
      .get<AllocationCostResponse | JWABackendResponse>(url, {
        params: {
          aggregation: "namespace",
          namespace: ns,
          window: window
        }
      })
      .pipe(
        tap(res => this.handleBackendError(res)),
        catchError(err => this.handleError(err))
      ) as Observable<AllocationCostResponse>;
  }

  private handleBackendError(response: AllocationCostResponse | JWABackendResponse) {
    if (this.isResp(response) || response.code < 200 || response.code >= 300) {
      throw response;
    }
  }

  private handleError(
    error: HttpErrorResponse | AllocationCostResponse | JWABackendResponse
  ): Observable<never> {
    const message = this.isResp(error) ? error.log : error.message;
    return throwError(new Error(message));
  }

  private isResp(
    obj: HttpErrorResponse | AllocationCostResponse | JWABackendResponse
  ): obj is JWABackendResponse {
    return (obj as JWABackendResponse).success !== undefined;
  }
}
