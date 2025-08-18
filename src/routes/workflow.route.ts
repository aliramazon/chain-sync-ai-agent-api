import { Router } from 'express';
import { workflowController } from '../controllers/workflow.controller';

const workflowRouter = Router();

workflowRouter.post('/', workflowController.createWorkflowFromPrompt);
workflowRouter.get('/', workflowController.getAll);
workflowRouter.delete('/:id', workflowController.deleteOne);
workflowRouter.get('/:id', workflowController.getOne);
workflowRouter.patch('/:id/change-status', workflowController.changeStatus);
workflowRouter.get(
    '/:id/run-with-synthetic-data',
    workflowController.runWithSyntheticData,
);

export { workflowRouter };
