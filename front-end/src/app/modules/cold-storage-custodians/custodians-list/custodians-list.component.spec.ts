import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { extraTestingModules, fakeAsyncResponse, click } from '../../../testing/utils';

import { CustodiansListComponent } from './custodians-list.component';
import { ColdStorageCustodiansModule } from '../cold-storage-custodians.module';
import { ColdStorageService } from '../../../services/cold-storage/cold-storage.service';
import { getAllCustodiansData } from '../../../testing/service-mock/coldStorage.service.mock';


describe('CustodiansListComponent', () => {
  let component: CustodiansListComponent;
  let fixture: ComponentFixture<CustodiansListComponent>;
  let coldStorageService: ColdStorageService;
  let getAllCustodiansSpy;
  let navigateSpy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ColdStorageCustodiansModule,
        ...extraTestingModules
      ],
      providers: [
        ColdStorageService,
      ]
    }).compileComponents();
  }));


  beforeEach(() => {
    fixture = TestBed.createComponent(CustodiansListComponent);
    component = fixture.componentInstance;
    coldStorageService = fixture.debugElement.injector.get(ColdStorageService);
    getAllCustodiansSpy = spyOn (coldStorageService, 'getAllCustodians').and.returnValue(fakeAsyncResponse(getAllCustodiansData));
    navigateSpy = spyOn (component.router, 'navigate');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should correctly load table data on init', () => {
    fixture.whenStable().then(() => {
      expect(component.custodiansDataSource.body).toEqual(getAllCustodiansData.custodians);
      expect(component.custodiansDataSource.footer).toEqual(getAllCustodiansData.footer);
      expect(component.count).toEqual(getAllCustodiansData.count);
    });
  });

  it('should navigate to add cusodian route on add cusodian button press', () => {
    fixture.whenStable().then(() => {
      const addCustodianButton = fixture.nativeElement.querySelector('a.start');
      click(addCustodianButton);
      expect(navigateSpy).toHaveBeenCalledWith(['cold_storage/custodians/add']);
    });
  });
});
