import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LiquidityListComponent } from './liquidity-list.component';

describe('LiquidityListComponent', () => {
  let component: LiquidityListComponent;
  let fixture: ComponentFixture<LiquidityListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LiquidityListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LiquidityListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
