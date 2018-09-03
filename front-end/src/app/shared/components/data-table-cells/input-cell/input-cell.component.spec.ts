import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { InputCellComponent } from './input-cell.component';

describe('InputCellComponent', () => {
  let component: InputCellComponent;
  let fixture: ComponentFixture<InputCellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InputCellComponent ],
      imports: [
        FormsModule
      ]
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
