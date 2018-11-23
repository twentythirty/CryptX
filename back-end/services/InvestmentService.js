'use strict';

const depositService = require('../services/DepositService');
const InvestmentRun = require('../models').InvestmentRun;
const InvestmentAmount = require('../models').InvestmentAmount;
const RecipeRun = require('../models').RecipeRun;
const RecipeRunDetail = require('../models').RecipeRunDetail;
const RecipeRunDetailInvestment = require('../models').RecipeRunDetailInvestment;
const Asset = require('../models').Asset;
const Exchange = require('../models').Exchange;
const AssetService = require('./AssetService');
const Op = require('sequelize').Op;
const sequelize = require('../models').sequelize;
const RecipeOrder = require('../models').RecipeOrder;
const RecipeOrderGroup = require('../models').RecipeOrderGroup;
const RecipeRunDeposit = require('../models').RecipeRunDeposit;
const InvestmentRunAssetGroup = require('../models').InvestmentRunAssetGroup;
const GroupAsset = require('../models').GroupAsset;
const InvestmentAssetConversion = require('../models').InvestmentAssetConversion;
const ColdStorageAccount = require('../models').ColdStorageAccount;

const { ISOLATION_LEVELS } = require('sequelize').Transaction;

const AdminViewService = require('./AdminViewsService');

const ActionLog = require('../utils/ActionLogUtil');

const getInvestmentRunWithAssetMix = async (investment_run_id, seq_query = {}, sql_where = '') => {

  let [err, investment_run] = await to(AdminViewService.fetchInvestmentRunView(investment_run_id));

  if (err) TE(err.message);
  if (!investment_run) return null;

  let asset_group = {};
  [err, asset_group] = await to(InvestmentRun.findById(investment_run_id, {
    include: InvestmentRunAssetGroup,
    raw: true
  }));

  if (err) console.log(err);

  const investment_run_asset_group_id = asset_group['InvestmentRunAssetGroup.id'];

  //Filter assets that belong to the investment run and show only whitelisted ones
  seq_query.where = _.assign({
    investment_run_asset_group_id,
    status: 'assets.status.400'
  }, seq_query.where);

  sql_where = `investment_run_asset_group_id = ${investment_run_asset_group_id} AND status = 'assets.status.400' ${ sql_where !== '' ? `AND ${sql_where}` : '' }`;

  if (!seq_query.order) seq_query.order = [
    ['capitalization', 'DESC']
  ];

  let result = [];
  [err, result] = await to(Promise.all([
    AdminViewService.fetchGroupAssetsViewDataWithCount(seq_query),
    AdminViewService.fetchGroupAssetViewFooter(sql_where)
  ]));

  if (err) TE(err.message);

  return [investment_run, ...result];
};
module.exports.getInvestmentRunWithAssetMix = getInvestmentRunWithAssetMix;

const createInvestmentRun = async function (user_id, strategy_type, is_simulated = true, deposit_amounts, asset_group_id) {
  // check for valid strategy type
  if (!Object.values(STRATEGY_TYPES).includes(parseInt(strategy_type, 10))) {
    TE(`Unknown strategy type ${strategy_type}!`);
  }

  if (!deposit_amounts.length) TE('No investment amounts given!');

  let [err, deposit_assets] = await to(AssetService.getDepositAssets());
  if (err) TE(err.message);

  let deposit_asset_symbols = deposit_assets.map(asset => asset.symbol);

  // if some of deposit info has an asset that is not for deposits
  if (deposit_amounts.some(
      amount => !deposit_asset_symbols.includes(amount.symbol)
    )) TE('Unacceptable deposit asset given!');

  if (deposit_amounts.some(a => a.amount < 0))
    TE(`Investment amount into any of assets can't be less than 0`);

  // leave only positive investment asset amounts
  deposit_amounts = deposit_amounts.filter(a => a.amount > 0);
  if (!deposit_amounts.length)
    TE(`Total deposit amount must be greather than 0`);

  let executing_investment_run;
  [err, executing_investment_run] = await to(InvestmentRun.count({
    where: {
      is_simulated: false,
      status: {
        [Op.ne]: INVESTMENT_RUN_STATUSES.OrdersFilled
      }
    }
  }));

  if (err) TE(err.message);

  // only allow one REAL investment run at the same time.
  if (executing_investment_run && !is_simulated) {
    let message = `Investment run cannot be initiated as other investment runs are still in progress`;
    TE(message);
  }

  let asset_group;
  [err, asset_group] = await to(InvestmentRunAssetGroup.findById(asset_group_id));

  if (err) TE(err.message);
  if (!asset_group) TE(`Asset Mix was not found with id "${asset_group_id}"`);

  //check if strategy types match
  if (asset_group.strategy_type !== strategy_type) TE(`Attempting to create a ${_.invert(STRATEGY_TYPES)[strategy_type]} Investment Run with a ${_.invert(STRATEGY_TYPES)[asset_group.strategy_type]} Asset Mix`);

  let investment_run;
  [err, investment_run] = await to(sequelize.transaction({
    isolationLevel: ISOLATION_LEVELS.SERIALIZABLE
  }, async transaction => {

      investment_run = await InvestmentRun.findOne({
        where: {
          is_simulated: false,
          status: {
            [Op.ne]: INVESTMENT_RUN_STATUSES.OrdersFilled
          }
        },
        transaction
      });

      if(investment_run && !is_simulated)
        TE('Investment run cannot be initiated as other investment runs are still in progress');

      return InvestmentRun.create({
        strategy_type: strategy_type,
        is_simulated: is_simulated,
        user_created_id: user_id,
        started_timestamp: new Date(),
        updated_timestamp: new Date(),
        status: INVESTMENT_RUN_STATUSES.Initiated,
        deposit_usd: 0,
        investment_run_asset_group_id: asset_group_id,
  
        InvestmentAmounts: [ // also create InvestmentAmount for every deposit
          ...deposit_amounts.map(deposit => {
            let asset = deposit_assets.find(asset => asset.symbol == deposit.symbol);
            return {
              asset_id: asset.id,
              amount: deposit.amount
            };
          })
        ]
      }, {
        include: InvestmentAmount, // include to create investment amounts with investment run
        transaction
      });

    }
    
  ));

  if (err) TE(err.message);

  return investment_run;
};
module.exports.createInvestmentRun = createInvestmentRun;

