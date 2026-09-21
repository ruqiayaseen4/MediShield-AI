
# MediShield AI — Complete Technical Specification (v2)

## 1. Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | React 18 + TypeScript + Vite | Fast dev server, type safety, modern DX |
| **Styling** | Tailwind CSS 3 + Lucide React icons | Rapid healthcare-clean UI, responsive |
| **Routing** | React Router v6 | SPA navigation with protected routes |
| **State** | Zustand (global) + React Query (server state) | Lightweight, minimal boilerplate |
| **Forms** | React Hook Form + Zod validation | Type-safe validation with minimal code |
| **OCR** | Tesseract.js (client-side, text extraction only) | Free, no API key, runs in browser |
| **Barcode** | html5-qrcode library | Camera-based barcode scanning in browser |
| **AI Analysis** | Pluggable AI service (backend abstraction) | Configurable provider via env var |
| **Backend** | Express.js + TypeScript | Thin proxy, hides API keys, serves REST |
| **Database** | better-sqlite3 (SQLite) | Zero-config, file-based, perfect for demo |
| **Auth** | JWT (jsonwebtoken) + bcrypt | Full auth with hashed passwords |
| **HTTP** | Axios (backend) + fetch (frontend via React Query) | Reliable API calls |

## 2. Folder Structure

```
MediShield-AI/
├── client/                          # React frontend (Vite)
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── ui/                  # Button, Input, Card, Badge, Modal, Spinner
│   │   │   ├── layout/             # Header, Footer, Sidebar, PageLayout
│   │   │   ├── medicine/           # MedicineCard, MedicineImage, VerificationBadge
│   │   │   ├── interaction/        # InteractionResult, SeverityIndicator
│   │   │   └── common/             # SearchBar, FileUploader, EmptyState, ErrorState, LoadingState
│   │   ├── pages/
│   │   │   ├── Landing.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── MedicineVerification.tsx
│   │   │   ├── MedicineScanner.tsx
│   │   │   ├── DrugInteraction.tsx
│   │   │   ├── AddictionRisk.tsx
│   │   │   ├── MedicineSearch.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   └── About.tsx
│   │   ├── hooks/
│   │   ├── stores/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   ├── tsconfig.json
│   └── package.json
├── server/                          # Express backend
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts             # POST /register, POST /login, GET /me
│   │   │   ├── medicine.ts         # GET /search, GET /verify, GET /ndc/:code
│   │   │   ├── ai.ts               # POST /analyze-medicine
│   │   │   ├── interaction.ts      # POST /check
│   │   │   ├── addiction.ts        # GET /risk/:medicineId
│   │   │   └── dashboard.ts        # GET /history, POST /save, GET /saved
│   │   ├── middleware/
│   │   │   ├── auth.ts             # JWT verification middleware
│   │   │   └── errorHandler.ts
│   │   ├── services/
│   │   │   ├── openfda.ts          # OpenFDA drug API wrapper
│   │   │   ├── rxnorm.ts           # NLM RxNorm API wrapper
│   │   │   ├── ndc.ts              # FDA National Drug Code lookup
│   │   │   ├── ai/                 # AI analysis service (pluggable)
│   │   │   │   ├── types.ts        # AI request/response interfaces
│   │   │   │   ├── analyzer.ts     # Main AI analyzer orchestrator
│   │   │   │   ├── rulesEngine.ts  # Built-in rule-based analysis (no AI key needed)
│   │   │   │   └── providers/      # Provider adapters (swap via env var)
│   │   │   │       ├── openai.ts   # OpenAI adapter (optional, future)
│   │   │   │       └── mock.ts     # Mock provider for dev/demo
│   │   │   └── db.ts               # SQLite database helper
│   │   ├── data/
│   │   │   ├── interactions.json   # Curated drug interaction pairs (seed data)
│   │   │   └── suspiciousPatterns.json  # Known suspicious packaging patterns
│   │   ├── index.ts                # Express app entry
│   │   └── config.ts               # Env vars, CORS, port
│   ├── package.json
│   └── tsconfig.json
├── .env.example
├── .gitignore
├── package.json                     # Root workspace (concurrently runs both)
└── README.md
```

## 3. AI Analysis Service Architecture

### 3.1 Design Principles

