import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonRadioComponent } from './button-radio.component';

describe('ButtonRadioComponent', () => {
  let component: ButtonRadioComponent;
  let fixture: ComponentFixture<ButtonRadioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ButtonRadioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ButtonRadioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
