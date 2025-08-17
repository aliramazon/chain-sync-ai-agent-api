import { Router } from 'express';
import { workflowController } from '../controllers/workflow.controller';

const workflowRouter = Router();

workflowRouter.post('/', workflowController.createWorkflowFromPrompt);
workflowRouter.get('/', workflowController.getAll);
workflowRouter.delete('/:id', workflowController.deleteOne);

export { workflowRouter };
