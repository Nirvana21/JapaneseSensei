import { VerbEntry } from "../types/grammar";

// 20 verbes fréquents, mélangés ichidan/godan/irréguliers
export const VERBS: VerbEntry[] = [
  { dict: "食べる", reading: "たべる", class: "ichidan", meaningFr: "manger" },
  { dict: "見る", reading: "みる", class: "ichidan", meaningFr: "voir" },
  { dict: "起きる", reading: "おきる", class: "ichidan", meaningFr: "se lever" },
  { dict: "出る", reading: "でる", class: "ichidan", meaningFr: "sortir" },
  { dict: "信じる", reading: "しんじる", class: "ichidan", meaningFr: "croire" },

  { dict: "書く", reading: "かく", class: "godan", meaningFr: "écrire" },
  { dict: "読む", reading: "よむ", class: "godan", meaningFr: "lire" },
  { dict: "話す", reading: "はなす", class: "godan", meaningFr: "parler" },
  { dict: "買う", reading: "かう", class: "godan", meaningFr: "acheter" },
  { dict: "待つ", reading: "まつ", class: "godan", meaningFr: "attendre" },
  { dict: "泳ぐ", reading: "およぐ", class: "godan", meaningFr: "nager" },
  { dict: "死ぬ", reading: "しぬ", class: "godan", meaningFr: "mourir" },
  { dict: "遊ぶ", reading: "あそぶ", class: "godan", meaningFr: "jouer" },
  { dict: "作る", reading: "つくる", class: "godan", meaningFr: "fabriquer" },
  { dict: "飲む", reading: "のむ", class: "godan", meaningFr: "boire" },
  { dict: "行く", reading: "いく", class: "godan", meaningFr: "aller" }, // te/ta exception

  { dict: "する", reading: "する", class: "irregular", meaningFr: "faire" },
  { dict: "来る", reading: "くる", class: "irregular", meaningFr: "venir" },
  { dict: "持ってくる", reading: "もってくる", class: "irregular", meaningFr: "apporter" },
  { dict: "連れてくる", reading: "つれてくる", class: "irregular", meaningFr: "amener quelqu'un" }
  ,
  // Ajouts — ichidan
  { dict: "見せる", reading: "みせる", class: "ichidan", meaningFr: "montrer" },
  { dict: "教える", reading: "おしえる", class: "ichidan", meaningFr: "enseigner" },
  { dict: "始める", reading: "はじめる", class: "ichidan", meaningFr: "commencer (transitif)" },
  { dict: "覚える", reading: "おぼえる", class: "ichidan", meaningFr: "mémoriser" },
  { dict: "開ける", reading: "あける", class: "ichidan", meaningFr: "ouvrir (transitif)" },
  { dict: "閉める", reading: "しめる", class: "ichidan", meaningFr: "fermer" },
  { dict: "寝る", reading: "ねる", class: "ichidan", meaningFr: "dormir" },
  { dict: "受ける", reading: "うける", class: "ichidan", meaningFr: "recevoir/subir (examen)" },
  { dict: "調べる", reading: "しらべる", class: "ichidan", meaningFr: "vérifier/rechercher" },
  { dict: "出かける", reading: "でかける", class: "ichidan", meaningFr: "sortir (s’absenter)" },
  { dict: "集める", reading: "あつめる", class: "ichidan", meaningFr: "rassembler/collectionner" },
  { dict: "借りる", reading: "かりる", class: "ichidan", meaningFr: "emprunter" },

  // Ajouts — godan
  { dict: "会う", reading: "あう", class: "godan", meaningFr: "rencontrer" },
  { dict: "使う", reading: "つかう", class: "godan", meaningFr: "utiliser" },
  { dict: "乗る", reading: "のる", class: "godan", meaningFr: "monter (à bord)" },
  { dict: "売る", reading: "うる", class: "godan", meaningFr: "vendre" },
  { dict: "入る", reading: "はいる", class: "godan", meaningFr: "entrer" },
  { dict: "帰る", reading: "かえる", class: "godan", meaningFr: "rentrer (chez soi)" },
  { dict: "歩く", reading: "あるく", class: "godan", meaningFr: "marcher" },
  { dict: "払う", reading: "はらう", class: "godan", meaningFr: "payer" },
  { dict: "撮る", reading: "とる", class: "godan", meaningFr: "prendre (photo)" },
  { dict: "呼ぶ", reading: "よぶ", class: "godan", meaningFr: "appeler" },
  { dict: "立つ", reading: "たつ", class: "godan", meaningFr: "se lever (debout)" },
  { dict: "置く", reading: "おく", class: "godan", meaningFr: "poser/placer" },
  { dict: "習う", reading: "ならう", class: "godan", meaningFr: "apprendre (de quelqu’un)" }
];
