import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { extraTestingModules } from '../../../utils/testing';

import { ActionLogComponent } from './action-log.component';
import { ModalComponent } from '../modal/modal.component';
import { BtnComponent } from '../btn/btn.component';

describe('ActionLogComponent', () => {
  let component: ActionLogComponent;
  let fixture: ComponentFixture<ActionLogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ActionLogComponent,
        BtnComponent,
        ModalComponent,
      ],
      imports: [
        ...extraTestingModules
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
