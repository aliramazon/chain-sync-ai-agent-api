import { workflowService } from '../services/workflow.service';
import { catchAsync } from '../utils/catch-async';

export const createWorkflowFromPrompt = catchAsync(async (req, res) => {
    const { prompt } = req.body;
    const result = await workflowService.createWorkflowFromPrompt(prompt);
    res.json(result);
});

export const workflowController = {
    createWorkflowFromPrompt,
};
