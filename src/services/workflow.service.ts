import { Actions } from '../connectors/actions';
import { executorsMap } from '../connectors/executors-map';
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

    const plannerPrompt = `You are a strict workflow planner. You MUST follow these rules exactly:

        CRITICAL RULES:
        1. You can ONLY use actions from the provided list below
        2. You MUST NOT create workflows if the required actions/services are NOT in the available list
        3. If the user mentions services, APIs, or tools NOT in the available list, respond with an error
        4. Every action MUST have a valid "actionKey" that exists in the available actions
        5. Return ONLY valid JSON - no explanations, no additional text

        AVAILABLE ACTIONS (you can ONLY use these):
        ${JSON.stringify(availableActions, null, 2)}

        USER REQUEST: ${prompt}

        VALIDATION REQUIREMENTS:
        - Check if all mentioned services/tools exist in the available actions
        - If ANY required service is missing, return this error format:
        {
        "error": "Cannot create workflow. Missing required services: [list missing services]",
        "availableServices": [list of available service names from actionKey]
        }

        If all required actions are available, return this exact JSON format:
        {
            "workflowName": "string (descriptive name)",
            "description": "string (what this workflow does)",
            "steps": [
                {
                    "stepId": "step_1",
                    "type": "trigger|action", 
                    "actionKey": "EXACT_KEY_FROM_AVAILABLE_ACTIONS",
                    "description": "string (what this step does)",
                    "dependsOn": ["previous_step_ids"] // empty array [] for first step
                }
            ]
        }

        RETURN ONLY THE JSON OBJECT - NO OTHER TEXT.`;

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
                createdAt: workflow.createdAt,
                _count: { steps: claudeResponse.steps.length },
                steps: createdSteps,
            },
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

const runWithSyntheticData = async (id: string) => {
    const workflow = await prisma.workflow.findUnique({
        where: {
            id,
        },
        include: {
            steps: {
                orderBy: {
                    stepOrder: 'asc',
                },
                include: {
                    action: true,
                },
            },
        },
    });

    if (!workflow?.steps) {
        throw CustomError.notFound('Workflow does not have steps');
    }

    for (const step of workflow.steps) {
        const actionKey = step.action.key as Actions;

        if (step.action.type === 'action' && executorsMap[actionKey]) {
            const { executor, input } = executorsMap[actionKey];

            await executor(input);
        }
    }
};

export const workflowService = {
    createFromLLMResponse,
    getAll,
    deleteOne,
    getOne,
    changeStatus,
    runWithSyntheticData,
};
