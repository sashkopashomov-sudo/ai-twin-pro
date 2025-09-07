import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  const { messages } = await req.json();
  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "Ти си AI Twin на потребителя. Отговаряй приятелски и практично." },
      ...messages,
    ],
  });
  const reply = completion.choices[0].message.content;
  return new Response(JSON.stringify({ reply }), { headers: { "Content-Type": "application/json" } });
}