/** Changes investment run status. Finds investment run by ID if number provided(could be string),
 * or by association if object provided with same keys as in 
 * findInvestmentRunFromAssociations methods allowed_entities object.
 * @param {*} identifying_value integer OR object with "investment_run_id","recipe_run_id",
 * "recipe_deposit_id", "recipe_order_group_id", "recipe_order_id", "execution_order_id"
 * @param {*} status_number 
 */
const changeInvestmentRunStatus = async function (identifying_value, status_number, transaction = null) {
  // check for valid recipe run status
  if (!Object.values(INVESTMENT_RUN_STATUSES).includes(parseInt(status_number, 10)))
    TE(`Unknown investment run status ${status_number}!`);

  let err, investment_run;
  if (_.isNumber(identifying_value) || _.isString(identifying_value))
    [err, investment_run] = await to(InvestmentRun.findById(identifying_value, { transaction }));
  else
    [err, investment_run] = await to(this.findInvestmentRunFromAssociations(identifying_value, transaction));

  if (err) TE(err.message);

  if (!investment_run) TE("Investment run not found");

  Object.assign(investment_run, {
    status: status_number,
    updated_timestamp: new Date()
  });

  const save_options = {};
  if(transaction) save_options.transaction = transaction;

  return investment_run.save(save_options);

};
module.exports.changeInvestmentRunStatus = changeInvestmentRunStatus;

const createRecipeRun = async function (user_id, investment_run_id) {
  let err, investment_run, recipe_run, recipe_run_details;

  /**
   * It might be fine to keep this here, in most cases to prevent heavier actions being performed.
   */
  recipe_run = await RecipeRun.findOne({
    where: {
      investment_run_id: investment_run_id,
      approval_status: {
        [Op.in]: [RECIPE_RUN_STATUSES.Pending, RECIPE_RUN_STATUSES.Approved]
      }
    },
    raw: true
  });

  if (recipe_run) {
    if (recipe_run.approval_status === RECIPE_RUN_STATUSES.Pending) TE("There is already recipe run pending approval");
    else TE("No more recipe runs can be generated after one was already approved.");
  }

  [err, investment_run] = await to(InvestmentRun.findById(investment_run_id));

  if(err) TE(er.message);
  if(!investment_run) return null;

  [err, recipe_run_details] = await to(this.generateRecipeDetails(investment_run.id, investment_run.strategy_type), false);
  if (err) TE(err.message);

  [err] = await to(sequelize.transaction({
    isolationLevel: ISOLATION_LEVELS.SERIALIZABLE
  }, transaction => {
    return RecipeRun.findOne({
      where: {
        investment_run_id: investment_run.id,
        approval_status: {
          [Op.in]: [RECIPE_RUN_STATUSES.Pending, RECIPE_RUN_STATUSES.Approved]
        }
      },
      transaction
    }).then(existing_recipe_run => {

      if(existing_recipe_run) {
        if (existing_recipe_run.approval_status === RECIPE_RUN_STATUSES.Pending) TE("There is already recipe run pending approval");
        else TE("No more recipe runs can be generated after one was already approved.");
      }

      return RecipeRun.create({
        created_timestamp: new Date(),
        investment_run_id,
        user_created_id: user_id,
        approval_status: RECIPE_RUN_STATUSES.Pending,
        approval_comment: '',
  
        RecipeRunDetails: recipe_run_details.map(detail => {
          detail.RecipeRunDetailInvestments = detail.detail_investment;
          return detail;
        })
      }, {
        include: [{
          model: RecipeRunDetail,
          include: RecipeRunDetailInvestment
        }], // include to create investment amounts with investment run
        transaction
      }).then(new_recipe_run => {
        recipe_run = new_recipe_run;

        return this.changeInvestmentRunStatus(investment_run_id, INVESTMENT_RUN_STATUSES.RecipeRun, transaction);
      });
    });
  }
  ));

  if (err) TE(err.message);

  return recipe_run;
};
module.exports.createRecipeRun = createRecipeRun;

