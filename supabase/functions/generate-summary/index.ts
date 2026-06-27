// Production origins via the ALLOWED_ORIGINS secret (comma-separated);
// localhost dev ports are always allowed.
const ALLOWED_ORIGINS = (Deno.env.get('ALLOWED_ORIGINS') ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

function isAllowedOrigin(origin: string): boolean {
  if (/^http:\/\/localhost:\d+$/.test(origin)) return true;
  if (/^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) return true;
  return ALLOWED_ORIGINS.includes(origin);
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin') ?? '';
  const corsHeaders = {
    'Access-Control-Allow-Origin': isAllowedOrigin(origin) ? origin : '',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Reject requests with no Authorization header (anon key alone is not enough)
  if (!req.headers.get('Authorization')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { courseName, school, reviews, description } = await req.json();
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) throw new Error('GEMINI_API_KEY secret not set');

    const hasReviews = Array.isArray(reviews) && reviews.length > 0;
    let prompt: string;

    if (hasReviews) {
      const excerpts = reviews
        .slice(0, 10)
        .map((r: { year: string; rate: number; review: string }) =>
          `[${r.year}, ${r.rate}/5 stars]: ${r.review}`
        )
        .join('\n\n');
      prompt =
        `You are advising an incoming university student considering "${courseName}" at ${school} in Singapore. ` +
        `Based on the following ${reviews.length} student review(s), write 3–4 sentences covering: ` +
        `(1) what the course is actually like day-to-day, (2) the key things students wish they knew before taking it, ` +
        `and (3) any practical tips or warnings. Be direct, specific, and honest — write as if you are a senior student giving real advice, not a marketing blurb.\n\nReviews:\n${excerpts}`;
    } else {
      const ctx = description ? `Official course description: ${description}\n\n` : '';
      prompt =
        `${ctx}You are advising an incoming university student considering "${courseName}" at ${school} in Singapore. ` +
        `Write 2–3 sentences covering what this course is generally about and what students should realistically expect — ` +
        `workload, style of teaching, or any common considerations. Be practical and honest, not generic.`;
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 300 },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gemini error: ${err}`);
    }

    const payload = await res.json();
    const summary: string = payload.candidates[0].content.parts[0].text;

    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    // Log full detail server-side; return an opaque message to the client.
    console.error('generate-summary failed:', err);
    return new Response(JSON.stringify({ error: 'Could not generate summary' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
