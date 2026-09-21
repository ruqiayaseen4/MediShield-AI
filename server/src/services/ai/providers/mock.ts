import type { AIAnalysisRequest, AIAnalysisResponse, AIProvider } from '../types.js';

const DISCLAIMER =
  'This AI-assisted analysis is not a substitute for professional medical advice, pharmacist verification, or laboratory testing. Always consult a qualified healthcare provider before making decisions about your medications.';

/**
 * Mock AI provider for development and demo purposes.
 * Returns canned responses based on the input to simulate AI analysis.
 */
export class MockProvider implements AIProvider {
  async analyze(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    const hasOcr = !!request.ocrText;
    const hasBarcode = !!request.barcodeData;
    const hasTrusted = !!(
      request.trustedData?.openfdaResults?.length ||
      request.trustedData?.ndcMatch ||
      request.trustedData?.rxnormData
    );

    // Simulate different scenarios
    if (hasTrusted && hasBarcode) {
      return {
        status: 'verified',
        confidence: 0.9,
        suspiciousIndicators: [],
        evidence: [
          'Barcode matched in NDC database',
          'Drug label found in OpenFDA',
          'Medicine information is consistent across sources',
        ],
        dataSources: ['FDA NDC', 'OpenFDA', 'RxNorm'],
        safetyRecommendation:
          'The medicine information is consistent with trusted database records. Always purchase from licensed pharmacies.',
        disclaimer: DISCLAIMER,
      };
    }

    if (hasTrusted && hasOcr) {
      return {
        status: 'needs_verification',
        confidence: 0.6,
        suspiciousIndicators: [
          {
            indicator: 'Partial text match',
            severity: 'low' as const,
            explanation: 'Some text elements from the packaging match trusted records, but a complete match could not be confirmed.',
          },
        ],
        evidence: [
          'Drug found in trusted databases',
          'OCR text partially matches expected label content',
        ],
        dataSources: ['OpenFDA', 'RxNorm'],
        safetyRecommendation:
          'Partial verification achieved. Consider having a pharmacist review the medicine for complete assurance.',
        disclaimer: DISCLAIMER,
      };
    }

    if (!hasTrusted) {
      return {
        status: 'not_found',
        confidence: 0.2,
        suspiciousIndicators: [],
        evidence: ['No matching records found in trusted databases'],
        dataSources: hasOcr ? ['OCR text analysis only'] : [],
        safetyRecommendation:
          'The medicine could not be verified through available databases. Please consult a pharmacist or try a different search method.',
        disclaimer: DISCLAIMER,
      };
    }

    return {
      status: 'needs_verification',
      confidence: 0.4,
      suspiciousIndicators: [],
      evidence: ['Limited data available for analysis'],
      dataSources: ['Partial database match'],
      safetyRecommendation:
        'Insufficient data for full verification. Please consult a healthcare provider.',
      disclaimer: DISCLAIMER,
    };
  }
}
