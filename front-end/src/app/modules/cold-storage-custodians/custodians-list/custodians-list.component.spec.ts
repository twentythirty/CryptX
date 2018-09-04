import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { extraTestingModules, fakeAsyncResponse } from '../../../utils/testing';

import { CustodiansListComponent } from './custodians-list.component';
import { ColdStorageCustodiansModule } from '../cold-storage-custodians.module';
import { ColdStorageService, CustodiansAllResponse } from '../../../services/cold-storage/cold-storage.service';


const ColdStorageServiceStub = {
  getAllCustodians: () => {
    return fakeAsyncResponse<CustodiansAllResponse>({
      success: true,
      custodians: [
        {
          id: 1,
          name: 'Coinbase Custody'
        }
      ],
      footer: [],
      count: 1
    });
  }
};


describe('CustodiansListComponent', () => {
  let component: CustodiansListComponent;
  let fixture: ComponentFixture<CustodiansListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ColdStorageCustodiansModule,
        ...extraTestingModules
      ],
      providers: [
        { provide: ColdStorageService, useValue: ColdStorageServiceStub }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(CustodiansListComponent);
    fixture.detectChanges();
  }));


  beforeEach(() => {
    fixture = TestBed.createComponent(CustodiansListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
