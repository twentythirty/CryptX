import { ExchangeCredentialsModule } from './exchange-credentials.module';

describe('ExchangeCredentialsModule', () => {
  let exchangeCredentialsModule: ExchangeCredentialsModule;

  beforeEach(() => {
    exchangeCredentialsModule = new ExchangeCredentialsModule();
  });

  it('should create an instance', () => {
    expect(exchangeCredentialsModule).toBeTruthy();
  });
});
