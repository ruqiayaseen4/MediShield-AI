import type { AIAnalysisRequest, AIAnalysisResponse, AIProvider } from '../types.js';

const DISCLAIMER =
  'This AI-assisted analysis is not a substitute for professional medical advice, pharmacist verification, or laboratory testing. Always consult a qualified healthcare provider before making decisions about your medications.';

/**
 * OpenAI provider adapter stub.
 * Requires OPENAI_API_KEY to be set.
 * This is a placeholder for future integration — it delegates to the rules engine
 * until a real OpenAI integration is implemented.
 */
export class OpenAIProvider implements AIProvider {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = 'gpt-4o-mini') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async analyze(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    if (!this.apiKey) {
      console.warn('[OpenAI] No API key configured. Falling back to rules-based analysis.');
      return {
        status: 'needs_verification',
        confidence: 0.3,
        suspiciousIndicators: [],
        evidence: ['OpenAI provider not configured — using fallback analysis'],
        dataSources: [],
        safetyRecommendation:
          'AI analysis is currently unavailable. Please rely on the database lookup results and consult a healthcare provider.',
        disclaimer: DISCLAIMER,
      };
    }

    // TODO: Implement real OpenAI API call
    // This would construct a system prompt with the safety rules,
    // include the OCR text, barcode data, and trusted API results,
    // then parse the structured JSON response.
    //
    // For now, return a needs_verification response
    return {
      status: 'needs_verification',
      confidence: 0.4,
      suspiciousIndicators: [
        {
          indicator: 'AI analysis pending implementation',
          severity: 'low' as const,
          explanation: 'The OpenAI integration is not yet fully implemented. Results are based on database lookups only.',
        },
      ],
      evidence: ['OpenAI provider stub — real analysis pending implementation'],
      dataSources: ['OpenAI (pending)', 'Database lookups'],
      safetyRecommendation:
        'Full AI analysis is not yet available. Please consult a pharmacist or healthcare provider for medicine verification.',
      disclaimer: DISCLAIMER,
    };
  }
}
