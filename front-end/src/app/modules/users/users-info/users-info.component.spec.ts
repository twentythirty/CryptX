import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersInfoComponent } from './users-info.component';

describe('UsersAddComponent', () => {
  let component: UsersInfoComponent;
  let fixture: ComponentFixture<UsersInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UsersInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsersInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
