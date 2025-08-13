import { connectorService } from '../services/connector.service';
import { catchAsync } from '../utils/catch-async';

export const listConnectors = catchAsync(async (req, res) => {
    const connectors = await connectorService.listConnectors();
    res.json(connectors);
});

export const connectConnector = catchAsync(async (req, res) => {
    const { id } = req.params;
    const connector = await connectorService.connectConnector(id);
    res.json(connector);
});

export const disconnectConnector = catchAsync(async (req, res) => {
    const { id } = req.params;
    const connector = await connectorService.disconnectConnector(id);
    res.json(connector);
});

export const connectorController = {
    listConnectors,
    connectConnector,
    disconnectConnector,
};
