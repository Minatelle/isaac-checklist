import { Routes } from '@angular/router';
import { ChecklistComponent } from './pages/checklist/checklist.component';

export const routes: Routes = [
    {
        path:'',
        title: 'Isaac Completion Marks',
        component: ChecklistComponent,
    }
];
