import { Router, Request, Response } from 'express';
import { searchDrugLabels, searchRecalls } from '../services/openfda.js';
import { searchDrugs, getDrugDetails, spellSuggest } from '../services/rxnorm.js';
import { lookupByNDC } from '../services/ndc.js';
import { authenticate } from '../middleware/auth.js';

export const medicineRouter = Router();

// All medicine routes require authentication
medicineRouter.use(authenticate);

/**
 * GET /api/medicine/search?q=...
 * Combined search across OpenFDA + RxNorm
 */
medicineRouter.get('/search', async (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string || '').trim();
    if (!query || query.length < 2) {
      res.status(400).json({ error: 'Search query must be at least 2 characters' });
      return;
    }

    // Search both sources in parallel
    const [openfdaResults, rxnormResults, spellSuggestions] = await Promise.all([
      searchDrugLabels(query, 10),
      searchDrugs(query),
      spellSuggest(query),
    ]);

    res.json({
      query,
      openfda: openfdaResults,
      rxnorm: rxnormResults.slice(0, 10),
      suggestions: spellSuggestions,
      totalResults: openfdaResults.length + rxnormResults.length,
    });
  } catch (err) {
    console.error('[Medicine] Search error:', err);
    res.status(500).json({ error: 'Search failed' });
  }
});

/**
 * GET /api/medicine/ndc/:code
 * Look up a medicine by NDC/barcode code
 */
medicineRouter.get('/ndc/:code', async (req: Request, res: Response) => {
  try {
    const code = String(req.params.code).trim();
    if (!code) {
      res.status(400).json({ error: 'NDC code is required' });
      return;
    }

    const ndcResult = await lookupByNDC(code);

    if (!ndcResult) {
      res.json({
        found: false,
        message: 'No medicine found for this NDC code in the FDA database.',
        ndcCode: code,
      });
      return;
    }

    // Also try to find related OpenFDA data
    const searchQuery = ndcResult.brand_name || ndcResult.generic_name;
    const openfdaResults = searchQuery ? await searchDrugLabels(searchQuery, 3) : [];
    const recalls = searchQuery ? await searchRecalls(searchQuery, 3) : [];

    res.json({
      found: true,
      ndc: ndcResult,
      openfda: openfdaResults,
      recalls,
    });
  } catch (err) {
    console.error('[Medicine] NDC lookup error:', err);
    res.status(500).json({ error: 'NDC lookup failed' });
  }
});

/**
 * GET /api/medicine/verify?barcode=...&name=...
 * Verify a medicine by combining NDC lookup + OpenFDA + AI analysis
 */
medicineRouter.get('/verify', async (req: Request, res: Response) => {
  try {
    const barcode = (req.query.barcode as string || '').trim();
    const name = (req.query.name as string || '').trim();

    if (!barcode && !name) {
      res.status(400).json({ error: 'Barcode or medicine name is required' });
      return;
    }

    let ndcResult = null;
    let openfdaResults: unknown[] = [];
    let recalls: unknown[] = [];

    // Look up by barcode first
    if (barcode) {
      ndcResult = await lookupByNDC(barcode);
    }

    // Search by name
    const searchQuery = name || (ndcResult?.brand_name || ndcResult?.generic_name) || '';
    if (searchQuery) {
      [openfdaResults, recalls] = await Promise.all([
        searchDrugLabels(searchQuery, 5),
        searchRecalls(searchQuery, 3),
      ]);
    }

    const found = !!(ndcResult || openfdaResults.length > 0);

    res.json({
      found,
      barcode: barcode || null,
      ndc: ndcResult,
      openfda: openfdaResults,
      recalls,
      searchQuery,
    });
  } catch (err) {
    console.error('[Medicine] Verify error:', err);
    res.status(500).json({ error: 'Verification failed' });
  }
});

/**
 * GET /api/medicine/details/:rxcui
 * Get detailed drug info from RxNorm
 */
medicineRouter.get('/details/:rxcui', async (req: Request, res: Response) => {
  try {
    const { rxcui } = req.params;
    if (!rxcui) {
      res.status(400).json({ error: 'RxCUI is required' });
      return;
    }

    const details = await getDrugDetails(String(rxcui));
    if (!details) {
      res.status(404).json({ error: 'Drug details not found' });
      return;
    }

    res.json({ drug: details });
  } catch (err) {
    console.error('[Medicine] Details error:', err);
    res.status(500).json({ error: 'Failed to fetch drug details' });
  }
});
