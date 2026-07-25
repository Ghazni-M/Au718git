// netlify/functions/gemini.js
export default async function handler(request, context) {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { 
      status: 405 
    });
  }

  try {
    const { prompt, model = "gemini-1.5-flash" } = await request.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), { 
        status: 400 
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { 
      status: 500 
    });
  }
}