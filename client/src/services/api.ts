import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  AIAnalysisRequest,
  AIAnalysisResponse,
  DoctorConsultationRequest,
  DoctorConsultationResponse,
} from '@/types';

const BASE_URL = '/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options?.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Auth API
export const authApi = {
  login: (data: LoginRequest) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  register: (data: RegisterRequest) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  me: () => request<{ user: User }>('/auth/me'),
};

// AI Analysis & Doctor Assistance API
export const aiApi = {
  analyzeMedicine: (data: AIAnalysisRequest) =>
    request<AIAnalysisResponse>('/ai/analyze-medicine', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  consultDoctor: (data: DoctorConsultationRequest) =>
    request<DoctorConsultationResponse>('/ai/doctor-consultation', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Medicine API
export interface MedicineSearchResult {
  query: string;
  openfda: Array<{
    id: string;
    brand_name?: string;
    generic_name?: string;
    manufacturer_name?: string;
    active_ingredient?: string;
    dosage_form?: string;
    route?: string;
    warnings?: string;
    indications_and_usage?: string;
  }>;
  rxnorm: Array<{
    rxcui: string;
    name: string;
    tty: string;
  }>;
  suggestions: string[];
  totalResults: number;
}

export interface NDCLookupResult {
  found: boolean;
  message?: string;
  ndcCode?: string;
  ndc?: {
    product_ndc: string;
    brand_name: string;
    generic_name: string;
    labeler_name: string;
    dosage_form: string;
    route: string;
    active_ingredients: { name: string; strength: string }[];
    marketing_start_date?: string;
    marketing_end_date?: string;
  };
  openfda?: unknown[];
  recalls?: unknown[];
}

export const medicineApi = {
  search: (query: string) =>
    request<MedicineSearchResult>(`/medicine/search?q=${encodeURIComponent(query)}`),

  lookupNDC: (code: string) =>
    request<NDCLookupResult>(`/medicine/ndc/${encodeURIComponent(code)}`),

  verify: (params: { barcode?: string; name?: string }) => {
    const searchParams = new URLSearchParams();
    if (params.barcode) searchParams.set('barcode', params.barcode);
    if (params.name) searchParams.set('name', params.name);
    return request<{ found: boolean; ndc: unknown; openfda: unknown[]; recalls: unknown[] }>(
      `/medicine/verify?${searchParams.toString()}`
    );
  },

  getDetails: (rxcui: string) =>
    request<{ drug: { rxcui: string; name: string; synonym?: string; attributes: Record<string, string> } }>(
      `/medicine/details/${encodeURIComponent(rxcui)}`
    ),
};

// Interaction API
export interface InteractionResult {
  drug1: string;
  drug2: string;
  severity: string;
  description: string;
  recommendation: string;
  mechanism: string;
  source: string;
}

export interface InteractionCheckResponse {
  medicines: string[];
  overallSeverity: string;
  totalPairs: number;
  results: InteractionResult[];
  disclaimer: string;
}

export const interactionApi = {
  check: (medicines: string[]) =>
    request<InteractionCheckResponse>('/interaction/check', {
      method: 'POST',
      body: JSON.stringify({ medicines }),
    }),
};

// Addiction Risk API
export interface AddictionRiskResponse {
  found: boolean;
  medicineName: string;
  matchedAlias?: string;
  riskLevel: 'low' | 'moderate' | 'high' | 'unknown';
  drugClass?: string;
  dependencyType?: string;
  schedule?: string;
  explanation: string;
  warnings: string[];
  dataSources: string[];
  disclaimer: string;
}

export const addictionApi = {
  getRisk: (query: string) =>
    request<AddictionRiskResponse>(`/addiction/risk/${encodeURIComponent(query)}`),
};
