import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeCredentialsAddComponent } from './exchange-credentials-add.component';
import { ExchangeCredentialsModule } from '../exchange-credentials.module';
import { extraTestingModules } from '../../../testing/utils';

fdescribe('ExchangeCredentialsAddComponent', () => {
  let component: ExchangeCredentialsAddComponent;
  let fixture: ComponentFixture<ExchangeCredentialsAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ExchangeCredentialsModule,
        ...extraTestingModules
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangeCredentialsAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
