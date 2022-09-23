import { TestBed } from '@angular/core/testing';

import { KubecostService } from './kubecost.service';

describe('KubecostService', () => {
  let service: KubecostService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KubecostService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
