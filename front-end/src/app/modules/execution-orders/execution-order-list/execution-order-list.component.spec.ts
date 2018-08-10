import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExecutionOrderListComponent } from './execution-order-list.component';

describe('ExecutionOrderListComponent', () => {
  let component: ExecutionOrderListComponent;
  let fixture: ComponentFixture<ExecutionOrderListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExecutionOrderListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExecutionOrderListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
