import 'dotenv/config';
import { prisma } from '../..';
import {
    shippoCreateShipmentInput,
    shippoCreateShipmentInputExample,
    shippoCreateShipmentOutput,
    shippoCreateShipmentOutputExample,
} from '../../../connectors/shippo/schemas/create-shipment.schema';
import { seedActionCatalog } from './seed-action-catalog';

export async function seedShippoActions() {
    await seedActionCatalog({
        connectorKey: 'shippo',
        actionKey: 'shippo.create_shipment',
        title: 'Shippo: Create Shipment',
        description:
            'Purchases a label and returns tracking, carrier, and label URL.',
        type: 'action',
        inputSchema: shippoCreateShipmentInput,
        outputSchema: shippoCreateShipmentOutput,
        examples: {
            input: shippoCreateShipmentInputExample,
            output: shippoCreateShipmentOutputExample,
        },
    });
}

seedShippoActions()
    .catch((err) => {
        console.error('❌ Seeding failed', err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
