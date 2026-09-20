import { TestBed } from '@angular/core/testing';
import { ProjectService } from './project.service';
import { ProjectStatus, UserRole } from '../enums';

describe('ProjectService', () => {
  let service: ProjectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProjectService);
  });

  it('returns all mock projects', (done) => {
    service.getAll().subscribe((projects) => {
      expect(projects.length).toBeGreaterThan(0);
      done();
    });
  });

  it('finds a project by id', (done) => {
    service.getAll().subscribe((projects) => {
      const target = projects[0];
      service.getById(target.id).subscribe((found) => {
        expect(found?.id).toBe(target.id);
        done();
      });
    });
  });

  it('returns undefined for an unknown project id', (done) => {
    service.getById('nonexistent').subscribe((found) => {
      expect(found).toBeUndefined();
      done();
    });
  });

  it('creates a new project and it becomes findable', (done) => {
    service
      .create({
        name: 'Test Project',
        key: 'TST',
        description: 'A test project.',
        startDate: '2026-01-01',
        endDate: '2026-06-01',
        status: ProjectStatus.Planning,
      })
      .subscribe((created) => {
        expect(created.name).toBe('Test Project');
        expect(created.progress).toBe(0);
        service.getById(created.id).subscribe((found) => {
          expect(found?.key).toBe('TST');
          done();
        });
      });
  });

  it('updates an existing project', (done) => {
    service.getAll().subscribe((projects) => {
      const target = projects[0];
      service
        .update(target.id, {
          name: 'Renamed Project',
          key: target.key,
          description: target.description,
          startDate: target.startDate,
          endDate: target.endDate,
          status: target.status,
        })
        .subscribe((updated) => {
          expect(updated.name).toBe('Renamed Project');
          done();
        });
    });
  });

  it('archives a project by setting its status', (done) => {
    service.getAll().subscribe((projects) => {
      const target = projects[0];
      service.archive(target.id).subscribe((archived) => {
        expect(archived.status).toBe(ProjectStatus.Archived);
        done();
      });
    });
  });

  it('returns only members belonging to the given project', (done) => {
    service.getMembers('proj-1').subscribe((members) => {
      expect(members.length).toBeGreaterThan(0);
      expect(members.every((m) => m.projectId === 'proj-1')).toBe(true);
      done();
    });
  });

  it('excludes existing members from the addable-users list', (done) => {
    service.getMembers('proj-1').subscribe((members) => {
      service.getAddableUsers('proj-1').subscribe((addable) => {
        const memberIds = new Set(members.map((m) => m.userId));
        expect(addable.every((u) => !memberIds.has(u.id))).toBe(true);
        done();
      });
    });
  });

  it('adds a member and increments the project member count', (done) => {
    service.getAddableUsers('proj-3').subscribe((addable) => {
      if (addable.length === 0) {
        return done();
      }
      service.getById('proj-3').subscribe((before) => {
        service.addMember('proj-3', addable[0].id, UserRole.Developer).subscribe((member) => {
          expect(member.projectId).toBe('proj-3');
          service.getById('proj-3').subscribe((after) => {
            expect(after?.memberCount).toBe((before?.memberCount ?? 0) + 1);
            done();
          });
        });
      });
    });
  });

  it('updates a member role', (done) => {
    service.getMembers('proj-1').subscribe((members) => {
      const member = members[0];
      service.updateMemberRole(member.id, UserRole.Viewer).subscribe((updated) => {
        expect(updated.role).toBe(UserRole.Viewer);
        done();
      });
    });
  });

  it('removes a member and decrements the project member count', (done) => {
    service.getAddableUsers('proj-4').subscribe((addable) => {
      if (addable.length === 0) {
        return done();
      }
      service.addMember('proj-4', addable[0].id, UserRole.Viewer).subscribe((added) => {
        service.getById('proj-4').subscribe((before) => {
          service.removeMember(added.id).subscribe(() => {
            service.getById('proj-4').subscribe((after) => {
              expect(after?.memberCount).toBe((before?.memberCount ?? 1) - 1);
              done();
            });
          });
        });
      });
    });
  });
});
