export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await req.json();
    const apiKey = process.env.OPENROUTER_API_KEY;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://jipyo-dashboard.vercel.app',
        'X-Title': 'Jipyo Dashboard',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku',
        max_tokens: 1000,
        messages: body.messages,
      }),
    });

    const text = await response.text();
    console.log('OpenRouter status:', response.status);
    console.log('OpenRouter response:', text.substring(0, 300));

    let data;
    try { data = JSON.parse(text); } catch(e) { data = {}; }

    const content = data.choices?.[0]?.message?.content || '응답 없음';

    return new Response(JSON.stringify({
      content: [{ type: 'text', text: content }]
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });

  } catch (err) {
    return new Response(JSON.stringify({
      content: [{ type: 'text', text: '오류: ' + err.message }]
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
}

export const config = { runtime: 'edge' };
