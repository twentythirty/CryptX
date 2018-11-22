'use strict';

const sequelize = require('../../models').sequelize;

const ccxtUtils = require('../CCXTUtils');

const { logAction } = require('../ActionLogUtil');

const action_path = 'execution_orders';

const actions = {
  sent: `${action_path}.adjusted`,
  sent_quantity: `${action_path}.sent_quantity`,
  sold_quantity: `${action_path}.sold_quantity`,
  adjusted_spend: `${action_path}.adjusted_spend`
};


class Exchange {

  constructor (api_id, ccxtInstance) {
    this.api_id = api_id;
    this._connector = ccxtInstance;
    this._throttle = null;
    
    if (this.api_id != this._connector.id) TE("Wrong ccxt instance supplied to exchange unification");

    this.waitList = [];
    this.init();
  }

  /** 
   * Finishes whenever all items in waiting list have completed.
   */
  async isReady () {
    await Promise.all(this.waitList);
    this.waitList = [];
    return;
  }

  /**
   * Add item to waiting list
   * @param  {...promise} items - promises to wait for to finish
   */
  waitFor (...items) {
    this.waitList.push(...items);
  }

  /**
   * It just initializes connector, adds it to waiting lists. Await'ing for isReady method
   * should continue once it's initialized and ready for use.
   */
  init () {
    this.waitFor(/* add some promises if there's need to wait for something */
      ccxtUtils.getThrottle(this.api_id).then(throttle => {
        this._throttle = throttle;
      })
    );
  }

  async throttle (fn, ...args) {
    return this._throttle.throttledUnhandled(fn, ...args);
  }

  async adjustQuantity (symbol, sell_amount, price, execution_order) {
    let statuses = [EXECUTION_ORDER_STATUSES.Pending],
      log = console.log;
    let { id: execution_order_id, recipe_order_id } = execution_order;

    let [err, amounts] = await to(sequelize.query(`
      SELECT 
        COALESCE(spend_amount,0) as spend_amount,
        COALESCE(eo.spent,0) as spent
      FROM recipe_order ro
      LEFT JOIN LATERAL (
        SELECT 
          COALESCE(SUM(
            CASE WHEN eo.status IN (:done_statuses) AND fills.fills_cost IS NOT NULL
              THEN fills.fills_cost
              ELSE eo.spend_amount
            END
          ), 0) as spent
        FROM execution_order eo
        LEFT JOIN LATERAL (
          SELECT
            SUM(eof.quantity) as filled,
            SUM(
              CASE WHEN fee_asset.is_base=true
                THEN (eof.quantity * eof.price) + eof.fee
                ELSE (eof.quantity * eof.price) + (eof.fee * price)
              END
            ) as fills_cost
          FROM execution_order_fill eof
          LEFT JOIN asset fee_asset ON fee_asset.id=eof.fee_asset_id
          WHERE eof.execution_order_id=eo.id
          GROUP BY execution_order_id
        ) as fills ON true
        WHERE eo.recipe_order_id=ro.id
          AND eo.status NOT IN (:statuses)
        GROUP BY eo.recipe_order_id
      ) AS eo ON TRUE
      WHERE ro.id=:recipe_order_id
      `, {
      replacements: {
        recipe_order_id,
        statuses,
        done_statuses: [
          EXECUTION_ORDER_STATUSES.FullyFilled,
          EXECUTION_ORDER_STATUSES.PartiallyFilled
        ]
      },
      plain: true,
      type: sequelize.QueryTypes.SELECT
    }));

    if (err) TE(err.message);

    let limits;
    [err, limits] = await to(this.getSymbolLimits(symbol, this.api_id));
    if (err) TE(err.message);

    const amount_limit = Object.assign({
      min: 0.0,
      max: Number.MAX_VALUE
    }, limits.amount);

    log(`${symbol} in ${this.api_id} limits detected: `, amount_limit);

    let quantity = Decimal(sell_amount).div(Decimal(price));
    log(`${symbol} ${quantity} could be bought with ${sell_amount}`);

    //reamining quantity for reciep order after this execution order gets generated
    const left_order_qnty = Decimal(amounts.spend_amount).minus(amounts.spent).div(price);
    //minimize the DP to accepted levels
    let next_total = quantity;

    //order_total.minus(next_total.plus(realized_total))
    if (left_order_qnty.minus(next_total).lt(amount_limit.min)) {
      next_total = left_order_qnty;
    }

    next_total = next_total.toDP(
      Decimal(limits.amount.min).dp(), Decimal.ROUND_FLOOR
    );

    log(`${symbol} order rounded to ${next_total} so it would fit exchange precision`);

    // check if quantity to be bought is above exchange minimum trade limit
    if (next_total.lt(amount_limit.min)) {
      if (left_order_qnty.gte(amount_limit.min)) {
        next_total = Decimal(amount_limit.min)
      }
    }

    let next_spend = next_total.mul(price);

    if (sell_amount != next_spend.toString())
      await logAction(actions.adjusted_spend, {
        args: {
          orig_spend: sell_amount,
          spend_amount: next_spend.toString(),
        },
        relations: { execution_order_id }
      });
    
    return [next_total.toString(), next_spend.toString()];
  }

  /**
   * Method to output order being sent to exchange. Tests should ensure that every
   * exchange class supplies all values needed to log.
   * @param {Object} Object with log values 
   */
  async logOrder (values) {
    const props = [
      'execution_order_id',
      'api_id',
      'external_instrument_id',
      'order_type',
      'side',
      'quantity',
      'price',
      'sold_quantity',
      'sell_qnt_unajusted',
      'accepts_transaction_quantity'
    ];

    if (props.some(key => !Object.keys(values).includes(key)))
      TE(`Unified function for logging order didn't receive all needed values to log order correctly`);

    console.log(`Creating market order to ${values.api_id}
    Instrument - ${values.external_instrument_id}
    Order type - ${values.order_type}
    Order side - ${values.side}
    Total quantity - ${values.quantity}
    Price - ${values.price}
    Sold quantity after adjustments - ${values.sold_quantity}
    Sold quantity before adjustment - ${values.sell_qnt_unajusted}
    ${values.accepts_transaction_quantity ? 'Quote' : 'Transaction'} asset quantity is used for order in this exchange`);

    if ( values.accepts_transaction_quantity )
      await logAction(actions.sent_quantity, {
        args: {
          exchange: values.api_id,
          quantity: values.quantity,
        },
        relations: { execution_order_id: values.execution_order_id }
      });
    else
    await logAction(actions.sold_quantity, {
      args: {
        exchange: values.api_id,
        quantity: values.sold_quantity,
      },
      relations: { execution_order_id: values.execution_order_id }
    });

  }

}

module.exports.Exchange = Exchange;