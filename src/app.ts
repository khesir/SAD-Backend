import dotenv from 'dotenv';

import log from '../lib/logger';

import MessageResponse from './interfaces/MessageResponse';

import { AuthGuard } from './auth/auth.middleware';
import authRoute from './auth/auth.route';
import baseRoute from './api';
import * as middlewares from './middlewares';

import createServer from './utils/server';

const app = createServer();

dotenv.config();

app.use('/auth', authRoute);

app.use('/api/v1', AuthGuard, baseRoute);
log.info('Api base route set');

app.get<object, MessageResponse>('/', (req, res) => {
  res.json({
    message: 'All systems working on root',
  });
});

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;
