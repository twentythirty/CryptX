import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExecutionOrderFillDetailComponent } from './execution-order-fill-detail.component';

describe('ExecutionOrderFillDetailComponent', () => {
  let component: ExecutionOrderFillDetailComponent;
  let fixture: ComponentFixture<ExecutionOrderFillDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExecutionOrderFillDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExecutionOrderFillDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
