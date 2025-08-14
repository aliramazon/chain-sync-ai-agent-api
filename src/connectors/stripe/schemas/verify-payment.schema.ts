import { z } from 'zod';
export const stripeVerifyPaymentInput = z.object({
    paymentIntentId: z.string().min(1, 'Stripe PaymentIntent ID is required'),
    amountExpectedMinor: z.number().int().nonnegative(), // e.g., 245000 for $2,450.00
    currency: z
        .string()
        .length(3)
        .refine((c) => c === c.toLowerCase(), { message: 'Must be lowercase' }),
    orderId: z.string().optional(),
});

export const stripeVerifyPaymentOutput = z.object({
    verified: z.boolean(), // true if payment fully confirmed
    status: z.string(), // e.g. 'succeeded', 'requires_capture'
    reason: z.string().optional(), // present only if verified = false
});

export const stripeVerifyPaymentInputExample = {
    paymentIntentId: 'pi_3QF1abcXYZ123456789',
    amountExpectedMinor: 245000,
    currency: 'usd',
    orderId: 'ORDER-84322',
};

export const stripeVerifyPaymentOutputExample = {
    verified: true,
    status: 'succeeded',
};
