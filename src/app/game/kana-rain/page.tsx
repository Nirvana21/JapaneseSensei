"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useKanjis } from "../../../hooks/useKanjis";
import { JLPT_N5, JLPT_N4, ALL_JLPT_KANJI } from "../../../data/jlptData";
import {
  simpleAdaptiveLearningService,
  SimpleLearningKanji,
} from "../../../services/adaptiveLearningService";

// ----------------------------------------------------------------
// Hiragana / Katakana → Romaji
// ----------------------------------------------------------------
function kanaToRomaji(text: string): string {
  const combos: Record<string, string> = {
    // Hiragana combos
    "きゃ": "kya", "きゅ": "kyu", "きょ": "kyo",
    "しゃ": "sha", "しゅ": "shu", "しょ": "sho",
    "ちゃ": "cha", "ちゅ": "chu", "ちょ": "cho",
    "にゃ": "nya", "にゅ": "nyu", "にょ": "nyo",
    "ひゃ": "hya", "ひゅ": "hyu", "ひょ": "hyo",
    "みゃ": "mya", "みゅ": "myu", "みょ": "myo",
    "りゃ": "rya", "りゅ": "ryu", "りょ": "ryo",
    "ぎゃ": "gya", "ぎゅ": "gyu", "ぎょ": "gyo",
    "じゃ": "ja",  "じゅ": "ju",  "じょ": "jo",
    "びゃ": "bya", "びゅ": "byu", "びょ": "byo",
    "ぴゃ": "pya", "ぴゅ": "pyu", "ぴょ": "pyo",
    // Katakana combos
    "キャ": "kya", "キュ": "kyu", "キョ": "kyo",
    "シャ": "sha", "シュ": "shu", "ショ": "sho",
    "チャ": "cha", "チュ": "chu", "チョ": "cho",
    "ニャ": "nya", "ニュ": "nyu", "ニョ": "nyo",
    "ヒャ": "hya", "ヒュ": "hyu", "ヒョ": "hyo",
    "ミャ": "mya", "ミュ": "myu", "ミョ": "myo",
    "リャ": "rya", "リュ": "ryu", "リョ": "ryo",
    "ギャ": "gya", "ギュ": "gyu", "ギョ": "gyo",
    "ジャ": "ja",  "ジュ": "ju",  "ジョ": "jo",
    "ビャ": "bya", "ビュ": "byu", "ビョ": "byo",
    "ピャ": "pya", "ピュ": "pyu", "ピョ": "pyo",
  };
  const singles: Record<string, string> = {
    // Hiragana
    "あ": "a",  "い": "i",  "う": "u",  "え": "e",  "お": "o",
    "か": "ka", "き": "ki", "く": "ku", "け": "ke", "こ": "ko",
    "さ": "sa", "し": "shi","す": "su", "せ": "se", "そ": "so",
    "た": "ta", "ち": "chi","つ": "tsu","て": "te", "と": "to",
    "な": "na", "に": "ni", "ぬ": "nu", "ね": "ne", "の": "no",
    "は": "ha", "ひ": "hi", "ふ": "fu", "へ": "he", "ほ": "ho",
    "ま": "ma", "み": "mi", "む": "mu", "め": "me", "も": "mo",
    "や": "ya", "ゆ": "yu", "よ": "yo",
    "ら": "ra", "り": "ri", "る": "ru", "れ": "re", "ろ": "ro",
    "わ": "wa", "を": "wo", "ん": "n",
    "が": "ga", "ぎ": "gi", "ぐ": "gu", "げ": "ge", "ご": "go",
    "ざ": "za", "じ": "ji", "ず": "zu", "ぜ": "ze", "ぞ": "zo",
    "だ": "da", "ぢ": "ji", "づ": "zu", "で": "de", "ど": "do",
    "ば": "ba", "び": "bi", "ぶ": "bu", "べ": "be", "ぼ": "bo",
    "ぱ": "pa", "ぴ": "pi", "ぷ": "pu", "ぺ": "pe", "ぽ": "po",
    // Katakana
    "ア": "a",  "イ": "i",  "ウ": "u",  "エ": "e",  "オ": "o",
    "カ": "ka", "キ": "ki", "ク": "ku", "ケ": "ke", "コ": "ko",
    "サ": "sa", "シ": "shi","ス": "su", "セ": "se", "ソ": "so",
    "タ": "ta", "チ": "chi","ツ": "tsu","テ": "te", "ト": "to",
    "ナ": "na", "ニ": "ni", "ヌ": "nu", "ネ": "ne", "ノ": "no",
    "ハ": "ha", "ヒ": "hi", "フ": "fu", "ヘ": "he", "ホ": "ho",
    "マ": "ma", "ミ": "mi", "ム": "mu", "メ": "me", "モ": "mo",
    "ヤ": "ya", "ユ": "yu", "ヨ": "yo",
    "ラ": "ra", "リ": "ri", "ル": "ru", "レ": "re", "ロ": "ro",
    "ワ": "wa", "ヲ": "wo", "ン": "n",
    "ガ": "ga", "ギ": "gi", "グ": "gu", "ゲ": "ge", "ゴ": "go",
    "ザ": "za", "ジ": "ji", "ズ": "zu", "ゼ": "ze", "ゾ": "zo",
    "ダ": "da", "ヂ": "ji", "ヅ": "zu", "デ": "de", "ド": "do",
    "バ": "ba", "ビ": "bi", "ブ": "bu", "ベ": "be", "ボ": "bo",
    "パ": "pa", "ピ": "pi", "プ": "pu", "ペ": "pe", "ポ": "po",
  };

  let result = "";
  let i = 0;
  while (i < text.length) {
    // Long vowel marker
    if (text[i] === "ー") { i++; continue; }
    // Small tsu (double consonant)
    if (text[i] === "っ" || text[i] === "ッ") {
      const next = singles[text[i + 1]];
      if (next) result += next[0];
      i++;
      continue;
    }
    // Two-char combo
    const two = text[i] + (text[i + 1] ?? "");
    if (combos[two]) {
      result += combos[two];
      i += 2;
      continue;
    }
    // Single char
    result += singles[text[i]] ?? text[i];
    i++;
  }
  return result;
}

