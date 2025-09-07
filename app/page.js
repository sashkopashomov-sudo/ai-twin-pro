"use client";
import { useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Здрасти! Аз съм твоят Чат AI Twin. С какво да помогна?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function copyToClipboard(text){
    try{ await navigator.clipboard.writeText(text); alert("Копирано!"); }
    catch{ /* no-op */ }
  }

  async function sendMessage(e){
    e.preventDefault();
    const content = input.trim();
    if(!content) return;
    const pending = [...messages, { role:"user", content }];
    setMessages(pending);
    setInput("");
    setLoading(true);

    try{
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({ messages: pending })
      });

      if(!res.ok){
        const text = await res.text();
        setMessages([...pending, { role:"assistant", content: "⚠️ Грешка: " + text }]);
        return;
      }

      const data = await res.json();
      setMessages([...pending, { role:"assistant", content: data.reply }]);
    }catch(err){
      setMessages([...pending, { role:"assistant", content: "⚠️ Мрежова грешка: " + (err?.message || err) }]);
    }finally{
      setLoading(false);
    }
  }

  return (
    <main>
      <div className="card">
        <div className="chat">
          {messages.map((m,i)=>(
            <div key={i} className={`msg ${m.role}`}>
              {m.content}
              {m.role === "assistant" && (
                <button className="copy" onClick={()=>copyToClipboard(m.content)}>Копирай</button>
              )}
            </div>
          ))}
          {loading && <div className="loading">Мисля…</div>}
        </div>

        <form className="form" onSubmit={sendMessage}>
          <input
            className="input"
            value={input}
            onChange={(e)=>setInput(e.target.value)}
            placeholder="Напиши съобщение…"
          />
          <button className="btn" disabled={loading} type="submit">
            {loading ? "Изпращам…" : "Изпрати"}
          </button>
        </form>
        <div className="small" style={{marginTop:8}}>
          Съвет: опитай „Направи ми 24-часов план за продуктивност“.
        </div>
      </div>
    </main>
  );
}

