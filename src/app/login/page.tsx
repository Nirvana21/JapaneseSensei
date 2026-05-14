"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Impossible de se connecter");
        setLoading(false);
        return;
      }

      router.replace("/");
    } catch (err) {
      console.error(err);
      setError("Erreur réseau");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0e0e] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Red sun glow behind logo */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(200,30,30,0.18) 0%, transparent 70%)",
        }}
      />

      <div className="w-full max-w-sm flex flex-col items-center gap-8 relative z-10">
        {/* Mascot */}
        <div className="flex flex-col items-center gap-3">
          <Image
            src="/Logo_Sensei.png"
            alt="Japanese Sensei"
            width={120}
            height={120}
            priority
            className="drop-shadow-[0_0_24px_rgba(200,40,40,0.5)]"
          />
          <div className="text-center">
            <p className="text-white/40 text-xs tracking-[0.3em] uppercase mb-1">
              ようこそ
            </p>
            <h1 className="text-white text-2xl font-bold tracking-tight">
              Japanese Sensei
            </h1>
          </div>
        </div>

        {/* Card */}
        <div className="w-full bg-white/[0.04] border border-white/10 rounded-3xl p-7 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-white/60 text-xs font-medium uppercase tracking-wider">
                Identifiant
              </label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-red-500/60 focus:bg-white/[0.08] transition-colors"
                placeholder="Votre nom de sensei"
                autoComplete="username"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-white/60 text-xs font-medium uppercase tracking-wider">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-red-500/60 focus:bg-white/[0.08] transition-colors"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-950/40 border border-red-700/40">
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !username || !password}
              className="relative w-full py-3.5 rounded-xl font-semibold text-white overflow-hidden transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: loading
                  ? "rgba(180,30,30,0.6)"
                  : "linear-gradient(135deg, #c41e1e 0%, #8b0000 100%)",
                boxShadow: loading ? "none" : "0 4px 24px rgba(196,30,30,0.4)",
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Connexion…
                </span>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>
        </div>

        {/* Footer hint */}
        <p className="text-white/20 text-xs text-center">
          日本語先生 · v2
        </p>
      </div>
    </div>
  );
}
