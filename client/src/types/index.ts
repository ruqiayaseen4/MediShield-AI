// Auth types
export interface User {
  id: number;
  name: string;
  email: string;
  created_at?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

// Medicine types
export interface Medicine {
  name: string;
  ndcCode?: string;
  activeIngredient?: string;
  manufacturer?: string;
  dosageForm?: string;
  route?: string;
  brandName?: string;
}

// AI Analysis types
export interface AIAnalysisRequest {
  ocrText?: string;
  barcodeData?: string;
  imageData?: string;
  identifiedMedicine?: Medicine;
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

// Scan history
export interface ScanRecord {
  id: number;
  user_id: number;
  medicine_name: string | null;
  ndc_code: string | null;
  scan_type: 'image' | 'barcode' | 'manual';
  status: 'verified' | 'not_found' | 'needs_verification' | 'suspicious';
  ocr_text: string | null;
  result_json: string | null;
  confidence: number | null;
  created_at: string;
}

// Interaction types
export interface InteractionResult {
  drug1: string;
  drug2: string;
  severity: 'none' | 'mild' | 'moderate' | 'severe' | 'unknown';
  description: string;
  recommendation: string;
  source: string;
}

export interface InteractionHistoryRecord {
  id: number;
  user_id: number;
  medicines_json: string;
  severity: 'none' | 'mild' | 'moderate' | 'severe' | 'unknown';
  result_json: string | null;
  created_at: string;
}

// Saved medicine
export interface SavedMedicine {
  id: number;
  user_id: number;
  medicine_name: string;
  ndc_code: string | null;
  active_ingredient: string | null;
  manufacturer: string | null;
  notes: string | null;
  created_at: string;
}

// Safety alert
export interface SafetyAlert {
  id: number;
  user_id: number;
  alert_type: string;
  title: string;
  message: string;
  is_read: number;
  created_at: string;
}

// Addiction risk
export interface AddictionRiskResult {
  medicineName: string;
  riskLevel: 'low' | 'moderate' | 'high' | 'unknown';
  explanation: string;
  dependencyType: string;
  warnings: string[];
  dataSources: string[];
  disclaimer: string;
}

// API error
export interface ApiError {
  error: string;
  details?: Record<string, unknown>;
}
