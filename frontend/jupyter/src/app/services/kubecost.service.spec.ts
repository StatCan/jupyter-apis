import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';

import { KubecostService } from './kubecost.service';

describe('KubecostService', () => {
  let service: KubecostService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: HttpClient, useValue: {} }],
    });
    service = TestBed.inject(KubecostService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
