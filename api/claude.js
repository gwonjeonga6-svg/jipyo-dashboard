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

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.OPENROUTER_API_KEY,
        'HTTP-Referer': 'https://jipyo-dashboard.vercel.app',
        'X-Title': 'Jipyo Dashboard',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-sonnet-4-5',
        max_tokens: 1000,
        messages: body.messages,
      }),
    });

    const data = await response.json();

    // OpenRouter 응답을 Anthropic 형식으로 변환
    const text = data.choices?.[0]?.message?.content || '응답 없음';
    const converted = {
      content: [{ type: 'text', text }]
    };

    return new Response(JSON.stringify(converted), {
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
