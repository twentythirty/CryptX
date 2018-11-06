import { ExchangesResponse, LiquidityRequirementsCreateResponse, LiquiditiesAllResponse, LiquidityUpdateResponse, LiquidityDeleteResponse } from '../../services/liquidity/liquidity.service';
import { LiquidityResponse } from '../../services/liquidity/liquidity.service';
import { LiquidityRequirement } from '../../shared/models/liquidityRequirement';

export const getExchangesData: ExchangesResponse = {
    success: true,
    count: 1,
    footer: [{
      name: 'id',
      value: '358',
      template: 'liquidity_exchanges.footer.id',
      args: {id: '358'}
    }],
    exchanges: [
      {
        current_price: '0.00000845618589877955',
        exchange: 'Binance',
        exchange_id: 1,
        id: 17528,
        instrument: 'ZEC/BTC',
        instrument_id: 3875,
        instrument_identifier: 'ZEC/BTC',
        last_day_vol: '32477',
        last_updated: 1537304400960,
        last_week_vol: '410241.495',
        passes: 'liquidity_exchanges.status.meets_liquidity_requirements'
      }
    ]
  };

export const getLiquidityData: LiquidityResponse = {
    success: true,
    liquidity_requirement: new LiquidityRequirement ({
      id: 21,
      exchange_id: '1',
      exchange: 'Binance',
      exchange_count: '1',
      exchange_not_pass: '0',
      exchange_pass: '1',
      instrument: 'IOTA/BTC',
      instrument_id: 3868,
      minimum_circulation: '50000',
      periodicity: 1,
      quote_asset: 'BTC'
    })
};

export const postLiquidityRequirementData: LiquidityRequirementsCreateResponse = {
      success: true,
      liquidity_requirement: {
        instrument_id: 1,
        exchange_id: 2,
        periodicity: 2,
        minimum_circulation: 2
      }
};

export const getAllLiquiditiesData: LiquiditiesAllResponse = {
  success: true,
  liquidity_requirements: [
    new LiquidityRequirement ({
      exchange_id: '1',
      exchange: 'Binance',
      exchange_count: '1',
      exchange_not_pass: '0',
      exchange_pass: '1',
      id: 21,
      instrument: 'IOTA/BTC',
      instrument_id: 3868,
      minimum_circulation: '50000',
      periodicity: 1,
      quote_asset: 'BTC'
    }),
  ],
  footer: [{
    name: 'id',
    value: '358',
    template: 'recipe_orders.footer.id',
    args: {id: '358'}
  }],
  count: 1
};

export const updateLiquidityData: LiquidityUpdateResponse = {
  success: true,
  liquidity_requirement: new LiquidityRequirement ({
    id: 21,
    exchange_id: '1',
    exchange: 'Binance',
    exchange_count: '1',
    exchange_not_pass: '0',
    exchange_pass: '1',
    instrument: 'IOTA/BTC',
    instrument_id: 3868,
    minimum_circulation: '50000',
    periodicity: 1,
    quote_asset: 'BTC'
  })
};

export const deleteLiquidityData: LiquidityDeleteResponse = {
  success: true,
  message: 'ok'
};
