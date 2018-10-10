import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { extraTestingModules, newEvent, fakeAsyncResponse, click } from '../../../testing/utils';

import { DepositApproveComponent } from './deposit-approve.component';
import { DepositModule } from '../deposit.module';
import { testFormControlForm } from '../../../testing/commonTests';
import { DepositService } from '../../../services/deposit/deposit.service';
import { SubmitData, ApproveData } from '../../../testing/service-mock/deposit.service.mock';


describe('DepositApproveComponent', () => {
  let component: DepositApproveComponent;
  let fixture: ComponentFixture<DepositApproveComponent>;
  let depositService: DepositService;
  let submitSpy;
  let approveSpy;

  const depositApproveFormModal: () => HTMLElement = () => {
    return fixture.nativeElement.querySelector('app-modal[deposit-form-modal]');
  };
  const depositApproveConfirmModal: () => HTMLElement = () => {
    return fixture.nativeElement.querySelector('app-confirm');
  };
  const depositApproveFormModalX: () => HTMLElement = () => {
    return fixture.nativeElement.querySelector('app-modal .close-modal');
  };
  const depositApproveFormModalSubmitBtn: () => HTMLElement = () => {
    return fixture.nativeElement.querySelector('app-modal button.submit');
  };
  const depositApproveConfirmModalCancelBtn: () => HTMLElement = () => {
    return fixture.nativeElement.querySelector('app-confirm .btn.grey');
  };
  const depositApproveConfirmModalConfirmBtn: () => HTMLElement = () => {
    return fixture.nativeElement.querySelector('app-confirm .btn:not(.grey)');
  };

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
    const modal = depositApproveFormModal();
    expect(modal).toBeFalsy('modal is rendered');
  });

  it('deposit approve confirm modal should not be rendered', () => {
    const modal = depositApproveConfirmModal();
    expect(modal).toBeFalsy('modal is rendered');
  });

  describe('open deposit approve form modal', () => {
    beforeEach(() => {
      component.openModal();
      fixture.detectChanges();
    });


    it('should open modal', () => {
      const modal = depositApproveFormModal();
      expect(modal).toBeTruthy('modal not opened');
    });

    testFormControlForm(() => {
      return {
        component: component,
        fixture: fixture,
        formControl: component.form,
        submitButton: depositApproveFormModalSubmitBtn,
        fillForm: () => {
          fillDepositApproveForm(fixture, 5.5, 6.6);
        },
        changeToUnsuccess: () => {

        }
      };
    });

    it('should close deposit approve form modal on cross button press', () => {
      const x = depositApproveFormModalX();
      click(x);
      fixture.detectChanges();

      const modal = depositApproveFormModal();
      expect(modal).toBeFalsy('modal opened');
    });

    it('should not close deposit form approve modal if form is invalid', () => {
      const btn = depositApproveFormModalSubmitBtn();
      click(btn);
      fixture.detectChanges();

      const modal = depositApproveFormModal();
      expect(modal).toBeTruthy('modal not opened');
    });

    describe('submited valid form', () => {
      beforeEach((done) => {
        const btn = depositApproveFormModalSubmitBtn();
        fillDepositApproveForm(fixture, 5.5, 6.6);
        click(btn);

        submitSpy.calls.mostRecent().returnValue.subscribe(() => {
          fixture.detectChanges();
          done();
        });
      });


      it('should close deposit form approve modal', () => {
        const modal = depositApproveFormModal();
        expect(modal).toBeFalsy('modal opened');
      });

      it('open confirm modal', () => {
        const modal = depositApproveConfirmModal();
        expect(modal).toBeTruthy('modal not opened');
      });

      describe('after deposit confirm modal is opened', () => {
        describe('after deposit confirmation is canceled', () => {
          let updateDataSpy;

          beforeEach(() => {
            updateDataSpy = spyOn(component.updateData, 'emit').and.callThrough();
            const btn = depositApproveConfirmModalCancelBtn();
            click(btn);
            fixture.detectChanges();
          });


          it('should close confirm modal', () => {
            const modal = depositApproveConfirmModal();
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
            const btn = depositApproveConfirmModalConfirmBtn();
            click(btn);

            approveSpy.calls.mostRecent().returnValue.subscribe(() => {
              fixture.detectChanges();
              done();
            });
          });


          it('should close confirm modal', () => {
            const modal = depositApproveConfirmModal();
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
