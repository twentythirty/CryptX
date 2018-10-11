import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { extraTestingModules, fakeAsyncResponse, errorResponse } from '../../../testing/utils';

import { ColdStorageCustodiansModule } from '../cold-storage-custodians.module';
import { CustodiansAddComponent } from './custodians-add.component';
import { ColdStorageService } from '../../../services/cold-storage/cold-storage.service';
import { testFormControlForm } from '../../../testing/commonTests';
import { addCustodianData } from '../../../testing/service-mock/coldStorage.service.mock';


describe('CustodiansAddComponent', () => {
  let component: CustodiansAddComponent;
  let fixture: ComponentFixture<CustodiansAddComponent>;
  let coldStorageService: ColdStorageService;
  let addCustodianSpy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ColdStorageCustodiansModule,
        ...extraTestingModules
      ],
      providers: [
        ColdStorageService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustodiansAddComponent);
    component = fixture.componentInstance;
    coldStorageService = fixture.debugElement.injector.get(ColdStorageService);
    addCustodianSpy = spyOn (coldStorageService, 'addCustodian').and.returnValue(fakeAsyncResponse(addCustodianData));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  testFormControlForm(() => {
    return {
      component: component,
      fixture: fixture,
      formControl: component.form,
      submitButton: () => fixture.nativeElement.querySelector('button.submit'),
      fillForm: () => {
        component.form.controls.custodian_name.setValue('Name');
        fixture.detectChanges();
      },
      changeToUnsuccess: () => {
        addCustodianSpy.and.returnValue(fakeAsyncResponse(errorResponse));
      }
    };
  });
});
