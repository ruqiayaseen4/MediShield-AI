import type { AIAnalysisRequest, AIAnalysisResponse, SuspiciousIndicator, AIProvider } from './types.js';
import suspiciousPatterns from '../../data/suspiciousPatterns.json' with { type: 'json' };

const DISCLAIMER =
  'This AI-assisted analysis is not a substitute for professional medical advice, pharmacist verification, or laboratory testing. Always consult a qualified healthcare provider before making decisions about your medications.';

/**
 * Built-in rules engine for medicine analysis.
 * Performs deterministic checks against known suspicious patterns
 * and trusted data mismatches. No external AI key required.
 */
export class RulesEngine implements AIProvider {
  async analyze(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    const indicators: SuspiciousIndicator[] = [];
    const evidence: string[] = [];
    const dataSources: string[] = [];

    // 1. Check if trusted data was available
    if (request.trustedData?.openfdaResults?.length) {
      dataSources.push('OpenFDA Drug Label Database');
      evidence.push(`Found ${request.trustedData.openfdaResults.length} matching drug label(s) in OpenFDA`);
    }
    if (request.trustedData?.rxnormData) {
      dataSources.push('NLM RxNorm');
      evidence.push('Matched drug concept in RxNorm database');
    }
    if (request.trustedData?.ndcMatch) {
      dataSources.push('FDA National Drug Code');
      evidence.push('Matched product in NDC directory');
    }

    // 2. Analyze OCR text against trusted data
    if (request.ocrText && request.trustedData) {
      this.checkOcrAgainstTrustedData(request, indicators, evidence);
    }

    // 3. Check for missing required label elements in OCR text
    if (request.ocrText) {
      this.checkMissingLabelElements(request.ocrText, indicators);
    }

    // 4. Check against suspicious patterns database
    if (request.ocrText) {
      this.checkSuspiciousPatterns(request.ocrText, indicators);
    }

    // 5. If no trusted data found at all
    if (dataSources.length === 0 && !request.barcodeData) {
      evidence.push('No matching records found in any trusted database');
    }

    // Determine status and confidence
    const { status, confidence } = this.determineStatus(indicators, dataSources, request);

    // Generate safety recommendation
    const safetyRecommendation = this.generateRecommendation(status, indicators);

    return {
      status,
      confidence,
      suspiciousIndicators: indicators,
      evidence,
      dataSources,
      safetyRecommendation,
      disclaimer: DISCLAIMER,
    };
  }

  private checkOcrAgainstTrustedData(
    request: AIAnalysisRequest,
    indicators: SuspiciousIndicator[],
    evidence: string[]
  ): void {
    const ocrLower = (request.ocrText || '').toLowerCase();

    // Check if the identified medicine name appears in OCR text
    if (request.identifiedMedicine?.name) {
      const medName = request.identifiedMedicine.name.toLowerCase();
      if (ocrLower.includes(medName)) {
        evidence.push(`Medicine name "${request.identifiedMedicine.name}" found in package text`);
      } else {
        indicators.push({
          indicator: 'Medicine name not found on packaging',
          severity: 'high',
          explanation: `The expected medicine name "${request.identifiedMedicine.name}" was not detected in the text extracted from the packaging. This could indicate a labeling discrepancy.`,
        });
      }
    }

    // Check manufacturer match
    if (request.identifiedMedicine?.manufacturer) {
      const mfrLower = request.identifiedMedicine.manufacturer.toLowerCase();
      const mfrWords = mfrLower.split(/\s+/).filter((w) => w.length > 3);
      const mfrFound = mfrWords.some((word) => ocrLower.includes(word));
      if (mfrFound) {
        evidence.push(`Manufacturer "${request.identifiedMedicine.manufacturer}" detected in packaging text`);
      } else {
        indicators.push({
          indicator: 'Manufacturer name mismatch',
          severity: 'medium',
          explanation: `The expected manufacturer "${request.identifiedMedicine.manufacturer}" was not found in the packaging text. This may indicate a different manufacturer or a labeling issue.`,
        });
      }
    }

    // Check active ingredient mention
    if (request.identifiedMedicine?.activeIngredient) {
      const ingredientLower = request.identifiedMedicine.activeIngredient.toLowerCase();
      if (ocrLower.includes(ingredientLower)) {
        evidence.push(`Active ingredient "${request.identifiedMedicine.activeIngredient}" confirmed in packaging text`);
      }
    }
  }

