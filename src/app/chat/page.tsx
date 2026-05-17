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
    <div className="min-h-screen bg-[#100c08] text-[#f5ede0] flex flex-col">
      <header className="bg-black/30 backdrop-blur-md border-b border-white/[0.08]">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="hidden sm:inline-flex items-center justify-center w-10 h-10 rounded-2xl overflow-hidden shadow-md border border-white/10">
              <img
                src="/sprites/logo_amour.png"
                alt="Japanese Sensei - Chat"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold text-[#f5ede0] truncate" style={{ fontFamily: "var(--font-noto-serif-jp, serif)" }}>
                Japanese Sensei - Chat
              </h1>
              <p className="text-[#f5ede0]/50 text-sm md:text-base truncate">
                Pose tes questions sur les kanjis, la grammaire ou le vocabulaire.
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.10] text-[#f5ede0] text-sm font-medium border border-white/[0.10] transition-colors hover:-translate-y-0.5"
          >
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-xl overflow-hidden border border-white/10">
              <img
                src="/sprites/logo_maison.png"
                alt="Menu principal"
                className="w-full h-full object-cover"
              />
            </span>
            <span className="hidden sm:inline">Menu principal</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 flex flex-col gap-4">
        <div className="flex-1 overflow-y-auto bg-white/[0.03] backdrop-blur-sm rounded-3xl border border-white/[0.08] p-4 space-y-3 animate-fade-in-up">
          {messages.length === 0 && (
            <div className="text-center text-[#f5ede0]/50 text-sm md:text-base">
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
                    ? "bg-[#c41e1e] text-[#f5ede0] rounded-br-sm"
                    : "bg-white/[0.06] text-[#f5ede0]/90 border border-white/[0.08] rounded-bl-sm"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="text-[#f5ede0]/40 text-sm italic">Le sensei réfléchit…</div>
          )}

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white/[0.04] backdrop-blur-sm rounded-2xl border border-white/[0.08] p-3 flex flex-col gap-2 animate-fade-in-up"
        >
          <textarea
            className="w-full rounded-xl border border-white/[0.10] bg-white/[0.06] px-3 py-2 text-sm md:text-base text-[#f5ede0] placeholder:text-[#f5ede0]/30 focus:outline-none focus:ring-2 focus:ring-[#c41e1e]/40 focus:border-[#c41e1e]/50 resize-none min-h-[70px] max-h-40"
            placeholder="Pose ta question au Japanese Sensei…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-[#f5ede0]/30">
              Le sensei est spécialisé dans les kanjis, les particules et la grammaire de base.
            </p>
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-2 rounded-xl bg-[#c41e1e] hover:bg-[#c41e1e]/80 text-[#f5ede0] text-sm font-semibold shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5"
            >
              {loading ? "Envoi en cours…" : "Envoyer"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