const generateRecipeDetails = async (investment_run_id, strategy_type) => {

  // get current base asset prices
  let err, prices;
  [err, prices] = await to(AssetService.getBaseAssetPrices(), false);
  if (err) TE(err.message);

  // get deposit assets, where is_deposit is true
  let deposit_assets;
  [err, deposit_assets] = await to(AssetService.getDepositAssets());
  if (err) TE(err.message);

  // find USD asset, it should always be is_deposit=true, and is_base=false
  let usd_deposit_asset = deposit_assets.find(a => a.is_deposit && !a.is_base);

  // find investment run with its investment deposit amounts.
  let investment_run;
  [err, investment_run] = await to(InvestmentRun.findOne({
    where: {
      id: investment_run_id
    },
    include: [{
      model: InvestmentAmount,
      include: Asset
    }]
  }).then(investment_run => {
    // assign asset symbols to invesment amount object for easier access.
    investment_run.InvestmentAmounts.map(a => {
      Object.assign(a, {
        symbol: a.Asset.symbol,
        long_name: a.Asset.long_name
      });
    });

    return investment_run;
  }));

  if (err) TE(err.message);
  if (!investment_run) TE('Investment run not found');

  let assets; // get all assets that should be involved in recipe run.
  [err, assets] = await to(AssetService.getAssetGroupWithData(investment_run_id));
  if (err) TE(err.message);

  // find liquidity level for each asset.
  assets.map(asset => {
    asset.liquidity_level = AssetService.getLiquidityLevel(asset.volume_usd);
  });

  /* group and map assets to be in structure:
    [
      {
        info: { id, symbol, long_name }
        possible: [], // possible ways to acquire an asset.
        to_execute: [] // details/conversions that will be saved and performed
      }
    ] */
  let assets_grouped_by_id = _(assets)
    .groupBy('id')
    .values()
    .value()
    .map((asset_group) => {
      let asset = _.first(asset_group);
      return {
        info: _.pick(asset, ["id", "symbol", "long_name", "is_base", "is_deposit"]),
        possible: asset_group,
        to_execute: []
      };
    }).map((asset, index, array) => { // calculate investment percentage
      asset.info.investment_percentage = Decimal(100).div(Decimal(array.length));
      return asset;
    });


  // calculate investment amounts in USD
  let total_investment_usd = Decimal(0);
  let investment_size = investment_run.InvestmentAmounts;
  // iterate through every investment asset
  investment_size = investment_size.map(size => {
    let value_usd;

    // asset id not found if it's USD
    if (size.asset_id === usd_deposit_asset.id) {
      // amount is 1:1, because we perform calcutions in USD
      value_usd = Decimal(size.amount);
      // price per asset is also 1:1.
      size.price_per_asset_usd = 1;
    } else { // asset id found - it's base asset then
      let base_price_usd = prices.find(price => price.id == size.asset_id);
      // calculate total amount needed in USD
      value_usd = Decimal(size.amount).mul(Decimal(base_price_usd.price));
      // calculate price of single unit of asset
      size.price_per_asset_usd = Decimal(base_price_usd.price);
    }

    // assgign whole USD value of investment asset
    size.value_usd = value_usd;
    // remaining USD is used to calculate remaining amount after subtracting reserved asset/instrument/exchange combinations
    size.remaining_usd = value_usd;

    total_investment_usd = Decimal(total_investment_usd).add(Decimal(size.value_usd));
    return size;
  });

  // filter out base assets, their instrument/exchange pairs will be changed as they are not needed
  let recipe_base_assets;
  [ recipe_base_assets, assets_grouped_by_id] = _.partition(
    assets_grouped_by_id, 
    (asset) => asset.info.is_base
  );

  // perform calculations and create details for excluded base assets
  recipe_base_assets = recipe_base_assets.map(asset => {
    // extract values just for compatibility.
    let properties = _.pick(_.first(asset.possible), ['nvt', 'liquidity_level', 'price_usd']);

    asset.possible = [{ // include single possible way to acquire an asset
      id: asset.info.id, 
      quote_asset_id: asset.info.id,
      exchange_id: null,
      ...properties // include those values
    }];

    return asset;
  });

  assets_grouped_by_id.push(...recipe_base_assets); 

  assets_grouped_by_id = _.orderBy(assets_grouped_by_id, a => a.possible[0].nvt, "desc");
  assets_grouped_by_id.map(asset => { // iterate through assets trying to find most fitting instruments to buy with.
    let chosen = []; // store pairs we are going to buy with
    let total_spent = new Decimal(0); // used for calculating how much USD we allocated to asset, this will be compared with value of should spend 
    let should_spend = Decimal(total_investment_usd) // how much should be spent on asset, total_investment_usd * asset investment_percentage
      .mul(
        Decimal(asset.info.investment_percentage)
        .div(Decimal(100))
      );

    // sort values by nvt, liquidity_level and price_usd properties
    asset.possible = _.orderBy(asset.possible, ['nvt', 'liquidity_level', 'price_usd'], ['desc', 'desc', 'asc']);

    // iterate through all instrument/exchange
    for (let action of asset.possible) {
      let base = investment_size.find(deposit => deposit.asset_id == action.quote_asset_id);

      // if we have this base asset in deposits and enough to buy
      if (base && base.remaining_usd.gt(0)) {
        let base_spent = new Decimal(0),
          base_needed = Decimal(should_spend).minus(total_spent);

        if (base.remaining_usd.gte(Decimal(base_needed))) { // enough to buy whole amount
          base_spent = Decimal(base_needed);
        } else { // not enough to buy whole needed amount, buy with whats remaining 
          base_spent = Decimal(base.remaining_usd);
        }

        chosen.push({ // push details of chosen purchase
          asset_id: action.quote_asset_id,
          from_asset_id: base.asset_id,
          exchange_id: action.exchange_id,
          amount_usd: base_spent
        });
        base.remaining_usd = Decimal(base.remaining_usd).minus(Decimal(base_spent)); // subtract chosen USD sum from remaining base asset amount in USD 
        total_spent = total_spent.add(Decimal(base_spent)); // add chosen amount to total spent sum of asset
      }

      let usd = investment_size.find(s => s.asset_id == usd_deposit_asset.id);

      // if we didn't yet allocate enough base asset to buy required amount
      if (usd && total_spent.lt(should_spend) && usd.remaining_usd.gt(0)) {
        let deposit_spent = 0,
          usd_needed = Decimal(should_spend).minus(total_spent);

        if (usd_needed.lte(Decimal(usd.remaining_usd))) { // enough to buy whole amount needed
          deposit_spent = Decimal(usd_needed);
        } else { // not enough to buy whole needed amount, buy whith whats remaining
          deposit_spent = Decimal(usd.remaining_usd);
        }

        chosen.push({
          asset_id: action.quote_asset_id,
          from_asset_id: usd.asset_id,
          exchange_id: action.exchange_id,
          amount_usd: deposit_spent
        });
        usd.remaining_usd = Decimal(usd.remaining_usd).minus(Decimal(deposit_spent)); 
        total_spent = total_spent.add(Decimal(deposit_spent));
      }

      if (total_spent.gte(Decimal(should_spend)))
        break; // break cycle if already allocated needed amount
    }

    // if whole needed amount not allocated, then we fail to fully buy an asset
    if (Decimal(total_spent.toFixed(7)).lt(should_spend.toFixed(7))) {
      //detailed error for devs
      console.error(`Could only allocate ${total_spent.toFixed(3)}/${should_spend.toFixed(3)}USD in ${asset.info.long_name}(${asset.info.symbol})
        because it can bought through:${asset.possible.map(p => ` ${p.symbol} in ${p.exchange_name} exchange`).join()}
        and investment amounts left are:${investment_size.map(s => ` ${s.symbol} - ${s.remaining_usd.toFixed(3)} USD`).join()}
      `);
      //simple terms for clients
      TE(`Recipe requires ${should_spend.toFixed(2)}USD in ${asset.info.symbol}, but provided base asset deposits only reached ${total_spent.toFixed(2)}USD for ${asset.info.symbol}. Have you deposited enough for this asset mix?`)
    
    } else {
      asset.to_execute = chosen;
    }
  });

  // calculate amount in base assets
  let recipe_details = assets_grouped_by_id.map(asset => {
    // calculate amount of asset from investment amount in USD
    asset.to_execute.map(investment_detail => {
      let base = investment_size.find(s => s.asset_id == investment_detail.from_asset_id);
      investment_detail.amount = Decimal(investment_detail.amount_usd).div(Decimal(base.price_per_asset_usd));
    });

    // form similar structure to recipe_run_detail and recipe_run_detail_investment
    let details = _.map(
      _.groupBy(asset.to_execute, detail => detail.asset_id),
      details => {
        let asset_info = details[0];
        let investment_percentage = Decimal(
            details.reduce(
              (acc, val) => acc.add(Decimal(val.amount_usd)),
              Decimal(0)
            ) // sum all the values
          )
          .div(Decimal(total_investment_usd))
          .mul(100)
          .toString();

        return {
          transaction_asset_id: asset.info.id,
          quote_asset_id: asset_info.asset_id,
          target_exchange_id: asset_info.exchange_id,
          investment_percentage: investment_percentage,
          detail_investment: details.map(detail => ({
            asset_id: detail.from_asset_id,
            amount: detail.amount.toString(),
            amount_usd: detail.amount_usd.toString()
          }))
        };
      }
    );
    return details;
  });

  recipe_details = _.flatten(recipe_details);

  if (!recipe_details.length) TE("No recipe details generated.");

  return recipe_details;
};
module.exports.generateRecipeDetails = generateRecipeDetails;

