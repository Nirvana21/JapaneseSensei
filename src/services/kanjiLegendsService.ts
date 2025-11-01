import { GameKanji, RoundSpec } from "@/types/kanjiLegends";

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pickTarget(pool: GameKanji[]): GameKanji | null {
  if (!pool || pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function buildRound(target: GameKanji, pool: GameKanji[]): RoundSpec {
  const required = target.components.length;
  // Collect decoy components from other kanji
  const others = pool.filter(k => k.id !== target.id);
  const decoys = shuffle(others.flatMap(k => k.components)).filter(c => !target.components.includes(c));
  const options = shuffle([...target.components, ...decoys.slice(0, Math.max(2, 5 - required))]);
  return { target, componentOptions: options, required };
}

export function isSelectionCorrect(target: GameKanji, picked: string[]): boolean {
  if (picked.length !== target.components.length) return false;
  const need = [...target.components].sort().join('|');
  const have = [...picked].sort().join('|');
  return need === have;
}
