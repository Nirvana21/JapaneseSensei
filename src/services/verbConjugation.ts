import { ConjugationResult, Polarity, Politeness, Tense, VerbEntry, VerbFormSpec } from "../types/grammar";

// Kana maps for godan stems
const GODAN_ENDINGS = {
  u: { a: "あ", i: "い", u: "う", e: "え", o: "お" },
  ku: { a: "か", i: "き", u: "く", e: "け", o: "こ" },
  gu: { a: "が", i: "ぎ", u: "ぐ", e: "げ", o: "ご" },
  su: { a: "さ", i: "し", u: "す", e: "せ", o: "そ" },
  tsu: { a: "た", i: "ち", u: "つ", e: "て", o: "と" },
  nu: { a: "な", i: "に", u: "ぬ", e: "ね", o: "の" },
  bu: { a: "ば", i: "び", u: "ぶ", e: "べ", o: "ぼ" },
  mu: { a: "ま", i: "み", u: "む", e: "め", o: "も" },
  ru: { a: "ら", i: "り", u: "る", e: "れ", o: "ろ" },
};

type GodanKey = keyof typeof GODAN_ENDINGS;

function getGodanKey(dict: string, reading: string): GodanKey | null {
  // Use reading to determine final mora
  if (reading.endsWith("く")) return "ku";
  if (reading.endsWith("ぐ")) return "gu";
  if (reading.endsWith("す")) return "su";
  if (reading.endsWith("つ")) return "tsu";
  if (reading.endsWith("ぬ")) return "nu";
  if (reading.endsWith("ぶ")) return "bu";
  if (reading.endsWith("む")) return "mu";
  if (reading.endsWith("る")) return "ru";
  if (reading.endsWith("う")) return "u";
  return null;
}

function replaceEnding(dict: string, reading: string, targetKana: string): { surface: string; reading: string } {
  // Replace only the phonetic tail; keep kanji stem if present
  // Find kana tail length (always 1 char for kana endings here)
  const kanaLen = 1;
  const surface = dict.slice(0, dict.length - kanaLen) + targetKana; // use kana for ending; OK with mixed kanji+kana
  const readingOut = reading.slice(0, reading.length - kanaLen) + targetKana;
  return { surface, reading: readingOut };
}

function godanMasuStem(verb: VerbEntry): { surface: string; reading: string } {
  const key = getGodanKey(verb.dict, verb.reading);
  if (!key) throw new Error("Godan key not found");
  const { i } = GODAN_ENDINGS[key];
  return replaceEnding(verb.dict, verb.reading, i);
}

function ichidanStem(verb: VerbEntry): { surface: string; reading: string } {
  // remove る
  if (!verb.reading.endsWith("る")) throw new Error("Ichidan reading must end with る");
  const kanjiStem = verb.dict.slice(0, verb.dict.length - 1);
  const readingStem = verb.reading.slice(0, verb.reading.length - 1);
  return { surface: kanjiStem, reading: readingStem };
}

function masuBase(verb: VerbEntry): { surface: string; reading: string } {
  if (verb.class === 'ichidan') return ichidanStem(verb);
  if (verb.class === 'godan') return godanMasuStem(verb);
  // irregular: する -> し, 来る -> き
  if (verb.dict === 'する') return { surface: 'し', reading: 'し' };
  if (verb.dict === '来る') return { surface: 'き', reading: 'き' };
  // 〜てくる compounds: 来る part becomes き
  if (verb.dict.endsWith('くる')) {
    // replace last くる by き
    const s = verb.dict.slice(0, -2) + 'き';
    const r = verb.reading.slice(0, -2) + 'き';
    return { surface: s, reading: r };
  }
  throw new Error('Unsupported irregular');
}

function plainNegative(verb: VerbEntry): ConjugationResult {
  if (verb.class === 'ichidan') {
    const stem = ichidanStem(verb);
    return { surface: stem.surface + 'ない', reading: stem.reading + 'ない' };
  }
  if (verb.class === 'godan') {
    const key = getGodanKey(verb.dict, verb.reading);
    if (!key) throw new Error('Godan key');
    // u-row to a-row, special case for "u" -> "wa"
    if (key === 'u') {
      const res = replaceEnding(verb.dict, verb.reading, 'わ');
      return { surface: res.surface + 'ない', reading: res.reading + 'ない' };
    }
    const { a } = GODAN_ENDINGS[key];
    const res = replaceEnding(verb.dict, verb.reading, a);
    return { surface: res.surface + 'ない', reading: res.reading + 'ない' };
  }
  // irregular
  if (verb.dict === 'する') return { surface: 'しない', reading: 'しない' };
  if (verb.dict === '来る') return { surface: '来ない', reading: 'こない' };
  if (verb.dict.endsWith('くる')) {
    // 来る part negative: こない
    const s = verb.dict.slice(0, -2) + 'こない';
    const r = verb.reading.slice(0, -2) + 'こない';
    return { surface: s, reading: r };
  }
  throw new Error('Unsupported irregular');
}

