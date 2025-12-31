"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PARTICLE_QUESTIONS } from "@/data/particles";
import { pickRandomQuestion, checkParticleAnswer } from "@/services/particleTraining";
import { getParticleNote } from "@/data/particleNotes";

export default function ParticlesTrainingPage() {
  const [idx, setIdx] = useState<number>(-1);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<null | { ok: boolean; correct: string }>(null);
  const [showNote, setShowNote] = useState(false);

  const current = useMemo(() => {
    if (idx < 0) return null;
    return PARTICLE_QUESTIONS[idx] ?? null;
  }, [idx]);

  const nextQuestion = () => {
    const q = pickRandomQuestion(PARTICLE_QUESTIONS);
    if (!q) return;
    const newIdx = PARTICLE_QUESTIONS.findIndex(x => x.id === q.id);
    setIdx(newIdx);
    setAnswer("");
    setFeedback(null);
  };

  useEffect(() => {
    nextQuestion();
  }, []);

  const check = () => {
    if (!current) return;
    const res = checkParticleAnswer(answer, current);
    setFeedback(res);
    if (res.ok) {
      setTimeout(() => { nextQuestion(); }, 700);
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
          <h1 className="text-xl font-bold text-red-800">🧩 Particules – trous</h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {current && (
          <div className="bg-gradient-to-br from-orange-100/90 to-red-100/90 rounded-3xl border border-orange-200/50 p-6 shadow-xl animate-fade-in-up">
            <div className="text-center mb-4">
              <p className="text-sm text-orange-700">Complétez avec la particule correcte</p>
              <div className="text-2xl sm:text-3xl font-bold text-red-800 break-words leading-relaxed">
                {current.sentence.replace('___', '____')}
              </div>
              <div className="text-sm text-orange-600 mt-1">{current.translationFr}</div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-stretch">
              <input
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                placeholder="Particule (JP)"
                className="flex-1 px-4 py-3 rounded-xl border border-orange-300 focus:outline-none focus:ring-2 focus:ring-red-400 bg-white text-slate-900 placeholder-slate-500"
                onKeyDown={e => { if (e.key === 'Enter') check(); }}
              />
              <button onClick={check} className="px-4 py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold hover:from-green-600 hover:to-green-700">Vérifier</button>
              <button onClick={nextQuestion} className="px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-blue-700">Nouvelle phrase</button>
            </div>

            {feedback && (
              <div className={`mt-4 p-3 rounded-lg border ${feedback.ok ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                {feedback.ok ? '✅ Correct !' : (
                  <span>❌ Correct: <span className="font-bold">{feedback.correct}</span></span>
                )}
              </div>
            )}

            <div className="mt-4">
              <button onClick={() => setShowNote(v => !v)} className="px-3 py-2 text-sm rounded-lg bg-amber-200/80 hover:bg-amber-200 text-amber-900 border border-amber-300/70">
                {showNote ? 'Masquer la règle' : 'Afficher la règle'}
              </button>
              {showNote && (
                (() => {
                  const note = getParticleNote(current.noteKey);
                  if (!note) return null;
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
