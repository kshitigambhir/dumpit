export async function generateTitleDescription(url: string): Promise<{ title?: string; description?: string }> {
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
        return { title: title || undefined, description: description || undefined };
      }
    } catch (err) {
      // parsing may fail in some environments; continue to fallback
    }
  } catch (err) {
    // Fetch may fail (CORS etc.) — we will attempt AI fallback below
  }

  // Fallback: use OpenAI (if API key present). This requires the repo maintainer to set VITE_OPENAI_API_KEY.
  const key = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
  if (!key) return {};

  try {
    const prompt = `You are a helpful assistant. Given only the URL: ${url}, produce a concise resource title (6-12 words) and a short description (1-2 sentences) suitable for a public resource listing. Return only a JSON object with keys \"title\" and \"description\`.\n`;

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: 'You are a concise metadata generator.' }, { role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 200,
      }),
    });

    if (!openaiRes.ok) return {};
    const body = await openaiRes.json();
    const content = body?.choices?.[0]?.message?.content ?? '';

    // Extract JSON blob from the response (model should return pure JSON per prompt)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return {};

    try {
      const parsed = JSON.parse(jsonMatch[0]);
      return { title: parsed.title, description: parsed.description };
    } catch (err) {
      return {};
    }
  } catch (err) {
    return {};
  }
}
