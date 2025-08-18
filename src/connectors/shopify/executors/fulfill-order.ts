import { z } from 'zod';
import { prisma } from '../../../prisma';
import { ajv } from '../../../utils/ajv';
import { Actions } from '../../actions';
import {
    shopifyFulfillOrderInput,
    shopifyFulfillOrderOutput,
} from '../schemas/fulfill-order.schema';

type ShopifyFulfillOrderInput = z.infer<typeof shopifyFulfillOrderInput>;
type ShopifyFulfillOrderOutput = z.infer<typeof shopifyFulfillOrderOutput>;

const shopifyFulfillOrderMock = (
    input: ShopifyFulfillOrderInput,
): ShopifyFulfillOrderOutput => {
    console.log(`[MOCK] Fulfilling Shopify order:`);
    console.log(input);

    // Return example data for predictable workflow testing
    return {
        fulfillmentId: 'FUL-001',
        status: 'fulfilled',
    };
};

export const shopifyFulfillOrderExecutor = async (
    rawInput: unknown,
): Promise<ShopifyFulfillOrderOutput> => {
    const actionName = Actions.SHOPIFY_FULFILL_ORDER;

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

    // 3. Execute the mock Shopify order fulfillment
    const result = shopifyFulfillOrderMock(
        rawInput as ShopifyFulfillOrderInput,
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
