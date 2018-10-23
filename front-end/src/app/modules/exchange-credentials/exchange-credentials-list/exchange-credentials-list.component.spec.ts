import { async, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';

import { ExchangeCredentialsListComponent } from './exchange-credentials-list.component';
import { testHeaderLov } from '../../../testing/commonTests';
import { click, fakeAsyncResponse, extraTestingModules } from '../../../testing/utils';
import { ExchangesService } from '../../../services/exchanges/exchanges.service';
import { Location } from '@angular/common';
import { getAllExchangeCredentialsData } from '../../../testing/service-mock/exchanges.service.mock';
import { ExchangeCredentialsModule } from '../exchange-credentials.module';

describe('ExchangeCredentialsListComponent', () => {
  let component: ExchangeCredentialsListComponent;
  let fixture: ComponentFixture<ExchangeCredentialsListComponent>;
  let exchangesService: ExchangesService;
  let getAllExchangeCredentialsSpy;
  let navigateSpy;
  let location: Location;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ExchangeCredentialsModule,
        ...extraTestingModules
      ],
      providers: [
        ExchangesService,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangeCredentialsListComponent);
    component = fixture.componentInstance;
    exchangesService = fixture.debugElement.injector.get(ExchangesService);
    navigateSpy = spyOn (component.router, 'navigate');
    getAllExchangeCredentialsSpy = spyOn (exchangesService, 'getAllExchangeCredentials').and.returnValue(fakeAsyncResponse(
      getAllExchangeCredentialsData));
    location = TestBed.get(Location);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load tables data on init', () => {
    fixture.whenStable().then(() => {
      expect(component.exchangeCredentialsDataSource.body).toEqual(getAllExchangeCredentialsData.exchange_credentials);
      expect(component.exchangeCredentialsDataSource.footer).toEqual(getAllExchangeCredentialsData.footer);
      expect(component.count).toEqual(getAllExchangeCredentialsData.count);
    });
  });

  it('should set header LOV observables for specified columns', () => {
    const headerLovColumns = ['exchange'];
    fixture.whenStable().then(() => testHeaderLov(component.exchangeCredentialsDataSource, headerLovColumns));
  });

  it('should be navigated to exchange account view on table row click', () => {
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const tableRow = fixture.nativeElement.querySelector('table tbody tr');
      click(tableRow);
      expect(navigateSpy).toHaveBeenCalledWith(['/exchange_credentials/view/', getAllExchangeCredentialsData.exchange_credentials[0].id]);
    });
  });

  it('should navigate to exchange account creation on "add account" button click', fakeAsync(() => {
    const button = fixture.nativeElement.querySelector('a.start');
    click(button);
    tick();
    expect(location.path()).toBe('/exchange_credentials/add');
  }));
});
