import { DestroyRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { SLIDE_TRANSITION_MS } from '../constants/checklist.constants';
import { SlideTransition } from './slide-transition';

describe('SlideTransition', () => {
  let transition: SlideTransition<'next' | 'prev'>;
  let prefersReducedMotion = false;

  beforeEach(() => {
    prefersReducedMotion = false;

    TestBed.configureTestingModule({});
    const destroyRef = TestBed.inject(DestroyRef);

    transition = new SlideTransition(destroyRef, () => prefersReducedMotion);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('runs the action and resets after the slide duration', () => {
    jest.useFakeTimers();
    const action = jest.fn();

    const started = transition.run('next', action);

    expect(started).toBe(true);
    expect(action).toHaveBeenCalledTimes(1);
    expect(transition.phase()).toBe('enter');
    expect(transition.direction()).toBe('next');

    jest.advanceTimersByTime(SLIDE_TRANSITION_MS);

    expect(transition.phase()).toBe('idle');
    expect(transition.direction()).toBeNull();
    expect(transition.locked()).toBe(false);
  });

  it('locks while animating when requested', () => {
    jest.useFakeTimers();

    transition.run('next', () => undefined, { lock: true });
    expect(transition.locked()).toBe(true);

    const blocked = transition.run('prev', () => undefined);
    expect(blocked).toBe(false);

    jest.advanceTimersByTime(SLIDE_TRANSITION_MS);
    expect(transition.locked()).toBe(false);
  });

  it('skips animation when reduced motion is preferred', () => {
    prefersReducedMotion = true;
    const action = jest.fn();

    transition.run('prev', action);

    expect(action).toHaveBeenCalledTimes(1);
    expect(transition.phase()).toBe('idle');
    expect(transition.direction()).toBeNull();
  });
});
