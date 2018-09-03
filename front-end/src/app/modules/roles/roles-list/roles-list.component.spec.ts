import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { extraTestingModules, fakeAsyncResponse } from '../../../utils/testing';

import { RolesListComponent } from './roles-list.component';
import { RolesModule } from '../roles.module';
import { RolesService } from '../../../services/roles/roles.service';


const RolesServiceStub = {
  getAllRoles: () => {
    return fakeAsyncResponse({});
  }
};


describe('RolesListComponent', () => {
  let component: RolesListComponent;
  let fixture: ComponentFixture<RolesListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RolesModule,
        ...extraTestingModules
      ],
      providers: [
        { provide: RolesService, useValue: RolesServiceStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RolesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
