import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustodiansAddComponent } from './custodians-add.component';

describe('CustodiansAddComponent', () => {
  let component: CustodiansAddComponent;
  let fixture: ComponentFixture<CustodiansAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustodiansAddComponent ]
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
