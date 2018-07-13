import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmCellComponent } from './confirm-cell.component';

describe('ConfirmCellComponent', () => {
  let component: ConfirmCellComponent;
  let fixture: ComponentFixture<ConfirmCellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmCellComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