const changeRecipeRunStatus = async function (user_id, recipe_run_id, status_constant, comment) {
  // check for valid recipe run status
  if (!Object.values(RECIPE_RUN_STATUSES).includes(parseInt(status_constant, 10)))
    TE(`Unknown recipe run status ${status_constant}!`);

  if (!comment) TE('Comment not provided');

  let err, recipe_run;
  recipe_run = await RecipeRun.findById(recipe_run_id, {
    include: InvestmentRun
  });

  if (!recipe_run) TE("Recipe run not found");

  const old_status = recipe_run.approval_status;

  Object.assign(recipe_run, {
    approval_status: status_constant,
    approval_user_id: user_id,
    approval_timestamp: new Date(),
    approval_comment: comment
  });

  /**
   * If a recipe run is Approved, generate initial asset conversion entries this is possible.
   * Deposits are no longer needed here.
   */
  if (status_constant == RECIPE_RUN_STATUSES.Approved && old_status !== status_constant) {

    //perform check of recipe run details
    const run_details = await RecipeRunDetail.findAll({
      where: {
        recipe_run_id: recipe_run.id
      },
      include: [{
          model: Exchange,
          as: 'target_exchange'
        }, {
          model: Asset,
          as: 'transaction_asset'
        },
        {
          model: Asset,
          as: 'quote_asset'
        }
      ]
    });
    const potential_instruments = await sequelize.query(`
    SELECT i.transaction_asset_id AS tx_asset_id,
       i.quote_asset_id AS quote_asset_id,
       i.symbol AS symbol,
       iem.exchange_id as exchange_id
    FROM instrument i
    JOIN instrument_exchange_mapping iem ON i.id = iem.instrument_id
`, {
      type: sequelize.Sequelize.QueryTypes.SELECT
    })

    const error_message_maker = (run_detail_id, tx_symbol, quote_symbol, exchange_name) => {
      //error formatting intentional to avoid parse-error cutting it
      return `error info: \n
      Can't approve Recipe Run ${recipe_run.id}! Problem with detail ${run_detail_id}: Missing mapping for ${tx_symbol}/${quote_symbol} on ${exchange_name}, please create it.`
    }

    _.forEach(run_details, run_detail => {

      const potential_error = error_message_maker(
        run_detail.id,
        run_detail.transaction_asset.symbol,
        run_detail.quote_asset.symbol,
        run_detail.target_exchange_id !== null ? 
          run_detail.target_exchange.name :
          null);

      const matching_mappings = _.filter(potential_instruments, instrument => {
        return (instrument.tx_asset_id == run_detail.transaction_asset_id && 
            instrument.quote_asset_id == run_detail.quote_asset_id)
      });

      if (_.isEmpty(matching_mappings) &&
        run_detail.transaction_asset_id!==run_detail.quote_asset_id) TE(potential_error);

      const matching_mapping = _.find(matching_mappings, mapping => {
        return mapping.exchange_id == run_detail.target_exchange_id
      });

      if (matching_mapping == null &&
        run_detail.transaction_asset_id!==run_detail.quote_asset_id) TE(potential_error);
    });

    const assets_ids = _.uniq(run_details.map(detail => detail.transaction_asset_id));

    let ct_accounts;
    [err, ct_accounts] = await to(ColdStorageAccount.findAll({
      where: {
        strategy_type: recipe_run.InvestmentRun.strategy_type,
        asset_id: assets_ids
      },
      raw: true
    }));

    if (err) TE(err.message);

    //If the account number does not match the number of asset ids, check which ones are missing and throw an error
    if(ct_accounts.length !== assets_ids.length) {
      
      let missing_assets = [];
      const uniq_details = _.uniqBy(run_details, 'transaction_asset_id');
      for(let detail of uniq_details) {
        const existing_account = ct_accounts.find(acc => acc.asset_id === detail.transaction_asset_id);
        if(existing_account) continue;

        missing_assets.push(detail.transaction_asset.symbol);
      }

      TE(`Cannot approve while there are missing ${_.invert(STRATEGY_TYPES)[recipe_run.InvestmentRun.strategy_type]} Cold Storage Accounts for: ${missing_assets.join(', ')}`);

    }

    let conversions;
    [err, conversions] = await to(depositService.generateAssetConversions(recipe_run));

    if (err) TE(err.message);

    [err] = await to(sequelize.transaction(transaction => {

      return InvestmentRun.update({
        status: INVESTMENT_RUN_STATUSES.RecipeApproved
      }, {
        where: {
          id: recipe_run.investment_run_id
        },
        limit: 1,
        transaction
      }).then(() => {

        return recipe_run.save({
          transaction
        }).then(saved_recipe_run => {
          recipe_run = saved_recipe_run;

          if (!conversions.length) return;
          else return InvestmentAssetConversion.bulkCreate(conversions, {
            transaction
          });

        });

      });

    }));

    if (err) TE(err.message);

    return recipe_run;
  } else return recipe_run.save();
};
module.exports.changeRecipeRunStatus = changeRecipeRunStatus;

