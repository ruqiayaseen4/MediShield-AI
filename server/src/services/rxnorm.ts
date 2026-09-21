import axios from 'axios';

const RXNORM_BASE = 'https://rxnav.nlm.nih.gov/REST';

export interface RxNormConcept {
  rxcui: string;
  name: string;
  tty: string; // Term type (IN=ingredient, BN=brand name, etc.)
}

export interface RxNormDrugInfo {
  rxcui: string;
  name: string;
  synonym?: string;
  attributes: Record<string, string>;
}

/**
 * Search for drug concepts by name.
 */
export async function searchDrugs(query: string): Promise<RxNormConcept[]> {
  try {
    const response = await axios.get(`${RXNORM_BASE}/drugs.json`, {
      params: { name: query },
      timeout: 10000,
      headers: { Accept: 'application/json' },
    });

    const drugGroup = response.data?.drugGroup?.conceptGroup;
    if (!drugGroup) return [];

    const concepts: RxNormConcept[] = [];
    for (const group of drugGroup) {
      if (group.conceptProperties) {
        for (const cp of group.conceptProperties) {
          concepts.push({
            rxcui: cp.rxcui,
            name: cp.name,
            tty: cp.tty,
          });
        }
      }
    }

    // Prefer ingredients and brand names, deduplicate by name
    const seen = new Set<string>();
    return concepts
      .filter((c) => {
        const key = c.name.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 20);
  } catch (err) {
    console.error('[RxNorm] Search error:', err);
    return [];
  }
}

/**
 * Get drug details by RxCUI.
 */
export async function getDrugDetails(rxcui: string): Promise<RxNormDrugInfo | null> {
  try {
    const [propsRes, attrsRes] = await Promise.all([
      axios.get(`${RXNORM_BASE}/rxcui/${rxcui}/properties.json`, {
        timeout: 10000,
        headers: { Accept: 'application/json' },
      }),
      axios.get(`${RXNORM_BASE}/rxcui/${rxcui}/attributestyles.json`, {
        timeout: 10000,
        headers: { Accept: 'application/json' },
      }).catch(() => null),
    ]);

    const propGroup = propsRes.data?.propConceptGroup?.propConcept;
    if (!propGroup) return null;

    const attributes: Record<string, string> = {};
    for (const prop of propGroup) {
      attributes[prop.propName] = prop.propValue;
    }

    // Parse attribute styles if available
    if (attrsRes?.data?.attributeGroup?.attribute) {
      for (const attr of attrsRes.data.attributeGroup.attribute) {
        if (attr.value) {
          attributes[attr.name] = attr.value;
        }
      }
    }

    return {
      rxcui,
      name: attributes.Synonym || attributes.DisplayName || '',
      synonym: attributes.Synonym,
      attributes,
    };
  } catch (err) {
    console.error('[RxNorm] Drug details error:', err);
    return null;
  }
}

/**
 * Spell suggest for drug names.
 */
export async function spellSuggest(query: string): Promise<string[]> {
  try {
    const response = await axios.get(`${RXNORM_BASE}/spellsuggestions.json`, {
      params: { name: query },
      timeout: 10000,
      headers: { Accept: 'application/json' },
    });

    const suggestions = response.data?.spellSuggestions?.suggestionGroup;
    if (!suggestions) return [];

    const names = new Set<string>();
    for (const group of suggestions) {
      if (group.suggestionList?.suggestion) {
        for (const s of group.suggestionList.suggestion) {
          names.add(s.name);
        }
      }
    }

    return Array.from(names).slice(0, 10);
  } catch {
    return [];
  }
}
