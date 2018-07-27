import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LiquidityInfoComponent } from './liquidity-info.component';

describe('LiquidityInfoComponent', () => {
  let component: LiquidityInfoComponent;
  let fixture: ComponentFixture<LiquidityInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LiquidityInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LiquidityInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
