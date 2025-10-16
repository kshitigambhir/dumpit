import { useState } from 'react';
import { PREDEFINED_TAGS } from '../lib/ai';

export interface EnrichmentResult {
  title: string;
  description: string;
  image?: string;
  favicon?: string;
  suggestedTag: string;
}

export function useUrlEnrichment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enrichUrl = async (url: string): Promise<EnrichmentResult | null> => {
    setLoading(true);
    setError(null);

    try {
      // Validate URL
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        throw new Error('URL must start with http:// or https://');
      }

  // AI enrichment (Gemini) is disabled in the client to avoid network calls.
  // We attempt only client-side metadata extraction above. If that fails, return partial info.
  console.log('⚠️ AI enrichment disabled - skipping generateTitleDescription for', url);
  const result = {} as any;

      // Always provide at least a domain-based title as fallback
      const title = result.title || extractDomain(url);
      const description = result.description || '';

      // Check if we have a Gemini key configured
      // Since AI is disabled, we won't attempt to call external services.
      
      // If we only have a domain name and no description, treat as partial success
      // (don't throw so the user can continue and manually edit fields).
      if (!result.title && !result.description) {
        const partialTitle = extractDomain(url);
        // set a friendly error message but return partial data so user can save
        setError('Unable to fetch page details automatically — automatic AI enrichment is disabled. You can enter title/description manually.');
        return {
          title: partialTitle,
          description: '',
          suggestedTag: 'Other',
        } as EnrichmentResult;
      }

      // Use suggestedTag from API response if available and valid
      let suggestedTag = result.suggestedTag || '';
      if (!PREDEFINED_TAGS.includes(suggestedTag)) {
        suggestedTag = 'Other';
      }

      return {
        title,
        description,
        suggestedTag,
        // For now, we don't extract images/favicon via client-side
        // These would need a proper metadata API or server-side scraping
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to enrich URL';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { enrichUrl, loading, error, setError };
}

function extractDomain(url: string): string {
  try {
    const { hostname } = new URL(url);
    return hostname.replace('www.', '');
  } catch {
    return 'Unknown Resource';
  }
}