  private checkMissingLabelElements(ocrText: string, indicators: SuspiciousIndicator[]): void {
    const lower = ocrText.toLowerCase();
    const requiredElements = [
      { name: 'lot/batch number', patterns: [/lot\s*[:#]?\s*\w+/i, /batch\s*[:#]?\s*\w+/i, /lot\s*no/i] },
      { name: 'expiry date', patterns: [/exp/i, /expir/i, /expiry/i, /expiration/i] },
      { name: 'manufacturer info', patterns: [/manufactured\s*by/i, /mfg/i, /distributed\s*by/i, /made\s*by/i] },
      { name: 'dosage/strength', patterns: [/\d+\s*mg/i, /\d+\s*ml/i, /\d+\s*mcg/i, /\d+\s*units?/i] },
    ];

    const missingElements: string[] = [];
    for (const elem of requiredElements) {
      const found = elem.patterns.some((p) => p.test(lower));
      if (!found) {
        missingElements.push(elem.name);
      }
    }

    if (missingElements.length >= 3) {
      indicators.push({
        indicator: 'Multiple required label elements missing',
        severity: 'high',
        explanation: `The following standard label elements were not detected: ${missingElements.join(', ')}. Legitimate medicine packages typically include all of these elements.`,
      });
    } else if (missingElements.length >= 1) {
      indicators.push({
        indicator: 'Some label elements missing',
        severity: 'low',
        explanation: `The following elements were not detected: ${missingElements.join(', ')}. This may be normal depending on the packaging format, but warrants attention.`,
      });
    }
  }

  private checkSuspiciousPatterns(ocrText: string, indicators: SuspiciousIndicator[]): void {
    const lower = ocrText.toLowerCase();

    for (const pattern of suspiciousPatterns.patterns) {
      const regex = new RegExp(pattern.regex, 'i');
      if (regex.test(lower)) {
        indicators.push({
          indicator: pattern.indicator,
          severity: pattern.severity as 'low' | 'medium' | 'high',
          explanation: pattern.explanation,
        });
      }
    }
  }

  private checkImageValidity(request: AIAnalysisRequest): { isNonMedicine: boolean; reason?: string } {
    const text = (request.ocrText || '').toLowerCase();

    // Human photo keywords
    const humanKeywords = ['face', 'person', 'selfie', 'portrait', 'human', 'man', 'woman', 'child', 'boy', 'girl', 'headshot', 'photo of a person'];
    const hasHumanKeyword = humanKeywords.some((kw) => text.includes(kw));

    // Common medical keywords
    const medicalKeywords = [
      'mg', 'ml', 'tablet', 'tablets', 'capsule', 'capsules', 'exp', 'lot', 'ndc',
      'rx', 'usp', 'fda', 'pharma', 'laboratories', 'pharmaceutical', 'bottle', 'syrup',
      'dose', 'dosage', 'daily', 'take', 'ointment', 'cream', 'drops', 'solution',
      'active ingredient', 'ingredients', 'warnings', 'keep out of reach', 'store at', 'hcl',
      'sodium', 'potassium', 'calcium', 'acid', 'hydrochloride', 'paracetamol', 'aspirin',
      'ibuprofen', 'amoxicillin', 'omeprazole', 'metformin', 'atorvastatin', 'lisinopril',
    ];

    const hasMedicalKeyword = medicalKeywords.some((kw) => text.includes(kw));

    // If user uploaded an image but it's a human photo or zero medical text/keywords
    if (hasHumanKeyword || (request.imageData && !hasMedicalKeyword && !request.barcodeData && !request.identifiedMedicine)) {
      return {
        isNonMedicine: true,
        reason: 'Human / Non-Medicine Image Detected. The uploaded photo appears to contain a person, face, or non-pharmaceutical subject rather than a medicine box, bottle, pill strip, or label.',
      };
    }

    return { isNonMedicine: false };
  }

  private determineStatus(
    indicators: SuspiciousIndicator[],
    dataSources: string[],
    request: AIAnalysisRequest
  ): { status: AIAnalysisResponse['status']; confidence: number } {
    // Check if uploaded image is non-medicine or human image
    const imgCheck = this.checkImageValidity(request);
    if (imgCheck.isNonMedicine) {
      indicators.push({
        indicator: 'Human / Non-Medicine Image Detected',
        severity: 'high',
        explanation: imgCheck.reason || 'The uploaded image does not contain a recognizable pharmaceutical package or label.',
      });
      return { status: 'invalid_image', confidence: 0.95 };
    }

    const highSeverity = indicators.filter((i) => i.severity === 'high').length;
    const mediumSeverity = indicators.filter((i) => i.severity === 'medium').length;

    // No trusted data and no input data
    if (!request.ocrText && !request.barcodeData && !request.identifiedMedicine && !request.imageData) {
      return { status: 'not_found', confidence: 0.0 };
    }

    // Multiple high-severity indicators
    if (highSeverity >= 2 || (highSeverity >= 1 && mediumSeverity >= 2)) {
      return { status: 'suspicious', confidence: Math.min(0.85, 0.5 + highSeverity * 0.15) };
    }

    // Some concerns but not conclusive
    if (highSeverity >= 1 || mediumSeverity >= 2) {
      return { status: 'needs_verification', confidence: 0.4 + mediumSeverity * 0.1 };
    }

    // Trusted data found with no concerns
    if (dataSources.length >= 2 && indicators.length === 0) {
      return { status: 'verified', confidence: 0.85 };
    }

    // Some trusted data found
    if (dataSources.length >= 1 && indicators.length === 0) {
      return { status: 'verified', confidence: 0.7 };
    }

    // Insufficient data for verification
    return { status: 'needs_verification', confidence: 0.3 };
  }

  private generateRecommendation(
    status: AIAnalysisResponse['status'],
    indicators: SuspiciousIndicator[]
  ): string {
    switch (status) {
      case 'verified':
        return 'The medicine information is consistent with trusted database records. No suspicious indicators were detected. However, this analysis does not guarantee authenticity — always purchase medicines from licensed pharmacies.';
      case 'suspicious':
        return `Multiple concerning indicators were found. We strongly recommend NOT using this medicine until it has been verified by a pharmacist or the manufacturer directly. ${
          indicators.length > 0
            ? `Key concerns: ${indicators.filter((i) => i.severity === 'high').map((i) => i.indicator).join(', ')}.`
            : ''
        } Contact your pharmacist or local health authority for further investigation.`;
      case 'needs_verification':
        return 'Some information could not be fully confirmed through automated analysis. We recommend having a pharmacist or healthcare provider review this medicine before use. Consider contacting the manufacturer to verify authenticity.';
      case 'invalid_image':
      case 'non_medicine':
        return 'Human or non-medicine photo detected. Please upload a clear photo of your medicine package, bottle label, pill strip, or prescription box so MediShield AI can verify its contents.';
      case 'not_found':
        return 'Insufficient information was available to analyze this medicine. Please try uploading a clearer image, entering a barcode/NDC code, or searching for the medicine by name.';
    }
  }
}
