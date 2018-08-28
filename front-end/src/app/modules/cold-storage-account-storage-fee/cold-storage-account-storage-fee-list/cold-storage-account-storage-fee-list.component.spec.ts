import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ColdStorageAccountStorageFeeListComponent } from './cold-storage-account-storage-fee-list.component';

describe('ColdStorageAccountStorageFeeListComponent', () => {
  let component: ColdStorageAccountStorageFeeListComponent;
  let fixture: ComponentFixture<ColdStorageAccountStorageFeeListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ColdStorageAccountStorageFeeListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColdStorageAccountStorageFeeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
