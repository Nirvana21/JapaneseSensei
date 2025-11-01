export type Rarity = 'common' | 'rare' | 'epic';

export type PowerEffectKind =
  | 'extraTime'      // +X secondes sur les rooms
  | 'shield'         // +1 coeur max ou ignore une erreur
  | 'hint'           // révèle 1 faux composant
  | 'comboBoost';    // +multiplicateur

export interface KanjiPower {
  id: string;
  name: string;
  description: string;
  effect: PowerEffectKind;
  value: number; // intensité simple (ex: +5s, +1 coeur, etc.)
}

export interface GameKanji {
  id: string;           // ex: '明'
  char: string;         // caractère kanji
  nameFr: string;       // nom ou sens principal en FR (pour flavour)
  components: string[]; // composants/éléments (radicaux ou kanji simples) ex: ['日','月']
  strokes?: number;     // info décorative
  rarity: Rarity;
  power?: KanjiPower;   // pouvoir débloqué si obtenu
}

export interface RoundSpec {
  target: GameKanji;
  componentOptions: string[]; // pool mélangé (inclut les vrais + des leurres)
  required: number;           // nb de composants à sélectionner
}

export interface RunState {
  hearts: number;
  maxHearts: number;
  timeLeft: number; // secondes
  score: number;
  combo: number;
  coins: number;
  relics: KanjiPower[]; // reliques/pouvoirs actifs
  floor: number;        // étage actuel
}
