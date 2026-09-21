import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { initializeDatabase } from './services/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authRouter } from './routes/auth.js';
import { medicineRouter } from './routes/medicine.js';
import { aiRouter } from './routes/ai.js';
import { interactionRouter } from './routes/interaction.js';
import { addictionRouter } from './routes/addiction.js';

const app = express();

// Middleware
app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/medicine', medicineRouter);
app.use('/api/ai', aiRouter);
app.use('/api/interaction', interactionRouter);
app.use('/api/addiction', addictionRouter);

// Error handler (must be last)
app.use(errorHandler);

// Initialize database and start server
initializeDatabase();

app.listen(config.port, () => {
  console.log(`[SERVER] MediShield AI backend running on http://localhost:${config.port}`);
  console.log(`[SERVER] AI Provider: ${config.ai.provider}`);
});

export default app;
