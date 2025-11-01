import { ParticleQuestion } from "../types/grammar";

export function pickRandomQuestion(pool: ParticleQuestion[]): ParticleQuestion | null {
  if (!pool || pool.length === 0) return null;
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx];
}

function normalize(s: string) {
  return s.trim();
}

export function checkParticleAnswer(input: string, q: ParticleQuestion): { ok: boolean; correct: string } {
  const ans = normalize(input);
  const ok = q.answers.some(a => normalize(a) === ans);
  return { ok, correct: q.answers.join(' / ') };
}
