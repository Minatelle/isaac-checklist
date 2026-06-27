import { Injectable } from '@angular/core';

import checklistData from '../checklist-data.json';
import checklistTaintedData from '../checklist-tainted-data.json';
import { ChecklistData } from '../models/checklist.model';

@Injectable({ providedIn: 'root' })
export class ChecklistDataService {
  getData(isTainted: boolean): ChecklistData {
    return isTainted ? checklistTaintedData : checklistData;
  }
}
