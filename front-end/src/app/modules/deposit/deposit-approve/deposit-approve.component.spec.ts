import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { extraTestingModules, newEvent, fakeAsyncResponse, click } from '../../../testing/utils';

import { DepositApproveComponent } from './deposit-approve.component';
import { DepositModule } from '../deposit.module';
import { testFormControlForm } from '../../../testing/commonTests';
import { DepositService } from '../../../services/deposit/deposit.service';
import { SubmitData, ApproveData } from '../../../testing/service-mock/deposit.service.mock';



const depositApproveFormModal: (ComponentFixture) => HTMLElement = (f) => {
  return f.nativeElement.querySelector('app-modal[deposit-form-modal]');
};
const depositApproveConfirmModal: (ComponentFixture) => HTMLElement = (f) => {
  return f.nativeElement.querySelector('app-confirm');
};
const depositApproveFormModalX: (ComponentFixture) => HTMLElement = (f) => {
  return f.nativeElement.querySelector('app-modal .close-modal');
};
const depositApproveFormModalSubmitBtn: (ComponentFixture) => HTMLElement = (f) => {
  return f.nativeElement.querySelector('app-modal button.submit');
};
const depositApproveConfirmModalCancelBtn: (ComponentFixture) => HTMLElement = (f) => {
  return f.nativeElement.querySelector('app-confirm .btn.grey');
};
const depositApproveConfirmModalConfirmBtn: (ComponentFixture) => HTMLElement = (f) => {
  return f.nativeElement.querySelector('app-confirm .btn:not(.grey)');
};


describe('DepositApproveComponent', () => {
  let component: DepositApproveComponent;
  let fixture: ComponentFixture<DepositApproveComponent>;
  let depositService: DepositService;
  let submitSpy;
  let approveSpy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        DepositModule,
        ...extraTestingModules
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DepositApproveComponent);
    component = fixture.componentInstance;

    depositService = fixture.debugElement.injector.get(DepositService);
    submitSpy = spyOn(depositService, 'Submit').and.returnValue(fakeAsyncResponse(SubmitData));
    approveSpy = spyOn(depositService, 'Approve').and.returnValue(fakeAsyncResponse(ApproveData));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deposit approve form modal should not be rendered', () => {
    const modal = depositApproveFormModal(fixture);
    expect(modal).toBeFalsy('modal is rendered');
  });

  it('deposit approve confirm modal should not be rendered', () => {
    const modal = depositApproveConfirmModal(fixture);
    expect(modal).toBeFalsy('modal is rendered');
  });

  describe('open deposit approve form modal', () => {
    beforeEach(() => {
      component.openModal();
      fixture.detectChanges();
    });


    it('should open modal', () => {
      const modal = depositApproveFormModal(fixture);
      expect(modal).toBeTruthy('modal not opened');
    });

    testFormControlForm(() => {
      return {
        component: component,
        fixture: fixture,
        formControl: component.form,
        submitButton: () => depositApproveFormModalSubmitBtn(fixture),
        fillForm: () => {
          fillDepositApproveForm(fixture, 5.5, 6.6);
        },
        changeToUnsuccess: () => {

        }
      };
    });

    it('should close deposit approve form modal on cross button press', () => {
      const x = depositApproveFormModalX(fixture);
      click(x);
      fixture.detectChanges();

      const modal = depositApproveFormModal(fixture);
      expect(modal).toBeFalsy('modal opened');
    });

    it('should not close deposit form approve modal if form is invalid', () => {
      const btn = depositApproveFormModalSubmitBtn(fixture);
      click(btn);
      fixture.detectChanges();

      const modal = depositApproveFormModal(fixture);
      expect(modal).toBeTruthy('modal not opened');
    });

    describe('submited valid form', () => {
      beforeEach((done) => {
        const btn = depositApproveFormModalSubmitBtn(fixture);
        fillDepositApproveForm(fixture, 5.5, 6.6);
        click(btn);

        submitSpy.calls.mostRecent().returnValue.subscribe(() => {
          fixture.detectChanges();
          done();
        });
      });


      it('should close deposit form approve modal', () => {
        const modal = depositApproveFormModal(fixture);
        expect(modal).toBeFalsy('modal opened');
      });

      it('open confirm modal', () => {
        const modal = depositApproveConfirmModal(fixture);
        expect(modal).toBeTruthy('modal not opened');
      });

      describe('after deposit confirm modal is opened', () => {
        describe('after deposit confirmation is canceled', () => {
          let updateDataSpy;

          beforeEach(() => {
            updateDataSpy = spyOn(component.updateData, 'emit').and.callThrough();
            const btn = depositApproveConfirmModalCancelBtn(fixture);
            click(btn);
            fixture.detectChanges();
          });


          it('should close confirm modal', () => {
            const modal = depositApproveConfirmModal(fixture);
            expect(modal).toBeFalsy('modal opened');
          });

          it('should call updateData output', () => {
            expect(updateDataSpy).toHaveBeenCalled();
          });
        });

        describe('after deposit confirmation is confirmed', () => {
          let updateDataSpy;

          beforeEach((done) => {
            updateDataSpy = spyOn(component.updateData, 'emit').and.callThrough();
            const btn = depositApproveConfirmModalConfirmBtn(fixture);
            click(btn);

            approveSpy.calls.mostRecent().returnValue.subscribe(() => {
              fixture.detectChanges();
              done();
            });
          });


          it('should close confirm modal', () => {
            const modal = depositApproveConfirmModal(fixture);
            expect(modal).toBeFalsy('modal opened');
          });

          it('should call updateData output', () => {
            expect(updateDataSpy).toHaveBeenCalled();
          });
        });
      });
    });

  });

});



function fillDepositApproveForm(fixture, amount, managementFee) {
  const inputs = fixture.nativeElement.querySelectorAll('form input');
  inputs[0].value = amount;
  inputs[0].dispatchEvent(newEvent('input'));
  fixture.detectChanges();

  inputs[1].value = managementFee;
  inputs[1].dispatchEvent(newEvent('input'));
  fixture.detectChanges();

  return inputs;
}
