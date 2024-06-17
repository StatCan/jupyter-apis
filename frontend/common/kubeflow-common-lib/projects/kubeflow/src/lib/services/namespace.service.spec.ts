import { TestBed } from '@angular/core/testing';
import { NamespaceService } from './namespace.service';
import { Observable, of } from 'rxjs';

export class MockNamespaceService {
  getSelectedNamespace(): Observable<string> {
    return of('wendy-gaultier1');
  }
}

describe('NamespaceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NamespaceService = TestBed.inject(NamespaceService);
    expect(service).toBeTruthy();
  });
});
