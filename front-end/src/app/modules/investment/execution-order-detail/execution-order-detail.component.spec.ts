import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExecutionOrderDetailComponent } from './execution-order-detail.component';

describe('ExecutionOrderDetailComponent', () => {
  let component: ExecutionOrderDetailComponent;
  let fixture: ComponentFixture<ExecutionOrderDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExecutionOrderDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExecutionOrderDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
