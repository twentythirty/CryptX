import { OrdersAllResponse } from '../../services/orders/orders.service';
import { Order } from '../../shared/models/order';

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