- **Tesseract.js is OCR only.** It extracts raw text from images. It does NOT analyze, classify, or detect fakes.
- **AI analysis runs server-side.** The backend receives OCR text + barcode data + trusted API results and produces structured analysis.
- **Pluggable providers.** The `AI_PROVIDER` env var selects the analysis engine at startup. Swapping providers requires zero frontend changes.
- **Built-in rules engine works out of the box.** No API key needed for the demo. The rules engine checks against known suspicious patterns, trusted data mismatches, and heuristics.

### 3.2 AI Service Interfaces (`server/src/services/ai/types.ts`)

```typescript
interface AIAnalysisRequest {
  ocrText?: string;                    // Raw text extracted by Tesseract.js
  barcodeData?: string;                // Scanned barcode/NDC code
  identifiedMedicine?: {               // Medicine identified via OpenFDA/RxNorm/NDC
    name: string;
    ndcCode?: string;
    activeIngredient?: string;
    manufacturer?: string;
    dosageForm?: string;
  };
  trustedData?: {                      // Data from trusted APIs
    openfdaResults?: any[];
    rxnormData?: any;
    ndcMatch?: any;
  };
  analysisType: 'verification' | 'suspicious_detection';
}

interface AIAnalysisResponse {
  status: 'verified' | 'not_found' | 'needs_verification' | 'suspicious';
  confidence: number;                  // 0.0 to 1.0
  suspiciousIndicators: {
    indicator: string;
    severity: 'low' | 'medium' | 'high';
    explanation: string;
  }[];
  evidence: string[];                  // What evidence was found
  dataSources: string[];               // Which APIs/sources were consulted
  safetyRecommendation: string;        // Actionable safety advice
  disclaimer: string;                  // Always present
}
```

### 3.3 Provider Selection (`analyzer.ts`)

```
AI_PROVIDER env var value:
  "rules"  --> rulesEngine.ts (built-in, no API key, default)
  "mock"   --> providers/mock.ts (returns canned responses for testing)
  "openai" --> providers/openai.ts (requires OPENAI_API_KEY, future use)
```

The orchestrator in `analyzer.ts` reads `process.env.AI_PROVIDER`, instantiates the correct provider, and delegates the analysis. All providers return the same `AIAnalysisResponse` shape.

### 3.4 Rules Engine (`rulesEngine.ts`)

The built-in rules engine performs deterministic checks:
- Compare OCR text against known medicine name/ingredients from trusted APIs
- Check for missing required label elements (lot number, expiry, manufacturer)
- Detect misspellings of known drug names
- Flag manufacturer name mismatches against NDC database
- Check dosage form consistency
- Cross-reference against `suspiciousPatterns.json`
- Always includes disclaimer: "AI-assisted analysis cannot replace laboratory or pharmacist verification"

### 3.5 Route

```
POST /api/ai/analyze-medicine  (JWT-protected)
  Body: AIAnalysisRequest
  Response: AIAnalysisResponse
```

This route is called by the frontend after OCR extraction and trusted API lookups are complete. The frontend sends the combined data; the backend runs the configured AI provider and returns structured results.

## 4. API / Data Source Strategy

### 4.1 Free APIs for Hackathon

| API | Use Case | Auth | Rate Limit | Cost |
|-----|----------|------|------------|------|
| **OpenFDA Drug API** | Drug label search, adverse events, recalls | No key needed | 240 req/min | Free |
| **NLM RxNorm** | Normalized drug names, ingredient lookup | No key needed | Generous | Free |
| **FDA National Drug Code (NDC)** | Barcode/NDC code to drug mapping | No key needed | Generous | Free |
| **DailyMed (NLM)** | Structured product labeling (SPL) | No key needed | Generous | Free |
| **Tesseract.js** | OCR text extraction only (client-side) | None | N/A | Free |
| **html5-qrcode** | Barcode scanning via camera (client-side) | None | N/A | Free |
| **AI Rules Engine** | Built-in analysis (server-side) | None | N/A | Free |

### 4.2 Backend API Routes

```
POST   /api/auth/register       -> Create user (bcrypt hash)
POST   /api/auth/login          -> Return JWT
GET    /api/auth/me              -> Current user (JWT required)

GET    /api/medicine/search?q=   -> Proxy to OpenFDA + RxNorm search
GET    /api/medicine/verify      -> NDC/OpenFDA lookup + AI analysis
GET    /api/medicine/ndc/:code   -> NDC code lookup

POST   /api/ai/analyze-medicine  -> AI-assisted medicine analysis (pluggable provider)

POST   /api/interaction/check   -> Check drug interactions (RxNorm + curated data)

GET    /api/addiction/risk/:id   -> Dependency risk from DailyMed + curated data

GET    /api/dashboard/history   -> User's scan/check history (SQLite)
POST   /api/dashboard/save      -> Save a medicine to user's list
GET    /api/dashboard/saved     -> Get user's saved medicines
DELETE /api/dashboard/saved/:id  -> Remove saved medicine
```

