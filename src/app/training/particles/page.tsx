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
    <div className="min-h-screen bg-[#100c08] text-[#f5ede0]">
      <header className="sticky top-0 z-50 bg-black/30 backdrop-blur-md border-b border-white/[0.08]">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 px-3 py-2 bg-white/[0.06] hover:bg-white/[0.10] text-[#f5ede0] font-medium rounded-lg transition-colors border border-white/[0.10]">
            <span>←</span>
            <span className="hidden sm:inline">戻る</span>
          </Link>
          <h1 className="text-xl font-bold text-[#f5ede0] flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl overflow-hidden border border-white/10">
              <img
                src="/sprites/logo_pensif.png"
                alt="Particules – cours"
                className="w-full h-full object-cover"
              />
            </span>
            <span>Particules – trous & règle</span>
          </h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {current && (
          <div className="bg-white/[0.04] rounded-3xl border border-white/[0.08] p-6 animate-fade-in-up">
            <div className="text-center mb-4">
              <p className="text-sm text-[#f5ede0]/50">Complétez avec la particule correcte</p>
              <div className="text-2xl sm:text-3xl font-bold text-[#c9a84c] break-words leading-relaxed">
                {current.sentence.replace('___', '____')}
              </div>
              <div className="text-sm text-[#f5ede0]/50 mt-1">{current.translationFr}</div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-stretch">
              <input
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                placeholder="Particule (JP)"
                className="flex-1 px-4 py-3 rounded-xl border border-white/[0.10] focus:outline-none focus:ring-2 focus:ring-[#c41e1e]/40 bg-white/[0.06] text-[#f5ede0] placeholder-[#f5ede0]/30"
                onKeyDown={e => { if (e.key === 'Enter') check(); }}
              />
              <button onClick={check} className="px-4 py-3 rounded-xl bg-[#c41e1e]/80 hover:bg-[#c41e1e] text-[#f5ede0] font-semibold">Vérifier</button>
              <button onClick={nextQuestion} className="px-4 py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.10] text-[#f5ede0] font-semibold">Nouvelle phrase</button>
            </div>

            {feedback && (
              <div className={`mt-4 p-3 rounded-lg border ${feedback.ok ? 'bg-green-900/20 border-green-500/40 text-green-400' : 'bg-red-900/20 border-red-500/40 text-red-400'}`}>
                {feedback.ok ? '✅ Correct !' : (
                  <span>❌ Correct: <span className="font-bold">{feedback.correct}</span></span>
                )}
              </div>
            )}

            <div className="mt-4">
              <button onClick={() => setShowNote(v => !v)} className="px-3 py-2 text-sm rounded-lg bg-white/[0.06] hover:bg-white/[0.10] text-[#f5ede0]/70 border border-white/[0.10]">
                {showNote ? 'Masquer la règle' : 'Afficher la règle'}
              </button>
              {showNote && (
                (() => {
                  const note = getParticleNote(current.noteKey);
                  if (!note) return null;
                  return (
                    <div className="mt-3 p-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[#f5ede0]/80">
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
