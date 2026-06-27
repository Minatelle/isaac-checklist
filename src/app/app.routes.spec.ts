import { ChecklistComponent } from './pages/checklist/checklist.component';
import { routes } from './app.routes';

describe('routes', () => {
  it('defines the checklist route', () => {
    expect(routes).toHaveLength(1);
    expect(routes[0]).toEqual({
      path: '',
      title: 'Isaac Completion Marks',
      component: ChecklistComponent
    });
  });
});
