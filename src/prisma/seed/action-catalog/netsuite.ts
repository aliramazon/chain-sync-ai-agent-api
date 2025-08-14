import 'dotenv/config';
import { prisma } from '../..';
import {
    netsuiteCreateSalesOrderInput,
    netsuiteCreateSalesOrderInputExample,
    netsuiteCreateSalesOrderOutput,
    netsuiteCreateSalesOrderOutputExample,
} from '../../../connectors/netsuite/schemas/create-sales-order.schema';
import { seedActionCatalog } from './seed-action-catalog';

export async function seedNetSuiteActions() {
    await seedActionCatalog({
        connectorKey: 'netsuite',
        actionKey: 'netsuite.create_sales_order',
        title: 'NetSuite: Create Sales Order',
        description:
            'Creates a Sales Order in NetSuite for a paid Shopify order.',
        type: 'action',
        inputSchema: netsuiteCreateSalesOrderInput,
        outputSchema: netsuiteCreateSalesOrderOutput,
        examples: {
            input: netsuiteCreateSalesOrderInputExample,
            output: netsuiteCreateSalesOrderOutputExample,
        },
    });
}

seedNetSuiteActions()
    .catch((err) => {
        console.error('❌ Seeding failed', err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
