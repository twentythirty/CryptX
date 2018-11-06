import { OrdersAllResponse, OrderGroupOfRecipeResponse } from '../../services/orders/orders.service';
import { Order } from '../../shared/models/order';
import { OrderGroup } from '../../shared/models/orderGroup';

export const getAllOrdersData: OrdersAllResponse = {
    success: true,
    recipe_orders: [
      new Order({
        completed_timestamp: 1535629504367,
        created_timestamp: 1535519367429,
        exchange: 'Binance',
        id: 404,
        instrument: 'ZEC/BTC',
        instrument_id: 3875,
        investment_id: 38,
        price: '0.02153',
        quantity: '42.224',
        recipe_order_group_id: 35,
        recipe_run_id: 67,
        side: 'orders.side.999',
        status: 'orders.status.53',
        sum_of_exchange_trading_fee: '3.64817800000000000000',
        target_exchange_id: 1
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

export const getOrderGroupOfRecipeData: OrderGroupOfRecipeResponse = {
  success: true,
  recipe_order_group: new OrderGroup({
    approval_comment: 'as',
    approval_user: 'Test User',
    created_timestamp: 1537789964411,
    id: 67,
    status: 'orders_group.status.83'
  })
};

export const getAllOrdersByGroupIdData: OrdersAllResponse = {
  success: true,
  recipe_orders: [
   new Order({
    completed_timestamp: 1537838101384,
    created_timestamp: 1537789964411,
    exchange: 'Huobi',
    id: 1027,
    instrument: 'QTUM/ETH',
    instrument_id: 3844,
    investment_id: 86,
    price: '0.01634',
    quantity: '2039.9837',
    recipe_order_group_id: 67,
    recipe_run_id: 129,
    side: 'orders.side.999',
    status: 'orders.status.53',
    sum_of_exchange_trading_fee: '1.133164',
    target_exchange_id: 7
   }),
  ],
  footer: [],
  count: 1
};

export const generateOrdersData = [
  {
    id: 5,
    recipe_order_group_id: 2,
    instrument_id: 5,
    target_exchange_id: 6,
    price: 0.11588,
    quantity: 32792.54401104591,
    side: 888,
    status: 51
  }
];

