import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RolesListComponent } from './roles-list.component';

describe('RolesComponent', () => {
  let component: RolesListComponent;
  let fixture: ComponentFixture<RolesListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RolesListComponent ]
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
