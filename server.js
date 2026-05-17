import express from 'express';
import { config } from 'dotenv';

// Load .env variables
config();

const app = express();

// Parse JSON bodies (large limit for base64 images)
app.use(express.json({ limit: '50mb' }));

// Dynamically import and route all API handlers
// Each handler expects (req, res) like a Vercel serverless function

app.post('/api/analyze', async (req, res) => {
  const { default: handler } = await import('./api/analyze.js');
  await handler(req, res);
});

app.get('/api/locations', async (req, res) => {
  const { default: handler } = await import('./api/locations.js');
  await handler(req, res);
});

app.get('/api/search', async (req, res) => {
  const { default: handler } = await import('./api/search.js');
  await handler(req, res);
});

app.get('/api/location/:id', async (req, res) => {
  const { default: handler } = await import('./api/location/[id].js');
  await handler(req, res);
});

app.delete('/api/location/:id', async (req, res) => {
  const { default: handler } = await import('./api/location/[id].js');
  await handler(req, res);
});

app.post('/api/rescan/:id', async (req, res) => {
  const { default: handler } = await import('./api/rescan/[id].js');
  await handler(req, res);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🔌 API server running at http://localhost:${PORT}`);
});
