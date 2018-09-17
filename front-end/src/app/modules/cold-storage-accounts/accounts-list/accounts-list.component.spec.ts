import { async, ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import * as _ from 'lodash';
import { extraTestingModules, fakeAsyncResponse } from '../../../testing/utils';

import { ColdStorageAccountsModule } from '../cold-storage-accounts.module';
import { AccountsListComponent } from './accounts-list.component';
import { ColdStorageService, AccountsAllResponse } from '../../../services/cold-storage/cold-storage.service';
import { testHeaderLov } from '../../../testing/commonTests';

const ColdStorageServiceStub = {
  getAllAccounts: () => {
    return fakeAsyncResponse<AccountsAllResponse>({
      success: true,
      accounts: [
        {
          id: 14,
          asset: 'BTC',
          strategy_type: 'investment.strategy.101',
          address: 'asdf',
          custodian: 'Coinbase Custody',
          balance: '0',
          balance_usd: '0',
          balance_update_timestamp: null
        },
      ],
      footer: [
        {
          name: 'balance_usd',
          value: '22719.008525',
          template: 'cold_storage_transfers.footer.balance_usd',
          args: {
            balance_usd: '22719.008525'
          }
        }
      ],
      count: 1
    });
  },

  getAllAccountsHeaderLOV: () => {
    return fakeAsyncResponse([
      { value: 'value 1' },
      { value: 'value 2' },
      { value: 'value 3' },
    ]);
  }
};


describe('AccountsListComponent', () => {
  let component: AccountsListComponent;
  let fixture: ComponentFixture<AccountsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ColdStorageAccountsModule,
        ...extraTestingModules,
      ],
      providers: [
        { provide: ColdStorageService, useValue: ColdStorageServiceStub },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('sould set header LOV observables for specified columns', () => {
    const headerLovColumns = ['asset', 'strategy_type', 'address', 'custodian'];

    fixture.whenStable().then(() => testHeaderLov(component.accountsDataSource, headerLovColumns));
  });

  fit('sould navigate to new account route on new account button press', fakeAsync(() => {
    const navigateSpy = spyOn(component.router, 'navigate');
    component.addAccount();
    expect(navigateSpy).toHaveBeenCalledWith(['/cold_storage/accounts/add']);
  }));
});