// ----------------------------------------------------------------
// Types
// ----------------------------------------------------------------
type SourceMode = "personal" | "n5" | "n4" | "n5n4";
type GamePhase = "menu" | "playing" | "gameover";

interface FallingItem {
  id: number;
  kanji: string;
  readingRomaji: string;   // romaji pour la comparaison
  readingDisplay: string;  // hiragana pour l'affichage
  meaning: string;
  x: number;
  y: number;
  speed: number;
  hit: boolean;
  missed: boolean;
}

// ----------------------------------------------------------------
// Constantes
// ----------------------------------------------------------------
const GAME_HEIGHT = 520;
const FLOOR_Y = GAME_HEIGHT - 40;
const SPAWN_INTERVAL_MS = 2200;
const FRAME_MS = 50;
const BASE_SPEED = 0.9;
const SPEED_INCREMENT = 0.04;
const MAX_LIVES = 3;

let uidCounter = 0;

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------
function normalise(r: string): string {
  return r.trim().toLowerCase().replace(/\s+/g, "").replace(/[ー]/g, "");
}

function pickReading(kanji: { onyomi?: string[]; kunyomi?: string[] }): string {
  const all = [...(kanji.kunyomi ?? []), ...(kanji.onyomi ?? [])];
  return all.find(Boolean) ?? "";
}

