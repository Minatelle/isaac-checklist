import { TestBed } from '@angular/core/testing';

import checklistChallengesData from '../checklist-challenges-data.json';
import checklistData from '../checklist-data.json';
import checklistTaintedData from '../checklist-tainted-data.json';
import { ChecklistDataService } from './checklist-data.service';

describe('ChecklistDataService', () => {
  let service: ChecklistDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChecklistDataService);
  });

  it('returns regular, tainted and challenges datasets', () => {
    expect(service.getData('regular').characters[0].name).toBe(checklistData.characters[0].name);
    expect(service.getData('tainted').characters[0].name).toBe(
      checklistTaintedData.characters[0].name
    );
    expect(service.getData('challenges').achievements[0].name).toBe(
      checklistChallengesData.achievements[0].name
    );
  });
});
