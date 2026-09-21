import axios from 'axios';

const OPENFDA_NDC_BASE = 'https://api.fda.gov/drug/ndc.json';

export interface NDCProduct {
  product_ndc: string;
  product_id: string;
  brand_name: string;
  generic_name: string;
  labeler_name: string;
  dosage_form: string;
  route: string;
  active_ingredients: { name: string; strength: string }[];
  marketing_start_date?: string;
  marketing_end_date?: string;
  application_number?: string;
}

/**
 * Look up a drug by NDC code.
 * NDC format can be: 5-4-2, 5-3-2, or plain digits.
 */
export async function lookupByNDC(ndcCode: string): Promise<NDCProduct | null> {
  try {
    // Normalize NDC code (remove dashes, try various formats)
    const cleanCode = ndcCode.replace(/-/g, '');

    // Try direct search first
    let response = await axios.get(OPENFDA_NDC_BASE, {
      params: {
        search: `product_ndc:"${cleanCode}"`,
        limit: 1,
      },
      timeout: 10000,
    }).catch(() => null);

    // If direct match fails, try with formatted NDC (insert dashes)
    if (!response?.data?.results?.length && cleanCode.length >= 9) {
      const formatted = formatNDC(cleanCode);
      if (formatted) {
        response = await axios.get(OPENFDA_NDC_BASE, {
          params: {
            search: `product_ndc:"${formatted}"`,
            limit: 1,
          },
          timeout: 10000,
        }).catch(() => null);
      }
    }

    if (!response?.data?.results?.length) return null;

    const r = response.data.results[0];
    const openfda = r.openfda || {};
    return {
      product_ndc: r.product_ndc || '',
      product_id: r.id || '',
      brand_name: openfda.brand_name?.[0] || r.brand_name || '',
      generic_name: openfda.generic_name?.[0] || r.generic_name || '',
      labeler_name: openfda.manufacturer_name?.[0] || r.labeler_name || '',
      dosage_form: r.dosage_form_name || '',
      route: r.route_name || '',
      active_ingredients: (r.active_ingredients || []).map(
        (ai: { name: string; strength: string[] }) => ({
          name: ai.name,
          strength: Array.isArray(ai.strength) ? ai.strength.join(', ') : ai.strength,
        })
      ),
      marketing_start_date: r.marketing_start_date,
      marketing_end_date: r.marketing_end_date,
      application_number: r.application_number,
    };
  } catch (err) {
    console.error('[NDC] Lookup error:', err);
    return null;
  }
}

/**
 * Search NDC products by name.
 */
export async function searchNDC(query: string, limit = 10): Promise<NDCProduct[]> {
  try {
    const response = await axios.get(OPENFDA_NDC_BASE, {
      params: {
        search: `brand_name:"${query}"+generic_name:"${query}"+labeler_name:"${query}"`,
        limit,
      },
      timeout: 10000,
    });

    if (!response.data.results) return [];

    return response.data.results.map((r: Record<string, unknown>) => {
      const openfda = (r.openfda as Record<string, string[]>) || {};
      const activeIngredients = (r.active_ingredients as { name: string; strength: string[] }[]) || [];
      return {
        product_ndc: r.product_ndc || '',
        product_id: r.id || '',
        brand_name: openfda.brand_name?.[0] || '',
        generic_name: openfda.generic_name?.[0] || '',
        labeler_name: openfda.manufacturer_name?.[0] || '',
        dosage_form: r.dosage_form_name || '',
        route: r.route_name || '',
        active_ingredients: activeIngredients.map((ai) => ({
          name: ai.name,
          strength: Array.isArray(ai.strength) ? ai.strength.join(', ') : ai.strength,
        })),
      };
    });
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 404) return [];
    console.error('[NDC] Search error:', err);
    return [];
  }
}

/**
 * Format a raw NDC code string into standard XXXXX-XXXX-XX format.
 */
function formatNDC(code: string): string | null {
  if (code.length === 10) {
    return `${code.slice(0, 5)}-${code.slice(5, 9)}-${code.slice(9)}`;
  }
  if (code.length === 11) {
    return `${code.slice(0, 5)}-${code.slice(5, 9)}-${code.slice(9)}`;
  }
  return null;
}
