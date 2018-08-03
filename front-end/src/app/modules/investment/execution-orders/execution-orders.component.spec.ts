import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExecutionOrdersComponent } from './execution-orders.component';

describe('ExecutionOrdersComponent', () => {
  let component: ExecutionOrdersComponent;
  let fixture: ComponentFixture<ExecutionOrdersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExecutionOrdersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExecutionOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
