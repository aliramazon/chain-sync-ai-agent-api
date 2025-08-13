import { prisma } from './index'; // reuse the same instance

async function main() {
    const connectors = [
        { key: 'shopify', name: 'Shopify' },
        { key: 'stripe', name: 'Stripe' },
        { key: 'netsuite', name: 'NetSuite' },
        { key: 'shippo', name: 'Shippo' },
        { key: 'salesforce', name: 'Salesforce' },
        { key: 'zendesk', name: 'Zendesk' },
    ];

    for (const c of connectors) {
        await prisma.connector.upsert({
            where: { key: c.key },
            update: {},
            create: c,
        });
    }
    console.log('Seed completed.');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
