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
];
