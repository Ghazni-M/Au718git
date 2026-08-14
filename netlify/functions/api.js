// netlify/functions/api.js
export default async (request, context) => {
  return new Response(
    JSON.stringify({ message: "API is working!" }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" }
    }
  );
};