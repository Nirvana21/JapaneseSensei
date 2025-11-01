export type VerbClass = 'ichidan' | 'godan' | 'irregular';

export interface VerbEntry {
  dict: string; // dictionary form in kanji/kana (e.g., 書く, 食べる, する)
  reading: string; // kana reading (e.g., かく, たべる, する)
  class: VerbClass;
  meaningFr: string; // French meaning
}

export type Politeness = 'plain' | 'polite';
export type Tense = 'present' | 'past';
export type Polarity = 'affirmative' | 'negative';

export type VerbFormKind =
  | 'masu'         // forme polie (present/past + polarity)
  | 'te'           // て-form
  | 'ta'           // た-form (past plain affirmative)
  | 'nai'          // negative plain present
  | 'volitional'   // volitif (plain/polite)
  | 'potential'    // potentiel
  | 'passive'      // passif
  | 'causative';   // causatif

export interface VerbFormSpec {
  kind: VerbFormKind;
  politeness?: Politeness; // for masu/volitional, and for showing polite potential/passive/causative variants
  tense?: Tense;           // for masu present/past
  polarity?: Polarity;     // for masu affirmative/negative
}

export interface ConjugationResult {
  surface: string; // conjugated surface (kanji+kana)
  reading?: string; // kana reading (optional)
  alternates?: string[]; // acceptable alternates (e.g., 食べろ / 食べよ)
}

// ————— Adjectives —————
export type AdjectiveClass = 'i' | 'na';

export interface AdjectiveEntry {
  dict: string; // dictionary/adnominal form (e.g., 高い, きれい)
  reading: string; // kana reading (e.g., たかい, きれい)
  class: AdjectiveClass;
  meaningFr: string; // French meaning
}

// For adjectives, main "declarative" covers tense/polarity/politeness (〜い/〜です / 〜くない etc.)
export type AdjFormKind =
  | 'declarative' // combines politeness/tense/polarity
  | 'te'          // 〜くて / 〜で
  | 'adverbial';  // 〜く / 〜に

export interface AdjFormSpec {
  kind: AdjFormKind;
  politeness?: Politeness; // for declarative only
  tense?: Tense;           // for declarative only
  polarity?: Polarity;     // for declarative only
}

export interface AdjectiveConjugationResult {
  surface: string;
  reading?: string;
}

// ————— Particles —————
export interface ParticleQuestion {
  id: string;
  sentence: string; // Japanese sentence with a single blank represented by ___
  answers: string[]; // acceptable particle(s), e.g., ["は"], or multiple like ["に", "へ"]
  translationFr: string; // French gloss/translation
  noteKey?: string; // optional key to show a note for this particle/use
}

export interface ParticleNote {
  key: string; // e.g., "wa", "ga", "o", "ni", "e-direction"
  title: string;
  usage: string;
  tips?: string[];
  examples?: string[];
}
