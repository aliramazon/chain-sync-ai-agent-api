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

export const getWorkflowPlanFromLLM = async (prompt: string) => {
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
                "stepId": "step_1",        // ← Always use step_1, step_2, step_3 format
                "type": "trigger|action",
                "actionKey": "string",
                "description": "string",
                "dependsOn": ["step_1", "step_2"]  // ← Must reference stepId format
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

    return claudeResponse;
};

const createFromLLMResponse = async (prompt: string) => {
    // 1. Get LLM workflow plan
    const claudeResponse = await getWorkflowPlanFromLLM(prompt);

    // 2. Get available actions for saving
    const availableActions = await prisma.actionCatalog.findMany({
        select: {
            id: true,
            connectorId: true,
            key: true,
            title: true,
            type: true,
            connector: {
                select: {
                    name: true,
                },
            },
        },
    });

    // 3. Save to database and return full workflow
    return await prisma.$transaction(async (tx) => {
        // Create main Workflow record
        const workflow = await tx.workflow.create({
            data: {
                name: claudeResponse.workflowName,
                description: claudeResponse.description,
                isActive: false,
            },
        });

        // Create WorkflowStep records
        const createdSteps = [];
        for (let i = 0; i < claudeResponse.steps.length; i++) {
            const step = claudeResponse.steps[i];

            const action = availableActions.find(
                (a) => a.key === step.actionKey,
            );
            if (!action) {
                throw CustomError.notFound(
                    `Action not found: ${step.actionKey}`,
                );
            }

            const workflowStep = await tx.workflowStep.create({
                data: {
                    workflowId: workflow.id,
                    actionId: action.id,
                    connectorId: action.connectorId,
                    stepOrder: i + 1,
                    externalId: step.stepId,
                    dependsOn: step.dependsOn || [],
                    description: step.description || '',
                },
            });
            createdSteps.push({
                id: workflowStep.id,
                stepId: step.stepId,
                type: action.type,
                actionKey: step.actionKey,
                title: action.title,
                description: step.description,
                connector: action.connector.name,
                dependsOn: step.dependsOn || [],
            });
        }

        return {
            workflow: {
                id: workflow.id,
                name: workflow.name,
                description: workflow.description,
                isActive: workflow.isActive,
                stepCount: claudeResponse.steps.length,
            },
            steps: createdSteps,
        };
    });
};

const getAll = async () => {
    const workflows = await prisma.workflow.findMany({
        select: {
            id: true,
            name: true,
            description: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            _count: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    return workflows;
};

const deleteOne = async (id: string) => {
    const workflow = await prisma.workflow.findUnique({
        where: { id },
        select: { id: true, isActive: true, name: true },
    });

    if (!workflow) {
        throw CustomError.notFound('Workflow not found');
    }

    if (workflow.isActive) {
        throw CustomError.validation(
            'Cannot delete active workflow. Deactivate first.',
            'WORKFLOW_ACTIVE',
        );
    }

    await prisma.workflow.delete({ where: { id } });
};

const getOne = async (id: string) => {
    const result = await prisma.workflow.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            description: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            steps: {
                select: {
                    id: true,
                    externalId: true,
                    stepOrder: true,
                    description: true,
                    dependsOn: true,
                    action: {
                        select: {
                            key: true,
                            title: true,
                            type: true,
                            description: true,
                        },
                    },
                    connector: {
                        select: {
                            name: true,
                            key: true,
                        },
                    },
                },
                orderBy: {
                    stepOrder: 'asc',
                },
            },
        },
    });

    if (!result) {
        throw CustomError.notFound('Workflow not found');
    }

    return result;
};

const changeStatus = async (id: string, status: 'activate' | 'deactivate') => {
    const workflow = await prisma.workflow.findUnique({
        where: { id },
        select: { id: true, isActive: true, name: true },
    });

    if (!workflow) {
        throw CustomError.notFound('Workflow not found');
    }

    const newStatus = status === 'activate';

    await prisma.workflow.update({
        where: { id },
        data: { isActive: newStatus },
    });

    return {
        id: workflow.id,
        isActive: newStatus,
    };
};

export const workflowService = {
    createFromLLMResponse,
    getAll,
    deleteOne,
    getOne,
    changeStatus,
};
