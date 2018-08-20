import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustodiansListComponent } from './custodians-list.component';

describe('CustodiansListComponent', () => {
  let component: CustodiansListComponent;
  let fixture: ComponentFixture<CustodiansListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustodiansListComponent ]
    })
    .compileComponents();
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
