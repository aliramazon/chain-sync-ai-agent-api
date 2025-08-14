import { z } from 'zod';

export const netsuiteCreateSalesOrderInput = z.object({
    externalOrderId: z.string().min(1),
    currency: z.string().length(3),
    customer: z.object({
        email: z.string().email(),
        name: z.string().optional(),
    }),
    items: z
        .array(
            z.object({
                sku: z.string().min(1),
                quantity: z.number().int().positive(),
                unitPrice: z.number().nonnegative(),
            }),
        )
        .min(1),
});

export const netsuiteCreateSalesOrderOutput = z.object({
    salesOrderId: z.string().min(1),
    status: z.literal('created'),
});

export const netsuiteCreateSalesOrderInputExample = {
    externalOrderId: 'ORDER-84322',
    currency: 'USD',
    customer: { email: 'john@example.com', name: 'John Doe' },
    items: [{ sku: 'OAK-DT-001', quantity: 1, unitPrice: 2450 }],
};

export const netsuiteCreateSalesOrderOutputExample = {
    salesOrderId: 'NS-SO-100045',
    status: 'created',
};
