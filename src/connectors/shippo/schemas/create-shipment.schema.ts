import { z } from 'zod';

export const shippoCreateShipmentInput = z.object({
    orderId: z.string().optional(),
    shippingAddress: z.string().min(5),
    items: z
        .array(
            z.object({
                sku: z.string().min(1),
                quantity: z.number().int().positive(),
            }),
        )
        .min(1),
    serviceLevel: z.string().optional(),
});

export const shippoCreateShipmentOutput = z.object({
    trackingNumber: z.string().min(1),
    carrier: z.string().min(1),
    labelUrl: z.string().min(1),
    status: z.literal('label_purchased'),
});

export const shippoCreateShipmentInputExample = {
    orderId: 'ORDER-84322',
    shippingAddress: '123 Main St, Austin, TX 78701, US',
    items: [{ sku: 'OAK-DT-001', quantity: 1 }],
    serviceLevel: 'ground',
};

export const shippoCreateShipmentOutputExample = {
    trackingNumber: '1Z999AA10123456784',
    carrier: 'UPS',
    labelUrl: 'https://labels.example.com/label_7d1a2b3c4d.pdf',
    status: 'label_purchased',
};
