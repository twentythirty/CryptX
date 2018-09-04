import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';

import { RationaleModalComponent } from './rationale-modal.component';
import { BtnComponent } from '../btn/btn.component';

describe('RationaleModalComponent', () => {
  let component: RationaleModalComponent;
  let fixture: ComponentFixture<RationaleModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        RationaleModalComponent,
        BtnComponent,
      ],
      imports: [
        ReactiveFormsModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RationaleModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
