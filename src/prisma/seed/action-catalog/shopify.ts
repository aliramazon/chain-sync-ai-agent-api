import 'dotenv/config';

import { prisma } from '../..';
import {
    shopifyFulfillOrderInput,
    shopifyFulfillOrderInputExample,
    shopifyFulfillOrderOutput,
    shopifyFulfillOrderOutputExample,
} from '../../../connectors/shopify/schemas/fulfill-order.schema';
import {
    shopifyOrderPaidOutput,
    shopifyOrderPaidOutputExample,
} from '../../../connectors/shopify/schemas/order-paid.schema';

import { seedActionCatalog } from './seed-action-catalog';

export async function seedShopifyActions() {
    await seedActionCatalog({
        connectorKey: 'shopify',
        actionKey: 'shopify.order_paid',
        title: 'Shopify: Order Paid',
        description:
            'Triggered when a customer completes payment for an order in Shopify.',
        type: 'trigger',
        outputSchema: shopifyOrderPaidOutput,
        examples: {
            output: shopifyOrderPaidOutputExample,
        },
    });
}

seedShopifyActions()
    .catch((err) => {
        console.error('❌ Seeding failed', err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

export async function seedShopifyFulfill() {
    await seedActionCatalog({
        connectorKey: 'shopify',
        actionKey: 'shopify.fulfill_order',
        title: 'Shopify: Fulfill Order',
        description: 'Marks a Shopify order fulfilled with tracking.',
        type: 'action',
        inputSchema: shopifyFulfillOrderInput,
        outputSchema: shopifyFulfillOrderOutput,
        examples: {
            input: shopifyFulfillOrderInputExample,
            output: shopifyFulfillOrderOutputExample,
        },
    });
}

seedShopifyFulfill()
    .catch((err) => {
        console.error('❌ Seeding failed', err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
