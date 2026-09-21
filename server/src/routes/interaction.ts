import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.js';
import interactionsData from '../data/interactions.json' with { type: 'json' };

export const interactionRouter = Router();

interactionRouter.use(authenticate);

interface InteractionPair {
  drug1: string;
  drug1Aliases: string[];
  drug2: string;
  drug2Aliases: string[];
  severity: 'none' | 'mild' | 'moderate' | 'severe';
  description: string;
  recommendation: string;
  mechanism: string;
}

const curatedInteractions: InteractionPair[] = interactionsData.interactions as InteractionPair[];

/**
 * POST /api/interaction/check
 * Body: { medicines: string[] }
 * Check drug interactions using curated data
 */
interactionRouter.post('/check', async (req: Request, res: Response) => {
  try {
    const { medicines } = req.body as { medicines?: string[] };

    if (!medicines || !Array.isArray(medicines) || medicines.length < 2) {
      res.status(400).json({ error: 'At least 2 medicines are required for interaction check' });
      return;
    }

    const results: {
      drug1: string;
      drug2: string;
      severity: string;
      description: string;
      recommendation: string;
      mechanism: string;
      source: string;
    }[] = [];

    // Check all pairs
    for (let i = 0; i < medicines.length; i++) {
      for (let j = i + 1; j < medicines.length; j++) {
        const match = findInteraction(medicines[i], medicines[j]);
        if (match) {
          results.push({
            drug1: medicines[i],
            drug2: medicines[j],
            severity: match.severity,
            description: match.description,
            recommendation: match.recommendation,
            mechanism: match.mechanism,
            source: 'MediShield Curated Pharmacology Database',
          });
        } else {
          results.push({
            drug1: medicines[i],
            drug2: medicines[j],
            severity: 'unknown',
            description: `No reliable interaction data is available for the combination of ${medicines[i]} and ${medicines[j]}.`,
            recommendation: 'Consult a pharmacist or healthcare provider for interaction information about this combination.',
            mechanism: 'No data available.',
            source: 'Not found in curated database',
          });
        }
      }
    }

    // Determine overall severity
    const overallSeverity = determineOverallSeverity(results);

    res.json({
      medicines,
      overallSeverity,
      totalPairs: results.length,
      results,
      disclaimer: 'This interaction check is based on available pharmacology data and is not a substitute for professional medical advice. Always consult a pharmacist or healthcare provider before combining medications.',
    });
  } catch (err) {
    console.error('[Interaction] Check error:', err);
    res.status(500).json({ error: 'Interaction check failed' });
  }
});

function findInteraction(drug1: string, drug2: string): InteractionPair | null {
  const d1 = drug1.toLowerCase().trim();
  const d2 = drug2.toLowerCase().trim();

  for (const pair of curatedInteractions) {
    const drug1Matches = pair.drug1 === d1 || pair.drug1Aliases.some((a) => a === d1);
    const drug2Matches = pair.drug2 === d2 || pair.drug2Aliases.some((a) => a === d2);

    if (drug1Matches && drug2Matches) return pair;

    // Check reverse
    const drug1MatchesReverse = pair.drug2 === d1 || pair.drug2Aliases.some((a) => a === d1);
    const drug2MatchesReverse = pair.drug1 === d2 || pair.drug1Aliases.some((a) => a === d2);

    if (drug1MatchesReverse && drug2MatchesReverse) return pair;
  }

  return null;
}

function determineOverallSeverity(results: { severity: string }[]): string {
  if (results.some((r) => r.severity === 'severe')) return 'severe';
  if (results.some((r) => r.severity === 'moderate')) return 'moderate';
  if (results.some((r) => r.severity === 'mild')) return 'mild';
  return 'unknown';
}
