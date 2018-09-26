import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { of, zip } from 'rxjs';
import * as _ from 'lodash';
import { extraTestingModules, fakeAsyncResponse, click, selectOption, KeyCode, triggerKeyDownEvent, getNgSelectElement } from '../../../testing/utils';

import { InstrumentsModule } from '../instruments.module';
import { InstrumentInfoComponent } from './instrument-info.component';
import { InstrumentsService } from '../../../services/instruments/instruments.service';
import { ExchangesService } from '../../../services/exchanges/exchanges.service';
import { getAllExchangesData, getExchangeInstrumentIdentifiersData } from '../../../testing/service-mock/exchanges.service.mock';
import {
  getInstrumentData,
  getInstrumentExchangesMappingData,
  checkMappingData,
  addMappingData
} from '../../../testing/service-mock/instruments.service.mock';


describe('InstrumentInfoComponent', () => {
  let component: InstrumentInfoComponent;
  let fixture: ComponentFixture<InstrumentInfoComponent>;
  let instrumentsService: InstrumentsService;
  let exchangesService: ExchangesService;
  let getInstrumentSpy;
  let getAllExchangesSpy;
  let getInstrumentExchangesMappingSpy;
  let getExchangeInstrumentIdentifiersSpy;
  let checkMappingSpy;
  let addMappingSpy;
  let navigateSpy;

  let submitButton;

  function getMappingTable() {
    return fixture.debugElement.queryAll(By.css('table'))[1]; // second component table
  }

  function noCustomClass(classList) {
    return _.every(classList, className => !/^color-/.test(className));
  }

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
    getExchangeInstrumentIdentifiersSpy = spyOn(exchangesService, 'getExchangeInstrumentIdentifiers').and.returnValue(fakeAsyncResponse(getExchangeInstrumentIdentifiersData));
    checkMappingSpy = spyOn(instrumentsService, 'checkMapping').and.returnValue(fakeAsyncResponse(checkMappingData));
    addMappingSpy = spyOn(instrumentsService, 'addMapping').and.returnValue(fakeAsyncResponse(addMappingData));
    navigateSpy = spyOn(fixture.debugElement.injector.get(Router), 'navigate');

    submitButton = fixture.nativeElement.querySelector('app-form-action-bar button');

    fixture.detectChanges();

    zip(
      getInstrumentSpy.calls.mostRecent().returnValue,
      getAllExchangesSpy.calls.mostRecent().returnValue
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
        Object.assign({}, getInstrumentExchangesMappingData, { mapping_data: [] })
      ));
      component.getAllData();

      getInstrumentExchangesMappingSpy.calls.mostRecent().returnValue.subscribe(() => {
        fixture.detectChanges();
        done();
      });
    });


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
      const tableRow = mappingTable.query(By.css('tbody tr'));

      expect(tableRow.nativeElement.classList).toContain('color-light-green');
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
      const mappingTable = getMappingTable();
      const firstTd = mappingTable.nativeElement.querySelector('tbody td:nth-child(1)');

      expect(firstTd.querySelector('.disable-paging')).toBeFalsy('select is disabled');
    });

    it('should have action button "undo"', () => {
      const mappingTable = getMappingTable();
      const lastTd = mappingTable.nativeElement.querySelector('tbody td:last-child');
      const buttonText = lastTd.querySelector('label').innerText;

      expect(buttonText).toBe('Undo');
    });


    describe('after exchange is selected', () => {
      beforeEach((done) => {
        const mappingTable = getMappingTable();
        const firstTd = mappingTable.query(By.css('tbody td:nth-child(1)'));
        const secondTd = mappingTable.query(By.css('tbody td:nth-child(2)'));

        selectOption(firstTd, KeyCode.ArrowDown, 3);
        fixture.detectChanges();

        getExchangeInstrumentIdentifiersSpy.calls.mostRecent().returnValue.subscribe(() => {
          triggerKeyDownEvent(getNgSelectElement(secondTd), KeyCode.Space);
          fixture.detectChanges();
          // expect(component.mappingDataSource.body[0].exchange_id).toBe(getAllExchangesData.exchanges[2].id);
          done();
        });
      });


      it('should load identifiers for next select', () => {
        expect(component.mappingDataSource.body[0].external_instrument_list.length).toBeGreaterThan(0);
      });

      it('should can select identifier', () => {
        const mappingTable = getMappingTable();
        const secondTd = mappingTable.nativeElement.querySelector('tbody td:nth-child(2)');

        expect(secondTd.querySelector('.disable-paging')).toBeFalsy('select is disabled');
      });


      describe('selecting identifier', () => {
        let secondTd;

        beforeEach(() => {
          const mappingTable = getMappingTable();
          secondTd = mappingTable.query(By.css('tbody td:nth-child(2)'));
        });


        describe('after identifier is selected and check mapping perform success response', () => {
          beforeEach((done) => {
            selectOption(secondTd, KeyCode.ArrowDown, 1);
            fixture.detectChanges();

            checkMappingSpy.calls.mostRecent().returnValue.subscribe(() => {
              fixture.detectChanges();
              done();
            });
          });


          it('last instrument mapping should get additional data and flag "valid" should be true', () => {
            const lastMapping = _.last(component.mappingDataSource.body);
            expect(lastMapping.valid).toBeTruthy('maping invalid');
          });
        });


        describe('after identifier is selected and check mapping perform unsuccess response', () => {
          beforeEach((done) => {
            checkMappingSpy.and.returnValue(fakeAsyncResponse(
              Object.assign({}, checkMappingData, { mapping_status: false })
            ));

            selectOption(secondTd, KeyCode.ArrowDown, 1);
            fixture.detectChanges();

            checkMappingSpy.calls.mostRecent().returnValue.subscribe(() => {
              fixture.detectChanges();
              done();
            });
          });


          it('last instrument mapping values shuold be cleared', () => {
            const lastMapping = _.last(component.mappingDataSource.body);
            expect(lastMapping.valid).toBeFalsy('maping valid');
          });
        });
      });
    });

    describe('after button "undo" is pressed', () => {
      beforeEach(() => {
        const mappingTable = getMappingTable();
        const lastTd = mappingTable.nativeElement.querySelector('tbody td:last-child');
        const button = lastTd.querySelector('label');

        click(button);
        fixture.detectChanges();
      });


      it('instrument mapping list should be empty', () => {
        expect(component.mappingDataSource.body.length).toBe(0, 'list not empty');
      });

      it('should can add instrument mapping record on "new mapping" button press', () => {
        const newMapping = fixture.nativeElement.querySelector('.top-controls .btn');
        click(newMapping);
        fixture.detectChanges();

        expect(component.mappingDataSource.body.length).toBe(1, 'mapping not added');
      });
    });
  });

  describe('if instrument have mapping', () => {
    it('mapping record should not have any custom row class', () => {
      const mappingTable = getMappingTable();
      const tableRow = mappingTable.query(By.css('tbody tr'));

      expect(noCustomClass(tableRow.nativeElement.classList)).toBeTruthy('some custom class was found');
    });

    it('select fields should be disabled', () => {
      const mappingTable = getMappingTable();
      const firstTd = mappingTable.nativeElement.querySelector('tbody td:nth-child(1)');
      const secondTd = mappingTable.nativeElement.querySelector('tbody td:nth-child(2)');

      expect(firstTd.querySelector('.disable-paging')).toBeTruthy('select 1 isint disabled');
      expect(secondTd.querySelector('.disable-paging')).toBeTruthy('select 2 isint disabled');
    });

    it('should can add new mapping on "new mapping" button press', () => {
      const countBefore = component.mappingDataSource.body.length;
      const newMapping = fixture.nativeElement.querySelector('.top-controls .btn');
      click(newMapping);
      fixture.detectChanges();

      const countAfter = component.mappingDataSource.body.length;
      expect(countAfter).toBeGreaterThan(countBefore);
    });

    it('loaded maping records should have action button "delete"', () => {
      const mappingTable = getMappingTable();
      const lastTd = mappingTable.nativeElement.querySelector('tbody td:last-child');
      const buttonText = lastTd.querySelector('label').innerText;

      expect(buttonText).toBe('Delete');
    });


    describe('after button "delete" is pressed', () => {
      beforeEach(() => {
        const mappingTable = getMappingTable();
        const lastTd = mappingTable.nativeElement.querySelector('tbody td:last-child');
        const button = lastTd.querySelector('label');

        click(button);
        fixture.detectChanges();
      });


      it('mapping list should have same amount of records', () => {
        expect(component.mappingDataSource.body.length).toBe(1);
      });

      it('deleted record should get custom row class', () => {
        const mappingTable = getMappingTable();
        const tableRow = mappingTable.query(By.css('tbody tr'));

        expect(tableRow.nativeElement.classList).toContain('color-light-red');
      });

      it('should can undo deletion', () => {
        const mappingTable = getMappingTable();
        const lastTd = mappingTable.nativeElement.querySelector('tbody td:last-child');
        const buttonText = lastTd.querySelector('label').innerText;

        expect(buttonText).toBe('Undo');
      });


      describe('after undo deletion', () => {
        beforeEach(() => {
          const mappingTable = getMappingTable();
          const lastTd = mappingTable.nativeElement.querySelector('tbody td:last-child');
          const button = lastTd.querySelector('label');

          click(button);
          fixture.detectChanges();
        });


        it('row should not have any custom row class', () => {
          const mappingTable = getMappingTable();
          const tableRow = mappingTable.query(By.css('tbody tr'));

          expect(noCustomClass(tableRow.nativeElement.classList)).toBeTruthy('row have some color-* custom class');
        });
      });

    });
  });


  it('"save" button should be disabled', () => {
    expect(submitButton.hasAttribute('disabled')).toBeTruthy('button not disabled');
  });


  describe('after form is successfuly submited', () => {
    beforeEach((done) => {
      const addMappingButton: HTMLAnchorElement = fixture.nativeElement.querySelector('.top-controls a');
      click(addMappingButton);
      fixture.detectChanges();

      const mappingTable = getMappingTable();
      const row = mappingTable.query(By.css('tbody tr:last-child'));
      const firstTd = row.query(By.css('td:nth-child(1)'));
      const secondTd = row.query(By.css('td:nth-child(2)'));

      selectOption(firstTd, KeyCode.ArrowDown, 1);
      fixture.detectChanges();

      getExchangeInstrumentIdentifiersSpy.calls.mostRecent().returnValue.subscribe(() => {
        triggerKeyDownEvent(getNgSelectElement(secondTd), KeyCode.Space);
        fixture.detectChanges();

        selectOption(secondTd, KeyCode.ArrowDown, 1);
        fixture.detectChanges();

        checkMappingSpy.calls.mostRecent().returnValue.subscribe(() => {
          fixture.detectChanges();
          click(submitButton);
          fixture.detectChanges();

          addMappingSpy.calls.mostRecent().returnValue().subscribe(() => {
            done();
          });
        });
      });

    });

    it('should be navigated', () => {
      expect(navigateSpy).toHaveBeenCalledWith(['/instruments']);
    });
  });
});
