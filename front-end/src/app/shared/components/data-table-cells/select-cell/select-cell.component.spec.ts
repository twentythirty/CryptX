import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import {  NgSelectModule } from '@ng-select/ng-select';

import { SelectCellComponent } from './select-cell.component';
import { InputItemComponent } from '../../input-item/input-item.component';
import { InputItemErrorMessageComponent } from '../../input-item-error-message/input-item-error-message.component';

describe('SelectCellComponent', () => {
  let component: SelectCellComponent;
  let fixture: ComponentFixture<SelectCellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        SelectCellComponent,
        InputItemComponent,
        InputItemErrorMessageComponent,
      ],
      imports: [
        FormsModule,
        NgSelectModule,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
