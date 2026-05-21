import express from 'express';
import { config } from 'dotenv';

// Load .env variables
config();

const app = express();

// Parse JSON bodies (large limit for base64 images)
app.use(express.json({ limit: '50mb' }));

// Dynamically import and route all API handlers
// Each handler expects (req, res) like a Vercel serverless function

// Cache-bust imports so file edits are always picked up without a full restart
const bust = () => `?t=${Date.now()}`;

app.post('/api/analyze', async (req, res) => {
  const { default: handler } = await import(`./api/analyze.js${bust()}`);
  await handler(req, res);
});

app.get('/api/locations', async (req, res) => {
  const { default: handler } = await import(`./api/locations.js${bust()}`);
  await handler(req, res);
});

app.get('/api/search', async (req, res) => {
  const { default: handler } = await import(`./api/search.js${bust()}`);
  await handler(req, res);
});

app.get('/api/suggest', async (req, res) => {
  const { default: handler } = await import(`./api/suggest.js${bust()}`);
  await handler(req, res);
});

app.get('/api/location/:id', async (req, res) => {
  const { default: handler } = await import(`./api/location/[id].js${bust()}`);
  await handler(req, res);
});

app.delete('/api/location/:id', async (req, res) => {
  const { default: handler } = await import(`./api/location/[id].js${bust()}`);
  await handler(req, res);
});

app.post('/api/rescan/:id', async (req, res) => {
  const { default: handler } = await import(`./api/rescan/[id].js${bust()}`);
  await handler(req, res);
});

// Global error handler — ensures every uncaught error returns JSON, never HTML
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  console.error(`[${req.method} ${req.path}]`, err);
  if (!res.headersSent) {
    res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🔌 API server running at http://localhost:${PORT}`);
});
