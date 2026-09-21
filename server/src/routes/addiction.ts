import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.js';
import addictionProfiles from '../data/addictionProfiles.json' with { type: 'json' };

export const addictionRouter = Router();

addictionRouter.use(authenticate);

interface AddictionProfile {
  medicineName: string;
  aliases: string[];
  riskLevel: 'low' | 'moderate' | 'high' | 'unknown';
  drugClass: string;
  dependencyType: string;
  schedule: string;
  explanation: string;
  warnings: string[];
}

const profiles: AddictionProfile[] = addictionProfiles.profiles as AddictionProfile[];

const DISCLAIMER =
  'This dependency risk information is based on publicly available pharmacology data and controlled substance schedules. It is NOT personalized medical advice. Always consult a qualified healthcare provider regarding medication risks.';

/**
 * GET /api/addiction/risk/:query
 * Look up addiction/dependency risk for a medicine
 */
addictionRouter.get('/risk/:query', async (req: Request, res: Response) => {
  try {
    const query = String(req.params.query).toLowerCase().trim();

    if (!query || query.length < 2) {
      res.status(400).json({ error: 'Medicine name must be at least 2 characters' });
      return;
    }

    // Search profiles
    const profile = profiles.find(
      (p) =>
        p.medicineName === query ||
        p.aliases.some((a) => a === query)
    );

    if (!profile) {
      // Try partial match
      const partialMatch = profiles.find(
        (p) =>
          p.medicineName.includes(query) ||
          p.aliases.some((a) => a.includes(query))
      );

      if (partialMatch) {
        res.json({
          found: true,
          medicineName: partialMatch.medicineName,
          matchedAlias: partialMatch.medicineName !== query ? partialMatch.medicineName : undefined,
          riskLevel: partialMatch.riskLevel,
          drugClass: partialMatch.drugClass,
          dependencyType: partialMatch.dependencyType,
          schedule: partialMatch.schedule,
          explanation: partialMatch.explanation,
          warnings: partialMatch.warnings,
          dataSources: ['MediShield Curated Dependency Database', 'US DEA Controlled Substances Schedules'],
          disclaimer: DISCLAIMER,
        });
        return;
      }

      // Not found
      res.json({
        found: false,
        medicineName: query,
        riskLevel: 'unknown' as const,
        explanation: `No dependency risk profile found for "${query}" in our database. This does not mean the medicine has no dependency risk — it may simply not be in our curated dataset.`,
        warnings: [
          'Absence of a risk profile does not mean absence of risk.',
          'Consult a pharmacist or healthcare provider for dependency information.',
        ],
        dataSources: [],
        disclaimer: DISCLAIMER,
      });
      return;
    }

    res.json({
      found: true,
      medicineName: profile.medicineName,
      matchedAlias: profile.medicineName !== query ? profile.medicineName : undefined,
      riskLevel: profile.riskLevel,
      drugClass: profile.drugClass,
      dependencyType: profile.dependencyType,
      schedule: profile.schedule,
      explanation: profile.explanation,
      warnings: profile.warnings,
      dataSources: ['MediShield Curated Dependency Database', 'US DEA Controlled Substances Schedules'],
      disclaimer: DISCLAIMER,
    });
  } catch (err) {
    console.error('[Addiction] Risk lookup error:', err);
    res.status(500).json({ error: 'Addiction risk lookup failed' });
  }
});
