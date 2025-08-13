import { Router } from 'express';
import { connectorController } from '../controllers/connector.controller';

const connectorRouter = Router();

connectorRouter.get('/', connectorController.listConnectors);
connectorRouter.post('/:id/connect', connectorController.connectConnector);
connectorRouter.post(
    '/:id/disconnect',
    connectorController.disconnectConnector,
);

export { connectorRouter };
