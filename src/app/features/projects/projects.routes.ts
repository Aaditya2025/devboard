import { Routes } from '@angular/router';

export const PROJECTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./project-list/project-list.component').then((m) => m.ProjectListComponent),
    title: 'Projects — DevBoard',
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./project-form/project-form.component').then((m) => m.ProjectFormComponent),
    title: 'New Project — DevBoard',
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./project-detail/project-detail.component').then((m) => m.ProjectDetailComponent),
    title: 'Project — DevBoard',
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./project-form/project-form.component').then((m) => m.ProjectFormComponent),
    title: 'Edit Project — DevBoard',
  },
];
