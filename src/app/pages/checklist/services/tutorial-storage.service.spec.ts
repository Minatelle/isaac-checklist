import { TestBed } from '@angular/core/testing';

import { TutorialStorageService } from './tutorial-storage.service';

describe('TutorialStorageService', () => {
  let service: TutorialStorageService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(TutorialStorageService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('returns false when tutorial has not been seen', () => {
    expect(service.hasSeen()).toBe(false);
  });

  it('persists seen state after markSeen', () => {
    service.markSeen();

    expect(service.hasSeen()).toBe(true);
  });

  it('returns false when storage contains an unexpected value', () => {
    localStorage.setItem('tutorialSeen', 'invalid');

    expect(service.hasSeen()).toBe(false);
  });

  it('returns false when localStorage throws on read', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage unavailable');
    });

    expect(service.hasSeen()).toBe(false);
  });

  it('ignores errors when localStorage throws on write', () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage unavailable');
    });

    expect(() => service.markSeen()).not.toThrow();
  });
});
