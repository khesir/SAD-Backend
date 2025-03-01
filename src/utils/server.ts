import cors from 'cors';
import express from 'express';

function createServer() {
  const app = express();

  app.use(cors({ origin: '*' }));
  app.use(express.json());

  return app;
}

export default createServer;
