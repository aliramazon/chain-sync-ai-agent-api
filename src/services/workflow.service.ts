import { prisma } from '../prisma';
import { Claude } from '../utils/claude';
import { CustomError } from '../utils/custom-error';

interface ClaudeWorkflowResponse {
    workflowName: string;
    description: string;
    steps: Array<{
        stepId: string;
        type: 'trigger' | 'action';
        actionKey: string;
        description: string;
        dependsOn?: string[];
    }>;
}

export const createWorkflowFromPrompt = async (prompt: string) => {
    const availableActions = await prisma.actionCatalog.findMany({
        select: {
            id: true,
            connectorId: true,
            type: true,
            key: true,
            title: true,
            description: true,
            schemaInput: true,
            schemaOutput: true,
            examples: true,
            connector: {
                select: {
                    name: true,
                    key: true,
                    status: true,
                },
            },
        },
    });

    if (availableActions.length === 0) {
        throw CustomError.notFound('No actions found in the system');
    }

    const plannerPrompt = `You are a workflow planner.

        Select actions from these available options:
        ${JSON.stringify(availableActions)}

        Task: ${prompt}

        Return ONLY a single JSON object IN RESPONSE.

        Response JSON shape:
        {
        "workflowName": "string",
        "description": "string", 
        "steps": [
            {
            "stepId": "string",
            "type": "trigger|action",
            "actionKey": "string",
            "description": "string",
            "dependsOn": ["string", "..."]
            }
        ]
        }`;

    const claudeResponse =
        await Claude.ask<ClaudeWorkflowResponse>(plannerPrompt);

    if (
        !claudeResponse.workflowName ||
        !claudeResponse.description ||
        !claudeResponse.steps ||
        !Array.isArray(claudeResponse.steps)
    ) {
        throw CustomError.badRequest(
            'Invalid response from Claude: missing required fields',
            'LLM_RESPONSE_ERROR',
        );
    }

    const validActionKeys = availableActions.map((a) => a.key);
    for (const step of claudeResponse.steps) {
        if (!validActionKeys.includes(step.actionKey)) {
            throw CustomError.validation(
                `Invalid action key: ${step.actionKey}`,
                'INVALID_ACTION_KEY',
                {
                    invalidKey: step.actionKey,
                    validKeys: validActionKeys,
                },
            );
        }
    }

    if (claudeResponse.steps[0]?.type !== 'trigger') {
        throw CustomError.validation(
            'First step must be a trigger',
            'INVALID_WORKFLOW_STRUCTURE',
        );
    }

    return {
        workflow: claudeResponse,
    };
};

export const workflowService = {
    createWorkflowFromPrompt,
};
