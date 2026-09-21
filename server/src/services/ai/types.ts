export interface AIAnalysisRequest {
  ocrText?: string;
  barcodeData?: string;
  imageData?: string;
  identifiedMedicine?: {
    name: string;
    ndcCode?: string;
    activeIngredient?: string;
    manufacturer?: string;
    dosageForm?: string;
  };
  trustedData?: {
    openfdaResults?: Record<string, unknown>[];
    rxnormData?: Record<string, unknown>;
    ndcMatch?: Record<string, unknown>;
  };
  analysisType: 'verification' | 'suspicious_detection';
}

export interface SuspiciousIndicator {
  indicator: string;
  severity: 'low' | 'medium' | 'high';
  explanation: string;
}

export interface AIAnalysisResponse {
  status: 'verified' | 'not_found' | 'needs_verification' | 'suspicious' | 'invalid_image' | 'non_medicine';
  confidence: number;
  suspiciousIndicators: SuspiciousIndicator[];
  evidence: string[];
  dataSources: string[];
  safetyRecommendation: string;
  disclaimer: string;
}

export interface DoctorConsultationRequest {
  medicineName?: string;
  userQuery: string;
  harmfulReason?: string;
  interactionDetails?: string;
  addictionRisk?: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
}

export interface DoctorConsultationResponse {
  reply: string;
  medicalDisclaimer: string;
  urgencyLevel: 'normal' | 'caution' | 'emergency';
  suggestedActions: string[];
}

export interface AIProvider {
  analyze(request: AIAnalysisRequest): Promise<AIAnalysisResponse>;
}

