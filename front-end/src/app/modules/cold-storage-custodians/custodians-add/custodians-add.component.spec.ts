import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { extraTestingModules, fakeAsyncResponse } from '../../../testing/utils';

import { ColdStorageCustodiansModule } from '../cold-storage-custodians.module';
import { CustodiansAddComponent } from './custodians-add.component';
import { ColdStorageService } from '../../../services/cold-storage/cold-storage.service';


const ColdStorageServiceStub = {
  addCustodian: () => {
    return fakeAsyncResponse({});
  }
};


describe('CustodiansAddComponent', () => {
  let component: CustodiansAddComponent;
  let fixture: ComponentFixture<CustodiansAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ColdStorageCustodiansModule,
        ...extraTestingModules
      ],
      providers: [
        { provide: ColdStorageService, useValue: ColdStorageServiceStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustodiansAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
