import Ajv from 'ajv';
import { z } from 'zod';
import { prisma } from '../../../prisma';
import { Actions } from '../../actions';
import {
    shippoCreateShipmentInput,
    shippoCreateShipmentOutput,
} from '../schemas/create-shipment.schema';

const ajv = new Ajv({ allErrors: true });

type ShippoCreateShipmentInput = z.infer<typeof shippoCreateShipmentInput>;
type ShippoCreateShipmentOutput = z.infer<typeof shippoCreateShipmentOutput>;

const shippoCreateShipmentMock = (
    input: ShippoCreateShipmentInput,
): ShippoCreateShipmentOutput => {
    // Log for workflow debugging
    console.log(`[MOCK] Creating Shippo shipment:`);
    console.log(input);

    // Return example data for predictable workflow testing
    return {
        trackingNumber: '1Z999AA10123456784',
        carrier: 'UPS',
        labelUrl: 'https://labels.example.com/label_7d1a2b3c4d.pdf',
        status: 'label_purchased',
    };
};

export const shippoCreateShipmentExecutor = async (
    rawInput: unknown,
): Promise<ShippoCreateShipmentOutput> => {
    const actionName = Actions.SHIPPO_CREATE_SHIPMENT;

    // 1. Fetch schemas from the DB
    const action = await prisma.actionCatalog.findUnique({
        where: { key: actionName },
        select: { schemaInput: true, schemaOutput: true },
    });

    if (!action) {
        throw new Error(`Action not found: ${actionName}`);
    }

    // 2. Validate input against DB schema
    if (!action.schemaInput) {
        throw new Error(`No input schema defined for ${actionName}`);
    }

    const validateInput = ajv.compile(action.schemaInput as object);
    if (!validateInput(rawInput)) {
        throw new Error(
            `Invalid input for ${actionName}: ${ajv.errorsText(validateInput.errors)}`,
        );
    }

    // 3. Execute the mock Shippo shipment creation
    const result = shippoCreateShipmentMock(
        rawInput as ShippoCreateShipmentInput,
    );

    // 4. Validate output against DB schema
    if (!action.schemaOutput) {
        throw new Error(`No output schema defined for ${actionName}`);
    }

    const validateOutput = ajv.compile(action.schemaOutput as object);
    if (!validateOutput(result)) {
        throw new Error(
            `Invalid output from ${actionName}: ${ajv.errorsText(validateOutput.errors)}`,
        );
    }

    return result;
};
