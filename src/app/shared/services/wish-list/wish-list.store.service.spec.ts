import { TestBed } from '@angular/core/testing';

import { WishListStore } from './wish-list.store.service';

describe('WishListService', () => {
  let service: WishListStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WishListStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