function teTaBase(verb: VerbEntry): { te: string; ta: string } {
  // Ichidan: stem + て/た
  if (verb.class === 'ichidan') {
    const stem = ichidanStem(verb).surface; // keep kanji stem
    return { te: stem + 'て', ta: stem + 'た' };
  }
  // Irregular する/来る
  if (verb.dict === 'する') return { te: 'して', ta: 'した' };
  if (verb.dict === '来る') return { te: '来て', ta: '来た' };
  if (verb.dict.endsWith('くる')) {
    const base = verb.dict.slice(0, -2);
    return { te: base + 'きて', ta: base + 'きた' };
  }
  // Godan
  const r = verb.reading;
  if (verb.dict === '行く' || r.endsWith('いく')) {
    // exception
    return { te: '行って', ta: '行った' };
  }
  // endpoints by reading
  if (r.endsWith('う') || r.endsWith('つ') || r.endsWith('る')) {
    const stem = verb.dict.slice(0, -1);
    return { te: stem + 'って', ta: stem + 'った' };
  }
  if (r.endsWith('む') || r.endsWith('ぶ') || r.endsWith('ぬ')) {
    const stem = verb.dict.slice(0, -1);
    return { te: stem + 'んで', ta: stem + 'んだ' };
  }
  if (r.endsWith('く')) {
    const stem = verb.dict.slice(0, -1);
    return { te: stem + 'いて', ta: stem + 'いた' };
  }
  if (r.endsWith('ぐ')) {
    const stem = verb.dict.slice(0, -1);
    return { te: stem + 'いで', ta: stem + 'いだ' };
  }
  if (r.endsWith('す')) {
    const stem = verb.dict.slice(0, -1);
    return { te: stem + 'して', ta: stem + 'した' };
  }
  // fallback
  const stem = verb.dict.slice(0, -1);
  return { te: stem + 'て', ta: stem + 'た' };
}

function potentialPlain(verb: VerbEntry): ConjugationResult {
  if (verb.class === 'ichidan') {
    const stem = ichidanStem(verb);
    return { surface: stem.surface + 'られる', reading: stem.reading + 'られる' };
  }
  if (verb.class === 'godan') {
    const key = getGodanKey(verb.dict, verb.reading);
    if (!key) throw new Error('Godan key');
    const { e } = GODAN_ENDINGS[key];
    const res = replaceEnding(verb.dict, verb.reading, e);
    return { surface: res.surface + 'る', reading: res.reading + 'る' };
  }
  if (verb.dict === 'する') return { surface: 'できる', reading: 'できる' };
  if (verb.dict === '来る') return { surface: '来られる', reading: 'こられる' };
  if (verb.dict.endsWith('くる')) {
    const s = verb.dict.slice(0, -2) + 'こられる';
    const r = verb.reading.slice(0, -2) + 'こられる';
    return { surface: s, reading: r };
  }
  throw new Error('Unsupported irregular');
}

function passivePlain(verb: VerbEntry): ConjugationResult {
  if (verb.class === 'ichidan') {
    const stem = ichidanStem(verb);
    return { surface: stem.surface + 'られる', reading: stem.reading + 'られる' };
  }
  if (verb.class === 'godan') {
    const key = getGodanKey(verb.dict, verb.reading);
    if (!key) throw new Error('Godan key');
    const { a } = GODAN_ENDINGS[key];
    const res = replaceEnding(verb.dict, verb.reading, a);
    return { surface: res.surface + 'れる', reading: res.reading + 'れる' };
  }
  if (verb.dict === 'する') return { surface: 'される', reading: 'される' };
  if (verb.dict === '来る') return { surface: '来られる', reading: 'こられる' };
  if (verb.dict.endsWith('くる')) {
    const s = verb.dict.slice(0, -2) + 'こられる';
    const r = verb.reading.slice(0, -2) + 'こられる';
    return { surface: s, reading: r };
  }
  throw new Error('Unsupported irregular');
}

