'use strict';

const sequelize = require('../../models').sequelize;

const ccxtUtils = require('../CCXTUtils');

class Exchange {

  constructor (api_id, ccxtInstance) {
    this.api_id = api_id;
    this._connector = ccxtInstance;
    
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
    this.waitFor(/* add some promises if there's need to wait for something */);
  }

  async adjustQuantity (symbol, sell_amount, price, recipe_order_id) {
    let statuses = [EXECUTION_ORDER_STATUSES.Pending];

    let [err, amounts] = await to(sequelize.query(`
      SELECT 
        COALESCE(spend_amount,0) as spend_amount,
        COALESCE(eo.spent,0) as spent
      FROM recipe_order ro
      LEFT JOIN LATERAL (
        SELECT SUM(spend_amount) as spent
        FROM execution_order eo
        WHERE eo.recipe_order_id=ro.id
          AND eo.status NOT IN (:statuses)
        GROUP BY eo.recipe_order_id
      ) AS eo ON TRUE
      WHERE ro.id=:recipe_order_id
      `, {
      replacements: {
        recipe_order_id,
        statuses
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

    let quantity = Decimal(sell_amount).div(Decimal(price));
    //reamining quantity for reciep order after this execution order gets generated
    const left_order_qnty = Decimal(amounts.spend_amount).minus(amounts.spent).div(price);
    //minimize the DP to accepted levels
    let next_total = quantity.toDP(
      Decimal(limits.amount.min).dp(), Decimal.ROUND_HALF_DOWN
    );

    //check if the amounts are defined since the keys might exist but not have values on them
    if (next_total.lt(amount_limit.min)) {
      if (left_order_qnty.gte(amount_limit.min)) {
        next_total = Decimal(amount_limit.min)
      }
    }

    //order_total.minus(next_total.plus(realized_total))
    if (left_order_qnty.minus(next_total).lt(amount_limit.min)) {
      next_total = left_order_qnty;
    }

    let next_spend = next_total.mul(price);
    
    return [next_total.toString(), next_spend.toString()];
  }

}

module.exports.Exchange = Exchange;