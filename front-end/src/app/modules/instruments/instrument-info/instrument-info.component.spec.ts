import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, zip } from 'rxjs';
import { extraTestingModules, fakeAsyncResponse, click } from '../../../testing/utils';

import { InstrumentsModule } from '../instruments.module';
import { InstrumentInfoComponent } from './instrument-info.component';
import { InstrumentsService } from '../../../services/instruments/instruments.service';
import { ExchangesService } from '../../../services/exchanges/exchanges.service';
import { getAllExchangesData } from '../../../testing/service-mock/exchanges.service.mock';
import { getInstrumentData, getInstrumentExchangesMappingData } from '../../../testing/service-mock/instruments.service.mock';


describe('InstrumentInfoComponent', () => {
  let component: InstrumentInfoComponent;
  let fixture: ComponentFixture<InstrumentInfoComponent>;
  let instrumentsService: InstrumentsService;
  let exchangesService: ExchangesService;
  let getInstrumentSpy;
  let getAllExchangesSpy;
  let getInstrumentExchangesMappingSpy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        InstrumentsModule,
        ...extraTestingModules
      ],
      providers: [
        {
          provide: ActivatedRoute, useValue: {
            params: of({ id: 1 }),
            queryParams: of({ page: 1 })
          }
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach((done) => {
    fixture = TestBed.createComponent(InstrumentInfoComponent);
    component = fixture.componentInstance;
    instrumentsService = fixture.debugElement.injector.get(InstrumentsService);
    exchangesService = fixture.debugElement.injector.get(ExchangesService);
    getInstrumentSpy = spyOn(instrumentsService, 'getInstrument').and.returnValue(fakeAsyncResponse(getInstrumentData));
    getAllExchangesSpy = spyOn(exchangesService, 'getAllExchanges').and.returnValue(fakeAsyncResponse(getAllExchangesData));
    getInstrumentExchangesMappingSpy = spyOn(instrumentsService, 'getInstrumentExchangesMapping').and.returnValue(fakeAsyncResponse(getInstrumentExchangesMappingData));
    fixture.detectChanges();

    zip(
      getInstrumentSpy.calls.mostRecent().returnValue,
      getInstrumentExchangesMappingSpy.calls.mostRecent().returnValue
    ).subscribe(() => {
      fixture.detectChanges();
      done();
    });
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should correctly load instrument table data on init', () => {
    expect(component.instrumentDataSource.body).toEqual([getInstrumentData.instrument]);
    expect(component.exchanges).toEqual(getAllExchangesData.exchanges);
    expect(component.mappingDataSource.body.length).toEqual(getInstrumentExchangesMappingData.count, 'mapping data count not match');
  });

  describe('if instrument dont have mapping', () => {
    beforeEach((done) => {
      getInstrumentExchangesMappingSpy.and.returnValue(fakeAsyncResponse(
        Object.assign(getInstrumentExchangesMappingData, { mapping_data: [] })
      ));
      component.getAllData();

      getInstrumentExchangesMappingSpy.calls.mostRecent().returnValue.subscribe(() => {
        fixture.detectChanges();
        done();
      });
    });


    const getMappingTable = () => {
      const tables = fixture.nativeElement.querySelectorAll('table');
      return tables[1]; // second component table
    };


    it('mapping table should have empty and not valid mapping record', () => {
      expect(component.mappingDataSource.body.length).toEqual(1);
      expect(component.mappingDataSource.body[0].valid).toBeFalsy('mapping record is valid');

      expect(component.mappingDataSource.body[0].instrument_id).toBeUndefined('instrument_id is defined');
      expect(component.mappingDataSource.body[0].exchange_name).toBeUndefined('exchange_name is defined');
      expect(component.mappingDataSource.body[0].external_instrument).toBeUndefined('external_instrument is defined');
      expect(component.mappingDataSource.body[0].current_price).toBeUndefined('current_price is defined');
      expect(component.mappingDataSource.body[0].last_day_vol).toBeUndefined('last_day_vol is defined');
      expect(component.mappingDataSource.body[0].last_week_vol).toBeUndefined('last_week_vol is defined');
      expect(component.mappingDataSource.body[0].last_updated).toBeUndefined('last_updated is defined');
      expect(component.mappingDataSource.body[0].external_instrument_list).toBeUndefined('external_instrument_list is defined');
    });

    it('mapping record should have new record custom row class', () => {
      const mappingTable = getMappingTable();
      const tableRow: HTMLTableRowElement = mappingTable.querySelector('tbody tr');

      expect(tableRow.classList).toContain('color-light-green');
    });

    it('should not add new mapping on "new mapping" button press', () => {
      const button: HTMLAnchorElement = fixture.nativeElement.querySelector('.top-controls a');
      click(button);

      expect(component.mappingDataSource.body.length).toBe(1, 'seems that mapping was added');
    });

    it('mapping exchange select should have exchanges', () => {
      expect(component.exchanges.length).toBeGreaterThan(0);
    });

    it('should can select exchange in mapping table', () => {
      component.mappingDataSource.body[0].exchange_id = 1;
      component.mappingDataSource.body[0].exchange_name = 'Binance';
      component.mappingDataSource.body[0].current_price = 100;
      fixture.detectChanges();

      fixture.whenStable().then(() => {

        const mappingTable = getMappingTable();
        const firstTd = mappingTable.querySelector('tbody td:nth-child(1) .ng-value-label');

        console.log(component);
      });
    });
  });
});
