export const PREDEFINED_TAGS = [
  'Tutorial',
  'Article',
  'Video',
  'Tool',
  'Documentation',
  'Course',
  'GitHub',
  'Design',
  'Library',
  'Other'
];

/**
 * Suggests an appropriate tag based on the title, description, and URL
 */


// Gemini network calls are disabled. Import kept commented for future use.
// import { generateGeminiSummary } from './gemini';

export async function generateTitleDescription(url: string): Promise<{ title?: string; description?: string; suggestedTag?: string }> {
  // Try to fetch the page and extract <title> and meta description client-side.
  try {
    const res = await fetch(url, { method: 'GET', mode: 'cors' });
    const text = await res.text();
    // DOMParser works in browser environments
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      const titleEl = doc.querySelector('title');
      const metaDesc = doc.querySelector('meta[name="description"]') as HTMLMetaElement | null;
      const ogTitle = doc.querySelector('meta[property="og:title"]') as HTMLMetaElement | null;
      const ogDesc = doc.querySelector('meta[property="og:description"]') as HTMLMetaElement | null;

      const title = (ogTitle?.content || titleEl?.textContent || '').trim();
      const description = (ogDesc?.content || metaDesc?.content || '').trim();

      if (title || description) {
        console.log('✅ Metadata fetched via CORS:', { title, description });
        return { title: title || undefined, description: description || undefined };
      }
    } catch (err) {
      // parsing may fail in some environments; continue to fallback
      console.log('⚠️ DOMParser failed, trying AI fallback');
    }
  } catch (err) {
    // Fetch may fail (CORS etc.) — we will attempt AI fallback below
    console.log('⚠️ CORS blocked, trying AI fallback');
  }

  // Gemini AI fallback is currently disabled to avoid client-side network calls during development.
  // If you need to re-enable Gemini, set VITE_GEMINI_API_KEY and restore the call to generateGeminiSummary.
  console.log('⚠️ AI fallback disabled: no Gemini call will be made for', url);
  return {};
}
