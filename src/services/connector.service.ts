import { prisma } from '../prisma';

const listConnectors = async () => {
    return prisma.connector.findMany();
};

const connectConnector = async (id: string) => {
    return prisma.connector.update({
        where: { id },
        data: {
            status: 'connected',
            connectedAt: new Date(),
            disconnectedAt: null,
        },
    });
};

const disconnectConnector = async (id: string) => {
    return prisma.connector.update({
        where: { id },
        data: {
            status: 'not_connected',
            disconnectedAt: new Date(),
        },
    });
};

export const connectorService = {
    listConnectors,
    connectConnector,
    disconnectConnector,
};