function causativePlain(verb: VerbEntry): ConjugationResult {
  if (verb.class === 'ichidan') {
    const stem = ichidanStem(verb);
    return { surface: stem.surface + 'させる', reading: stem.reading + 'させる' };
  }
  if (verb.class === 'godan') {
    const key = getGodanKey(verb.dict, verb.reading);
    if (!key) throw new Error('Godan key');
    const { a } = GODAN_ENDINGS[key];
    const res = replaceEnding(verb.dict, verb.reading, a);
    return { surface: res.surface + 'せる', reading: res.reading + 'せる' };
  }
  if (verb.dict === 'する') return { surface: 'させる', reading: 'させる' };
  if (verb.dict === '来る') return { surface: '来させる', reading: 'こさせる' };
  if (verb.dict.endsWith('くる')) {
    const s = verb.dict.slice(0, -2) + 'こさせる';
    const r = verb.reading.slice(0, -2) + 'こさせる';
    return { surface: s, reading: r };
  }
  throw new Error('Unsupported irregular');
}

function volitional(verb: VerbEntry, politeness: Politeness = 'plain'): ConjugationResult {
  if (politeness === 'polite') {
    const base = masuBase(verb);
    return { surface: base.surface + 'ましょう', reading: base.reading + 'ましょう' };
  }
  // plain
  if (verb.class === 'ichidan') {
    const stem = ichidanStem(verb);
    return { surface: stem.surface + 'よう', reading: stem.reading + 'よう' };
  }
  if (verb.class === 'godan') {
    const key = getGodanKey(verb.dict, verb.reading);
    if (!key) throw new Error('Godan key');
    // u -> o + う
    const { o } = GODAN_ENDINGS[key];
    const res = replaceEnding(verb.dict, verb.reading, o);
    return { surface: res.surface + 'う', reading: res.reading + 'う' };
  }
  if (verb.dict === 'する') return { surface: 'しよう', reading: 'しよう' };
  if (verb.dict === '来る') return { surface: '来よう', reading: 'こよう' };
  if (verb.dict.endsWith('くる')) {
    const s = verb.dict.slice(0, -2) + 'こよう';
    const r = verb.reading.slice(0, -2) + 'こよう';
    return { surface: s, reading: r };
  }
  throw new Error('Unsupported irregular');
}

export function conjugate(verb: VerbEntry, spec: VerbFormSpec): ConjugationResult {
  const kind = spec.kind;
  switch (kind) {
    case 'masu': {
      const base = masuBase(verb);
      const tense: Tense = spec.tense ?? 'present';
      const polarity: Polarity = spec.polarity ?? 'affirmative';
      if (tense === 'present' && polarity === 'affirmative') return { surface: base.surface + 'ます', reading: base.reading + 'ます' };
      if (tense === 'present' && polarity === 'negative') return { surface: base.surface + 'ません', reading: base.reading + 'ません' };
      if (tense === 'past' && polarity === 'affirmative') return { surface: base.surface + 'ました', reading: base.reading + 'ました' };
      return { surface: base.surface + 'ませんでした', reading: base.reading + 'ませんでした' };
    }
    case 'te': {
      const { te } = teTaBase(verb);
      return { surface: te };
    }
    case 'ta': {
      const { ta } = teTaBase(verb);
      return { surface: ta };
    }
    case 'nai': {
      return plainNegative(verb);
    }
    case 'volitional': {
      return volitional(verb, spec.politeness);
    }
    case 'potential': {
      const res = potentialPlain(verb);
      if (spec.politeness === 'polite') {
        // polite potential = masu-form of potential plain
        return {
          surface: res.surface.replace(/る$/, '') + 'ます',
        };
      }
      return res;
    }
    case 'passive': {
      const res = passivePlain(verb);
      if (spec.politeness === 'polite') {
        return {
          surface: res.surface.replace(/る$/, '') + 'ます',
        };
      }
      return res;
    }
    case 'causative': {
      const res = causativePlain(verb);
      if (spec.politeness === 'polite') {
        return {
          surface: res.surface.replace(/る$/, '') + 'ます',
        };
      }
      return res;
    }
    default:
      return { surface: verb.dict };
  }
}
