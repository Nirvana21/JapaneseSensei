import { AdjectiveConjugationResult, AdjectiveEntry, AdjFormSpec, Polarity, Politeness, Tense } from "../types/grammar";

function isIi(adj: AdjectiveEntry) {
  // handle いい special base よ
  return adj.reading === 'いい' || adj.dict === 'いい' || adj.dict === '良い';
}

function iAdjStem(adj: AdjectiveEntry): { surface: string; reading: string } {
  // For いい -> よ (よい as underlying)
  if (isIi(adj)) {
    return { surface: 'よ', reading: 'よ' };
    }
  // Otherwise drop the last い
  if (!adj.dict.endsWith('い') || !adj.reading.endsWith('い')) {
    // Some i-adjectives may be kana-only or kanji+kana; rely on reading check
    // If data malformed, fallback to no change
    return { surface: adj.dict, reading: adj.reading };
  }
  return {
    surface: adj.dict.slice(0, -1),
    reading: adj.reading.slice(0, -1),
  };
}

function iAdjDeclarative(adj: AdjectiveEntry, politeness: Politeness, tense: Tense, polarity: Polarity): AdjectiveConjugationResult {
  const stem = iAdjStem(adj);
  if (politeness === 'plain') {
    if (tense === 'present' && polarity === 'affirmative') {
      // dictionary form
      return { surface: adj.dict, reading: adj.reading };
    }
    if (tense === 'present' && polarity === 'negative') {
      return { surface: stem.surface + 'くない', reading: stem.reading + 'くない' };
    }
    if (tense === 'past' && polarity === 'affirmative') {
      return { surface: stem.surface + 'かった', reading: stem.reading + 'かった' };
    }
    // past negative
    return { surface: stem.surface + 'くなかった', reading: stem.reading + 'くなかった' };
  }
  // polite
  if (tense === 'present' && polarity === 'affirmative') {
    return { surface: adj.dict + 'です', reading: adj.reading + 'です' };
  }
  if (tense === 'present' && polarity === 'negative') {
    // alternative 〜くありません exists; we accept 〜くないです for simplicity
    return { surface: stem.surface + 'くないです', reading: stem.reading + 'くないです' };
  }
  if (tense === 'past' && polarity === 'affirmative') {
    return { surface: stem.surface + 'かったです', reading: stem.reading + 'かったです' };
  }
  return { surface: stem.surface + 'くなかったです', reading: stem.reading + 'くなかったです' };
}

function naAdjDeclarative(adj: AdjectiveEntry, politeness: Politeness, tense: Tense, polarity: Polarity): AdjectiveConjugationResult {
  const baseS = adj.dict;
  const baseR = adj.reading;
  if (politeness === 'plain') {
    if (tense === 'present' && polarity === 'affirmative') return { surface: baseS + 'だ', reading: baseR + 'だ' };
    if (tense === 'present' && polarity === 'negative') return { surface: baseS + 'じゃない', reading: baseR + 'じゃない' };
    if (tense === 'past' && polarity === 'affirmative') return { surface: baseS + 'だった', reading: baseR + 'だった' };
    return { surface: baseS + 'じゃなかった', reading: baseR + 'じゃなかった' };
  }
  // polite
  if (tense === 'present' && polarity === 'affirmative') return { surface: baseS + 'です', reading: baseR + 'です' };
  if (tense === 'present' && polarity === 'negative') return { surface: baseS + 'じゃないです', reading: baseR + 'じゃないです' };
  if (tense === 'past' && polarity === 'affirmative') return { surface: baseS + 'でした', reading: baseR + 'でした' };
  return { surface: baseS + 'じゃなかったです', reading: baseR + 'じゃなかったです' };
}

export function conjugateAdjective(adj: AdjectiveEntry, spec: AdjFormSpec): AdjectiveConjugationResult {
  const kind = spec.kind;
  if (kind === 'declarative') {
    const politeness: Politeness = spec.politeness ?? 'plain';
    const tense: Tense = spec.tense ?? 'present';
    const polarity: Polarity = spec.polarity ?? 'affirmative';
    if (adj.class === 'i') return iAdjDeclarative(adj, politeness, tense, polarity);
    return naAdjDeclarative(adj, politeness, tense, polarity);
  }
  if (kind === 'te') {
    if (adj.class === 'i') {
      const stem = iAdjStem(adj);
      return { surface: stem.surface + 'くて', reading: stem.reading + 'くて' };
    }
    return { surface: adj.dict + 'で', reading: adj.reading + 'で' };
  }
  // adverbial
  if (adj.class === 'i') {
    const stem = iAdjStem(adj);
    return { surface: stem.surface + 'く', reading: stem.reading + 'く' };
  }
  return { surface: adj.dict + 'に', reading: adj.reading + 'に' };
}
