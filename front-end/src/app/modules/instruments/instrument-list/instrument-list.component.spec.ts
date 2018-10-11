import { async, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { extraTestingModules, fakeAsyncResponse, click } from '../../../testing/utils';

import { InstrumentsModule } from '../instruments.module';
import { InstrumentListComponent } from './instrument-list.component';
import { InstrumentsService } from '../../../services/instruments/instruments.service';
import { getAllInstrumentsData } from '../../../testing/service-mock/instruments.service.mock';
import { testHeaderLov } from '../../../testing/commonTests';
import { Location } from '@angular/common';


describe('InstrumentListComponent', () => {
  let component: InstrumentListComponent;
  let fixture: ComponentFixture<InstrumentListComponent>;
  let instrumentsService: InstrumentsService;
  let location: Location;
  let navigateSpy;
  let getAllInstrumentsSpy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        InstrumentsModule,
        ...extraTestingModules
      ],
      providers: [
        InstrumentsService,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InstrumentListComponent);
    component = fixture.componentInstance;
    location = TestBed.get(Location);
    instrumentsService = fixture.debugElement.injector.get(InstrumentsService);
    getAllInstrumentsSpy = spyOn (instrumentsService, 'getAllInstruments').and.returnValue(fakeAsyncResponse(getAllInstrumentsData));
    navigateSpy = spyOn (component.router, 'navigate');
    fixture.detectChanges();
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should correctly load deposits on init', () => {
    fixture.whenStable().then(() => {
      expect(component.instrumentsDataSource.body).toEqual(getAllInstrumentsData.instruments);
      expect(component.instrumentsDataSource.footer).toEqual(getAllInstrumentsData.footer);
      expect(component.count).toEqual(getAllInstrumentsData.count);
    });
  });

  it('should set header LOV observables for specified columns', () => {
    const headerLovColumns = ['symbol'];

    fixture.whenStable().then(() => testHeaderLov(component.instrumentsDataSource, headerLovColumns));
  });

  it('should be navigated to instrument info page on table row click', () => {
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const tableRow = fixture.nativeElement.querySelector('table tbody tr');
      click(tableRow);
      expect(navigateSpy).toHaveBeenCalledWith(['/instrument', getAllInstrumentsData.instruments[0].id]);
    });
  });

  it('should be navigated to instrument creation page on "add instrument" button press', fakeAsync(() => {
    const addRoleButton = fixture.nativeElement.querySelector('a.start');
    click(addRoleButton);
    tick();
    expect(location.path()).toBe('/instruments/create');
  }));

});
