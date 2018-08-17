import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransfersListComponent } from './transfers-list.component';

describe('TransfersListComponent', () => {
  let component: TransfersListComponent;
  let fixture: ComponentFixture<TransfersListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransfersListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransfersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