const findInvestmentRunFromAssociations = async function (entities, transaction) {

  // property names show how value can be served, value show what db table is used.
  let allowed_entities = {
    "investment_run_id": 'investment_run',
    "recipe_run_id": 'recipe_run',
    "recipe_deposit_id": 'recipe_run_deposit',
    "recipe_order_group_id": 'recipe_order_group',
    "recipe_order_id": 'recipe_order',
    "execution_order_id": 'execution_order',
    "cold_storage_transfer_id": 'cold_storage_transfer'
  };

  if (!Object.keys(entities).length) TE('No id was supplied. Please supply atleast one ID.')

  let foundClosestEntity = Object.keys(entities).find(entity => {
    return Object.keys(allowed_entities).includes(entity);
  });
  let id_to_find = entities[foundClosestEntity];

  let [err, investment_run] = await to(sequelize.query(`
    SELECT investment_run.*
    FROM investment_run
    LEFT JOIN recipe_run ON recipe_run.investment_run_id=investment_run.id
    LEFT JOIN recipe_run_deposit ON recipe_run_deposit.recipe_run_id=recipe_run.id
    LEFT JOIN recipe_order_group ON recipe_order_group.recipe_run_id=recipe_run.id
    LEFT JOIN recipe_order ON recipe_order.recipe_order_group_id=recipe_order_group.id
    LEFT JOIN execution_order ON execution_order.recipe_order_id=recipe_order.id
    LEFT JOIN cold_storage_transfer ON cold_storage_transfer.id = recipe_order.id OR cold_storage_transfer.recipe_run_id = recipe_run.id
    WHERE ${allowed_entities[foundClosestEntity]}.id=:entity_id
    LIMIT 1
  `, {
    replacements: {
      entity_id: id_to_find
    },
    plain: true, // assign as single value, not array
    model: InvestmentRun,
    transaction
  }));

  if (err) TE(err.message);

  return investment_run;
};
module.exports.findInvestmentRunFromAssociations = findInvestmentRunFromAssociations;

