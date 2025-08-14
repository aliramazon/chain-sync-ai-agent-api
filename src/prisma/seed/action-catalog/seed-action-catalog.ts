import z from 'zod';
import { prisma } from '../..';
import { CustomError, NotFoundError } from '../../../utils/custom-error';

export async function seedActionCatalog(config: {
    connectorKey: string;
    actionKey: string;
    title: string;
    description: string;
    type: 'trigger' | 'action';
    outputSchema?: z.ZodSchema;
    inputSchema?: z.ZodSchema;
    examples?: {
        input?: any;
        output?: any;
    };
    metadata?: Record<string, any>;
}) {
    try {
        const {
            connectorKey,
            actionKey,
            title,
            description,
            type,
            outputSchema,
            inputSchema,
            examples,
        } = config;

        const connector = await prisma.connector.findUnique({
            where: { key: connectorKey },
            select: { id: true },
        });

        if (!connector) {
            throw new NotFoundError(`${connectorKey} connector`);
        }

        const existingAction = await prisma.actionCatalog.findUnique({
            where: { key: actionKey },
        });

        if (existingAction) {
            console.log(`Action ${actionKey} already exists, skipping...`);
            return existingAction;
        }

        const schemaOutput = outputSchema
            ? JSON.parse(
                  JSON.stringify(
                      z.toJSONSchema(outputSchema as z.ZodSchema, {
                          target: 'draft-2020-12',
                      }),
                  ),
              )
            : undefined;

        const schemaInput = inputSchema
            ? JSON.parse(
                  JSON.stringify(
                      z.toJSONSchema(inputSchema as z.ZodSchema, {
                          target: 'draft-2020-12',
                      }),
                  ),
              )
            : undefined;

        // Create action catalog entry
        const actionCatalog = await prisma.actionCatalog.create({
            data: {
                connectorId: connector.id,
                type,
                key: actionKey,
                title,
                description,
                schemaInput,
                schemaOutput,
                examples: examples || {},
            },
        });

        console.log(`✅ Created action catalog: ${actionCatalog.key}`);
        return actionCatalog;
    } catch (error) {
        console.error(
            `❌ Failed to seed action catalog ${config.actionKey}:`,
            error,
        );
        throw error instanceof CustomError
            ? error
            : CustomError.internal('Failed to seed action catalog', {
                  actionKey: config.actionKey,
                  originalError:
                      error instanceof Error ? error.message : String(error),
              });
    }
}
