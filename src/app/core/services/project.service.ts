import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProjectStatus, UserRole } from '../enums';
import { CreateProjectPayload, Project, ProjectMember } from '../models';
import { MOCK_PROJECTS } from '../mock/projects.mock';
import { MOCK_PROJECT_MEMBERS } from '../mock/project-members.mock';
import { MOCK_USERS } from '../mock/users.mock';

const MOCK_LATENCY_MS = 400;

function delayed<T>(factory: () => T): Observable<T> {
  return new Observable<T>((subscriber) => {
    const timeout = setTimeout(() => {
      subscriber.next(factory());
      subscriber.complete();
    }, MOCK_LATENCY_MS);
    return () => clearTimeout(timeout);
  });
}

/**
 * Reads/writes project data and membership. Backed by the mock store for
 * now — swapped for real HTTP calls in Phase 11 without changing this
 * service's public shape, so ProjectList/ProjectForm/ProjectDetail don't
 * need to change when that happens.
 */
@Injectable({ providedIn: 'root' })
export class ProjectService {
  getAll(): Observable<Project[]> {
    return delayed(() => [...MOCK_PROJECTS]);
  }

  getById(id: string): Observable<Project | undefined> {
    return delayed(() => MOCK_PROJECTS.find((project) => project.id === id));
  }

  create(payload: CreateProjectPayload): Observable<Project> {
    return delayed(() => {
      const project: Project = {
        id: `proj-${MOCK_PROJECTS.length + 1}`,
        organizationId: 'org-1',
        name: payload.name,
        key: payload.key,
        description: payload.description,
        status: payload.status,
        startDate: payload.startDate,
        endDate: payload.endDate,
        progress: 0,
        memberCount: 0,
        issueCount: 0,
        createdDate: new Date().toISOString().slice(0, 10),
      };
      MOCK_PROJECTS.push(project);
      return project;
    });
  }

  update(id: string, payload: CreateProjectPayload): Observable<Project> {
    return delayed(() => {
      const index = MOCK_PROJECTS.findIndex((project) => project.id === id);
      if (index === -1) {
        throw new Error('Project not found.');
      }
      const updated: Project = { ...MOCK_PROJECTS[index], ...payload };
      MOCK_PROJECTS[index] = updated;
      return updated;
    });
  }

  archive(id: string): Observable<Project> {
    return delayed(() => {
      const index = MOCK_PROJECTS.findIndex((project) => project.id === id);
      if (index === -1) {
        throw new Error('Project not found.');
      }
      MOCK_PROJECTS[index] = { ...MOCK_PROJECTS[index], status: ProjectStatus.Archived };
      return MOCK_PROJECTS[index];
    });
  }

  getMembers(projectId: string): Observable<ProjectMember[]> {
    return delayed(() =>
      MOCK_PROJECT_MEMBERS.filter((member) => member.projectId === projectId),
    );
  }

  /** Users not already a member of the given project — for the "add member" picker. */
  getAddableUsers(projectId: string): Observable<{ id: string; name: string; email: string }[]> {
    return delayed(() => {
      const memberUserIds = new Set(
        MOCK_PROJECT_MEMBERS.filter((m) => m.projectId === projectId).map((m) => m.userId),
      );
      return MOCK_USERS.filter((user) => !memberUserIds.has(user.id)).map((user) => ({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
      }));
    });
  }

  addMember(projectId: string, userId: string, role: UserRole): Observable<ProjectMember> {
    return delayed(() => {
      const user = MOCK_USERS.find((u) => u.id === userId);
      if (!user) {
        throw new Error('User not found.');
      }
      const member: ProjectMember = {
        id: `pm-${MOCK_PROJECT_MEMBERS.length + 1}`,
        projectId,
        userId,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role,
        joinedDate: new Date().toISOString().slice(0, 10),
      };
      MOCK_PROJECT_MEMBERS.push(member);
      this.bumpMemberCount(projectId, 1);
      return member;
    });
  }

  updateMemberRole(memberId: string, role: UserRole): Observable<ProjectMember> {
    return delayed(() => {
      const index = MOCK_PROJECT_MEMBERS.findIndex((m) => m.id === memberId);
      if (index === -1) {
        throw new Error('Member not found.');
      }
      MOCK_PROJECT_MEMBERS[index] = { ...MOCK_PROJECT_MEMBERS[index], role };
      return MOCK_PROJECT_MEMBERS[index];
    });
  }

  removeMember(memberId: string): Observable<void> {
    return delayed(() => {
      const index = MOCK_PROJECT_MEMBERS.findIndex((m) => m.id === memberId);
      if (index === -1) {
        return;
      }
      const [removed] = MOCK_PROJECT_MEMBERS.splice(index, 1);
      this.bumpMemberCount(removed.projectId, -1);
    });
  }

  private bumpMemberCount(projectId: string, delta: number): void {
    const index = MOCK_PROJECTS.findIndex((p) => p.id === projectId);
    if (index !== -1) {
      MOCK_PROJECTS[index] = {
        ...MOCK_PROJECTS[index],
        memberCount: Math.max(0, MOCK_PROJECTS[index].memberCount + delta),
      };
    }
  }
}