function getPool(
  mode: SourceMode,
  personalKanjis: SimpleLearningKanji[]
): Array<{ kanji: string; readingRomaji: string; readingDisplay: string; meaning: string }> {
  if (mode === "personal") {
    return personalKanjis
      .filter((k) => k.kanji && (k.onyomi?.length || k.kunyomi?.length))
      .map((k) => {
        const raw = pickReading(k);
        return {
          kanji: k.kanji,
          readingDisplay: raw,
          readingRomaji: normalise(kanaToRomaji(raw)),
          meaning: k.meanings?.[0] ?? "",
        };
      })
      .filter((k) => k.readingRomaji.length > 0);
  }
  const base = mode === "n5" ? JLPT_N5 : mode === "n4" ? JLPT_N4 : ALL_JLPT_KANJI;
  return base.filter(
    (k) => k.onyomi.length > 0 || k.kunyomi.length > 0
  ).map((k) => {
    const raw = pickReading(k);
    return {
      kanji: k.kanji,
      readingDisplay: raw,
      readingRomaji: normalise(kanaToRomaji(raw)),
      meaning: k.meanings[0] ?? "",
    };
  }).filter((k) => k.readingRomaji.length > 0);
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ----------------------------------------------------------------
// Composant
// ----------------------------------------------------------------
export default function KanaRainPage() {
  const { kanjis } = useKanjis();

  const [sourceMode, setSourceMode] = useState<SourceMode>("n5");
  const [phase, setPhase] = useState<GamePhase>("menu");

  const [items, setItems] = useState<FallingItem[]>([]);
  const [input, setInput] = useState("");
  const [lives, setLives] = useState(MAX_LIVES);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [speed, setSpeed] = useState(BASE_SPEED);
  const [feedbacks, setFeedbacks] = useState<
    Array<{ id: number; text: string; good: boolean }>
  >([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const spawnRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const poolRef = useRef<Array<{ kanji: string; readingRomaji: string; readingDisplay: string; meaning: string }>>([]);
  const speedRef = useRef(BASE_SPEED);
  // Ref pour communiquer les misses hors du setState
  const pendingMissesRef = useRef<Array<{ kanji: string; readingDisplay: string }>>([]);

  // ----------------------------------------------------------------
  // addFeedback — useCallback stable (pas de dépendances d'état)
  // ----------------------------------------------------------------
  const addFeedback = useCallback((text: string, good: boolean) => {
    const id = ++uidCounter;
    setFeedbacks((prev) => [...prev, { id, text, good }]);
    setTimeout(
      () => setFeedbacks((prev) => prev.filter((f) => f.id !== id)),
      1400
    );
  }, []);

  // ----------------------------------------------------------------
  // Démarrer
  // ----------------------------------------------------------------
  const startGame = useCallback(() => {
    const personal = kanjis.map((k) =>
      simpleAdaptiveLearningService.initializeLearningData(k)
    );
    const pool = getPool(sourceMode, personal);
    if (pool.length === 0) return;
    poolRef.current = pool;

    setItems([]);
    setInput("");
    setLives(MAX_LIVES);
    setScore(0);
    setCombo(0);
    setBestCombo(0);
    setFeedbacks([]);
    speedRef.current = BASE_SPEED;
    setSpeed(BASE_SPEED);
    setPhase("playing");
  }, [sourceMode, kanjis]);

  // ----------------------------------------------------------------
  // endGame
  // ----------------------------------------------------------------
  const endGame = useCallback(() => {
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    if (spawnRef.current) clearInterval(spawnRef.current);
    gameLoopRef.current = null;
    spawnRef.current = null;
    setPhase("gameover");
  }, []);

  // ----------------------------------------------------------------
  // Spawn
  // ----------------------------------------------------------------
  const spawnItem = useCallback(() => {
    const pool = poolRef.current;
    if (pool.length === 0) return;
    const entry = randomItem(pool);
    const newItem: FallingItem = {
      id: ++uidCounter,
      kanji: entry.kanji,
      readingRomaji: entry.readingRomaji,
      readingDisplay: entry.readingDisplay,
      meaning: entry.meaning,
      x: 5 + Math.random() * 70,
      y: -60,
      speed: speedRef.current,
      hit: false,
      missed: false,
    };
    setItems((prev) => [...prev, newItem]);
  }, []);

  // ----------------------------------------------------------------
  // Tick — PAS de setState imbriqués dans le updater setItems
  // ----------------------------------------------------------------
  const tick = useCallback(() => {
    // Collecter les misses via closure locale (remplie dans le updater)
    const newMisses: Array<{ kanji: string; readingDisplay: string }> = [];

    setItems((prev) => {
      const updated = prev.map((item) => {
        if (item.hit || item.missed) return item;
        return { ...item, y: item.y + item.speed };
      });

      updated.forEach((item) => {
        if (!item.hit && !item.missed && item.y >= FLOOR_Y) {
          newMisses.push({ kanji: item.kanji, readingDisplay: item.readingDisplay });
        }
      });

      pendingMissesRef.current = newMisses;

      return updated.map((item) => ({
        ...item,
        missed: !item.hit && !item.missed && item.y >= FLOOR_Y ? true : item.missed,
      }));
    });

    // Traiter les misses en dehors du setState
    const misses = pendingMissesRef.current;
    if (misses.length > 0) {
      pendingMissesRef.current = [];
      setLives((l) => Math.max(0, l - misses.length));
      setCombo(0);
      misses.forEach((m) =>
        addFeedback(`✗ ${m.kanji}  ${m.readingDisplay}`, false)
      );
      speedRef.current = Math.min(
        speedRef.current + SPEED_INCREMENT * misses.length,
        4
      );
      setSpeed(speedRef.current);
    }
  }, [addFeedback]);

  // ----------------------------------------------------------------
  // Arrêter si vies = 0 (géré par useEffect, pas dans le tick)
  // ----------------------------------------------------------------
  useEffect(() => {
    if (phase === "playing" && lives <= 0) {
      endGame();
    }
  }, [lives, phase, endGame]);

  // ----------------------------------------------------------------
  // Démarrer / arrêter les intervals
  // ----------------------------------------------------------------
  useEffect(() => {
    if (phase !== "playing") return;

    spawnRef.current = setInterval(spawnItem, SPAWN_INTERVAL_MS);
    spawnItem();

    gameLoopRef.current = setInterval(tick, FRAME_MS);
    inputRef.current?.focus();

    return () => {
      if (spawnRef.current) clearInterval(spawnRef.current);
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [phase, spawnItem, tick]);

  // ----------------------------------------------------------------
  // Valider la frappe
  // ----------------------------------------------------------------
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    const normValue = normalise(value);

    let hitEntry: { kanji: string; bonus: number } | null = null;

    setItems((prev) => {
      const updated = prev.map((item) => {
        if (item.hit || item.missed) return item;
        if (normValue === item.readingRomaji) {
          const bonus = Math.floor((item.y / FLOOR_Y) * 3);
          hitEntry = { kanji: item.kanji, bonus };
          return { ...item, hit: true };
        }
        return item;
      });
      return updated;
    });

    // Traiter le hit en dehors du setState
    if (hitEntry) {
      const { kanji, bonus } = hitEntry as { kanji: string; bonus: number };
      setScore((s) => s + 1 + bonus);
      setCombo((c) => {
        const nc = c + 1;
        setBestCombo((bc) => Math.max(bc, nc));
        if (nc > 1) addFeedback(`🔥 Combo ×${nc}`, true);
        return nc;
      });
      addFeedback(`✓ ${kanji}`, true);
      setTimeout(() => setInput(""), 0);
    }
  };

  // ----------------------------------------------------------------
  // Menu
  // ----------------------------------------------------------------
  if (phase === "menu") {
    const hasPersonal = kanjis.length >= 2;
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 flex flex-col text-white">
        <header className="px-4 py-3 flex items-center gap-3 bg-white/5 border-b border-white/10">
          <Link href="/" className="inline-flex items-center justify-center w-8 h-8 rounded-xl overflow-hidden bg-amber-100">
            <img src="/sprites/logo_maison.png" alt="Menu" className="w-full h-full object-cover" />
          </Link>
          <h1 className="text-lg font-bold">Kana Rain</h1>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 gap-8">
          <div className="text-center max-w-sm">
            <div className="text-5xl mb-4">🌧️</div>
            <h2 className="text-2xl font-bold mb-2">Kana Rain</h2>
            <p className="text-blue-200 text-sm">
              Des kanjis tombent du ciel. Tape leur <strong>lecture en romaji</strong> avant
              qu'ils atteignent le sol. 3 ratés = game over !
            </p>
          </div>

          <div className="w-full max-w-xs">
            <p className="text-xs font-semibold text-blue-300 uppercase tracking-wide mb-2 text-center">
              Source des kanjis
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSourceMode("personal")}
                disabled={!hasPersonal}
                className={`py-3 px-4 rounded-2xl text-sm font-semibold border-2 transition-all ${
                  sourceMode === "personal"
                    ? "border-indigo-400 bg-indigo-500/30 text-white"
                    : "border-white/20 bg-white/5 text-blue-200 hover:border-white/40"
                } ${!hasPersonal ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                <div>Ma collection</div>
                {!hasPersonal && <div className="text-[10px] mt-0.5">(min. 2 kanjis)</div>}
              </button>
              <button
                onClick={() => setSourceMode("n5")}
                className={`py-3 px-4 rounded-2xl text-sm font-semibold border-2 transition-all ${
                  sourceMode === "n5"
                    ? "border-teal-400 bg-teal-500/30 text-white"
                    : "border-white/20 bg-white/5 text-blue-200 hover:border-white/40"
                }`}
              >
                <div>JLPT N5</div>
                <div className="text-[10px] mt-0.5 opacity-70">{JLPT_N5.length} kanjis · débutant</div>
              </button>
              <button
                onClick={() => setSourceMode("n4")}
                className={`py-3 px-4 rounded-2xl text-sm font-semibold border-2 transition-all ${
                  sourceMode === "n4"
                    ? "border-sky-400 bg-sky-500/30 text-white"
                    : "border-white/20 bg-white/5 text-blue-200 hover:border-white/40"
                }`}
              >
                <div>JLPT N4</div>
                <div className="text-[10px] mt-0.5 opacity-70">{JLPT_N4.length} kanjis · élémentaire</div>
              </button>
              <button
                onClick={() => setSourceMode("n5n4")}
                className={`py-3 px-4 rounded-2xl text-sm font-semibold border-2 transition-all ${
                  sourceMode === "n5n4"
                    ? "border-purple-400 bg-purple-500/30 text-white"
                    : "border-white/20 bg-white/5 text-blue-200 hover:border-white/40"
                }`}
              >
                <div>N5 + N4</div>
                <div className="text-[10px] mt-0.5 opacity-70">{ALL_JLPT_KANJI.length} kanjis · mélangé</div>
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-blue-300 max-w-xs bg-white/5 rounded-2xl p-3">
            <strong>Exemples :</strong> 犬 → &ldquo;inu&rdquo;, 食べる → &ldquo;taberu&rdquo;, 学校 → &ldquo;gakkou&rdquo;
          </div>

          <button
            onClick={startGame}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold text-lg shadow-lg hover:-translate-y-0.5 transition-all active:scale-95"
          >
            Commencer
          </button>
        </main>
      </div>
    );
  }

  // ----------------------------------------------------------------
  // Game Over
  // ----------------------------------------------------------------
  if (phase === "gameover") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 flex flex-col text-white">
        <header className="px-4 py-3 flex items-center gap-3 bg-white/5 border-b border-white/10">
          <Link href="/" className="inline-flex items-center justify-center w-8 h-8 rounded-xl overflow-hidden bg-amber-100">
            <img src="/sprites/logo_maison.png" alt="Menu" className="w-full h-full object-cover" />
          </Link>
          <h1 className="text-lg font-bold">Kana Rain — Game Over</h1>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 gap-6">
          <div className="text-center">
            <div className="text-6xl mb-4">💀</div>
            <div className="text-5xl font-black mb-2">{score}</div>
            <div className="text-blue-300 text-sm">points · Meilleur combo : {bestCombo}</div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setPhase("menu")}
              className="px-6 py-3 rounded-2xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition-colors"
            >
              Rejouer
            </button>
            <Link href="/" className="px-6 py-3 rounded-2xl bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors">
              Menu
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // ----------------------------------------------------------------
  // Jeu
  // ----------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 flex flex-col text-white select-none">
      {/* HUD */}
      <header className="px-4 py-2 flex items-center justify-between bg-white/5 border-b border-white/10">
        <div className="flex items-center gap-2 text-sm font-semibold">
          {Array.from({ length: MAX_LIVES }).map((_, i) => (
            <span key={i} className={i < lives ? "text-red-400 text-lg" : "text-white/20 text-lg"}>
              ❤
            </span>
          ))}
        </div>
        <div className="text-lg font-black text-blue-200">{score} pts</div>
        {combo >= 2 && (
          <div className="text-amber-400 text-sm font-bold">🔥 ×{combo}</div>
        )}
      </header>

      {/* Zone de jeu */}
      <div className="relative overflow-hidden flex-1" style={{ height: GAME_HEIGHT }}>
        {/* Ligne de mort */}
        <div className="absolute left-0 right-0 h-px bg-red-500/50" style={{ top: FLOOR_Y }} />

        {/* Kanjis tombants */}
        {items.map((item) =>
          item.missed ? null : (
            <div
              key={item.id}
              className={`absolute text-center transition-opacity duration-200 ${
                item.hit ? "opacity-0 scale-150" : "opacity-100"
              }`}
              style={{ left: `${item.x}%`, top: item.y, transform: "translateX(-50%)" }}
            >
              <div className={`text-3xl font-bold px-2 py-1 rounded-xl ${
                item.hit ? "bg-green-500/40 text-green-300" : "bg-white/10 text-white"
              }`}>
                {item.kanji}
              </div>
              <div className="text-xs text-blue-300/60 mt-0.5">{item.readingDisplay}</div>
            </div>
          )
        )}

        {/* Feedbacks flottants */}
        {feedbacks.map((f) => (
          <div
            key={f.id}
            className={`absolute left-1/2 -translate-x-1/2 text-sm font-bold pointer-events-none ${
              f.good ? "text-green-400" : "text-red-400"
            }`}
            style={{ top: "30%", animation: "fadeInUp 0.4s ease-out" }}
          >
            {f.text}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 py-4 bg-white/5 border-t border-white/10">
        <input
          ref={inputRef}
          value={input}
          onChange={handleInputChange}
          placeholder="Tape la lecture en romaji…"
          className="w-full rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 px-4 py-3 text-lg font-semibold outline-none focus:border-blue-400 transition-colors"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />
      </div>
    </div>
  );
}
