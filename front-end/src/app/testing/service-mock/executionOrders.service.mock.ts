import { OrderAllResponse } from '../../services/execution-orders/execution-orders.service';
import { ExecutionOrder } from '../../shared/models/executionOrder';

export const getAllExecutionOrdersData: OrderAllResponse = {
    success: true,
    execution_orders: [
      new ExecutionOrder({
        completion_time: null,
        exchange: 'Bitfinex',
        exchange_id: 2,
        exchange_trading_fee: null,
        filled_quantity: '0',
        id: 84234,
        instrument: 'XRP/BTC',
        instrument_id: 3,
        investment_run_id: 28,
        price: null,
        recipe_order_id: 176,
        side: 'execution_orders.side.999',
        status: 'execution_orders.status.62',
        submission_time: 1538115310117,
        total_quantity: '106',
        type: 'execution_orders.type.71'
      }),
    ],
    footer: [],
    count: 1
};

export const changeExecutionOrderStatusResponse = {
  success: true,
  status: 'execution_orders.status.61'
};
