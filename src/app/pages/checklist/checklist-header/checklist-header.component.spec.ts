import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChecklistHeaderComponent } from './checklist-header.component';
import { ChecklistStore } from '../services/checklist.store';
import { LayoutService } from '../services/layout.service';

describe('ChecklistHeaderComponent', () => {
  let fixture: ComponentFixture<ChecklistHeaderComponent>;
  let store: ChecklistStore;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [ChecklistHeaderComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ChecklistHeaderComponent);
    store = TestBed.inject(ChecklistStore);
    store.initialize();
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders segmented control on mobile', () => {
    TestBed.inject(LayoutService).isMobile.set(true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.segmented-control')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.progress__bar')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.tabs')).toBeFalsy();
  });

  it('renders desktop tabs when not mobile', () => {
    TestBed.inject(LayoutService).isMobile.set(false);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.tabs')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.segmented-control')).toBeFalsy();
  });

  it('emits taintedChange when a segment is selected', () => {
    TestBed.inject(LayoutService).isMobile.set(true);
    fixture.detectChanges();

    const emit = jest.fn();
    fixture.componentInstance.taintedChange.subscribe(emit);

    const taintedButton = fixture.nativeElement.querySelectorAll('.segment')[1] as HTMLButtonElement;
    taintedButton.click();

    expect(emit).toHaveBeenCalledWith(true);
  });
});
