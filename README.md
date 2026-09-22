# DevBoard

A Jira/Linear-inspired engineering project management SaaS — organizations, projects, issues,
sprints, Kanban boards, comments, notifications and analytics.

This repository contains the **frontend only**, built as a standalone Angular application. It's
designed to run against mock data during development and swap over to a real ASP.NET Core REST
API later without UI rewrites.

## Features

- Authentication UI (login, registration, guarded routes)
- Dashboard with statistics and charts
- Project management (list, create/edit, members, details)
- Issue tracking (list, search, filter, sort, pagination, comments, activity)
- Kanban board with drag-and-drop
- Notification center
- Profile and settings
- Responsive layout (desktop, tablet, mobile) with light/dark theming groundwork

> **Status:** Phases 1–8 (Foundation, Layout, Authentication, Dashboard, Projects, Issues,
> Kanban, Notifications) complete. See
> [Project Structure](#project-structure) and [Frontend Development Phases](#frontend-development-phases)
> below for what's implemented vs. planned.
>
> **Demo login:** `admin@devboard.dev` / `Password123!` (also `dev@devboard.dev`, `viewer@devboard.dev`
> — same password, different roles).

## Tech Stack

```text
Angular (standalone components)
TypeScript
RxJS
Angular Signals
Angular Material + CDK
SCSS
ESLint + Prettier
Karma/Jasmine
ASP.NET Core (planned backend)
PostgreSQL (planned backend)
```

## Architecture

Feature-based structure, lazy-loaded routes, and a service-oriented data layer that starts on
mock data and swaps to HTTP without changing components:

```text
Mock Service  ──▶  HTTP Service
      (same public interface, swapped in Phase 11)
```

- **core/** — guards, interceptors, services, models, enums, constants, mock data
- **shared/** — reusable, business-agnostic UI (badges, empty/loading/error states, dialogs, etc.)
- **layout/** — app shell: main layout, sidebar, navbar, breadcrumbs
- **features/** — one folder per feature area, each lazy-loaded via its own `*.routes.ts`

Frontend role checks (admin/manager/developer/viewer) are for UI/UX only — real authorization is
enforced by the backend.

## Local Setup

```bash
npm install
npm start        # ng serve, http://localhost:4200
```

Other useful scripts:

```bash
npm run build          # production build
npm test                # unit tests (Karma/Jasmine)
npm run lint             # ESLint
npm run format            # Prettier — write
npm run format:check       # Prettier — check only
```

If Chrome/Chromium isn't auto-detected when running tests, set `CHROME_BIN` to its path first.

## Project Structure

```text
src/
└── app/
    ├── core/{guards,interceptors,services,models,enums,constants,mock}
    ├── shared/{components,directives,pipes,utils}
    ├── layout/{main-layout,sidebar,navbar,breadcrumbs}
    ├── features/{auth,dashboard,projects,issues,kanban,notifications,profile,settings}
    ├── app.component.ts
    ├── app.routes.ts
    └── app.config.ts
src/styles/          # design tokens (_tokens.scss) + Material theme (_theme.scss)
src/environments/    # apiBaseUrl, useMockData — swapped per build configuration
```

## Frontend Development Phases

1. **Foundation** ✅ — project setup, Material, ESLint/Prettier, folder structure, routing, theme
2. **Layout** ✅ — main layout, sidebar, navbar, breadcrumbs, responsive drawer
3. **Authentication** ✅ — login, register, auth service/state, guards, interceptor
4. **Dashboard** ✅ — statistics, charts, recent activity, assigned issues, project progress
5. **Projects** ✅ — list, details, create/edit, members
6. **Issues** ✅ — list, create/edit, details, comments, activity, search/filter/sort/pagination
7. **Kanban** ✅ — board, columns, drag-and-drop, filtering
8. **Notifications** ✅ — center, unread count, mark read/all read
9. **Profile/Settings** — profile, password, preferences
10. **Quality** — loading/error/empty states, responsive design, accessibility, tests, linting
11. **Backend Integration Prep** — swap mock services for HTTP services

## Future Backend

The frontend is designed to consume an ASP.NET Core REST API (PostgreSQL-backed) once available;
until then it runs entirely on the mock data layer under `core/mock/`.

## Screenshots

_Added once the UI is further along._
