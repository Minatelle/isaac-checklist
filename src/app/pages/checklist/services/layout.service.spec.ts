import { TestBed } from '@angular/core/testing';

import { LayoutService } from './layout.service';

describe('LayoutService', () => {
  let service: LayoutService;
  let changeListeners: Array<() => void>;

  beforeEach(() => {
    changeListeners = [];

    (globalThis.matchMedia as jest.Mock).mockImplementation((query: string) => ({
      matches: query === '(max-width: 768px)',
      media: query,
      addEventListener: jest.fn((_event: string, listener: () => void) => {
        changeListeners.push(listener);
      }),
      removeEventListener: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      dispatchEvent: jest.fn()
    }));

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    service = TestBed.inject(LayoutService);
  });

  it('reflects the current mobile breakpoint match', () => {
    expect(service.isMobile()).toBe(true);
  });

  it('reflects the current reduced motion preference', () => {
    expect(service.prefersReducedMotion()).toBe(false);
  });

  it('updates signals when the media query change event fires', () => {
    const changeListeners: Array<() => void> = [];
    const mobileQuery = {
      matches: true,
      media: '(max-width: 768px)',
      addEventListener: jest.fn((_event: string, listener: () => void) => {
        changeListeners.push(listener);
      }),
      removeEventListener: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      dispatchEvent: jest.fn()
    };
    const motionQuery = {
      matches: false,
      media: '(prefers-reduced-motion: reduce)',
      addEventListener: jest.fn((_event: string, listener: () => void) => {
        changeListeners.push(listener);
      }),
      removeEventListener: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      dispatchEvent: jest.fn()
    };

    (globalThis.matchMedia as jest.Mock).mockImplementation((query: string) => {
      if (query === '(max-width: 768px)') {
        return mobileQuery;
      }

      return motionQuery;
    });

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    service = TestBed.inject(LayoutService);

    expect(service.isMobile()).toBe(true);
    expect(service.prefersReducedMotion()).toBe(false);

    mobileQuery.matches = false;
    motionQuery.matches = true;

    for (const listener of changeListeners) {
      listener();
    }

    expect(service.isMobile()).toBe(false);
    expect(service.prefersReducedMotion()).toBe(true);
  });

  it('removes media query listeners when the injector is destroyed', () => {
    const removeEventListener = jest.fn();

    (globalThis.matchMedia as jest.Mock).mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: jest.fn(),
      removeEventListener,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      dispatchEvent: jest.fn()
    }));

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    TestBed.inject(LayoutService);
    TestBed.resetTestingModule();

    expect(removeEventListener).toHaveBeenCalled();
  });
});
