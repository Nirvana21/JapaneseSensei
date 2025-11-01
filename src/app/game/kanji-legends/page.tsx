"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { KANJI_LEGENDS } from "@/data/game/kanjiLegends";
import { RADICAL_INFO } from "@/data/game/radicals";
import { GameKanji, KanjiPower } from "@/types/kanjiLegends";
import { buildRound, isSelectionCorrect, pickTarget } from "@/services/kanjiLegendsService";

export default function KanjiLegendsPage() {
  const [hearts, setHearts] = useState(3);
  const [maxHearts] = useState(3);
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [floor, setFloor] = useState(1);
  const [relics, setRelics] = useState<KanjiPower[]>([]);
  const [usedHintThisRound, setUsedHintThisRound] = useState(false);
  const [peekVisible, setPeekVisible] = useState(false);
  const [usedPeekThisRound, setUsedPeekThisRound] = useState(false);

  const [target, setTarget] = useState<GameKanji | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [required, setRequired] = useState(0);
  const [picked, setPicked] = useState<number[]>([]); // indices sélectionnés
  const [disabledOpts, setDisabledOpts] = useState<number[]>([]); // indices désactivés
  const [feedback, setFeedback] = useState<null | { ok: boolean; message: string }>(null);
  const [dropMsg, setDropMsg] = useState<string | null>(null);

  // Start
  useEffect(() => {
    nextRound();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      handleVerify();
      return;
    }
    const t = setTimeout(() => setTimeLeft(tl => tl - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft]);

  const sumPower = (effect: KanjiPower["effect"]) => relics.filter(r => r.effect === effect).reduce((a, b) => a + (b.value || 0), 0);

  const nextRound = () => {
    const tgt = pickTarget(KANJI_LEGENDS);
    if (!tgt) return;
    const round = buildRound(tgt, KANJI_LEGENDS);
    setTarget(tgt);
    setOptions(round.componentOptions);
    setRequired(round.required);
    setPicked([]);
    setFeedback(null);
    setDisabledOpts([]);
    setUsedHintThisRound(false);
    setUsedPeekThisRound(false);
    setPeekVisible(false);
    // base 30s + extraTime from relics
    const extra = sumPower('extraTime');
    const base = 30 + extra;
    setTimeLeft(base);
  };

  const togglePick = (i: number) => {
    setPicked(prev => {
      if (prev.includes(i)) return prev.filter(x => x !== i);
      if (prev.length >= required) return prev; // limit
      return [...prev, i];
    });
  };

  const upsertRelic = (p: KanjiPower) => {
    setRelics(prev => {
      const i = prev.findIndex(r => r.id === p.id);
      if (i >= 0) {
        const copy = prev.slice();
        copy[i] = { ...copy[i], value: (copy[i].value || 0) + (p.value || 0) };
        return copy;
      }
      return [...prev, { ...p }];
    });
  };

  const consumeShieldIfAny = (): boolean => {
    const idx = relics.findIndex(r => r.effect === 'shield' && r.value > 0);
    if (idx >= 0) {
      const copy = relics.slice();
      copy[idx] = { ...copy[idx], value: copy[idx].value - 1 };
      setRelics(copy);
      return true;
    }
    return false;
  };

  const handleVerify = () => {
    if (!target) return;
    const pickedChars = picked.map(i => options[i]);
    const ok = isSelectionCorrect(target, pickedChars);
    if (ok) {
      const comboBoost = sumPower('comboBoost');
      const noHintBonus = !usedHintThisRound ? 50 : 0;
      const noPeekBonus = !usedPeekThisRound ? 50 : 0;
      const add = 100 + (combo + comboBoost) * 25 + noHintBonus + noPeekBonus;
      setScore(s => s + add);
      setCombo(k => k + 1);
      setFeedback({ ok: true, message: `+${add} points${noHintBonus ? ' (sans indice +50)' : ''}${noPeekBonus ? ' (sans regard +50)' : ''}` });
      // Drop de pouvoir lié au kanji (si défini)
      if (target.power) {
        upsertRelic(target.power);
        setDropMsg(`🔮 +${target.power.value} ${target.power.name}`);
      } else {
        setDropMsg(null);
      }
      setFloor(f => f + 1);
      setTimeout(() => nextRound(), 700);
    } else {
      // Consommer un bouclier si dispo
      const saved = consumeShieldIfAny();
      if (!saved) setHearts(h => Math.max(0, h - 1));
      setCombo(0);
      setFeedback({ ok: false, message: saved ? '🛡️ Bouclier ! Erreur ignorée' : '❌ Mauvaise combinaison' });
      if (!saved && hearts - 1 <= 0) {
        // game over
        // simple reset for prototype
        setTimeout(() => {
          setHearts(maxHearts);
          setScore(0);
          setCombo(0);
          setFloor(1);
          setRelics([]);
          nextRound();
        }, 1000);
      } else {
        setTimeout(() => nextRound(), 700);
      }
    }
  };

  const progress = useMemo(() => ({ hearts, maxHearts, timeLeft, score, combo, floor }), [hearts, maxHearts, timeLeft, score, combo, floor]);
  const getRadicalMeaning = (c: string) => RADICAL_INFO[c]?.meaningFr || 'à compléter';
  const targetBreakdown = useMemo(() => {
    if (!target) return '';
    const parts = target.components.map(c => `${c} (${getRadicalMeaning(c)})`).join(' + ');
    return `${parts} → ${target.nameFr}`;
  }, [target]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50">
      <header className="sticky top-0 z-50 bg-gradient-to-r from-indigo-100/90 to-blue-100/90 backdrop-blur-md border-b border-indigo-200/50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 px-3 py-2 bg-indigo-200/50 hover:bg-blue-200/50 text-indigo-800 font-medium rounded-lg transition-colors">
            <span>←</span>
            <span className="hidden sm:inline">Menu</span>
          </Link>
          <h1 className="text-xl font-bold text-indigo-900">🔶 Kanji Legends (mode radicaux)</h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* HUD */}
        <div className="mb-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-white/70 border border-indigo-200 text-indigo-900 text-center"><div className="text-xs">Etage</div><div className="text-lg font-bold">{progress.floor}</div></div>
          <div className="p-3 rounded-xl bg-white/70 border border-indigo-200 text-indigo-900 text-center"><div className="text-xs">Score</div><div className="text-lg font-bold">{progress.score}</div></div>
          <div className="p-3 rounded-xl bg-white/70 border border-indigo-200 text-indigo-900 text-center"><div className="text-xs">Combo</div><div className="text-lg font-bold">x{progress.combo}</div></div>
          <div className="p-3 rounded-xl bg-white/70 border border-indigo-200 text-indigo-900 text-center"><div className="text-xs">Temps</div><div className="text-lg font-bold">{progress.timeLeft}s</div></div>
        </div>
        <div className="mb-6 flex items-center gap-2">
          {Array.from({length: progress.maxHearts}).map((_, i) => (
            <div key={i} className={`h-4 flex-1 rounded-full ${i < progress.hearts ? 'bg-rose-500' : 'bg-rose-200'}`}/>
          ))}
        </div>

        {/* Target */}
        {target && (
          <div className={`rounded-3xl border p-6 shadow ${target.rarity === 'epic' ? 'bg-gradient-to-br from-yellow-50/90 to-amber-100/80 border-amber-200' : target.rarity === 'rare' ? 'bg-gradient-to-br from-indigo-50/90 to-blue-50/80 border-indigo-200' : 'bg-gradient-to-br from-white/80 to-indigo-50/80 border-indigo-200'}`}>
            <div className="text-center mb-4">
              <div className="text-sm text-indigo-700">Assembler les composants</div>
              <div className="text-6xl sm:text-7xl font-extrabold text-indigo-900 tracking-tight">{!peekVisible ? '???' : target.char}</div>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">🎯 {target.nameFr}</span>
                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200">🧩 {required} éléments</span>
                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-200">🙈 caché</span>
              </div>
              {dropMsg && <div className="mt-2 text-xs text-amber-700">{dropMsg}</div>}
            </div>

            {/* Options */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {options.map((c, i) => {
                const active = picked.includes(i);
                const disabled = disabledOpts.includes(i);
                return (
                  <button key={`${c}-${i}`} onClick={() => !disabled && togglePick(i)} disabled={disabled} title={`${c} — ${getRadicalMeaning(c)}`} className={`aspect-square rounded-2xl border flex flex-col items-center justify-center select-none transition shadow-sm ${disabled ? 'opacity-40 cursor-not-allowed bg-gray-50 border-gray-200' : active ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white border-indigo-700 shadow-md' : 'bg-white text-indigo-900 border-indigo-200 hover:border-indigo-400 hover:shadow-md hover:-translate-y-0.5'}`}>
                    <div className="text-3xl sm:text-4xl leading-none">{c}</div>
                    <div className={`mt-1 text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full border ${active ? 'text-indigo-50 bg-indigo-500/40 border-indigo-400' : 'text-indigo-700 bg-indigo-50 border-indigo-200'}`}>{getRadicalMeaning(c)}</div>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex gap-3 flex-wrap items-center">
              {/* Indice si disponible */}
              {sumPower('hint') > 0 && (
                <button onClick={() => {
                  // trouver un leurre non désactivé
                  if (!target) return;
                  const wrongIdx = options
                    .map((o, idx) => ({ o, idx }))
                    .filter(x => !target.components.includes(x.o) && !disabledOpts.includes(x.idx))
                    .map(x => x.idx);
                  if (wrongIdx.length === 0) return;
                  const pickIdx = wrongIdx[Math.floor(Math.random() * wrongIdx.length)];
                  setDisabledOpts(prev => [...prev, pickIdx]);
                  setUsedHintThisRound(true);
                  // consommer 1 charge hint
                  const idx = relics.findIndex(r => r.effect === 'hint' && r.value > 0);
                  if (idx >= 0) {
                    const copy = relics.slice();
                    copy[idx] = { ...copy[idx], value: copy[idx].value - 1 };
                    setRelics(copy);
                  }
                }} className="px-3 py-2 rounded-xl bg-amber-200 text-amber-900 border border-amber-300 hover:bg-amber-300 text-sm">
                  🔍 Indice ({sumPower('hint')})
                </button>
              )}
              <button onClick={() => {
                if (!peekVisible) {
                  setPeekVisible(true);
                  setUsedPeekThisRound(true);
                  setTimeLeft(t => Math.max(0, t - 5));
                  setTimeout(() => setPeekVisible(false), 1000);
                }
              }} className="px-3 py-2 rounded-xl bg-purple-200 text-purple-900 border border-purple-300 hover:bg-purple-300 text-sm">
                👀 Regarder (−5s)
              </button>
              <div className="ml-auto text-xs text-indigo-700">Résous sans indice ni regard pour des bonus.</div>
              <button onClick={handleVerify} className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold hover:from-green-600 hover:to-green-700">Valider</button>
              <button onClick={nextRound} className="px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-blue-700">Passer</button>
            </div>

            {feedback && (
              <div className={`mt-4 p-3 rounded-lg border ${feedback.ok ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                {feedback.message}
              </div>
            )}

            {/* Stub inventaire/pouvoirs */}
            <div className="mt-6 p-4 rounded-xl bg-white/70 border border-indigo-200">
              <div className="text-sm text-indigo-700 mb-2">Pouvoirs actifs</div>
              {relics.length === 0 ? (
                <div className="text-xs text-indigo-600">Gagne des pouvoirs en réussissant des kanji qui en ont.</div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {relics.map(r => (
                    <div key={r.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800 text-sm">
                      <img src={`/sprites/power-${r.effect}.svg`} alt={r.name} className="w-5 h-5" />
                      <span className="font-medium">{r.name}</span>
                      <span className="opacity-70">×{r.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
