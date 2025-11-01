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
