import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InputItemComponent } from './input-item.component';

describe('InputItemComponent', () => {
  let component: InputItemComponent;
  let fixture: ComponentFixture<InputItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InputItemComponent ]
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
