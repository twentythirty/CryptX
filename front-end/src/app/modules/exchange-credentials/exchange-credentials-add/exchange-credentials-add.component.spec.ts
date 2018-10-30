import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { of, forkJoin } from 'rxjs';

import { ExchangeCredentialsAddComponent } from './exchange-credentials-add.component';
import { ExchangeCredentialsModule } from '../exchange-credentials.module';
import { extraTestingModules, fakeAsyncResponse, selectOption, KeyCode, errorResponse, newEvent, click } from '../../../testing/utils';
import { ExchangesService } from '../../../services/exchanges/exchanges.service';
import {
  getAllExchangesData,
  getCredentialFieldsData,
  getExchangeCredentialsData,
  setExchangeCredentialsData,
  deleteExchangeCredentialsData
} from '../../../testing/service-mock/exchanges.service.mock';
import { testFormControlForm } from '../../../testing/commonTests';


describe('ExchangeCredentialsAddComponent', () => {
  let component: ExchangeCredentialsAddComponent;
  let fixture: ComponentFixture<ExchangeCredentialsAddComponent>;
  let exchangesService: ExchangesService;
  let router: Router;
  let getAllExchangesSpy;
  let getCredentialFieldsSpy;
  let getExchangeCredentialsSpy;
  let setExchangeCredentialsSpy;
  let deleteExchangeCredentialsSpy;
  let navigateSpy;


  const exchangeSelectComp: () => DebugElement = () => {
    return fixture.debugElement.query(By.css('[formControlName="exchange"]'));
  };
  const exchangeSelect: () => HTMLElement = () => {
    return fixture.nativeElement.querySelector('[formControlName="exchange"] ng-select');
  };
  const editButton: () => HTMLButtonElement = () => {
    return fixture.nativeElement.querySelector('[edit-button] button');
  };
  const deleteButton: () => HTMLButtonElement = () => {
    return fixture.nativeElement.querySelector('[delete-button] button');
  };
  const confirmModal: () => HTMLButtonElement = () => {
    return fixture.nativeElement.querySelector('app-confirm');
  };


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ExchangeCredentialsModule,
        ...extraTestingModules
      ]
    });
  }));


  function afterConfigure() {
    TestBed.compileComponents();
    fixture = TestBed.createComponent(ExchangeCredentialsAddComponent);
    component = fixture.componentInstance;

    exchangesService = fixture.debugElement.injector.get(ExchangesService);
    router = fixture.debugElement.injector.get(Router);
    getAllExchangesSpy = spyOn(exchangesService, 'getAllExchanges').and.returnValue(fakeAsyncResponse(getAllExchangesData));
    getCredentialFieldsSpy = spyOn(exchangesService, 'getCredentialFields').and.returnValue(fakeAsyncResponse(getCredentialFieldsData));
    getExchangeCredentialsSpy = spyOn(exchangesService, 'getExchangeCredentials')
      .and.returnValue(fakeAsyncResponse(getExchangeCredentialsData));
    setExchangeCredentialsSpy = spyOn(exchangesService, 'setExchangeCredentials')
      .and.returnValue(fakeAsyncResponse(setExchangeCredentialsData));
    deleteExchangeCredentialsSpy = spyOn(exchangesService, 'deleteExchangeCredentials')
      .and.returnValue(fakeAsyncResponse(deleteExchangeCredentialsData));
    navigateSpy = spyOn(router, 'navigate');

    fixture.detectChanges();
  }



  describe('when add credential', () => {
    beforeEach(afterConfigure);


    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('exchange select should be disabled', () => {
      const select = exchangeSelect();
      expect(select.classList).toContain('disabled');
    });


    describe('when load all exchanges', () => {
      beforeEach((done) => {
        getAllExchangesSpy.calls.mostRecent().returnValue.subscribe(() => {
          fixture.detectChanges();
          done();
        });
      });


      it('exchange select should not be disabled', () => {
        const select = exchangeSelect();
        expect(select.classList).not.toContain('disabled');
      });


      describe('when exchange is selected', () => {
        beforeEach((done) => {
          const exchangeSel = exchangeSelectComp();
          selectOption(exchangeSel, KeyCode.ArrowDown, 1);

          getCredentialFieldsSpy.calls.mostRecent().returnValue.subscribe(() => {
            fixture.detectChanges();
            done();
          });
        });


        it('should load exchange fields', () => {
          expect(component.fieldsWithoutApiKey).toBeTruthy();
        });


        testFormControlForm(() => {
          return {
            component: component,
            fixture: fixture,
            formControl: component.form,
            submitButton: () => fixture.nativeElement.querySelector('button.submit'),
            fillForm: () => {
              fillForm();
            },
            changeToUnsuccess: () => {
              setExchangeCredentialsSpy.and.returnValue(fakeAsyncResponse(errorResponse));
            }
          };
        });

      });
    });
  });


  describe('when edit credential', () => {
    beforeEach(() => {
      TestBed.overrideProvider(ActivatedRoute, {
        useValue: {
          params: of({ id: 3 }),
        }
      });
    });

    beforeEach(afterConfigure);

    beforeEach((done) => {
      forkJoin(
        getCredentialFieldsSpy.calls.mostRecent().returnValue,
        getExchangeCredentialsSpy.calls.mostRecent().returnValue,
      ).subscribe(() => {
        fixture.detectChanges();
        done();
      });
    });


    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should apply edit mode', () => {
      expect(component.isEdit).toBeTruthy();
    });

    it('should set exchange id to form', () => {
      expect(component.form.controls.exchange.value).toBe(3);
    });

    it('should set api_key value', () => {
      expect(component.form.controls.api_key.value).toBeTruthy();
    });

    it('should show edit button', () => {
      const btn = editButton();
      expect(btn).toBeTruthy();
    });

    it('should show credential delete button', () => {
      const btn = deleteButton();
      expect(btn).toBeTruthy();
    });

    it('should show 2 inputs', () => {
      const inputs = fixture.nativeElement.querySelectorAll('app-input-item');
      expect(inputs.length).toBe(2);
    });


    describe('when edit button is pressed', () => {
      beforeEach(() => {
        const btn = editButton();
        click(btn);
        fixture.detectChanges();
      });


      it('should show 5 inputs', () => {
        const inputs = fixture.nativeElement.querySelectorAll('app-input-item');
        expect(inputs.length).toBe(5);
      });
    });


    describe('when delete button is pressed', () => {
      beforeEach(() => {
        const btn = deleteButton();
        click(btn);
        fixture.detectChanges();
      });


      it('should open confirm modal', () => {
        const modal = confirmModal();
        expect(modal).toBeTruthy();
      });


      describe('when confirm button is pressed', () => {
        beforeEach((done) => {
          const modal = confirmModal();
          const btn = modal.querySelectorAll('button')[1];
          click(btn);
          fixture.detectChanges();

          deleteExchangeCredentialsSpy.calls.mostRecent().returnValue.subscribe(() => {
            fixture.detectChanges();
            done();
          });
        });


        it('should delete and navigate to exchange credentials list', () => {
          expect(deleteExchangeCredentialsSpy).toHaveBeenCalled();
          expect(navigateSpy).toHaveBeenCalledWith(['/exchange_credentials']);
        });
      });
    });

  });


  function fillForm() {
    const inputs = fixture.nativeElement.querySelectorAll('form app-input-item input');

    for (let i = 1; i < inputs.length; i++) {
      inputs[i].value = 'test';
      inputs[i].dispatchEvent(newEvent('input'));
    }

    fixture.detectChanges();
  }
});
