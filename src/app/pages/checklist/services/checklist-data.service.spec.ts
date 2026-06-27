import { TestBed } from '@angular/core/testing';

import checklistData from '../checklist-data.json';
import checklistTaintedData from '../checklist-tainted-data.json';
import { ChecklistDataService } from './checklist-data.service';

describe('ChecklistDataService', () => {
  let service: ChecklistDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChecklistDataService);
  });

  it('returns regular and tainted datasets', () => {
    expect(service.getData(false).characters[0].name).toBe(checklistData.characters[0].name);
    expect(service.getData(true).characters[0].name).toBe(checklistTaintedData.characters[0].name);
  });
});
