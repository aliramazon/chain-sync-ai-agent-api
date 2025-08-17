import { workflowService } from '../services/workflow.service';
import { catchAsync } from '../utils/catch-async';

const createWorkflowFromPrompt = catchAsync(async (req, res) => {
    const { prompt } = req.body;
    const result = await workflowService.createFromLLMResponse(prompt);
    res.json(result);
});

const getAll = catchAsync(async (_, res) => {
    const result = await workflowService.getAll();
    res.json(result);
});

export const deleteOne = catchAsync(async (req, res) => {
    const { id } = req.params;
    await workflowService.deleteOne(id);
    res.json(204);
});

export const workflowController = {
    createWorkflowFromPrompt,
    getAll,
    deleteOne,
};
