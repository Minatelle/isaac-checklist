import { TestBed } from '@angular/core/testing';

import { UnlockStorageService } from './unlock-storage.service';

describe('UnlockStorageService', () => {
  let service: UnlockStorageService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(UnlockStorageService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('loads and saves unlock names', () => {
    expect(service.load()).toEqual([]);

    service.save(['Lost Baby']);
    expect(service.load()).toEqual(['Lost Baby']);
  });

  it('returns an empty list when storage contains invalid json', () => {
    localStorage.setItem('unlockedAchievements', '{invalid');

    expect(service.load()).toEqual([]);
  });
});
