import { AutofocusDirective } from './autofocus.directive';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component } from '@angular/core';

describe('AutofocusDirective', () => {
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ AutofocusDirective, TestComponent ]
    })
    .createComponent(TestComponent);

    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
  });

  it('should create an instance', () => {
    expect(fixture).toBeTruthy();
  });
});


@Component({
  template: `
    <input appAutofocus>
  `
})
class TestComponent { }
