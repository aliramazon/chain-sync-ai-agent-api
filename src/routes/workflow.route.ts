import { Router } from 'express';
import { workflowController } from '../controllers/workflow.controller';

const workflowRouter = Router();

workflowRouter.post('/', workflowController.createWorkflowFromPrompt);

export { workflowRouter };