const getWholeInvestmentRun = async function (investment_run_id) {
  let [err, all_investment_data] = await to(InvestmentRun.find({
    where: {
      id: investment_run_id
    },
    include: [{
      model: RecipeRun,
      include: [{
          model: RecipeOrderGroup,
          include: [{
            /* This makes sequelize get further includes as in separate query. This is a quick workaround for postgres truncating too long paths. */
            /* separate: true, */
            model: RecipeOrder,
            /* include: [{
              model: ExecutionOrder,
              include: [{
                model: ExecutionOrderFill,
              }]
            }] */
          }]
        },
        {
          model: RecipeRunDeposit
        }
      ]
    }]
  }))

  if (err) TE(err);

  return all_investment_data;
};
module.exports.getWholeInvestmentRun = getWholeInvestmentRun;

const getInvestmentRunTimeline = async function (investment_run_id) {


  let [err, whole_investment] = await to(this.getWholeInvestmentRun(investment_run_id));
  if (err) return ReE(res, err.message, 422);

  if (!whole_investment) TE("Investment run not found!");
  whole_investment = whole_investment.toJSON();

  // prepare investment run data
  let investment_run_data = Object.assign({}, whole_investment);
  delete investment_run_data.RecipeRuns;

  investment_run_data.status = `investment.status.${investment_run_data.status}`;
  investment_run_data.strategy_type = `investment.strategy.${investment_run_data.strategy_type}`;
  investment_run_data.started_timestamp = investment_run_data.started_timestamp.getTime();
  investment_run_data.updated_timestamp = investment_run_data.updated_timestamp.getTime();

  // prepare recipe run data
  let recipe_runs = whole_investment.RecipeRuns,
    recipe_run_data;

  if (!recipe_runs.length) {
    return { // no recipe runs found. Return to avoid further calculations that could cause errors.
      investment_run: investment_run_data,
      recipe_run: null,
      recipe_deposits: null,
      recipe_orders: null,
      execution_orders: null,
      cold_storage_transfers: null
    }
  }

  recipe_run_data = Object.assign({}, _.maxBy(recipe_runs, rr => { // finds newest by created_timestamp
    rr.created_timestamp = rr.created_timestamp.getTime();
    return rr.created_timestamp;
  }));

  delete recipe_run_data.RecipeOrderGroups;
  delete recipe_run_data.RecipeRunDeposits;
  if (recipe_run_data.approval_timestamp) {
    recipe_run_data.approval_timestamp = recipe_run_data.approval_timestamp.getTime();
  }
  recipe_run_data.approval_status = `recipes.status.${recipe_run_data.approval_status}`;

  // prepare recipe deposit data
  let recipe_deposits = Object.assign({}, whole_investment).RecipeRuns.map(recipe_run => {
    return recipe_run.RecipeRunDeposits;
  })
  recipe_deposits = _.flatten(_.flatten(recipe_deposits));

  if (!recipe_deposits.length) {
    return { // no deposits found. Return current status
      investment_run: investment_run_data,
      recipe_run: recipe_run_data,
      recipe_deposits: null,
      recipe_orders: null,
      execution_orders: null,
      cold_storage_transfers: null
    }
  }


  let deposit_status =
    recipe_deposits.some(deposit => deposit.status == RECIPE_RUN_DEPOSIT_STATUSES.Pending) ?
    RECIPE_RUN_DEPOSIT_STATUSES.Pending :
    RECIPE_RUN_DEPOSIT_STATUSES.Completed;
  let deposit_stats = {
    count: recipe_deposits.length,
    status: `deposits.status.${deposit_status}`
  };

  // prepare recipe order data
  // collects all recipe orders into single flat array
  let recipes = Object.assign({}, whole_investment).RecipeRuns;
  let recipe_order_groups = _.filter(
    _.flatten(recipes.map(recipe_run => {
      return recipe_run.RecipeOrderGroups;
    })), group => group.approval_status != RECIPE_ORDER_GROUP_STATUSES.Rejected);
  let recipe_orders = recipe_order_groups.length ? _.maxBy(recipe_order_groups, rog => rog.created_timestamp.getTime()).RecipeOrders : [];

  if (!recipe_orders.length) {
    return { // no recipe orders found. Return current status
      investment_run: investment_run_data,
      recipe_run: recipe_run_data,
      recipe_deposits: deposit_stats,
      recipe_orders: null,
      execution_orders: null,
      cold_storage_transfers: null
    }
  }

  let order_status;

  if (recipe_orders.every(order => order.status === RECIPE_ORDER_STATUSES.Pending)) {
    order_status = RECIPE_ORDER_STATUSES.Pending;
  } else if (recipe_orders.some(order => order.status === RECIPE_ORDER_STATUSES.Rejected)) {
    order_status = RECIPE_ORDER_STATUSES.Rejected;
  } else if (recipe_orders.some(order => order.status === RECIPE_ORDER_STATUSES.Failed)) {
    order_status = RECIPE_ORDER_STATUSES.Failed;
  } else if (recipe_orders.some(order => order.status === RECIPE_ORDER_STATUSES.Executing)) {
    order_status = RECIPE_ORDER_STATUSES.Executing;
  } else if (recipe_orders.every(order => order.status === RECIPE_ORDER_STATUSES.Completed)) {
    order_status = RECIPE_ORDER_STATUSES.Completed;
  } else { //just take status of last created order if all else fails
    order_status = _.maxBy(recipe_orders, 'id').status
  }

  let prepared_recipe_orders = {
    count: recipe_orders.length,
    order_group_id: recipe_orders[0].recipe_order_group_id,
    status: `order.status.${order_status}`
  };

  // find at least one failed execution order
  let exec_order_statuses;
  [err, exec_order_statuses] = await to(sequelize.query(`
    SELECT eo.status, COUNT(eo.id) as count
    FROM execution_order as eo
    JOIN recipe_order as ro ON ro.id=eo.recipe_order_id
    JOIN recipe_order_group as rog ON rog.id=ro.recipe_order_group_id
    WHERE rog.id=:rog_id
    GROUP BY eo.status
  `, {
    type: sequelize.QueryTypes.SELECT,
    replacements: {
      rog_id: prepared_recipe_orders.order_group_id
    }
  }));

  if (err) TE(err.message);

  let exec_order_count = _.sumBy(exec_order_statuses, eos => parseInt(eos.count, 10));
  if (!exec_order_count) {
    return { // no execution orders found. Return current status
      investment_run: investment_run_data,
      recipe_run: recipe_run_data,
      recipe_deposits: deposit_stats,
      recipe_orders: prepared_recipe_orders,
      execution_orders: null,
      cold_storage_transfers: null
    }
  }

  let exec_order_status;
  if (exec_order_statuses.some(e => e.status == EXECUTION_ORDER_STATUSES.Failed && e.count)) { // if at least one failed execution order found
    exec_order_status = EXECUTION_ORDER_STATUSES.Failed;
  } else if (whole_investment.status === INVESTMENT_RUN_STATUSES.OrdersFilled) {
    exec_order_status = EXECUTION_ORDER_STATUSES.FullyFilled;
  } else if (whole_investment.status === INVESTMENT_RUN_STATUSES.OrdersExecuting) {
    exec_order_status = EXECUTION_ORDER_STATUSES.InProgress;
  }
  let exec_order_data = {
    count: exec_order_count,
    status: `execution_orders_timeline.status.${exec_order_status}`
  };

  // find related transfers
  let transfer_statuses;
  [err, transfer_statuses] = await to(sequelize.query(`
    SELECT 
      COUNT(*) AS count,
      cst.status
    FROM cold_storage_transfer AS cst
    WHERE cst.recipe_run_id = :recipe_run_id OR cst.recipe_run_order_id IN (:recipe_order_ids)
    GROUP BY cst.status
  `, {
    type: sequelize.QueryTypes.SELECT,
    replacements: {
      recipe_run_id: recipe_run_data.id,
      recipe_order_ids: recipe_orders.map(r => r.id)
    }
  }));

  let transfer_count = _.sumBy(transfer_statuses, cst => parseInt(cst.count, 10));
  if(!transfer_count) {
    return {
      investment_run: investment_run_data,
      recipe_run: recipe_run_data,
      recipe_deposits: deposit_stats,
      recipe_orders: prepared_recipe_orders,
      execution_orders: exec_order_data,
      cold_storage_transfers: null
    }
  }

  let transfer_status;
  if(transfer_statuses.every(t => t.status === COLD_STORAGE_ORDER_STATUSES.Pending || t.status === COLD_STORAGE_ORDER_STATUSES.Approved)) {
    transfer_status = COLD_STORAGE_ORDER_STATUSES.Pending;
  }
  else if(transfer_statuses.some(t => t.status === COLD_STORAGE_ORDER_STATUSES.Sent)) {
    transfer_status = COLD_STORAGE_ORDER_STATUSES.Sent;
  }
  else if(transfer_statuses.every(t => t.status === COLD_STORAGE_ORDER_STATUSES.Completed)) {
    transfer_status = COLD_STORAGE_ORDER_STATUSES.Completed;
  }
  else if(transfer_statuses.some(t => t.status === COLD_STORAGE_ORDER_STATUSES.Failed)) {
    transfer_status = COLD_STORAGE_ORDER_STATUSES.Failed;
  }
  else transfer_status = COLD_STORAGE_ORDER_STATUSES.Pending;

  let transfer_data = {
    count: transfer_count,
    status: `cold_storage_transfers_timeline.status.${transfer_status}`
  };

  return {
    investment_run: investment_run_data,
    recipe_run: recipe_run_data,
    recipe_deposits: deposit_stats,
    recipe_orders: prepared_recipe_orders,
    execution_orders: exec_order_data,
    cold_storage_transfers: transfer_data
  }
  
}
module.exports.getInvestmentRunTimeline = getInvestmentRunTimeline;

const generateInvestmentAssetGroup = async function (user_id, strategy_type) {

  let [err, strategy_assets] = await to(AssetService.getStrategyAssets(strategy_type));
  if (err) TE(err.message);

  let all = _.concat(...strategy_assets);
  
  let group, group_assets;
  [err, group_assets] = await to(sequelize.transaction(transaction => {

    return InvestmentRunAssetGroup.create({
      created_timestamp: new Date(),
      user_id: user_id,
      strategy_type
    }, {
      transaction
    }).then(asset_group => {

      group = asset_group;

      return GroupAsset.bulkCreate(all.map(asset => {

        return {
          asset_id: asset.id,
          status: asset.status,
          investment_run_asset_group_id: asset_group.id
        };

      }), {
        transaction,
        returning: true
      });

    });
  }));

  if (err) TE(err.message);

  return [group, group_assets];
};
module.exports.generateInvestmentAssetGroup = generateInvestmentAssetGroup;