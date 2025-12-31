"use client";

import Link from "next/link";
import { useState } from "react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          history,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Erreur inconnue");
      }

      const data = await res.json();
      const reply = (data?.reply as string) || "";
      if (reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      }
    } catch (err: any) {
      console.error("Chat error", err);
      setError(err.message || "Impossible de contacter le sensei.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex flex-col">
      <header className="bg-gradient-to-r from-amber-100/90 to-orange-100/90 backdrop-blur-md border-b border-amber-200/50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="hidden sm:inline-flex items-center justify-center w-10 h-10 rounded-2xl overflow-hidden shadow-md bg-red-100">
              <img
                src="/sprites/logo_amour.png"
                alt="Japanese Sensei - Chat"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-800 to-orange-800 bg-clip-text text-transparent truncate">
                Japanese Sensei - Chat
              </h1>
              <p className="text-amber-700 text-sm md:text-base truncate">
                Pose tes questions sur les kanjis, la grammaire ou le vocabulaire.
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="px-3 py-2 rounded-xl bg-amber-200/80 hover:bg-amber-300 text-amber-900 text-sm font-medium shadow-sm border border-amber-300 transition-smooth hover:-translate-y-0.5"
          >
            ← Menu principal
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 flex flex-col gap-4">
        <div className="flex-1 overflow-y-auto bg-white/70 backdrop-blur-sm rounded-3xl shadow-md border border-amber-100 p-4 space-y-3 animate-fade-in-up">
          {messages.length === 0 && (
            <div className="text-center text-amber-700 text-sm md:text-base">
              💬 Commence par demander :
              <div className="mt-2 space-y-1">
                <p>• "Explique-moi le kanji 学 avec ses lectures"</p>
                <p>• "Corrige cette phrase : 私は日本語を勉強します。"</p>
                <p>• "Donne-moi des exemples avec la particule ね"</p>
              </div>
            </div>
          )}

          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm md:text-base whitespace-pre-wrap leading-relaxed shadow-sm ${
                  m.role === "user"
                    ? "bg-orange-500 text-white rounded-br-sm"
                    : "bg-white/90 text-amber-900 border border-amber-100 rounded-bl-sm"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="text-amber-700 text-sm italic">Le sensei réfléchit…</div>
          )}

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-amber-100 p-3 flex flex-col gap-2 animate-fade-in-up"
        >
          <textarea
            className="w-full rounded-xl border border-amber-200 bg-amber-50/70 px-3 py-2 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 resize-none min-h-[70px] max-h-40"
            placeholder="Pose ta question au Japanese Sensei…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-amber-600">
              Le sensei est spécialisé dans les kanjis, les particules et la grammaire de base.
            </p>
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-semibold shadow-md disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-lg transition-bounce hover:-translate-y-0.5"
            >
              {loading ? "Envoi en cours…" : "Envoyer"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
