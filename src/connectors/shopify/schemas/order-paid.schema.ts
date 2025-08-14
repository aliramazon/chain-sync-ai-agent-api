import { z } from 'zod';

export const shopifyOrderPaidInput = z.object({});

export const shopifyOrderPaidOutput = z.object({
    orderId: z.string().min(1, 'Order ID is required'),
    total: z.number().positive('Total amount must be positive'),
    currency: z.string().length(3, 'Currency must be a 3-letter ISO code'),
    items: z.array(
        z.object({
            sku: z.string(),
            name: z.string(),
            quantity: z.number().int().positive(),
            unitPrice: z.number().positive(),
        }),
    ),
    customer: z.object({
        id: z.string(),
        name: z.string(),
        email: z.string().email(),
    }),
    shippingAddress: z.string().min(5),
});

export const shopifyOrderPaidOutputExample = {
    orderId: 'ORDER-84322',
    total: 2450,
    currency: 'USD',
    items: [
        {
            sku: 'OAK-DT-001',
            name: 'Solid Oak Dining Table',
            quantity: 1,
            unitPrice: 2450,
        },
    ],
    customer: {
        id: 'CUST-932',
        name: 'John Doe',
        email: 'john@example.com',
    },
    shippingAddress: '123 Main St, Austin, TX',
};
