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

  it('loads and saves steam ids', () => {
    expect(service.load()).toEqual([]);

    service.save([168, 167, 167]);
    expect(service.load()).toEqual([167, 168]);
  });

  it('returns an empty list when storage contains invalid json', () => {
    localStorage.setItem('unlockedSteamIds', '{invalid');

    expect(service.load()).toEqual([]);
  });

  it('returns an empty list when storage contains a non-array value', () => {
    localStorage.setItem('unlockedSteamIds', JSON.stringify({ steamId: 167 }));

    expect(service.load()).toEqual([]);
  });

  it('filters out invalid steam ids', () => {
    localStorage.setItem('unlockedSteamIds', JSON.stringify([167, 0, -1, 1.5, 'nope', null]));

    expect(service.load()).toEqual([167]);
  });
});
