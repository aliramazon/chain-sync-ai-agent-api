import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import { GlobalError } from './middlewares/global-error.middleware';
import { connectorRouter } from './routes/connector.route';
import { workflowRouter } from './routes/workflow.route';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;

app.use('/api/connectors', connectorRouter);
app.use('/api/workflows', workflowRouter);
app.use(GlobalError.handle);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
