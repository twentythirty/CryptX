import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { extraTestingModules, fakeAsyncResponse, click } from '../../../testing/utils';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { ColdStorageTransfersModule } from '../cold-storage-transfers.module';
import { TransferInfoComponent } from './transfer-info.component';
import { ColdStorageService } from '../../../services/cold-storage/cold-storage.service';
import { getTransferData } from '../../../testing/service-mock/coldStorage.service.mock';
import { testHeaderLov } from '../../../testing/commonTests';


describe('TransferInfoComponent', () => {
  let component: TransferInfoComponent;
  let fixture: ComponentFixture<TransferInfoComponent>;
  let coldStorageService: ColdStorageService;
  let getTransferSpy;
  let navigateSpy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ColdStorageTransfersModule,
        ...extraTestingModules
      ],
      providers: [
        ColdStorageService,
        {
          provide: ActivatedRoute, useValue: {
            params: of({ transferId: 1 })
          }
        },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransferInfoComponent);
    component = fixture.componentInstance;
    coldStorageService = fixture.debugElement.injector.get(ColdStorageService);
    getTransferSpy = spyOn (coldStorageService, 'getTransfer').and.returnValue(fakeAsyncResponse(getTransferData));
    navigateSpy = spyOn (component.router, 'navigate');

    fixture.detectChanges();


  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should correctly load transfers on init', () => {
    fixture.whenStable().then(() => {
      expect(component.transferDataSource.body).toEqual([getTransferData.transfer]);
    });
  });

});
