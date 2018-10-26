'use strict';


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
    this.waitFor([/* add some promises if there's need to wait for something */]);
  }

}

module.exports.Exchange = Exchange;