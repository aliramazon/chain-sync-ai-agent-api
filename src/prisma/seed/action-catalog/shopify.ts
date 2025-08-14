import 'dotenv/config';

import { prisma } from '../..';
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
