"use client";

import Link from "next/link";

export default function DuoDuelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-fuchsia-50 to-pink-50 flex flex-col">
      <header className="bg-white/80 backdrop-blur border-b border-purple-100 px-4 py-3 flex items-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center w-8 h-8 rounded-xl overflow-hidden bg-amber-100 hover:bg-amber-200 transition-colors"
        >
          <img src="/sprites/logo_maison.png" alt="Menu" className="w-full h-full object-cover" />
        </Link>
        <h1 className="text-lg font-bold text-purple-900">Duo Duel</h1>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 gap-6 text-center">
        <div className="text-6xl mb-2">⚔️</div>
        <h2 className="text-2xl font-bold text-purple-900">Duo Duel</h2>
        <p className="text-purple-700 text-sm max-w-xs">
          Défiez un ami en temps réel sur vos kanjis communs.
          Ce mode multijoueur arrive bientôt !
        </p>

        <div className="bg-white rounded-2xl shadow-md px-6 py-5 max-w-xs w-full space-y-2 text-sm text-purple-800">
          <p className="font-semibold text-purple-600 text-xs uppercase tracking-wide">
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
                <span className="text-purple-400">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <Link
          href="/"
          className="mt-4 px-6 py-3 rounded-2xl bg-purple-500 text-white font-semibold hover:bg-purple-600 transition-colors"
        >
          Retour au menu
        </Link>
      </main>
    </div>
  );
}
