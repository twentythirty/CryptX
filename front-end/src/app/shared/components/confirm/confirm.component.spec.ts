import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { extraTestingModules } from '../../../testing/utils';
import { MatProgressSpinnerModule } from '@angular/material';

import { ConfirmComponent } from './confirm.component';
import { BtnComponent } from '../btn/btn.component';
import { ModalComponent } from '../modal/modal.component';

describe('ConfirmComponent', () => {
  let component: ConfirmComponent;
  let fixture: ComponentFixture<ConfirmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ConfirmComponent,
        BtnComponent,
        ModalComponent,
      ],
      imports: [
        ...extraTestingModules,
        MatProgressSpinnerModule,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
