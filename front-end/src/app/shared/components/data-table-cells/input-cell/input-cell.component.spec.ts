import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InputCellComponent } from './input-cell.component';

describe('InputCellComponent', () => {
  let component: InputCellComponent;
  let fixture: ComponentFixture<InputCellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InputCellComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InputCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
