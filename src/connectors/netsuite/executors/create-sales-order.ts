import { z } from 'zod';
import { prisma } from '../../../prisma';
import { ajv } from '../../../utils/ajv';
import { Actions } from '../../actions';
import {
    netsuiteCreateSalesOrderInput,
    netsuiteCreateSalesOrderOutput,
} from '../schemas/create-sales-order.schema';

type NetSuiteCreateSalesOrderInput = z.infer<
    typeof netsuiteCreateSalesOrderInput
>;
type NetSuiteCreateSalesOrderOutput = z.infer<
    typeof netsuiteCreateSalesOrderOutput
>;

const netsuiteCreateSalesOrderMock = (
    input: NetSuiteCreateSalesOrderInput,
): NetSuiteCreateSalesOrderOutput => {
    const { externalOrderId, currency, customer, items } = input;

    console.log(`[MOCK] Creating NetSuite sales order:`);
    console.log(input);

    // Return example data for predictable workflow testing
    return {
        salesOrderId: 'NS-SO-100045',
        status: 'created',
    };
};

export const netsuiteCreateSalesOrderExecutor = async (
    rawInput: unknown,
): Promise<NetSuiteCreateSalesOrderOutput> => {
    const actionName = Actions.NETSUITE_CREATE_SALES_ORDER;

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

    // 3. Execute the mock NetSuite sales order creation
    const result = netsuiteCreateSalesOrderMock(
        rawInput as NetSuiteCreateSalesOrderInput,
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
