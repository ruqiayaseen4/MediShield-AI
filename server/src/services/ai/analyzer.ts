import type { AIAnalysisRequest, AIAnalysisResponse, AIProvider } from './types.js';
import { RulesEngine } from './rulesEngine.js';
import { MockProvider } from './providers/mock.js';
import { OpenAIProvider } from './providers/openai.js';
import { config } from '../../config.js';

let provider: AIProvider;

function getProvider(): AIProvider {
  if (provider) return provider;

  switch (config.ai.provider) {
    case 'mock':
      console.log('[AI] Using Mock provider (dev mode)');
      provider = new MockProvider();
      break;
    case 'openai':
      console.log(`[AI] Using OpenAI provider (model: ${config.ai.openaiModel})`);
      provider = new OpenAIProvider(config.ai.openaiApiKey, config.ai.openaiModel);
      break;
    case 'rules':
    default:
      console.log('[AI] Using built-in Rules Engine');
      provider = new RulesEngine();
      break;
  }

  return provider;
}

/**
 * Main analyzer orchestrator.
 * Selects the configured AI provider and delegates the analysis.
 * Enforces timeout and error handling.
 */
export async function analyzeMedicine(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
  const aiProvider = getProvider();

  // Wrap analysis in a timeout
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('AI analysis timed out')), config.ai.timeoutMs);
  });

  try {
    const result = await Promise.race([aiProvider.analyze(request), timeoutPromise]);
    return result;
  } catch (err) {
    console.error('[AI] Analysis error:', err);

    // Return a safe fallback response
    return {
      status: 'needs_verification',
      confidence: 0.0,
      suspiciousIndicators: [],
      evidence: ['AI analysis encountered an error'],
      dataSources: [],
      safetyRecommendation:
        'An error occurred during automated analysis. Please consult a pharmacist or healthcare provider to verify this medicine.',
      disclaimer:
        'This AI-assisted analysis is not a substitute for professional medical advice, pharmacist verification, or laboratory testing. Always consult a qualified healthcare provider before making decisions about your medications.',
    };
  }
}
