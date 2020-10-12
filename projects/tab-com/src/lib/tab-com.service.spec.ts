import { TestBed } from '@angular/core/testing';

import { TabComService } from './tab-com.service';

describe('TabComService', () => {
  let service: TabComService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TabComService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
