"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ADJECTIVES } from "@/data/adjectives";
import { conjugateAdjective } from "@/services/adjectiveConjugation";
import { AdjFormKind, AdjFormSpec, Polarity, Politeness, Tense, AdjectiveEntry } from "@/types/grammar";
import { getAdjFormNote } from "@/data/adjFormNotes";

const FORM_OPTIONS: { label: string; value: AdjFormKind }[] = [
  { label: "déclaratif (だ/です)", value: "declarative" },
  { label: "て", value: "te" },
  { label: "adverbial (副詞化)", value: "adverbial" },
];

export default function AdjectivesTrainingPage() {
  const [current, setCurrent] = useState<AdjectiveEntry | null>(null);
  const [formKind, setFormKind] = useState<AdjFormKind>("declarative");
  const [politeness, setPoliteness] = useState<Politeness>("polite");
  const [tense, setTense] = useState<Tense>("present");
  const [polarity, setPolarity] = useState<Polarity>("affirmative");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<null | { ok: boolean; correct: string }>(null);
  const [showNote, setShowNote] = useState(false);

  const shuffleAdj = () => {
    if (ADJECTIVES.length === 0) return;
    const idx = Math.floor(Math.random() * ADJECTIVES.length);
    setCurrent(ADJECTIVES[idx]);
    setAnswer("");
    setFeedback(null);
  };

  useEffect(() => {
    shuffleAdj();
  }, []);

  const spec: AdjFormSpec = useMemo(() => ({
    kind: formKind,
    politeness,
    tense,
    polarity,
  }), [formKind, politeness, tense, polarity]);

  const correct = useMemo(() => {
    if (!current) return null;
    try {
      return conjugateAdjective(current, spec).surface;
    } catch {
      return null;
    }
  }, [current, spec]);

  const needsPoliteness = formKind === 'declarative';
  const needsTense = formKind === 'declarative';
  const needsPolarity = formKind === 'declarative';

  const check = () => {
    if (!correct) return;
    const norm = (s: string) => s.trim();
    const ok = norm(answer) === norm(correct);
    setFeedback({ ok, correct });
    if (ok) {
      setTimeout(() => {
        shuffleAdj();
      }, 700);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <header className="sticky top-0 z-50 bg-gradient-to-r from-amber-100/90 to-orange-100/90 backdrop-blur-md border-b border-amber-200/50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 px-3 py-2 bg-amber-200/50 hover:bg-orange-200/50 text-amber-800 font-medium rounded-lg transition-colors">
            <span>←</span>
            <span className="hidden sm:inline">戻る</span>
          </Link>
          <h1 className="text-xl font-bold text-red-800">🎨 Adjectifs – formes</h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Controls */}
        <div className="bg-gradient-to-br from-orange-100/90 to-red-100/90 rounded-2xl border border-orange-200/50 p-4 sm:p-6 shadow-lg mb-6 animate-fade-in-up">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-orange-700 mb-1">Forme</label>
              <select value={formKind} onChange={e => setFormKind(e.target.value as AdjFormKind)} className="w-full px-3 py-2 rounded-lg border border-orange-300 bg-white text-slate-900">
                {FORM_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            {needsPoliteness && (
              <div>
                <label className="block text-sm text-orange-700 mb-1">Politesse</label>
                <select value={politeness} onChange={e => setPoliteness(e.target.value as Politeness)} className="w-full px-3 py-2 rounded-lg border border-orange-300 bg-white text-slate-900">
                  <option value="plain">courante</option>
                  <option value="polite">polie</option>
                </select>
              </div>
            )}
            {needsTense && (
              <div>
                <label className="block text-sm text-orange-700 mb-1">Temps</label>
                <select value={tense} onChange={e => setTense(e.target.value as Tense)} className="w-full px-3 py-2 rounded-lg border border-orange-300 bg-white text-slate-900">
                  <option value="present">présent</option>
                  <option value="past">passé</option>
                </select>
              </div>
            )}
            {needsPolarity && (
              <div>
                <label className="block text-sm text-orange-700 mb-1">Polarité</label>
                <select value={polarity} onChange={e => setPolarity(e.target.value as Polarity)} className="w-full px-3 py-2 rounded-lg border border-orange-300 bg-white text-slate-900">
                  <option value="affirmative">affirmative</option>
                  <option value="negative">négative</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Card */}
        {current && (
          <div className="bg-gradient-to-br from-orange-100/90 to-red-100/90 rounded-3xl border border-orange-200/50 p-6 shadow-xl animate-fade-in-up">
            <div className="text-center mb-4">
              <p className="text-sm text-orange-700">Adjectif</p>
              <div className="text-4xl font-bold text-red-800">{current.dict}</div>
              <div className="text-sm text-orange-600">{current.reading} • {current.meaningFr}</div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-stretch">
              <input
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                placeholder="Votre réponse (JP)"
                className="flex-1 px-4 py-3 rounded-xl border border-orange-300 focus:outline-none focus:ring-2 focus:ring-red-400 bg-white text-slate-900 placeholder-slate-500"
                onKeyDown={e => { if (e.key === 'Enter') check(); }}
              />
              <button onClick={check} className="px-4 py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold hover:from-green-600 hover:to-green-700">Vérifier</button>
              <button onClick={shuffleAdj} className="px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-blue-700">Nouvel adjectif</button>
            </div>

            {feedback && (
              <div className={`mt-4 p-3 rounded-lg border ${feedback.ok ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                {feedback.ok ? '✅ Correct !' : (
                  <span>❌ Correct: <span className="font-bold">{feedback.correct}</span></span>
                )}
              </div>
            )}

            {/* Mini fiche de cours */}
            <div className="mt-4">
              <button
                onClick={() => setShowNote(v => !v)}
                className="px-3 py-2 text-sm rounded-lg bg-amber-200/80 hover:bg-amber-200 text-amber-900 border border-amber-300/70"
              >
                {showNote ? 'Masquer la règle' : 'Afficher la règle'}
              </button>
              {showNote && (
                (() => {
                  const note = getAdjFormNote(spec);
                  return (
                    <div className="mt-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                      <h3 className="font-bold mb-1">{note.title}</h3>
                      <p className="text-sm mb-2">{note.usage}</p>
                      {note.tips && note.tips.length > 0 && (
                        <ul className="list-disc pl-5 text-sm space-y-1 mb-2">
                          {note.tips.map((t, i) => (<li key={i}>{t}</li>))}
                        </ul>
                      )}
                      {note.examples && note.examples.length > 0 && (
                        <div className="text-sm">
                          <span className="font-medium">Exemples: </span>
                          <ul className="list-disc pl-5 mt-1">
                            {note.examples.map((ex, i) => (<li key={i}>{ex}</li>))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })()
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
