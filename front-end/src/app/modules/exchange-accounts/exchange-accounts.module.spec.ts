import { ExchangeAccountsModule } from './exchange-accounts.module';

describe('ExchangeAccountsModule', () => {
  let exchangeAccountsModule: ExchangeAccountsModule;

  beforeEach(() => {
    exchangeAccountsModule = new ExchangeAccountsModule();
  });

  it('should create an instance', () => {
    expect(exchangeAccountsModule).toBeTruthy();
  });
});
