import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InputItemErrorMessageComponent } from './input-item-error-message.component';

describe('InputItemErrorMessageComponent', () => {
  let component: InputItemErrorMessageComponent;
  let fixture: ComponentFixture<InputItemErrorMessageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InputItemErrorMessageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InputItemErrorMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
