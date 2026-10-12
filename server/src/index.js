import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import './env.js';
import { migrate } from './db.js';
import routes from './routes.js';

const app = express();
app.set('trust proxy', 1);
app.use(helmet());
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '20kb' }));

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api', routes);
app.use('/api', (_req, res) => res.status(404).json({ message: 'Not found' }));

// Optional single-process mode: serve the built client (Docker uses nginx instead)
const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../client/dist');
if (fs.existsSync(path.join(dist, 'index.html'))) {
  app.use(express.static(dist, { index: false, maxAge: '1h' }));
  app.use((req, res, next) => (req.method === 'GET' ? res.sendFile(path.join(dist, 'index.html')) : next()));
}

app.use((err, _req, res, _next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ message: 'Invalid JSON.' });
  console.error(err);
  res.status(500).json({ message: 'Something went wrong.' });
});

await migrate();
const port = Number(process.env.PORT) || 5000;
app.listen(port, () => console.log(`API listening on :${port}`));
