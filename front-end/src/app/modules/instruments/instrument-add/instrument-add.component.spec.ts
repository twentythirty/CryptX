import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { extraTestingModules, fakeAsyncResponse } from '../../../testing/utils';

import { InstrumentsModule } from '../instruments.module';
import { InstrumentAddComponent } from './instrument-add.component';
import { AssetService, AssetsAllResponse } from '../../../services/asset/asset.service';
import { InstrumentsService } from '../../../services/instruments/instruments.service';
import { testFormControlForm } from '../../../testing/commonTests';


const AssetServiceStub = {
  getAllAssets: () => {
    return fakeAsyncResponse<AssetsAllResponse>({
      success: true,
      assets: [
        {
          id: 1,
          symbol: 'USD',
          long_name: 'US Dollars',
          is_base: false,
          is_deposit: true
        },
        {
          id: 2,
          symbol: 'BTC',
          long_name: 'Bitcoin',
          is_base: true,
          is_deposit: false
        },
      ],
      count: 2
    });
  }
};

const InstrumentsServiceStub = {
  createInstrument: () => {}
};


describe('InstrumentAddComponent', () => {
  let component: InstrumentAddComponent;
  let fixture: ComponentFixture<InstrumentAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        InstrumentsModule,
        ...extraTestingModules
      ],
      providers: [
        { provide: AssetService, useValue: AssetServiceStub },
        { provide: InstrumentsService, useValue: InstrumentsServiceStub },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InstrumentAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  testFormControlForm(() => {
    return {
      formControl: component.form,
      submitButton: fixture.nativeElement.querySelector('button.submit'),
      fillForm: () => {
        component.form.controls.transaction_asset_id.setValue(1);
        component.form.controls.quote_asset_id.setValue(2);
      }
    };
  });

});
