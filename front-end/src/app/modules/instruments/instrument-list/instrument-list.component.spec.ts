import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { extraTestingModules, fakeAsyncResponse } from '../../../utils/testing';

import { InstrumentsModule } from '../instruments.module';
import { InstrumentListComponent } from './instrument-list.component';
import { InstrumentsService, InstrumentsAllResponse } from '../../../services/instruments/instruments.service';


const InstrumentsServiceStub = {
  getAllInstruments: () => {
    return fakeAsyncResponse<InstrumentsAllResponse>({
      success: true,
      instruments: [
        {
          id: 3891,
          symbol: 'NPXS/ETH',
          exchanges_connected: '1',
          exchanges_failed: '0'
        },
      ],
      footer: [],
      count: 1
    });
  },

  getHeaderLOV: () => {
    return fakeAsyncResponse([
      { value: 'value 1' },
      { value: 'value 2' },
      { value: 'value 3' },
    ]);
  }
};


describe('InstrumentListComponent', () => {
  let component: InstrumentListComponent;
  let fixture: ComponentFixture<InstrumentListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        InstrumentsModule,
        ...extraTestingModules
      ],
      providers: [
        { provide: InstrumentsService, useValue: InstrumentsServiceStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InstrumentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should correctly load deposits on init', () => {
    InstrumentsServiceStub.getAllInstruments().subscribe(res => {
      expect(component.instrumentsDataSource.body).toEqual(res.instruments);
      expect(component.instrumentsDataSource.footer).toEqual(res.footer);
      expect(component.count).toEqual(component.count);
    });
  });

});
