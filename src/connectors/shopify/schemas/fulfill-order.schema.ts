import { z } from 'zod';

export const shopifyFulfillOrderInput = z.object({
    orderId: z.string().min(1),
    trackingNumber: z.string().min(1),
    carrier: z.string().min(1),
});

export const shopifyFulfillOrderOutput = z.object({
    fulfillmentId: z.string().min(1),
    status: z.literal('fulfilled'),
});

export const shopifyFulfillOrderInputExample = {
    orderId: 'ORDER-84322',
    trackingNumber: '1Z999AA10123456784',
    carrier: 'UPS',
};

export const shopifyFulfillOrderOutputExample = {
    fulfillmentId: 'FUL-001',
    status: 'fulfilled',
};
