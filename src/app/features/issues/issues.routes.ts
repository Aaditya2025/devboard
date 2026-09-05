import { Routes } from '@angular/router';

export const ISSUES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./issue-list/issue-list.component').then((m) => m.IssueListComponent),
    title: 'Issues — DevBoard',
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./issue-form/issue-form.component').then((m) => m.IssueFormComponent),
    title: 'New Issue — DevBoard',
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./issue-detail/issue-detail.component').then((m) => m.IssueDetailComponent),
    title: 'Issue — DevBoard',
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./issue-form/issue-form.component').then((m) => m.IssueFormComponent),
    title: 'Edit Issue — DevBoard',
  },
];
