import { async, ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import * as _ from 'lodash';
import { extraTestingModules, fakeAsyncResponse, click } from '../../../testing/utils';

import { ColdStorageAccountsModule } from '../cold-storage-accounts.module';
import { AccountsListComponent } from './accounts-list.component';
import { ColdStorageService } from '../../../services/cold-storage/cold-storage.service';
import { testHeaderLov } from '../../../testing/commonTests';
import { getAllAccountsData } from '../../../testing/service-mock/coldStorage.service.mock';


fdescribe('AccountsListComponent', () => {
  let component: AccountsListComponent;
  let fixture: ComponentFixture<AccountsListComponent>;
  let coldStorageService: ColdStorageService;
  let navigateSpy;
  let getAllAccountsDataSpy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ColdStorageAccountsModule,
        ...extraTestingModules,
      ],
      providers: [
        ColdStorageService,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountsListComponent);
    component = fixture.componentInstance;
    coldStorageService = fixture.debugElement.injector.get(ColdStorageService);
    getAllAccountsDataSpy = spyOn(coldStorageService, 'getAllAccounts').and.returnValue(fakeAsyncResponse(getAllAccountsData));
    navigateSpy = spyOn(component.router, 'navigate');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should correctly load table data on init', () => {
    fixture.whenStable().then(() => {
      expect(component.accountsDataSource.body).toEqual(getAllAccountsData.accounts);
      expect(component.accountsDataSource.footer).toEqual(getAllAccountsData.footer);
      expect(component.count).toBe(getAllAccountsData.count);
    });
  });

  it('sould set header LOV observables for specified columns', () => {
    const headerLovColumns = ['asset', 'strategy_type', 'address', 'custodian'];

    fixture.whenStable().then(() => testHeaderLov(component.accountsDataSource, headerLovColumns));
  });

  it('sould navigate to new account route on new account button press', fakeAsync(() => {
    fixture.whenStable().then(() => {
      const button = fixture.nativeElement.querySelector('a.start');
      click(button);
      expect(navigateSpy).toHaveBeenCalledWith(['/cold_storage/accounts/add']);
    });
  }));
});
