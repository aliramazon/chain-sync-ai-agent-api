import { Actions } from './actions';
import { netsuiteCreateSalesOrderExecutor } from './netsuite/executors/create-sales-order';
import { netsuiteCreateSalesOrderInputExample } from './netsuite/schemas/create-sales-order.schema';
import { shippoCreateShipmentExecutor } from './shippo/executors/create-shipment';
import { shippoCreateShipmentInputExample } from './shippo/schemas/create-shipment.schema';
import { shopifyFulfillOrderExecutor } from './shopify/executors/fulfill-order';
import { shopifyFulfillOrderInputExample } from './shopify/schemas/fulfill-order.schema';
import { stripeVerifyPaymentExecutor } from './stripe/executors/verify-payment';
import { stripeVerifyPaymentInputExample } from './stripe/schemas/verify-payment.schema';

export const executorsMap: Record<
    Actions,
    {
        executor: (input: unknown) => Promise<unknown>;
        input: unknown;
    }
> = {
    [Actions.SHOPIFY_FULFILL_ORDER]: {
        executor: shopifyFulfillOrderExecutor,
        input: shopifyFulfillOrderInputExample,
    },
    [Actions.STRIPE_VERIFY_PAYMENT]: {
        executor: stripeVerifyPaymentExecutor,
        input: stripeVerifyPaymentInputExample,
    },
    [Actions.NETSUITE_CREATE_SALES_ORDER]: {
        executor: netsuiteCreateSalesOrderExecutor,
        input: netsuiteCreateSalesOrderInputExample,
    },
    [Actions.SHIPPO_CREATE_SHIPMENT]: {
        executor: shippoCreateShipmentExecutor,
        input: shippoCreateShipmentInputExample,
    },
};
