import { GameKanji } from "@/types/kanjiLegends";

// Jeu: dataset indépendant de la collection utilisateur
// NB: Compositions simplifiées à visée ludique
export const KANJI_LEGENDS: GameKanji[] = [
  { id: '明', char: '明', nameFr: 'clair', components: ['日','月'], strokes: 8, rarity: 'common', onyomi:['メイ','ミョウ'], kunyomi:['あか-るい','あき-らか'], power: { id:'p-time1', name:'Lueur du jour', description:'+5s sur les rooms', effect:'extraTime', value:5 } },
  { id: '林', char: '林', nameFr: 'bosquet', components: ['木','木'], strokes: 8, rarity: 'common', onyomi:['リン'], kunyomi:['はやし'], power: { id:'p-hint1', name:'Bruissement', description:'Révèle 1 leurre', effect:'hint', value:1 } },
  { id: '森', char: '森', nameFr: 'forêt', components: ['木','木','木'], strokes: 12, rarity: 'rare', onyomi:['シン'], kunyomi:['もり'], power: { id:'p-time2', name:'Voile sylvestre', description:'+8s sur les rooms', effect:'extraTime', value:8 } },
  { id: '休', char: '休', nameFr: 'repos', components: ['亻','木'], strokes: 6, rarity: 'common', onyomi:['キュウ'], kunyomi:['やす-む','やす-み'], power: { id:'p-shield1', name:'Souffle', description:'Ignore une erreur', effect:'shield', value:1 } },
  { id: '好', char: '好', nameFr: 'aimer', components: ['女','子'], strokes: 6, rarity: 'common', onyomi:['コウ'], kunyomi:['す-き','この-む'], power: { id:'p-combo1', name:'Affinité', description:'Combo +1 palier', effect:'comboBoost', value:1 } },
  { id: '体', char: '体', nameFr: 'corps', components: ['亻','本'], strokes: 7, rarity: 'common', onyomi:['タイ','テイ'], kunyomi:['からだ'] },
  { id: '時', char: '時', nameFr: 'temps', components: ['日','寺'], strokes: 10, rarity: 'rare', onyomi:['ジ'], kunyomi:['とき'], power: { id:'p-time3', name:'Chronomètre', description:'+10s sur les rooms', effect:'extraTime', value:10 } },
  { id: '信', char: '信', nameFr: 'foi', components: ['亻','言'], strokes: 9, rarity: 'rare', onyomi:['シン'] , kunyomi:[], power: { id:'p-hint2', name:'Intuition', description:'Révèle 2 leurres', effect:'hint', value:2 } },
  { id: '語', char: '語', nameFr: 'langue', components: ['言','五','口'], strokes: 14, rarity: 'rare', onyomi:['ゴ'], kunyomi:['かた-る','かた-らう'] },
  { id: '飲', char: '飲', nameFr: 'boire', components: ['飠','欠'], strokes: 12, rarity: 'common', onyomi:['イン'], kunyomi:['の-む'] },
  { id: '食', char: '食', nameFr: 'manger', components: ['人','良'], strokes: 9, rarity: 'common', onyomi:['ショク','ジキ'], kunyomi:['た-べる','く-う'] },
  { id: '男', char: '男', nameFr: 'homme', components: ['田','力'], strokes: 7, rarity: 'common', onyomi:['ダン','ナン'], kunyomi:['おとこ'] },
  { id: '女', char: '女', nameFr: 'femme', components: ['女'], strokes: 3, rarity: 'common', onyomi:['ジョ','ニョ'], kunyomi:['おんな'] },
  { id: '週', char: '週', nameFr: 'semaine', components: ['辶','周'], strokes: 11, rarity: 'rare', onyomi:['シュウ'], kunyomi:[] },
  { id: '電', char: '電', nameFr: 'électricité', components: ['雨','田'], strokes: 13, rarity: 'rare', onyomi:['デン'], kunyomi:[] },
  { id: '駅', char: '駅', nameFr: 'gare', components: ['馬','尺'], strokes: 14, rarity: 'rare', onyomi:['エキ'], kunyomi:[] },
  { id: '海', char: '海', nameFr: 'mer', components: ['氵','毎'], strokes: 9, rarity: 'common', onyomi:['カイ'], kunyomi:['うみ'] },
  { id: '河', char: '河', nameFr: 'rivière', components: ['氵','可'], strokes: 8, rarity: 'common', onyomi:['カ'], kunyomi:['かわ'] },
  { id: '炎', char: '炎', nameFr: 'flammes', components: ['火','火'], strokes: 8, rarity: 'rare', onyomi:['エン'], kunyomi:['ほのお'], power: { id:'p-combo2', name:'Brasier', description:'Combo +2 paliers', effect:'comboBoost', value:2 } },
  { id: '灯', char: '灯', nameFr: 'lampe', components: ['火','丁'], strokes: 6, rarity: 'common', onyomi:['トウ'], kunyomi:['ひ','とも-す'] },
  { id: '秋', char: '秋', nameFr: 'automne', components: ['禾','火'], strokes: 9, rarity: 'common', onyomi:['シュウ'], kunyomi:['あき'] },
  // Diversité supplémentaire
  { id: '山', char: '山', nameFr: 'montagne', components: ['山'], strokes: 3, rarity: 'common', onyomi:['サン'], kunyomi:['やま'] },
  { id: '川', char: '川', nameFr: 'rivière', components: ['川'], strokes: 3, rarity: 'common', onyomi:[], kunyomi:['かわ'] },
  { id: '花', char: '花', nameFr: 'fleur', components: ['艹','化'], strokes: 7, rarity: 'common', onyomi:['カ'], kunyomi:['はな'] },
  { id: '空', char: '空', nameFr: 'ciel/vide', components: ['穴','工'], strokes: 8, rarity: 'common', onyomi:['クウ'], kunyomi:['そら','から'] },
  { id: '雨', char: '雨', nameFr: 'pluie', components: ['雨'], strokes: 8, rarity: 'common', onyomi:['ウ'], kunyomi:['あめ','あま'] },
  { id: '犬', char: '犬', nameFr: 'chien', components: ['犬'], strokes: 4, rarity: 'common', onyomi:['ケン'], kunyomi:['いぬ'] },
  { id: '鳥', char: '鳥', nameFr: 'oiseau', components: ['鳥'], strokes: 11, rarity: 'common', onyomi:['チョウ'], kunyomi:['とり'] },
];
