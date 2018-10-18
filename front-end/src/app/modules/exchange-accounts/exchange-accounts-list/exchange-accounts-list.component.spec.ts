import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { extraTestingModules, fakeAsyncResponse, click } from '../../../testing/utils';
import { ExchangesService } from '../../../services/exchanges/exchanges.service';
import { ExchangeAccountsModule } from '../exchange-accounts.module';
import { ExchangeAccountsListComponent } from './exchange-accounts-list.component';
import { getAllExchangeAccountsData } from '../../../testing/service-mock/exchanges.service.mock';
import { testHeaderLov } from '../../../testing/commonTests';
import { Location } from '@angular/common';

describe('ExchangeAccountsListComponent', () => {
  let component: ExchangeAccountsListComponent;
  let fixture: ComponentFixture<ExchangeAccountsListComponent>;
  let exchangeService: ExchangesService;
  let getExchangeAccountsDataSpy;
  let navigateSpy;
  let location: Location;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ExchangeAccountsModule,
        ...extraTestingModules
      ],
      providers: [
        ExchangesService,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangeAccountsListComponent);
    component = fixture.componentInstance;
    exchangeService = fixture.debugElement.injector.get(ExchangesService);
    getExchangeAccountsDataSpy = spyOn (exchangeService, 'getAllExchangeAccounts').and.returnValue(fakeAsyncResponse(getAllExchangeAccountsData));
    navigateSpy = spyOn (component.router, 'navigate');
    location = TestBed.get(Location);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load tables data on init', () => {
    fixture.whenStable().then(() => {
      expect(component.exchangeAccountsDataSource.body).toEqual(getAllExchangeAccountsData.exchange_accounts);
      expect(component.exchangeAccountsDataSource.footer).toEqual(getAllExchangeAccountsData.footer);
      expect(component.count).toEqual(getAllExchangeAccountsData.count);
    });
  });

  it('should set header LOV observables for specified columns', () => {
    const headerLovColumns = ['exchange', 'address', 'is_active'];
    fixture.whenStable().then(() => testHeaderLov(component.exchangeAccountsDataSource, headerLovColumns));
  });

  it('should be navigated to exchange account view on table row click', () => {
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const tableRow = fixture.nativeElement.querySelector('table tbody tr');
      click(tableRow);
      expect(navigateSpy).toHaveBeenCalledWith(['/exchange_accounts/view/', getAllExchangeAccountsData.exchange_accounts[0].id]);
    });
  });

  it('should navigate to exchange account creation on "add account" button click', fakeAsync(() => {
    const button = fixture.nativeElement.querySelector('a.start');
    click(button);
    tick();
    expect(location.path()).toBe('/exchange_accounts/add');
  }));

});
