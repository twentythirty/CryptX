import { async, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { extraTestingModules, fakeAsyncResponse, click } from '../../../testing/utils';

import { RolesListComponent } from './roles-list.component';
import { RolesModule } from '../roles.module';
import { RolesService } from '../../../services/roles/roles.service';
import { getAllRolesData } from '../../../testing/service-mock/roles.service.mock';
import { Location } from '@angular/common';


describe('RolesListComponent', () => {
  let component: RolesListComponent;
  let fixture: ComponentFixture<RolesListComponent>;
  let rolesService: RolesService;
  let getAllRolesSpy;
  let navigateSpy;
  let location: Location;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RolesModule,
        ...extraTestingModules
      ],
      providers: [
        RolesService,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RolesListComponent);
    component = fixture.componentInstance;
    rolesService = fixture.debugElement.injector.get(RolesService);
    getAllRolesSpy = spyOn (rolesService, 'getAllRoles').and.returnValue(fakeAsyncResponse(getAllRolesData));
    navigateSpy = spyOn (component.router, 'navigate');
    location = TestBed.get(Location);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should correctly load roles table data on init', () => {
    fixture.whenStable().then(() => {
      expect(component.rolesDataSource.body).toEqual(getAllRolesData.roles);
      expect(component.rolesDataSource.footer).toEqual(getAllRolesData.footer);
      expect(component.count).toEqual(getAllRolesData.count);
    });
  });

  it('should should be navigated to role edit page on table row click', () => {
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const tableRow = fixture.nativeElement.querySelector('table tbody tr');
      click(tableRow);
      expect(navigateSpy).toHaveBeenCalledWith(['/roles/edit', getAllRolesData.roles[0].id]);
    });
  });

  it('should be navigated to role creation page on "add new role" button press', fakeAsync(() => {
      const addRoleButton = fixture.nativeElement.querySelector('a.start');
      click(addRoleButton);
      tick();
      expect(location.path()).toBe('/roles/add');
  }));
});
