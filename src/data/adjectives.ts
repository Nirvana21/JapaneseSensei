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
  ,
  // i-adjectifs supplémentaires
  { dict: "明るい", reading: "あかるい", class: "i", meaningFr: "lumineux/joyeux" },
  { dict: "暗い", reading: "くらい", class: "i", meaningFr: "sombre" },
  { dict: "強い", reading: "つよい", class: "i", meaningFr: "fort" },
  { dict: "弱い", reading: "よわい", class: "i", meaningFr: "faible" },
  { dict: "広い", reading: "ひろい", class: "i", meaningFr: "spacieux/large" },
  { dict: "狭い", reading: "せまい", class: "i", meaningFr: "étroit" },
  { dict: "美しい", reading: "うつくしい", class: "i", meaningFr: "magnifique" },
  { dict: "危ない", reading: "あぶない", class: "i", meaningFr: "dangereux" },
  { dict: "温かい", reading: "あたたかい", class: "i", meaningFr: "tiède/chaud (objet)" },
  { dict: "冷たい", reading: "つめたい", class: "i", meaningFr: "froid (objet)" },
  { dict: "涼しい", reading: "すずしい", class: "i", meaningFr: "frais (climat)" },
  { dict: "楽しい", reading: "たのしい", class: "i", meaningFr: "amusant/agréable" },
  { dict: "嬉しい", reading: "うれしい", class: "i", meaningFr: "content" },
  { dict: "悲しい", reading: "かなしい", class: "i", meaningFr: "triste" },
  { dict: "怖い", reading: "こわい", class: "i", meaningFr: "effrayant" },
  { dict: "若い", reading: "わかい", class: "i", meaningFr: "jeune" },
  { dict: "近い", reading: "ちかい", class: "i", meaningFr: "proche" },
  { dict: "遠い", reading: "とおい", class: "i", meaningFr: "loin" },
  { dict: "太い", reading: "ふとい", class: "i", meaningFr: "épais (diamètre)" },
  { dict: "細い", reading: "ほそい", class: "i", meaningFr: "fin/mince" },

  // na-adjectifs supplémentaires
  { dict: "賑やか", reading: "にぎやか", class: "na", meaningFr: "animé" },
  { dict: "大変", reading: "たいへん", class: "na", meaningFr: "dur/sérieux" },
  { dict: "安全", reading: "あんぜん", class: "na", meaningFr: "sûr" },
  { dict: "危険", reading: "きけん", class: "na", meaningFr: "dangereux" },
  { dict: "真面目", reading: "まじめ", class: "na", meaningFr: "sérieux/appliqué" },
  { dict: "自由", reading: "じゆう", class: "na", meaningFr: "libre" },
  { dict: "豊か", reading: "ゆたか", class: "na", meaningFr: "riche/abondant" },
  { dict: "親切", reading: "しんせつ", class: "na", meaningFr: "aimable/gentil" },
  { dict: "大切", reading: "たいせつ", class: "na", meaningFr: "important/précieux" },
  { dict: "重要", reading: "じゅうよう", class: "na", meaningFr: "important" },
  { dict: "丁寧", reading: "ていねい", class: "na", meaningFr: "poli/soigné" },
  { dict: "健康", reading: "けんこう", class: "na", meaningFr: "en bonne santé" },
  { dict: "幸せ", reading: "しあわせ", class: "na", meaningFr: "heureux" }
];
