import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response("❌ OPENAI_API_KEY is missing.", { status: 500 });
    }

    const client = new OpenAI({ apiKey });
    const { messages } = await req.json();

    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.6,
      messages: [
        { role: "system", content: "Ти си AI Twin на потребителя. Отговаряй кратко, приятелски и ясно." },
        ...(messages || []),
      ],
    });

    const reply = completion?.choices?.[0]?.message?.content ?? "⚠️ Нещо се обърка.";
    return new Response(JSON.stringify({ reply }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg =
      err?.response?.data?.error?.message ||
      err?.message ||
      "⚠️ Server error";
    return new Response(msg, { status: 500 });
  }
}
