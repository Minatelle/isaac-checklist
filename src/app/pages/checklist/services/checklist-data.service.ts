import { Injectable } from '@angular/core';

import checklistData from '../checklist-data.json';
import checklistTaintedData from '../checklist-tainted-data.json';
import checklistChallengesData from '../checklist-challenges-data.json';
import { ChecklistData, ChecklistMode } from '../models/checklist.model';

@Injectable({ providedIn: 'root' })
export class ChecklistDataService {
  getData(mode: ChecklistMode): ChecklistData {
    switch (mode) {
      case 'tainted':
        return checklistTaintedData;
      case 'challenges':
        return checklistChallengesData;
      default:
        return checklistData;
    }
  }
}
