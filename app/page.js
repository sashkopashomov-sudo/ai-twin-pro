"use client";
import { useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Здрасти! Аз съм твоят Чат AI Twin. С какво да помогна?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

async function sendMessage(e) {
  e.preventDefault();
  const content = input.trim();
  if (!content) return;
  const newMessages = [...messages, { role: "user", content }];
  setMessages(newMessages);
  setInput("");
  setLoading(true);

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: newMessages }),
    });

    if (!res.ok) {
      const text = await res.text();
      setMessages([...newMessages, { role: "assistant", content: "⚠️ Грешка: " + text }]);
      setLoading(false);
      return;
    }

    const data = await res.json();
    setMessages([...newMessages, { role: "assistant", content: data.reply }]);
  } catch (err) {
    setMessages([...newMessages, { role: "assistant", content: "⚠️ Грешка (мрежа/сървър): " + (err?.message || err) }]);
  } finally {
    setLoading(false);
  }
}


  return (
    <main style={{ maxWidth: 600, margin: "20px auto", padding: 20 }}>
      <h1>Chat AI Twin</h1>
      <div style={{ background: "#f9f9f9", padding: 10, borderRadius: 8, minHeight: 200 }}>
        {messages.map((m, i) => (
          <div key={i}><b>{m.role}:</b> {m.content}</div>
        ))}
        {loading && <div>Мисля…</div>}
      </div>
      <form onSubmit={sendMessage} style={{ marginTop: 10, display: "flex", gap: 8 }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} style={{ flex: 1 }} />
        <button type="submit">Изпрати</button>
      </form>
    </main>
  );
}
