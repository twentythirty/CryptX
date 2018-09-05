import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

import { InputItemComponent } from './input-item.component';
import { InputItemErrorMessageComponent } from '../input-item-error-message/input-item-error-message.component';

describe('InputItemComponent', () => {
  let component: InputItemComponent;
  let fixture: ComponentFixture<InputItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        InputItemComponent,
        InputItemErrorMessageComponent
      ],
      imports: [
        FormsModule,
        NgSelectModule,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InputItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
