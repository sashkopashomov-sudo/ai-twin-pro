// app/api/chat/route.js — Hugging Face (Mistral 7B Instruct)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Модел — можеш да смениш с друг HF модел по-късно
const HF_MODEL =
  process.env.HF_MODEL || "mistralai/Mistral-7B-Instruct-v0.2";

// Превръща chat съобщенията в prompt за Instruct модел ([INST] ... [/INST])
function buildPrompt(messages = []) {
  // Взимаме само последните ~12 съобщения за краткост
  const recent = messages.slice(-12);
  const pairs = recent
    .map((m) => {
      if (m.role === "user") return `[INST] ${m.content} [/INST]`;
      if (m.role === "assistant") return `${m.content}\n`;
      return ""; // пропускаме "system" тук (можеш да го вградиш в първия INST)
    })
    .join("\n");

  // Лек system тон – добавяме го първи
  const system =
    "Ти си полезен, кратък и приятелски AI асистент. Отговаряй ясно и на български, ако е възможно.";

  return `[INST] ${system} [/INST]\n` + pairs + `\n`;
}

export async function POST(req) {
  try {
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) {
      return new Response("Missing HUGGINGFACE_API_KEY.", { status: 500 });
    }

    const { messages } = await req.json();
    const prompt = buildPrompt(messages || []);

    // HF Inference API (text-generation)
    const res = await fetch(
      `https://api-inference.huggingface.co/models/${HF_MODEL}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 256,
            temperature: 0.6,
            top_p: 0.9,
            repetition_penalty: 1.05,
            // return_full_text: false  // някои модели игнорират това
          },
          options: {
            wait_for_model: true, // важно при „студени“ модели на безплатния план
          },
        }),
      }
    );

    // Обработка на не-200 отговор
    if (!res.ok) {
      const text = await res.text();
      // 503 често значи „моделът се зарежда“ — опитай след секунди
      return new Response(
        `HF error (${res.status}): ${text || "Unknown error"}`,
        { status: 500 }
      );
    }

    const data = await res.json();

    // HF връща масив [{generated_text: "..."}] за text-generation
    let reply = "";
    if (Array.isArray(data) && data.length && data[0].generated_text) {
      // Опит да изрежем echo-то на prompt-а
      const full = data[0].generated_text;
      reply = full.replace(prompt, "").trim() || full.trim();
    } else if (data?.generated_text) {
      reply = (data.generated_text || "").trim();
    } else {
      reply = JSON.stringify(data); // fallback за непознат формат
    }

    if (!reply) reply = "Не успях да генерирам отговор в момента. Опитай пак.";

    return new Response(JSON.stringify({ reply }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg =
      err?.response?.data?.error?.message ||
      err?.message ||
      "Server error (HF)";
    return new Response(msg, { status: 500 });
  }
}
