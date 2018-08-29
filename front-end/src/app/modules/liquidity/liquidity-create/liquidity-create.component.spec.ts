import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LiquidityCreateComponent } from './liquidity-create.component';

describe('LiquidityCreateComponent', () => {
  let component: LiquidityCreateComponent;
  let fixture: ComponentFixture<LiquidityCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LiquidityCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LiquidityCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
