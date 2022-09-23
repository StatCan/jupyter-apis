import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError,  tap } from 'rxjs/operators';
import {
  JWABackendResponse,
} from '../types';

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
    const url = `api/namespaces/${ns}/cost/aggregated`;

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
