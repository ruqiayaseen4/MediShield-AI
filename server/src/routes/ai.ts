import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.js';
import { analyzeMedicine } from '../services/ai/analyzer.js';
import { consultDoctor } from '../services/ai/doctorAssistant.js';
import type { AIAnalysisRequest, DoctorConsultationRequest } from '../services/ai/types.js';

export const aiRouter = Router();

// All AI routes require authentication
aiRouter.use(authenticate);

/**
 * POST /api/ai/analyze-medicine
 * Run AI-assisted analysis on medicine data or uploaded image.
 * Body: AIAnalysisRequest
 */
aiRouter.post('/analyze-medicine', async (req: Request, res: Response) => {
  try {
    const body = req.body as Partial<AIAnalysisRequest>;

    // Validate required fields
    if (!body.analysisType) {
      res.status(400).json({ error: 'analysisType is required (verification | suspicious_detection)' });
      return;
    }

    if (!['verification', 'suspicious_detection'].includes(body.analysisType)) {
      res.status(400).json({ error: 'analysisType must be "verification" or "suspicious_detection"' });
      return;
    }

    // Must have at least some input data
    if (!body.ocrText && !body.barcodeData && !body.imageData && !body.identifiedMedicine && !body.trustedData) {
      res.status(400).json({ error: 'At least one of ocrText, barcodeData, imageData, identifiedMedicine, or trustedData is required' });
      return;
    }

    const request: AIAnalysisRequest = {
      ocrText: body.ocrText,
      barcodeData: body.barcodeData,
      imageData: body.imageData,
      identifiedMedicine: body.identifiedMedicine,
      trustedData: body.trustedData,
      analysisType: body.analysisType,
    };

    const result = await analyzeMedicine(request);
    res.json(result);
  } catch (err) {
    console.error('[AI] Analyze error:', err);
    res.status(500).json({ error: 'AI analysis failed' });
  }
});

/**
 * POST /api/ai/doctor-consultation
 * Consult the Online AI Doctor Assistant regarding harmful, suspicious, or risky medicines.
 * Body: DoctorConsultationRequest
 */
aiRouter.post('/doctor-consultation', async (req: Request, res: Response) => {
  try {
    const body = req.body as Partial<DoctorConsultationRequest>;

    if (!body.userQuery || typeof body.userQuery !== 'string') {
      res.status(400).json({ error: 'userQuery is required' });
      return;
    }

    const request: DoctorConsultationRequest = {
      medicineName: body.medicineName,
      userQuery: body.userQuery,
      harmfulReason: body.harmfulReason,
      interactionDetails: body.interactionDetails,
      addictionRisk: body.addictionRisk,
      history: body.history,
    };

    const response = await consultDoctor(request);
    res.json(response);
  } catch (err) {
    console.error('[AI Doctor] Consultation error:', err);
    res.status(500).json({ error: 'Doctor consultation failed' });
  }
});

