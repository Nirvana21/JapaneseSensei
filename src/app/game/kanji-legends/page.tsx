"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { KANJI_LEGENDS } from "@/data/game/kanjiLegends";
import { RADICAL_INFO } from "@/data/game/radicals";
import { GameKanji, KanjiPower } from "@/types/kanjiLegends";
import { buildRound, isSelectionCorrect, pickTarget } from "@/services/kanjiLegendsService";
import StrokeOrderViewer from "@/components/StrokeOrderViewer";

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
  const [roundType, setRoundType] = useState<'components'|'reading'>('components');
  const [readingKind, setReadingKind] = useState<'onyomi'|'kunyomi'|null>(null);
  const [feedback, setFeedback] = useState<null | { ok: boolean; message: string }>(null);
  const [dropMsg, setDropMsg] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState<{score:number; floor:number; bestCombo:number} | null>(null);

  // --- Lightweight SFX (Web Audio) ---
  const audioCtxRef = useRef<AudioContext | null>(null);
  const ensureAudio = () => {
    if (typeof window === 'undefined') return null;
    if (!audioCtxRef.current) {
      const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AC) audioCtxRef.current = new AC();
    }
    return audioCtxRef.current;
  };
  const beep = (freq: number, dur = 0.12, type: OscillatorType = 'sine', gain = 0.03) => {
    const ctx = ensureAudio();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      try { ctx.resume(); } catch {}
    }
    const t0 = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    osc.connect(g).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur);
  };
  const sfxSuccess = () => { beep(660, 0.08, 'triangle'); setTimeout(()=>beep(880, 0.1, 'triangle'), 70); };
  const sfxError = () => { beep(220, 0.15, 'sawtooth', 0.035); };
  const sfxShield = () => { beep(440, 0.06, 'square'); setTimeout(()=>beep(330, 0.08, 'square'), 60); };
  const sfxDrop = () => { beep(1200, 0.08, 'sine'); };

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
    setTarget(tgt);
    // ~1/3 des rooms: lecture (si dispo). On favorise les KUN si présents.
    const canOn = !!(tgt.onyomi && tgt.onyomi.length > 0);
    const canKun = !!(tgt.kunyomi && tgt.kunyomi.length > 0);
    const canReading = canOn || canKun;
    const chooseReading = canReading && Math.random() < 0.33;
    if (chooseReading) {
      // Pondération: si KUN dispo, 80% KUN / 20% ON. Sinon ce qui existe.
      let kind: 'onyomi'|'kunyomi';
      if (canKun && canOn) {
        kind = Math.random() < 0.8 ? 'kunyomi' : 'onyomi';
      } else if (canKun) {
        kind = 'kunyomi';
      } else {
        kind = 'onyomi';
      }
      setRoundType('reading');
      setReadingKind(kind);
      const correct = (kind === 'onyomi' ? (tgt.onyomi || []) : (tgt.kunyomi || [])).filter(Boolean);
      // décoys: piocher dans les autres kanji
      const others = KANJI_LEGENDS.filter(k => k.id !== tgt.id);
      const pool = others.flatMap(k => kind === 'onyomi' ? (k.onyomi || []) : (k.kunyomi || []));
      // éviter de reprendre les mêmes que correct
      const candidates = pool.filter(p => !correct.includes(p));
      // au moins 4 options totales si possible
      const needDecoys = Math.max(1, 4 - correct.length);
      const decoys: string[] = [];
      const used = new Set<string>();
      while (decoys.length < needDecoys && candidates.length > 0) {
        const idx = Math.floor(Math.random() * candidates.length);
        const val = candidates.splice(idx,1)[0];
        if (!used.has(val)) { used.add(val); decoys.push(val); }
      }
      const opts = [...correct, ...decoys].sort(() => Math.random() - 0.5);
      setOptions(opts);
      setRequired(correct.length || 1);
    } else {
      setRoundType('components');
      setReadingKind(null);
      const round = buildRound(tgt, KANJI_LEGENDS);
      setOptions(round.componentOptions);
      setRequired(round.required);
    }
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
    let ok = false;
    if (roundType === 'components') {
      ok = isSelectionCorrect(target, pickedChars);
    } else if (roundType === 'reading' && readingKind && target) {
      const correct = (readingKind === 'onyomi' ? (target.onyomi || []) : (target.kunyomi || [])).filter(Boolean).slice().sort().join('|');
      const have = pickedChars.slice().sort().join('|');
      ok = correct === have && pickedChars.length === (readingKind === 'onyomi' ? (target.onyomi?.length || 0) : (target.kunyomi?.length || 0));
    }
    if (ok) {
      const comboBoost = sumPower('comboBoost');
      const noHintBonus = !usedHintThisRound ? 50 : 0;
      const noPeekBonus = (roundType === 'components' && !usedPeekThisRound) ? 50 : 0;
      const add = 100 + (combo + comboBoost) * 25 + noHintBonus + noPeekBonus;
      setScore(s => s + add);
      setCombo(k => k + 1);
      setFeedback({ ok: true, message: `+${add} points${noHintBonus ? ' (sans indice +50)' : ''}${noPeekBonus ? ' (sans regard +50)' : ''}` });
      sfxSuccess();
      // Drop de pouvoir lié au kanji (si défini)
      if (target.power) {
        upsertRelic(target.power);
        setDropMsg(`🔮 +${target.power.value} ${target.power.name}`);
        sfxDrop();
      } else {
        setDropMsg(null);
      }
      setFloor(f => f + 1);
      // Révéler brièvement le kanji avant de passer
      setPeekVisible(true);
      setTimeout(() => nextRound(), 1100);
    } else {
      // Consommer un bouclier si dispo
      const saved = consumeShieldIfAny();
      if (!saved) setHearts(h => Math.max(0, h - 1));
      const comboBefore = combo;
      setCombo(0);
      setFeedback({ ok: false, message: saved ? '🛡️ Bouclier ! Erreur ignorée' : '❌ Mauvaise combinaison' });
      if (saved) sfxShield(); else sfxError();
      // Révéler brièvement le kanji même en cas d'erreur
      setPeekVisible(true);
      if (!saved && hearts - 1 <= 0) {
        // game over summary
        setTimeout(() => {
          setGameOver({ score, floor, bestCombo: comboBefore });
        }, 800);
      } else {
        setTimeout(() => nextRound(), 1100);
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

  const showStudyDetails = !!feedback || peekVisible;

  return (
    <div className="min-h-screen bg-[#100c08] text-[#f5ede0]">
      <header className="sticky top-0 z-50 bg-black/30 backdrop-blur-md border-b border-white/[0.08]">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 px-3 py-2 bg-white/[0.06] hover:bg-white/[0.10] text-[#f5ede0] font-medium rounded-lg transition-colors border border-white/[0.10]">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-xl overflow-hidden border border-white/10">
              <img
                src="/sprites/logo_maison.png"
                alt="Menu principal"
                className="w-full h-full object-cover"
              />
            </span>
            <span className="hidden sm:inline">Menu</span>
          </Link>
          <h1 className="text-xl font-bold text-[#f5ede0]">🔶 Kanji Legends (mode radicaux)</h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* HUD */}
        <div className="mb-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[#f5ede0] text-center">
            <div className="text-[10px] uppercase tracking-wide text-[#f5ede0]/40 flex items-center justify-center gap-1">
              <span>🗻</span>
              <span>Etage</span>
            </div>
            <div className="text-lg font-bold">{progress.floor}</div>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[#f5ede0] text-center">
            <div className="text-[10px] uppercase tracking-wide text-[#f5ede0]/40 flex items-center justify-center gap-1">
              <span>✨</span>
              <span>Score</span>
            </div>
            <div className="text-lg font-bold">{progress.score}</div>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[#f5ede0] text-center">
            <div className="text-[10px] uppercase tracking-wide text-[#f5ede0]/40 flex items-center justify-center gap-1">
              <span>🔥</span>
              <span>Combo</span>
            </div>
            <div className="text-lg font-bold">x{progress.combo}</div>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[#f5ede0] text-center">
            <div className="text-[10px] uppercase tracking-wide text-[#f5ede0]/40 flex items-center justify-center gap-1">
              <span>⏱️</span>
              <span>Temps</span>
            </div>
            <div className="text-lg font-bold">{progress.timeLeft}s</div>
          </div>
        </div>
        <div className="mb-6 flex items-center gap-2">
          {Array.from({length: progress.maxHearts}).map((_, i) => (
            <div key={i} className={`h-4 flex-1 rounded-full ${i < progress.hearts ? 'bg-rose-500' : 'bg-white/[0.10]'}`}/>
          ))}
        </div>

        {/* Zone principale jeu + fiche étude */}
        {target && (
          <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] items-start">
            {/* Carte de jeu */}
            <div className={`rounded-3xl border p-6 ${target.rarity === 'epic' ? 'bg-[#c9a84c]/10 border-[#c9a84c]/30' : target.rarity === 'rare' ? 'bg-white/[0.06] border-white/[0.15]' : 'bg-white/[0.04] border-white/[0.08]'}`}>
              <div className="text-center mb-4">
                <div className="text-xs sm:text-sm text-[#f5ede0]/60 mb-1">
                  {roundType === 'reading'
                    ? (readingKind === 'onyomi'
                        ? "Sélectionne toutes les lectures ON (カタカナ) de ce kanji"
                        : "Sélectionne toutes les lectures KUN (ひらがな) de ce kanji")
                    : "Assemble les bons composants/radicaux pour reconstruire le kanji"}
                </div>
                <div className={`text-6xl sm:text-7xl font-extrabold text-[#c9a84c] tracking-tight ${peekVisible ? 'animate-legend-glow' : ''}`}>
                  {roundType === 'reading' ? target.char : (!peekVisible ? '???' : target.char)}
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-white/[0.08] text-[#f5ede0]/70 border border-white/[0.12]">
                    🎯 {target.nameFr}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-white/[0.08] text-[#f5ede0]/70 border border-white/[0.12]">
                    🧩 {required} éléments
                  </span>
                  {roundType === 'components' && !peekVisible && (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-white/[0.08] text-[#f5ede0]/50 border border-white/[0.12]">
                      🙈 Kanji caché
                    </span>
                  )}
                </div>
                  {dropMsg && <div className="mt-2 text-xs text-[#c9a84c]/80">{dropMsg}</div>}
              </div>

              {/* Options */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {options.map((c, i) => {
                const active = picked.includes(i);
                const disabled = disabledOpts.includes(i);
                return (
                  <button key={`${c}-${i}`} onClick={() => !disabled && togglePick(i)} disabled={disabled} title={`${c} — ${getRadicalMeaning(c)}`} className={`aspect-square rounded-2xl border flex flex-col items-center justify-center select-none transition ${disabled ? 'opacity-40 cursor-not-allowed bg-white/[0.02] border-white/[0.06]' : active ? 'bg-[#c41e1e] text-[#f5ede0] border-[#c41e1e] shadow-md' : 'bg-white/[0.06] text-[#f5ede0] border-white/[0.12] hover:border-white/[0.30] hover:bg-white/[0.10] hover:-translate-y-0.5'}`}>
                    <div className="text-3xl sm:text-4xl leading-none">{c}</div>
                    {roundType === 'components' ? (
                      <div className={`mt-1 text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full border ${active ? 'text-[#f5ede0] bg-white/[0.15] border-white/[0.20]' : 'text-[#f5ede0]/50 bg-white/[0.04] border-white/[0.10]'}`}>{getRadicalMeaning(c)}</div>
                    ) : (
                      <div className={`mt-1 text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full border ${active ? 'text-[#f5ede0] bg-white/[0.15] border-white/[0.20]' : 'text-[#f5ede0]/50 bg-white/[0.04] border-white/[0.10]'}`}>{readingKind === 'onyomi' ? 'ON' : 'KUN'}</div>
                    )}
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
                  let wrongIdx: number[] = [];
                  if (roundType === 'components') {
                    wrongIdx = options
                      .map((o, idx) => ({ o, idx }))
                      .filter(x => !target.components.includes(x.o) && !disabledOpts.includes(x.idx))
                      .map(x => x.idx);
                  } else if (roundType === 'reading' && readingKind) {
                    const correct = readingKind === 'onyomi' ? (target.onyomi || []) : (target.kunyomi || []);
                    wrongIdx = options
                      .map((o, idx) => ({ o, idx }))
                      .filter(x => !correct.includes(x.o) && !disabledOpts.includes(x.idx))
                      .map(x => x.idx);
                  }
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
                }} className="px-3 py-2 rounded-xl bg-white/[0.06] text-[#f5ede0]/70 border border-white/[0.10] hover:bg-white/[0.10] text-sm">
                  🔍 Indice ({sumPower('hint')})
                </button>
              )}
              {roundType === 'components' && (<button onClick={() => {
                if (!peekVisible) {
                  setPeekVisible(true);
                  setUsedPeekThisRound(true);
                  setTimeLeft(t => Math.max(0, t - 5));
                  setTimeout(() => setPeekVisible(false), 1000);
                }
              }} className="px-3 py-2 rounded-xl bg-white/[0.06] text-[#f5ede0]/70 border border-white/[0.10] hover:bg-white/[0.10] text-sm">
                👀 Regarder (−5s)
              </button>)}
              <div className="ml-auto text-xs text-[#f5ede0]/40">
                Résous sans indice{roundType==='components' ? ' ni regard' : ''} pour des bonus.
              </div>
              <button onClick={handleVerify} className="flex-1 px-4 py-3 rounded-xl bg-[#c41e1e]/80 hover:bg-[#c41e1e] text-[#f5ede0] font-semibold">Valider</button>
              <button onClick={nextRound} className="px-4 py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.10] text-[#f5ede0] font-semibold">Passer</button>
            </div>

            {feedback && (
              <div className={`mt-4 p-3 rounded-lg border ${feedback.ok ? 'bg-green-900/20 border-green-500/40 text-green-400' : 'bg-red-900/20 border-red-500/40 text-red-400'}`}>
                {feedback.message}
              </div>
            )}

              {/* Inventaire/pouvoirs */}
              <div className="mt-6 p-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
              <div className="text-sm text-[#f5ede0]/60 mb-2">Pouvoirs actifs</div>
              {relics.length === 0 ? (
                <div className="text-xs text-[#f5ede0]/40">Gagne des pouvoirs en réussissant des kanji qui en ont.</div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {relics.map(r => (
                    <div key={r.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.10] text-[#f5ede0]/80 text-sm">
                      <img src={`/sprites/power-${r.effect}.svg`} alt={r.name} className="w-5 h-5" />
                      <span className="font-medium">{r.name}</span>
                      <span className="opacity-70">×{r.value}</span>
                    </div>
                  ))}
                </div>
              )}
              </div>
            </div>

            {/* Panneau d'étude pédagogique */}
            <aside className="rounded-3xl bg-white/[0.04] border border-white/[0.08] p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-[#f5ede0]/40">Fiche kanji</p>
                  <p className="text-lg font-bold text-[#f5ede0] flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-2xl bg-white/[0.08] border border-white/[0.10] text-2xl">
                      {target.char}
                    </span>
                    <span>{target.nameFr}</span>
                  </p>
                </div>
              </div>

              {showStudyDetails ? (
                <>
                  {(target.onyomi?.length || target.kunyomi?.length) && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-[#f5ede0]/50">Lectures</p>
                      <div className="flex flex-wrap gap-1.5">
                        {target.onyomi?.map((r, i) => (
                          <span key={`on-${i}`} className="px-2 py-0.5 rounded-full text-[11px] bg-white/[0.08] text-[#f5ede0]/70 border border-white/[0.12]">
                            ON・{r}
                          </span>
                        ))}
                        {target.kunyomi?.map((r, i) => (
                          <span key={`kun-${i}`} className="px-2 py-0.5 rounded-full text-[11px] bg-[#c9a84c]/10 text-[#c9a84c] border border-[#c9a84c]/20">
                            KUN・{r}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <p className="text-xs font-medium text-[#f5ede0]/50">Décomposition</p>
                    <p className="text-xs text-[#f5ede0]/40 mb-1">{targetBreakdown}</p>
                    <div className="space-y-1 max-h-40 overflow-auto pr-1">
                      {target.components.map((c, idx) => {
                        const info = RADICAL_INFO[c];
                        return (
                          <div
                            key={`${c}-${idx}`}
                            className="flex items-center justify-between gap-2 text-xs rounded-lg bg-white/[0.04] border border-white/[0.08] px-2 py-1"
                          >
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-white/[0.08] text-sm font-semibold text-[#c9a84c] border border-white/[0.10]">
                                {c}
                              </span>
                              <div>
                                <p className="text-[11px] text-[#f5ede0] font-medium">{info?.meaningFr || 'Radical'}</p>
                                {info?.nameJa && (
                                  <p className="text-[10px] text-[#f5ede0]/40">{info.nameJa}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-medium text-[#f5ede0]/50">Ordre des traits</p>
                    <div className="border border-white/[0.08] rounded-xl bg-white/[0.04] p-2 flex items-center justify-center">
                      <StrokeOrderViewer kanji={target.char} className="w-full max-w-[220px]" />
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-xs text-[#f5ede0]/40 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2">
                  Résous la room ou utilise 👀 pour révéler la fiche complète (lectures, radicaux détaillés et ordre des traits).
                </p>
              )}
            </aside>
          </div>
        )}
      </main>
      {gameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#100c08] border border-white/[0.08] p-6 text-center">
            <div className="text-3xl font-extrabold text-[#f5ede0]">Fin de run</div>
            <div className="mt-2 text-[#f5ede0]/50">Bien joué !</div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-[#f5ede0]">
              <div className="rounded-xl bg-white/[0.04] border border-white/[0.08] p-3"><div className="text-xs text-[#f5ede0]/40">Score</div><div className="text-lg font-bold text-[#c9a84c]">{gameOver.score}</div></div>
              <div className="rounded-xl bg-white/[0.04] border border-white/[0.08] p-3"><div className="text-xs text-[#f5ede0]/40">Etage</div><div className="text-lg font-bold text-[#c9a84c]">{gameOver.floor}</div></div>
              <div className="rounded-xl bg-white/[0.04] border border-white/[0.08] p-3"><div className="text-xs text-[#f5ede0]/40">Meilleur combo</div><div className="text-lg font-bold text-[#c9a84c]">x{gameOver.bestCombo}</div></div>
            </div>
            <div className="mt-6 flex gap-3 justify-center">
              <button onClick={() => setGameOver(null)} className="px-4 py-2 rounded-xl border border-white/[0.15] text-[#f5ede0]/70 bg-white/[0.06] hover:bg-white/[0.10]">Fermer</button>
              <button onClick={() => { setGameOver(null); setHearts(maxHearts); setScore(0); setCombo(0); setFloor(1); setRelics([]); nextRound(); }} className="px-4 py-2 rounded-xl bg-[#c41e1e] text-[#f5ede0] hover:bg-[#c41e1e]/80">Recommencer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
