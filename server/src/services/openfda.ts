import axios from 'axios';

const OPENFDA_BASE = 'https://api.fda.gov/drug';

export interface OpenFDADrugLabel {
  id: string;
  brand_name?: string;
  generic_name?: string;
  manufacturer_name?: string;
  active_ingredient?: string;
  dosage_form?: string;
  route?: string;
  purpose?: string;
  warnings?: string;
  indications_and_usage?: string;
  spl_set_id?: string;
}

export interface OpenFDARecall {
  recall_number: string;
  product_description: string;
  reason_for_recall: string;
  status: string;
  classification: string;
  distribution_pattern: string;
  recalling_firm: string;
  event_date: string;
}

/**
 * Search OpenFDA drug label database.
 * Docs: https://api.fda.gov/drug/label.json
 */
export async function searchDrugLabels(query: string, limit = 10): Promise<OpenFDADrugLabel[]> {
  try {
    const response = await axios.get(`${OPENFDA_BASE}/label.json`, {
      params: {
        search: `openfda.brand_name:"${query}"+openfda.generic_name:"${query}"+openfda.manufacturer_name:"${query}"`,
        limit,
      },
      timeout: 10000,
    });

    if (!response.data.results) return [];

    return response.data.results.map((r: Record<string, unknown>) => {
      const openfda = (r.openfda as Record<string, string[]>) || {};
      return {
        id: r.id as string || '',
        brand_name: openfda.brand_name?.[0],
        generic_name: openfda.generic_name?.[0],
        manufacturer_name: openfda.manufacturer_name?.[0],
        active_ingredient: r.active_ingredient as string || undefined,
        dosage_form: r.dosage_form as string || undefined,
        route: r.route as string || undefined,
        purpose: r.purpose as string || undefined,
        warnings: r.warnings as string || undefined,
        indications_and_usage: r.indications_and_usage as string || undefined,
        spl_set_id: r.spl_set_id as string || undefined,
      };
    });
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      return [];
    }
    console.error('[OpenFDA] Search error:', err);
    return [];
  }
}

/**
 * Search OpenFDA drug recalls.
 */
export async function searchRecalls(query: string, limit = 5): Promise<OpenFDARecall[]> {
  try {
    const response = await axios.get(`${OPENFDA_BASE}/enforcement.json`, {
      params: {
        search: `product_description:"${query}"`,
        limit,
      },
      timeout: 10000,
    });

    if (!response.data.results) return [];

    return response.data.results.map((r: Record<string, string>) => ({
      recall_number: r.recall_number || '',
      product_description: r.product_description || '',
      reason_for_recall: r.reason_for_recall || '',
      status: r.status || '',
      classification: r.classification || '',
      distribution_pattern: r.distribution_pattern || '',
      recalling_firm: r.recalling_firm || '',
      event_date: r.event_date || '',
    }));
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      return [];
    }
    console.error('[OpenFDA] Recall search error:', err);
    return [];
  }
}

/**
 * Get drug label by SPL Set ID.
 */
export async function getDrugLabelBySplId(splSetId: string): Promise<OpenFDADrugLabel | null> {
  try {
    const response = await axios.get(`${OPENFDA_BASE}/label.json`, {
      params: {
        search: `spl_set_id:"${splSetId}"`,
        limit: 1,
      },
      timeout: 10000,
    });

    if (!response.data.results?.length) return null;

    const r = response.data.results[0];
    const openfda = r.openfda || {};
    return {
      id: r.id || '',
      brand_name: openfda.brand_name?.[0],
      generic_name: openfda.generic_name?.[0],
      manufacturer_name: openfda.manufacturer_name?.[0],
      active_ingredient: r.active_ingredient,
      dosage_form: r.dosage_form,
      route: r.route,
      purpose: r.purpose,
      warnings: r.warnings,
      indications_and_usage: r.indications_and_usage,
      spl_set_id: r.spl_set_id,
    };
  } catch {
    return null;
  }
}
