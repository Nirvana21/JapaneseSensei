import { AdjectiveEntry } from "../types/grammar";

// ~20 adjectifs courants (い / な) avec lectures et sens FR
export const ADJECTIVES: AdjectiveEntry[] = [
  // i-adjectifs
  { dict: "大きい", reading: "おおきい", class: "i", meaningFr: "grand" },
  { dict: "小さい", reading: "ちいさい", class: "i", meaningFr: "petit" },
  { dict: "新しい", reading: "あたらしい", class: "i", meaningFr: "nouveau" },
  { dict: "古い", reading: "ふるい", class: "i", meaningFr: "vieux/ancien" },
  { dict: "高い", reading: "たかい", class: "i", meaningFr: "haut/cher" },
  { dict: "低い", reading: "ひくい", class: "i", meaningFr: "bas" },
  { dict: "早い", reading: "はやい", class: "i", meaningFr: "tôt/rapide" },
  { dict: "遅い", reading: "おそい", class: "i", meaningFr: "tard/lent" },
  { dict: "面白い", reading: "おもしろい", class: "i", meaningFr: "intéressant/drôle" },
  { dict: "難しい", reading: "むずかしい", class: "i", meaningFr: "difficile" },
  { dict: "忙しい", reading: "いそがしい", class: "i", meaningFr: "occupé" },
  { dict: "暑い", reading: "あつい", class: "i", meaningFr: "chaud (temps)" },
  { dict: "寒い", reading: "さむい", class: "i", meaningFr: "froid (temps)" },
  { dict: "長い", reading: "ながい", class: "i", meaningFr: "long" },
  { dict: "短い", reading: "みじかい", class: "i", meaningFr: "court" },
  // exception いい
  { dict: "いい", reading: "いい", class: "i", meaningFr: "bon" },
  { dict: "悪い", reading: "わるい", class: "i", meaningFr: "mauvais" },

  // na-adjectifs (stockés sans な)
  { dict: "きれい", reading: "きれい", class: "na", meaningFr: "beau/propre" },
  { dict: "静か", reading: "しずか", class: "na", meaningFr: "calme" },
  { dict: "有名", reading: "ゆうめい", class: "na", meaningFr: "célèbre" },
  { dict: "元気", reading: "げんき", class: "na", meaningFr: "en forme/énergique" },
  { dict: "便利", reading: "べんり", class: "na", meaningFr: "pratique" },
  { dict: "簡単", reading: "かんたん", class: "na", meaningFr: "simple" },
  { dict: "上手", reading: "じょうず", class: "na", meaningFr: "doué" },
  { dict: "下手", reading: "へた", class: "na", meaningFr: "maladroit/mauvais (habile)" },
  { dict: "好き", reading: "すき", class: "na", meaningFr: "aimé/qui plaît" },
  { dict: "大好き", reading: "だいすき", class: "na", meaningFr: "adoré" }
];
