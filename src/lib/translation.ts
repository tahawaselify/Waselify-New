export async function translateText(text: string, source: string, target: string): Promise<string> {
  if (!text) return text;
  const endpoint = (import.meta as any).env?.VITE_TRANSLATE_URL; // Supabase Edge Function or backend URL
  if (!endpoint) {
    console.warn('VITE_TRANSLATE_URL is not set. Skipping auto-translation.');
    return text;
  }
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ q: text, source, target, format: 'text' })
    });
    if (!res.ok) return text;
    const data = await res.json();
    // Expecting { translatedText: '...' }
    return data?.translatedText || text;
  } catch (e) {
    console.warn('Translation request failed, falling back to original text.', e);
    return text;
  }
}

