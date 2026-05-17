"use client";

import Link from "next/link";

export default function DuoDuelPage() {
  return (
    <div className="min-h-screen bg-[#100c08] text-[#f5ede0] flex flex-col">
      <header className="bg-black/30 backdrop-blur-md border-b border-white/[0.08] px-4 py-3 flex items-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center w-8 h-8 rounded-xl overflow-hidden border border-white/10 hover:bg-white/[0.08] transition-colors"
        >
          <img src="/sprites/logo_maison.png" alt="Menu" className="w-full h-full object-cover" />
        </Link>
        <h1 className="text-lg font-bold text-[#f5ede0]">Duo Duel</h1>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 gap-6 text-center">
        <div className="text-6xl mb-2">⚔️</div>
        <h2 className="text-2xl font-bold text-[#f5ede0]">Duo Duel</h2>
        <p className="text-[#f5ede0]/60 text-sm max-w-xs">
          Défiez un ami en temps réel sur vos kanjis communs.
          Ce mode multijoueur arrive bientôt !
        </p>

        <div className="bg-white/[0.04] rounded-2xl border border-white/[0.08] px-6 py-5 max-w-xs w-full space-y-2 text-sm text-[#f5ede0]/80">
          <p className="font-semibold text-[#f5ede0]/50 text-xs uppercase tracking-wide">
            Ce qui arrive
          </p>
          <ul className="space-y-1 text-left list-none">
            {[
              "Défis en temps réel avec tes amis",
              "Partage de listes de kanjis",
              "Classement entre amis",
              "Notifications de défi",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="text-[#c9a84c]">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <Link
          href="/"
          className="mt-4 px-6 py-3 rounded-2xl bg-[#c41e1e] text-[#f5ede0] font-semibold hover:bg-[#c41e1e]/80 transition-colors"
        >
          Retour au menu
        </Link>
      </main>
    </div>
  );
}
