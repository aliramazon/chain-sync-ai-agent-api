import Ajv from 'ajv';
import { z } from 'zod';
import { prisma } from '../../../prisma';
import { Actions } from '../../actions';
import {
    stripeVerifyPaymentInput,
    stripeVerifyPaymentOutput,
} from '../schemas/verify-payment.schema';

const ajv = new Ajv({ allErrors: true });

type StripeVerifyPaymentInput = z.infer<typeof stripeVerifyPaymentInput>;
type StripeVerifyPaymentOutput = z.infer<typeof stripeVerifyPaymentOutput>;

const stripeVerifyPaymentMock = (
    input: StripeVerifyPaymentInput,
): StripeVerifyPaymentOutput => {
    const { paymentIntentId, amountExpectedMinor, currency, orderId } = input;

    const mockVerified =
        paymentIntentId?.startsWith('pi_') && amountExpectedMinor > 0;

    return {
        verified: mockVerified,
        status: mockVerified ? 'succeeded' : 'failed',
        reason: mockVerified ? undefined : 'Invalid payment intent or amount',
    };
};

export const stripeVerifyPaymentExecutor = async (
    rawInput: unknown,
): Promise<StripeVerifyPaymentOutput> => {
    const actionName = Actions.STRIPE_VERIFY_PAYMENT;

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

    // 3. Execute the mock Stripe verification
    const result = stripeVerifyPaymentMock(
        rawInput as StripeVerifyPaymentInput,
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
