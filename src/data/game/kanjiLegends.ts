import { GameKanji } from "@/types/kanjiLegends";

// Jeu: dataset indépendant de la collection utilisateur
// NB: Compositions simplifiées à visée ludique
export const KANJI_LEGENDS: GameKanji[] = [
  { id: '明', char: '明', nameFr: 'clair', components: ['日','月'], strokes: 8, rarity: 'common', power: { id:'p-time1', name:'Lueur du jour', description:'+5s sur les rooms', effect:'extraTime', value:5 } },
  { id: '林', char: '林', nameFr: 'bosquet', components: ['木','木'], strokes: 8, rarity: 'common', power: { id:'p-hint1', name:'Bruissement', description:'Révèle 1 leurre', effect:'hint', value:1 } },
  { id: '森', char: '森', nameFr: 'forêt', components: ['木','木','木'], strokes: 12, rarity: 'rare', power: { id:'p-time2', name:'Voile sylvestre', description:'+8s sur les rooms', effect:'extraTime', value:8 } },
  { id: '休', char: '休', nameFr: 'repos', components: ['亻','木'], strokes: 6, rarity: 'common', power: { id:'p-shield1', name:'Souffle', description:'Ignore une erreur', effect:'shield', value:1 } },
  { id: '好', char: '好', nameFr: 'aimer', components: ['女','子'], strokes: 6, rarity: 'common', power: { id:'p-combo1', name:'Affinité', description:'Combo +1 palier', effect:'comboBoost', value:1 } },
  { id: '体', char: '体', nameFr: 'corps', components: ['亻','本'], strokes: 7, rarity: 'common' },
  { id: '時', char: '時', nameFr: 'temps', components: ['日','寺'], strokes: 10, rarity: 'rare', power: { id:'p-time3', name:'Chronomètre', description:'+10s sur les rooms', effect:'extraTime', value:10 } },
  { id: '信', char: '信', nameFr: 'foi', components: ['亻','言'], strokes: 9, rarity: 'rare', power: { id:'p-hint2', name:'Intuition', description:'Révèle 2 leurres', effect:'hint', value:2 } },
  { id: '語', char: '語', nameFr: 'langue', components: ['言','五','口'], strokes: 14, rarity: 'rare' },
  { id: '飲', char: '飲', nameFr: 'boire', components: ['飠','欠'], strokes: 12, rarity: 'common' },
  { id: '食', char: '食', nameFr: 'manger', components: ['人','良'], strokes: 9, rarity: 'common' },
  { id: '男', char: '男', nameFr: 'homme', components: ['田','力'], strokes: 7, rarity: 'common' },
  { id: '女', char: '女', nameFr: 'femme', components: ['女'], strokes: 3, rarity: 'common' },
  { id: '週', char: '週', nameFr: 'semaine', components: ['辶','周'], strokes: 11, rarity: 'rare' },
  { id: '電', char: '電', nameFr: 'électricité', components: ['雨','田'], strokes: 13, rarity: 'rare' },
  { id: '駅', char: '駅', nameFr: 'gare', components: ['馬','尺'], strokes: 14, rarity: 'rare' },
  { id: '海', char: '海', nameFr: 'mer', components: ['氵','毎'], strokes: 9, rarity: 'common' },
  { id: '河', char: '河', nameFr: 'rivière', components: ['氵','可'], strokes: 8, rarity: 'common' },
  { id: '炎', char: '炎', nameFr: 'flammes', components: ['火','火'], strokes: 8, rarity: 'rare', power: { id:'p-combo2', name:'Brasier', description:'Combo +2 paliers', effect:'comboBoost', value:2 } },
  { id: '灯', char: '灯', nameFr: 'lampe', components: ['火','丁'], strokes: 6, rarity: 'common' },
  { id: '秋', char: '秋', nameFr: 'automne', components: ['禾','火'], strokes: 9, rarity: 'common' },
];
