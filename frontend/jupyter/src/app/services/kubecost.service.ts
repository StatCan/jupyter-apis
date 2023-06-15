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
    "start": string,
    "end": string,
    "cpuCoreRequestAverage": number, 
    "cpuCoreUsageAverage": number,
    "cpuCost": number,
    "gpuCost": number,
    "networkCost": number,
    "loadBalancerCost": number,
    "pvCost": number,
    "ramByteRequestAverage": number,
    "ramByteUsageAverage": number,
    "ramCost": number,
    "sharedCost": number,
    "externalCost": number,
  }
};

export type AllocationCostResponse = {
    code: number;
    data: {
      sets: Array<{
        allocations: AllocationCostData,
        window: {
          start: string,
          end: string
        }
      }>
      window: {
        start: string,
        end: string
      }
    };
    message: string;
  };


@Injectable({
  providedIn: 'root',
})
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
