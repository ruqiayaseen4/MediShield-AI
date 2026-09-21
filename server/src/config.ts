import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  databasePath: process.env.DATABASE_PATH || path.resolve(__dirname, '../data/medishield.db'),
  ai: {
    provider: process.env.AI_PROVIDER || 'rules',
    timeoutMs: parseInt(process.env.AI_PROVIDER_TIMEOUT_MS || '15000', 10),
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    openaiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
};
