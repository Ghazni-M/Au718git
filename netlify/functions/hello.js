// netlify/functions/hello.js
export default async function handler(request, context) {
  return new Response(
    JSON.stringify({ 
      message: "Hello from Netlify Function!",
      timestamp: new Date().toISOString()
    }),
    { 
      status: 200,
      headers: { "Content-Type": "application/json" }
    }
  );
}