### 4.3 Curated / Seed Data

- `interactions.json`: ~50-100 well-known drug interaction pairs with severity levels
- `suspiciousPatterns.json`: Known red-flag packaging patterns (missing lot numbers, common misspellings, suspicious manufacturer claims, missing regulatory text)

## 5. Database Schema (SQLite)

Unchanged from original plan. Five tables: `users`, `scan_history`, `interaction_history`, `saved_medicines`, `safety_alerts`. See original spec for full CREATE TABLE statements.

## 6. UI / Page Design

### 6.1 Design System

- **Primary**: Teal (#0D9488), **Secondary**: Blue (#2563EB)
- **Danger**: Red (#DC2626), **Warning**: Amber (#D97706), **Success**: Green (#16A34A)
- **Background**: Slate-50 (#F8FAFC), **Typography**: Inter
- **Layout**: Sidebar on desktop, bottom tab bar on mobile

### 6.2 Page Specifications

| Page | Route | Auth | Key Components |
|------|-------|------|---------------|
| **Landing** | `/` | No | Hero, feature cards, CTA, trust badges |
| **Login** | `/login` | No | Email/password form |
| **Register** | `/register` | No | Name/email/password form |
| **Medicine Verification** | `/verify` | Yes | Image upload, OCR preview, barcode input, AI analysis result card |
| **Medicine Scanner** | `/scanner` | Yes | Camera viewfinder, barcode detection, auto-lookup |
| **Drug Interaction** | `/interactions` | Yes | Multi-medicine selector, severity result cards |
| **Addiction Risk** | `/addiction-risk` | Yes | Medicine search, risk level card |
| **Medicine Search** | `/search` | Yes | Search bar + autocomplete, medicine detail |
| **Dashboard** | `/dashboard` | Yes | Recent scans, interactions, saved medicines, alerts |
| **About/Safety** | `/about` | No | Purpose, data sources, medical disclaimer |

### 6.3 Safety Disclaimers

Every analysis result page displays:
> "This tool provides AI-assisted analysis and is not a substitute for professional medical advice, pharmacist verification, or laboratory testing. Always consult a qualified healthcare provider."

## 7. Component Architecture

```
App
├── Layout (Header + Sidebar/BottomNav + Footer)
│   ├── ProtectedRoute (checks JWT)
│   │   ├── Dashboard
│   │   ├── MedicineVerification
│   │   │   ├── FileUploader
│   │   │   ├── OcrPreview (Tesseract.js text extraction progress + raw text)
│   │   │   ├── BarcodeInput
│   │   │   └── VerificationResult (AI analysis: status badge + indicators + disclaimer)
│   │   ├── MedicineScanner
│   │   │   ├── CameraViewfinder (html5-qrcode)
│   │   │   └── ScanResult
│   │   ├── DrugInteraction
│   │   │   ├── MedicineSelector (multi-select autocomplete)
│   │   │   └── InteractionResults (severity cards + explanations)
│   │   ├── AddictionRisk
│   │   │   ├── MedicineSearchInput
│   │   │   └── RiskAssessment (level indicator + explanation)
│   │   ├── MedicineSearch
│   │   │   ├── SearchBar
│   │   │   └── MedicineDetail (tabs: Info, Interactions, Warnings)
│   │   └── UserDashboard
│   │       ├── RecentScans
│   │       ├── RecentInteractions
│   │       ├── SavedMedicines
│   │       └── SafetyAlerts
│   └── PublicRoutes
│       ├── Landing
│       ├── Login / Register
│       └── About
```

## 8. Safety and Ethics Rules (Hardcoded)

1. **Never claim a medicine is definitely fake.** Status: `verified`, `not_found`, `needs_verification`, `suspicious`. Never `confirmed_fake`.
2. **Never invent interactions.** If no data found: "No reliable interaction data available."
3. **Never diagnose.** Addiction risk shows known pharmacological profiles only.
4. **Always show disclaimers** on any analysis result.
5. **Confidence levels** always displayed alongside AI results.
6. **Data source attribution** shown for every piece of medicine information.
7. **AI provider is transparent.** The response always lists which data sources were consulted.

## 9. Environment Variables

```env
# .env.example
PORT=3001
JWT_SECRET=your-secret-key-here
DATABASE_PATH=./data/medishield.db

# AI Analysis Service Configuration
AI_PROVIDER=rules              # 'rules' (built-in), 'mock' (dev), or 'openai' (future)
AI_PROVIDER_TIMEOUT_MS=15000   # Max wait time for AI provider response

# Optional AI provider keys (only needed when AI_PROVIDER=openai)
# OPENAI_API_KEY=
# OPENAI_MODEL=gpt-4o-mini
```

No frontend environment variables are needed. All external API calls and AI analysis go through the backend.

## 10. Phased Implementation Plan

### Phase 1: Project Scaffolding and Auth (Foundation)
- Initialize Vite + React + TypeScript in `client/`
- Initialize Express + TypeScript in `server/`
- Set up Tailwind CSS with healthcare design tokens
- Create root `package.json` with `concurrently`
- Build SQLite database initialization (`db.ts`) with all 5 tables
- Implement auth routes: register, login, me
- Create JWT middleware
- Build Login/Register pages with Zod validation
- Create ProtectedRoute component
- Build Layout (Header, Sidebar, responsive navigation)
- Set up `.env.example` with all config including AI settings

### Phase 2: Medicine Search, Verification and AI Analysis (Core Features)
- Build OpenFDA + RxNorm + NDC service wrappers in backend
- Implement `GET /api/medicine/search` endpoint
- Build MedicineSearch page with autocomplete
- Build MedicineDetail component
- Build AI service abstraction (`server/src/services/ai/`):
  - Define interfaces in `types.ts`
  - Implement `rulesEngine.ts` (built-in, no API key)
  - Implement `mock.ts` provider for dev
  - Implement `openai.ts` adapter stub for future
  - Implement `analyzer.ts` orchestrator
  - Create `suspiciousPatterns.json` seed data
- Implement `POST /api/ai/analyze-medicine` route
- Implement `GET /api/medicine/verify` (combines API lookup + AI analysis)
- Integrate Tesseract.js for client-side OCR (text extraction only)
- Integrate html5-qrcode for barcode scanning
- Build MedicineVerification page (upload + OCR + AI result)
- Build MedicineScanner page (camera + barcode)
- Implement NDC code lookup endpoint

### Phase 3: Drug Interactions and Addiction Risk (Safety Features)
- Create `interactions.json` seed data (~50-100 pairs)
- Build interaction check endpoint (RxNorm + curated data)
- Build DrugInteraction page with multi-select + results
- Build addiction risk endpoint (DailyMed + curated profiles)
- Build AddictionRisk page
- Implement severity indicators and risk level visualizations

### Phase 4: Dashboard and History (User Experience)
- Implement scan_history, interaction_history, saved_medicines tables
- Build dashboard API endpoints (history, save, saved, delete)
- Build Dashboard page with all four sections
- Implement safety alerts system
- Connect all analysis pages to save results to history

### Phase 5: Polish and Landing (Final)
- Build Landing page with hero, features, trust badges
- Build About/Safety page with disclaimers and data source info
- Add loading skeletons, empty states, error states everywhere
- Responsive testing and fixes
- Add global error boundary
- Final disclaimer audit on all result pages
- README with setup instructions

## 11. Risks and Limitations

| Risk | Impact | Mitigation |
|------|--------|------------|
| OpenFDA/RxNorm API downtime | Search/verify fails | Curated fallback data for common drugs |
| OCR accuracy on medicine packaging | Wrong medicine identified | Show extracted text for user confirmation, confidence score |
| Barcode not in NDC database | Medicine not found | Show "not found" with manual search fallback |
| Limited interaction data | False safety assurance | Always state data limitations |
| SQLite concurrency limits | Performance under load | Acceptable for demo |
| Tesseract.js performance | Slow OCR in browser | Progress bar, manual entry fallback |
| AI rules engine coverage | Misses novel fakes | Disclaimer + "needs verification" status for low confidence |

## 12. Scripts

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:client": "cd client && npm run dev",
    "dev:server": "cd server && npm run dev",
    "build": "cd client && npm run build && cd ../server && npm run build",
    "install:all": "npm install && cd client && npm install && cd ../server && npm install"
  }
}
```
