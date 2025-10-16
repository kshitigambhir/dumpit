// Temporarily disable Gemini network calls during development and testing.
// The function remains in place but returns an empty result so callers won't attempt
// to parse any network responses. Re-enable by restoring the original implementation
// and ensuring VITE_GEMINI_API_KEY is set.
export async function generateGeminiSummary(url: string): Promise<{ title?: string; description?: string; suggestedTag?: string }> {
  console.log('⚠️ generateGeminiSummary is currently disabled (no network call will be made) for URL:', url);
  // Return an empty object to indicate no metadata was generated.
  return {};
}
