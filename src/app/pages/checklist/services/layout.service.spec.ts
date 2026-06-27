import { TestBed } from '@angular/core/testing';

import { LayoutService } from './layout.service';

describe('LayoutService', () => {
  let service: LayoutService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LayoutService);
  });

  it('reflects the current mobile breakpoint match', () => {
    expect(service.isMobile()).toBe(window.matchMedia('(max-width: 768px)').matches);
  });

  it('updates isMobile when the media query changes', () => {
    service.isMobile.set(true);
    expect(service.isMobile()).toBe(true);

    service.isMobile.set(false);
    expect(service.isMobile()).toBe(false);
  });
});
