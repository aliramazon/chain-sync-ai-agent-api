import 'dotenv/config';

import { prisma } from '../..';
import {
    stripeVerifyPaymentInput,
    stripeVerifyPaymentInputExample,
    stripeVerifyPaymentOutput,
    stripeVerifyPaymentOutputExample,
} from '../../../connectors/stripe/schemas/verify-payment.schema';
import { seedActionCatalog } from './seed-action-catalog';

export async function seedStripeActions() {
    await seedActionCatalog({
        connectorKey: 'stripe',
        actionKey: 'stripe.verify_payment',
        title: 'Stripe: Verify Payment',
        description:
            'Validates a Stripe Payment Intent status, amount, and currency before fulfillment.',
        type: 'action',
        inputSchema: stripeVerifyPaymentInput,
        outputSchema: stripeVerifyPaymentOutput,
        examples: {
            input: stripeVerifyPaymentInputExample,
            output: stripeVerifyPaymentOutputExample,
        },
    });
}

seedStripeActions()
    .catch((err) => {
        console.error('❌ Seeding failed', err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
