export async function GET() {
  return new Response(
    JSON.stringify({ ok: true, openaiKeyPresent: !!process.env.OPENAI_API_KEY }),
    { headers: { "Content-Type": "application/json" } }
  );
}
