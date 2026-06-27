import { DestroyRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { ROW_PULSE_MS } from '../constants/checklist.constants';
import { TimedSignal } from './timed-signal';

describe('TimedSignal', () => {
  let timedSignal: TimedSignal<string>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    const destroyRef = TestBed.inject(DestroyRef);
    timedSignal = new TimedSignal(destroyRef, ROW_PULSE_MS);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('sets a value and clears it after the duration', () => {
    jest.useFakeTimers();

    timedSignal.trigger('row-a');
    expect(timedSignal.value()).toBe('row-a');

    jest.advanceTimersByTime(ROW_PULSE_MS);
    expect(timedSignal.value()).toBeNull();
  });

  it('resets the timer when triggered again quickly', () => {
    jest.useFakeTimers();

    timedSignal.trigger('row-a');
    timedSignal.trigger('row-b');
    jest.advanceTimersByTime(ROW_PULSE_MS);

    expect(timedSignal.value()).toBeNull();
  });
});
