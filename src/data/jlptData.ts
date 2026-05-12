// ================================================================
// Données JLPT N5 et N4 — Base de kanjis de référence
// Sens en français, lectures romaji incluses pour les jeux
// ================================================================

export interface JLPTKanjiData {
  kanji: string;
  level: "N5" | "N4";
  onyomi: string[];
  kunyomi: string[];
  meanings: string[]; // français en premier
  strokeCount: number;
  tags: string[];
  examples: Array<{ word: string; reading: string; meaning: string }>;
}

export const JLPT_N5: JLPTKanjiData[] = [
  // --- Chiffres & mesures ---
  {
    kanji: "一", level: "N5", onyomi: ["いち", "いつ"], kunyomi: ["ひと"],
    meanings: ["un", "1"],
    strokeCount: 1, tags: ["nombre", "N5"],
    examples: [{ word: "一つ", reading: "ひとつ", meaning: "un (chose)" }, { word: "一日", reading: "ついたち", meaning: "premier du mois" }]
  },
  {
    kanji: "二", level: "N5", onyomi: ["に"], kunyomi: ["ふた"],
    meanings: ["deux", "2"],
    strokeCount: 2, tags: ["nombre", "N5"],
    examples: [{ word: "二つ", reading: "ふたつ", meaning: "deux (choses)" }, { word: "二月", reading: "にがつ", meaning: "février" }]
  },
  {
    kanji: "三", level: "N5", onyomi: ["さん"], kunyomi: ["み"],
    meanings: ["trois", "3"],
    strokeCount: 3, tags: ["nombre", "N5"],
    examples: [{ word: "三つ", reading: "みっつ", meaning: "trois (choses)" }, { word: "三月", reading: "さんがつ", meaning: "mars" }]
  },
  {
    kanji: "四", level: "N5", onyomi: ["し"], kunyomi: ["よ", "よん"],
    meanings: ["quatre", "4"],
    strokeCount: 5, tags: ["nombre", "N5"],
    examples: [{ word: "四つ", reading: "よっつ", meaning: "quatre (choses)" }, { word: "四月", reading: "しがつ", meaning: "avril" }]
  },
  {
    kanji: "五", level: "N5", onyomi: ["ご"], kunyomi: ["いつ"],
    meanings: ["cinq", "5"],
    strokeCount: 4, tags: ["nombre", "N5"],
    examples: [{ word: "五つ", reading: "いつつ", meaning: "cinq (choses)" }, { word: "五月", reading: "ごがつ", meaning: "mai" }]
  },
  {
    kanji: "六", level: "N5", onyomi: ["ろく"], kunyomi: ["む"],
    meanings: ["six", "6"],
    strokeCount: 4, tags: ["nombre", "N5"],
    examples: [{ word: "六つ", reading: "むっつ", meaning: "six (choses)" }, { word: "六月", reading: "ろくがつ", meaning: "juin" }]
  },
  {
    kanji: "七", level: "N5", onyomi: ["しち"], kunyomi: ["なな"],
    meanings: ["sept", "7"],
    strokeCount: 2, tags: ["nombre", "N5"],
    examples: [{ word: "七つ", reading: "ななつ", meaning: "sept (choses)" }, { word: "七月", reading: "しちがつ", meaning: "juillet" }]
  },
  {
    kanji: "八", level: "N5", onyomi: ["はち"], kunyomi: ["や"],
    meanings: ["huit", "8"],
    strokeCount: 2, tags: ["nombre", "N5"],
    examples: [{ word: "八つ", reading: "やっつ", meaning: "huit (choses)" }, { word: "八月", reading: "はちがつ", meaning: "août" }]
  },
  {
    kanji: "九", level: "N5", onyomi: ["く", "きゅう"], kunyomi: ["ここの"],
    meanings: ["neuf", "9"],
    strokeCount: 2, tags: ["nombre", "N5"],
    examples: [{ word: "九つ", reading: "ここのつ", meaning: "neuf (choses)" }, { word: "九月", reading: "くがつ", meaning: "septembre" }]
  },
  {
    kanji: "十", level: "N5", onyomi: ["じゅう", "じっ"], kunyomi: ["とお"],
    meanings: ["dix", "10"],
    strokeCount: 2, tags: ["nombre", "N5"],
    examples: [{ word: "十", reading: "じゅう", meaning: "dix" }, { word: "二十", reading: "はたち", meaning: "vingt ans" }]
  },
  {
    kanji: "百", level: "N5", onyomi: ["ひゃく"], kunyomi: [],
    meanings: ["cent", "100"],
    strokeCount: 6, tags: ["nombre", "N5"],
    examples: [{ word: "百円", reading: "ひゃくえん", meaning: "100 yens" }, { word: "三百", reading: "さんびゃく", meaning: "300" }]
  },
  {
    kanji: "千", level: "N5", onyomi: ["せん"], kunyomi: ["ち"],
    meanings: ["mille", "1000"],
    strokeCount: 3, tags: ["nombre", "N5"],
    examples: [{ word: "千円", reading: "せんえん", meaning: "1000 yens" }, { word: "三千", reading: "さんぜん", meaning: "3000" }]
  },
  {
    kanji: "万", level: "N5", onyomi: ["まん", "ばん"], kunyomi: [],
    meanings: ["dix mille", "10 000"],
    strokeCount: 3, tags: ["nombre", "N5"],
    examples: [{ word: "一万円", reading: "いちまんえん", meaning: "10 000 yens" }, { word: "万年筆", reading: "まんねんひつ", meaning: "stylo plume" }]
  },
  {
    kanji: "円", level: "N5", onyomi: ["えん"], kunyomi: ["まる"],
    meanings: ["yen", "cercle", "rond"],
    strokeCount: 4, tags: ["argent", "N5"],
    examples: [{ word: "円", reading: "えん", meaning: "yen" }, { word: "円い", reading: "まるい", meaning: "rond" }]
  },
  // --- Temps ---
  {
    kanji: "年", level: "N5", onyomi: ["ねん"], kunyomi: ["とし"],
    meanings: ["année", "an"],
    strokeCount: 6, tags: ["temps", "N5"],
    examples: [{ word: "今年", reading: "ことし", meaning: "cette année" }, { word: "来年", reading: "らいねん", meaning: "l'année prochaine" }]
  },
  {
    kanji: "月", level: "N5", onyomi: ["つき", "げつ", "がつ"], kunyomi: ["つき"],
    meanings: ["lune", "mois"],
    strokeCount: 4, tags: ["temps", "ciel", "N5"],
    examples: [{ word: "月曜日", reading: "げつようび", meaning: "lundi" }, { word: "来月", reading: "らいげつ", meaning: "le mois prochain" }]
  },
  {
    kanji: "日", level: "N5", onyomi: ["にち", "じつ"], kunyomi: ["ひ", "か"],
    meanings: ["soleil", "jour", "Japon"],
    strokeCount: 4, tags: ["temps", "ciel", "N5"],
    examples: [{ word: "日曜日", reading: "にちようび", meaning: "dimanche" }, { word: "今日", reading: "きょう", meaning: "aujourd'hui" }]
  },
  {
    kanji: "時", level: "N5", onyomi: ["じ"], kunyomi: ["とき"],
    meanings: ["heure", "moment", "temps"],
    strokeCount: 10, tags: ["temps", "N5"],
    examples: [{ word: "何時", reading: "なんじ", meaning: "quelle heure" }, { word: "時間", reading: "じかん", meaning: "durée, heure" }]
  },
  {
    kanji: "分", level: "N5", onyomi: ["ふん", "ぶん"], kunyomi: ["わ"],
    meanings: ["minute", "comprendre", "diviser"],
    strokeCount: 4, tags: ["temps", "N5"],
    examples: [{ word: "五分", reading: "ごふん", meaning: "cinq minutes" }, { word: "分かる", reading: "わかる", meaning: "comprendre" }]
  },
  {
    kanji: "週", level: "N5", onyomi: ["しゅう"], kunyomi: [],
    meanings: ["semaine"],
    strokeCount: 11, tags: ["temps", "N5"],
    examples: [{ word: "今週", reading: "こんしゅう", meaning: "cette semaine" }, { word: "来週", reading: "らいしゅう", meaning: "la semaine prochaine" }]
  },
  {
    kanji: "毎", level: "N5", onyomi: ["まい"], kunyomi: [],
    meanings: ["chaque", "tous les"],
    strokeCount: 6, tags: ["temps", "N5"],
    examples: [{ word: "毎日", reading: "まいにち", meaning: "chaque jour" }, { word: "毎朝", reading: "まいあさ", meaning: "chaque matin" }]
  },
  {
    kanji: "今", level: "N5", onyomi: ["こん", "きん"], kunyomi: ["いま"],
    meanings: ["maintenant", "présent"],
    strokeCount: 4, tags: ["temps", "N5"],
    examples: [{ word: "今", reading: "いま", meaning: "maintenant" }, { word: "今日", reading: "きょう", meaning: "aujourd'hui" }]
  },
  {
    kanji: "前", level: "N5", onyomi: ["ぜん"], kunyomi: ["まえ"],
    meanings: ["avant", "devant", "nom"],
    strokeCount: 9, tags: ["direction", "temps", "N5"],
    examples: [{ word: "前", reading: "まえ", meaning: "devant, avant" }, { word: "名前", reading: "なまえ", meaning: "prénom, nom" }]
  },
  {
    kanji: "後", level: "N5", onyomi: ["ご", "こう"], kunyomi: ["あと", "うし"],
    meanings: ["après", "derrière", "plus tard"],
    strokeCount: 9, tags: ["direction", "temps", "N5"],
    examples: [{ word: "後で", reading: "あとで", meaning: "plus tard" }, { word: "午後", reading: "ごご", meaning: "après-midi" }]
  },
  // --- Direction & position ---
  {
    kanji: "上", level: "N5", onyomi: ["じょう", "しょう"], kunyomi: ["うえ", "あ", "のぼ"],
    meanings: ["dessus", "haut", "monter"],
    strokeCount: 3, tags: ["direction", "N5"],
    examples: [{ word: "上", reading: "うえ", meaning: "dessus, en haut" }, { word: "上がる", reading: "あがる", meaning: "monter" }]
  },
  {
    kanji: "下", level: "N5", onyomi: ["か", "げ"], kunyomi: ["した", "くだ", "さ"],
    meanings: ["dessous", "bas", "descendre"],
    strokeCount: 3, tags: ["direction", "N5"],
    examples: [{ word: "下", reading: "した", meaning: "dessous, en bas" }, { word: "下さい", reading: "ください", meaning: "s'il vous plaît" }]
  },
  {
    kanji: "左", level: "N5", onyomi: ["さ"], kunyomi: ["ひだり"],
    meanings: ["gauche"],
    strokeCount: 5, tags: ["direction", "N5"],
    examples: [{ word: "左", reading: "ひだり", meaning: "gauche" }, { word: "左手", reading: "ひだりて", meaning: "main gauche" }]
  },
  {
    kanji: "右", level: "N5", onyomi: ["う", "ゆう"], kunyomi: ["みぎ"],
    meanings: ["droite"],
    strokeCount: 5, tags: ["direction", "N5"],
    examples: [{ word: "右", reading: "みぎ", meaning: "droite" }, { word: "右手", reading: "みぎて", meaning: "main droite" }]
  },
  {
    kanji: "中", level: "N5", onyomi: ["ちゅう", "じゅう"], kunyomi: ["なか"],
    meanings: ["milieu", "intérieur", "pendant"],
    strokeCount: 4, tags: ["direction", "N5"],
    examples: [{ word: "中", reading: "なか", meaning: "intérieur, milieu" }, { word: "中国", reading: "ちゅうごく", meaning: "Chine" }]
  },
  {
    kanji: "外", level: "N5", onyomi: ["がい", "げ"], kunyomi: ["そと", "はず"],
    meanings: ["extérieur", "dehors", "étranger"],
    strokeCount: 5, tags: ["direction", "N5"],
    examples: [{ word: "外", reading: "そと", meaning: "extérieur, dehors" }, { word: "外国", reading: "がいこく", meaning: "pays étranger" }]
  },
  {
    kanji: "東", level: "N5", onyomi: ["とう"], kunyomi: ["ひがし"],
    meanings: ["est", "orient"],
    strokeCount: 8, tags: ["direction", "N5"],
    examples: [{ word: "東京", reading: "とうきょう", meaning: "Tokyo" }, { word: "東", reading: "ひがし", meaning: "est" }]
  },
  {
    kanji: "西", level: "N5", onyomi: ["せい", "さい"], kunyomi: ["にし"],
    meanings: ["ouest", "occident"],
    strokeCount: 6, tags: ["direction", "N5"],
    examples: [{ word: "西", reading: "にし", meaning: "ouest" }, { word: "西洋", reading: "せいよう", meaning: "Occident" }]
  },
  {
    kanji: "南", level: "N5", onyomi: ["なん", "な"], kunyomi: ["みなみ"],
    meanings: ["sud"],
    strokeCount: 9, tags: ["direction", "N5"],
    examples: [{ word: "南", reading: "みなみ", meaning: "sud" }, { word: "南口", reading: "みなみぐち", meaning: "sortie sud" }]
  },
  {
    kanji: "北", level: "N5", onyomi: ["ほく"], kunyomi: ["きた"],
    meanings: ["nord"],
    strokeCount: 5, tags: ["direction", "N5"],
    examples: [{ word: "北", reading: "きた", meaning: "nord" }, { word: "北海道", reading: "ほっかいどう", meaning: "Hokkaido" }]
  },
  // --- Nature ---
  {
    kanji: "山", level: "N5", onyomi: ["さん"], kunyomi: ["やま"],
    meanings: ["montagne"],
    strokeCount: 3, tags: ["nature", "N5"],
    examples: [{ word: "山", reading: "やま", meaning: "montagne" }, { word: "富士山", reading: "ふじさん", meaning: "Mont Fuji" }]
  },
  {
    kanji: "川", level: "N5", onyomi: ["せん"], kunyomi: ["かわ"],
    meanings: ["rivière", "fleuve"],
    strokeCount: 3, tags: ["nature", "N5"],
    examples: [{ word: "川", reading: "かわ", meaning: "rivière" }, { word: "川口", reading: "かわぐち", meaning: "embouchure" }]
  },
  {
    kanji: "海", level: "N5", onyomi: ["かい"], kunyomi: ["うみ"],
    meanings: ["mer", "océan"],
    strokeCount: 9, tags: ["nature", "N5"],
    examples: [{ word: "海", reading: "うみ", meaning: "mer" }, { word: "海外", reading: "かいがい", meaning: "à l'étranger" }]
  },
  {
    kanji: "空", level: "N5", onyomi: ["くう"], kunyomi: ["そら", "から", "す"],
    meanings: ["ciel", "vide", "air"],
    strokeCount: 8, tags: ["nature", "ciel", "N5"],
    examples: [{ word: "空", reading: "そら", meaning: "ciel" }, { word: "空港", reading: "くうこう", meaning: "aéroport" }]
  },
  {
    kanji: "雨", level: "N5", onyomi: ["う"], kunyomi: ["あめ"],
    meanings: ["pluie"],
    strokeCount: 8, tags: ["météo", "N5"],
    examples: [{ word: "雨", reading: "あめ", meaning: "pluie" }, { word: "大雨", reading: "おおあめ", meaning: "forte pluie" }]
  },
  {
    kanji: "天", level: "N5", onyomi: ["てん"], kunyomi: ["あま"],
    meanings: ["ciel", "paradis", "temps qu'il fait"],
    strokeCount: 4, tags: ["nature", "ciel", "N5"],
    examples: [{ word: "天気", reading: "てんき", meaning: "temps, météo" }, { word: "天国", reading: "てんごく", meaning: "paradis" }]
  },
  {
    kanji: "木", level: "N5", onyomi: ["もく", "ぼく"], kunyomi: ["き"],
    meanings: ["arbre", "bois"],
    strokeCount: 4, tags: ["nature", "N5"],
    examples: [{ word: "木", reading: "き", meaning: "arbre" }, { word: "木曜日", reading: "もくようび", meaning: "jeudi" }]
  },
  {
    kanji: "花", level: "N5", onyomi: ["か"], kunyomi: ["はな"],
    meanings: ["fleur"],
    strokeCount: 7, tags: ["nature", "N5"],
    examples: [{ word: "花", reading: "はな", meaning: "fleur" }, { word: "花見", reading: "はなみ", meaning: "contemplation des cerisiers" }]
  },
  {
    kanji: "水", level: "N5", onyomi: ["すい"], kunyomi: ["みず"],
    meanings: ["eau"],
    strokeCount: 4, tags: ["nature", "N5"],
    examples: [{ word: "水", reading: "みず", meaning: "eau" }, { word: "水曜日", reading: "すいようび", meaning: "mercredi" }]
  },
  {
    kanji: "火", level: "N5", onyomi: ["か"], kunyomi: ["ひ"],
    meanings: ["feu"],
    strokeCount: 4, tags: ["nature", "N5"],
    examples: [{ word: "火", reading: "ひ", meaning: "feu" }, { word: "火曜日", reading: "かようび", meaning: "mardi" }]
  },
  {
    kanji: "金", level: "N5", onyomi: ["きん", "こん"], kunyomi: ["かね"],
    meanings: ["or", "argent (monnaie)", "métal"],
    strokeCount: 8, tags: ["nature", "argent", "N5"],
    examples: [{ word: "お金", reading: "おかね", meaning: "argent" }, { word: "金曜日", reading: "きんようび", meaning: "vendredi" }]
  },
  {
    kanji: "土", level: "N5", onyomi: ["ど", "と"], kunyomi: ["つち"],
    meanings: ["terre", "sol"],
    strokeCount: 3, tags: ["nature", "N5"],
    examples: [{ word: "土", reading: "つち", meaning: "terre, sol" }, { word: "土曜日", reading: "どようび", meaning: "samedi" }]
  },
  // --- Personnes & famille ---
  {
    kanji: "人", level: "N5", onyomi: ["じん", "にん"], kunyomi: ["ひと"],
    meanings: ["personne", "gens"],
    strokeCount: 2, tags: ["personne", "N5"],
    examples: [{ word: "人", reading: "ひと", meaning: "personne" }, { word: "日本人", reading: "にほんじん", meaning: "Japonais(e)" }]
  },
  {
    kanji: "男", level: "N5", onyomi: ["だん", "なん"], kunyomi: ["おとこ"],
    meanings: ["homme", "masculin"],
    strokeCount: 7, tags: ["personne", "N5"],
    examples: [{ word: "男", reading: "おとこ", meaning: "homme" }, { word: "男の子", reading: "おとこのこ", meaning: "garçon" }]
  },
  {
    kanji: "女", level: "N5", onyomi: ["じょ", "にょ"], kunyomi: ["おんな"],
    meanings: ["femme", "féminin"],
    strokeCount: 3, tags: ["personne", "N5"],
    examples: [{ word: "女", reading: "おんな", meaning: "femme" }, { word: "女の子", reading: "おんなのこ", meaning: "fille" }]
  },
  {
    kanji: "子", level: "N5", onyomi: ["し", "す"], kunyomi: ["こ"],
    meanings: ["enfant", "fils"],
    strokeCount: 3, tags: ["personne", "famille", "N5"],
    examples: [{ word: "子供", reading: "こども", meaning: "enfant" }, { word: "女子", reading: "じょし", meaning: "fille, étudiante" }]
  },
  {
    kanji: "父", level: "N5", onyomi: ["ふ"], kunyomi: ["ちち"],
    meanings: ["père"],
    strokeCount: 4, tags: ["famille", "N5"],
    examples: [{ word: "父", reading: "ちち", meaning: "mon père" }, { word: "お父さん", reading: "おとうさん", meaning: "père (poli)" }]
  },
  {
    kanji: "母", level: "N5", onyomi: ["ぼ"], kunyomi: ["はは"],
    meanings: ["mère"],
    strokeCount: 5, tags: ["famille", "N5"],
    examples: [{ word: "母", reading: "はは", meaning: "ma mère" }, { word: "お母さん", reading: "おかあさん", meaning: "mère (poli)" }]
  },
  // --- Lieux ---
  {
    kanji: "国", level: "N5", onyomi: ["こく", "ごく"], kunyomi: ["くに"],
    meanings: ["pays", "nation"],
    strokeCount: 8, tags: ["lieu", "N5"],
    examples: [{ word: "国", reading: "くに", meaning: "pays" }, { word: "外国", reading: "がいこく", meaning: "pays étranger" }]
  },
  {
    kanji: "学", level: "N5", onyomi: ["がく"], kunyomi: ["まな"],
    meanings: ["étude", "apprendre", "école"],
    strokeCount: 8, tags: ["école", "N5"],
    examples: [{ word: "学校", reading: "がっこう", meaning: "école" }, { word: "大学", reading: "だいがく", meaning: "université" }]
  },
  {
    kanji: "校", level: "N5", onyomi: ["こう"], kunyomi: [],
    meanings: ["école"],
    strokeCount: 10, tags: ["école", "N5"],
    examples: [{ word: "学校", reading: "がっこう", meaning: "école" }, { word: "高校", reading: "こうこう", meaning: "lycée" }]
  },
  {
    kanji: "先", level: "N5", onyomi: ["せん"], kunyomi: ["さき"],
    meanings: ["avant", "précédent", "bout"],
    strokeCount: 6, tags: ["N5"],
    examples: [{ word: "先生", reading: "せんせい", meaning: "professeur" }, { word: "先週", reading: "せんしゅう", meaning: "la semaine dernière" }]
  },
  {
    kanji: "生", level: "N5", onyomi: ["せい", "しょう"], kunyomi: ["い", "う", "は", "き", "なま"],
    meanings: ["vie", "naissance", "cru", "étudiant"],
    strokeCount: 5, tags: ["N5"],
    examples: [{ word: "先生", reading: "せんせい", meaning: "professeur" }, { word: "学生", reading: "がくせい", meaning: "étudiant" }]
  },
  // --- Corps ---
  {
    kanji: "目", level: "N5", onyomi: ["もく", "め"], kunyomi: ["め"],
    meanings: ["œil", "yeux"],
    strokeCount: 5, tags: ["corps", "N5"],
    examples: [{ word: "目", reading: "め", meaning: "œil" }, { word: "目的", reading: "もくてき", meaning: "objectif" }]
  },
  {
    kanji: "耳", level: "N5", onyomi: ["じ"], kunyomi: ["みみ"],
    meanings: ["oreille"],
    strokeCount: 6, tags: ["corps", "N5"],
    examples: [{ word: "耳", reading: "みみ", meaning: "oreille" }, { word: "耳鼻科", reading: "じびか", meaning: "ORL" }]
  },
  {
    kanji: "口", level: "N5", onyomi: ["こう", "く"], kunyomi: ["くち"],
    meanings: ["bouche"],
    strokeCount: 3, tags: ["corps", "N5"],
    examples: [{ word: "口", reading: "くち", meaning: "bouche" }, { word: "入口", reading: "いりぐち", meaning: "entrée" }]
  },
  {
    kanji: "手", level: "N5", onyomi: ["しゅ"], kunyomi: ["て"],
    meanings: ["main"],
    strokeCount: 4, tags: ["corps", "N5"],
    examples: [{ word: "手", reading: "て", meaning: "main" }, { word: "上手", reading: "じょうず", meaning: "habile, doué" }]
  },
  {
    kanji: "足", level: "N5", onyomi: ["そく"], kunyomi: ["あし", "た"],
    meanings: ["pied", "jambe", "suffisant"],
    strokeCount: 7, tags: ["corps", "N5"],
    examples: [{ word: "足", reading: "あし", meaning: "pied, jambe" }, { word: "足りる", reading: "たりる", meaning: "être suffisant" }]
  },
  // --- Taille & qualité ---
  {
    kanji: "大", level: "N5", onyomi: ["だい", "たい"], kunyomi: ["おお"],
    meanings: ["grand", "gros"],
    strokeCount: 3, tags: ["taille", "N5"],
    examples: [{ word: "大きい", reading: "おおきい", meaning: "grand" }, { word: "大学", reading: "だいがく", meaning: "université" }]
  },
  {
    kanji: "小", level: "N5", onyomi: ["しょう"], kunyomi: ["ちい", "こ", "お"],
    meanings: ["petit"],
    strokeCount: 3, tags: ["taille", "N5"],
    examples: [{ word: "小さい", reading: "ちいさい", meaning: "petit" }, { word: "小学校", reading: "しょうがっこう", meaning: "école primaire" }]
  },
  {
    kanji: "高", level: "N5", onyomi: ["こう"], kunyomi: ["たか"],
    meanings: ["haut", "cher", "élevé"],
    strokeCount: 10, tags: ["taille", "N5"],
    examples: [{ word: "高い", reading: "たかい", meaning: "haut, cher" }, { word: "高校", reading: "こうこう", meaning: "lycée" }]
  },
  {
    kanji: "長", level: "N5", onyomi: ["ちょう"], kunyomi: ["なが"],
    meanings: ["long", "chef"],
    strokeCount: 8, tags: ["taille", "N5"],
    examples: [{ word: "長い", reading: "ながい", meaning: "long" }, { word: "社長", reading: "しゃちょう", meaning: "PDG" }]
  },
  // --- Couleurs ---
  {
    kanji: "白", level: "N5", onyomi: ["はく", "びゃく"], kunyomi: ["しろ"],
    meanings: ["blanc"],
    strokeCount: 5, tags: ["couleur", "N5"],
    examples: [{ word: "白い", reading: "しろい", meaning: "blanc" }, { word: "白米", reading: "はくまい", meaning: "riz blanc" }]
  },
  // --- Verbes d'action ---
  {
    kanji: "行", level: "N5", onyomi: ["こう", "ぎょう"], kunyomi: ["い", "ゆ", "おこな"],
    meanings: ["aller"],
    strokeCount: 6, tags: ["action", "N5"],
    examples: [{ word: "行く", reading: "いく", meaning: "aller" }, { word: "旅行", reading: "りょこう", meaning: "voyage" }]
  },
  {
    kanji: "来", level: "N5", onyomi: ["らい"], kunyomi: ["く", "き"],
    meanings: ["venir"],
    strokeCount: 7, tags: ["action", "N5"],
    examples: [{ word: "来る", reading: "くる", meaning: "venir" }, { word: "来年", reading: "らいねん", meaning: "l'année prochaine" }]
  },
  {
    kanji: "帰", level: "N5", onyomi: ["き"], kunyomi: ["かえ"],
    meanings: ["rentrer", "retourner"],
    strokeCount: 10, tags: ["action", "N5"],
    examples: [{ word: "帰る", reading: "かえる", meaning: "rentrer chez soi" }, { word: "帰国", reading: "きこく", meaning: "retour dans son pays" }]
  },
  {
    kanji: "見", level: "N5", onyomi: ["けん"], kunyomi: ["み"],
    meanings: ["voir", "regarder"],
    strokeCount: 7, tags: ["action", "N5"],
    examples: [{ word: "見る", reading: "みる", meaning: "voir, regarder" }, { word: "見学", reading: "けんがく", meaning: "visite d'étude" }]
  },
  {
    kanji: "聞", level: "N5", onyomi: ["もん", "ぶん"], kunyomi: ["き", "きこ"],
    meanings: ["entendre", "écouter", "demander"],
    strokeCount: 14, tags: ["action", "N5"],
    examples: [{ word: "聞く", reading: "きく", meaning: "entendre, demander" }, { word: "新聞", reading: "しんぶん", meaning: "journal" }]
  },
  {
    kanji: "読", level: "N5", onyomi: ["どく", "とく"], kunyomi: ["よ"],
    meanings: ["lire"],
    strokeCount: 14, tags: ["action", "N5"],
    examples: [{ word: "読む", reading: "よむ", meaning: "lire" }, { word: "読書", reading: "どくしょ", meaning: "lecture" }]
  },
  {
    kanji: "書", level: "N5", onyomi: ["しょ"], kunyomi: ["か"],
    meanings: ["écrire"],
    strokeCount: 10, tags: ["action", "N5"],
    examples: [{ word: "書く", reading: "かく", meaning: "écrire" }, { word: "図書館", reading: "としょかん", meaning: "bibliothèque" }]
  },
  {
    kanji: "話", level: "N5", onyomi: ["わ"], kunyomi: ["はな", "はなし"],
    meanings: ["parler", "parole", "histoire"],
    strokeCount: 13, tags: ["action", "N5"],
    examples: [{ word: "話す", reading: "はなす", meaning: "parler" }, { word: "電話", reading: "でんわ", meaning: "téléphone" }]
  },
  {
    kanji: "食", level: "N5", onyomi: ["しょく"], kunyomi: ["た", "く"],
    meanings: ["manger", "nourriture"],
    strokeCount: 9, tags: ["nourriture", "N5"],
    examples: [{ word: "食べる", reading: "たべる", meaning: "manger" }, { word: "食事", reading: "しょくじ", meaning: "repas" }]
  },
  {
    kanji: "飲", level: "N5", onyomi: ["いん"], kunyomi: ["の"],
    meanings: ["boire"],
    strokeCount: 12, tags: ["nourriture", "N5"],
    examples: [{ word: "飲む", reading: "のむ", meaning: "boire" }, { word: "飲み物", reading: "のみもの", meaning: "boisson" }]
  },
  {
    kanji: "買", level: "N5", onyomi: ["ばい"], kunyomi: ["か"],
    meanings: ["acheter"],
    strokeCount: 12, tags: ["action", "N5"],
    examples: [{ word: "買う", reading: "かう", meaning: "acheter" }, { word: "買い物", reading: "かいもの", meaning: "courses" }]
  },
  {
    kanji: "出", level: "N5", onyomi: ["しゅつ", "すい"], kunyomi: ["で", "だ"],
    meanings: ["sortir", "apparaître", "produire"],
    strokeCount: 5, tags: ["action", "N5"],
    examples: [{ word: "出る", reading: "でる", meaning: "sortir" }, { word: "出口", reading: "でぐち", meaning: "sortie" }]
  },
  {
    kanji: "入", level: "N5", onyomi: ["にゅう"], kunyomi: ["い", "はい"],
    meanings: ["entrer"],
    strokeCount: 2, tags: ["action", "N5"],
    examples: [{ word: "入る", reading: "はいる", meaning: "entrer" }, { word: "入口", reading: "いりぐち", meaning: "entrée" }]
  },
  {
    kanji: "立", level: "N5", onyomi: ["りつ", "りゅう"], kunyomi: ["た"],
    meanings: ["se lever", "se tenir debout"],
    strokeCount: 5, tags: ["action", "N5"],
    examples: [{ word: "立つ", reading: "たつ", meaning: "se lever, se tenir debout" }, { word: "国立", reading: "こくりつ", meaning: "national" }]
  },
  {
    kanji: "休", level: "N5", onyomi: ["きゅう"], kunyomi: ["やす"],
    meanings: ["se reposer", "vacances"],
    strokeCount: 6, tags: ["action", "N5"],
    examples: [{ word: "休む", reading: "やすむ", meaning: "se reposer" }, { word: "休日", reading: "きゅうじつ", meaning: "jour de congé" }]
  },
  // --- Langage & écriture ---
  {
    kanji: "語", level: "N5", onyomi: ["ご"], kunyomi: ["かた"],
    meanings: ["langue", "mot", "parler"],
    strokeCount: 14, tags: ["langue", "N5"],
    examples: [{ word: "日本語", reading: "にほんご", meaning: "japonais" }, { word: "英語", reading: "えいご", meaning: "anglais" }]
  },
  {
    kanji: "名", level: "N5", onyomi: ["めい", "みょう"], kunyomi: ["な"],
    meanings: ["nom", "réputation"],
    strokeCount: 6, tags: ["N5"],
    examples: [{ word: "名前", reading: "なまえ", meaning: "nom, prénom" }, { word: "有名", reading: "ゆうめい", meaning: "célèbre" }]
  },
];

export const JLPT_N4: JLPTKanjiData[] = [
  // --- Lieu & bâtiment ---
  {
    kanji: "家", level: "N4", onyomi: ["か", "け"], kunyomi: ["いえ", "や"],
    meanings: ["maison", "famille"],
    strokeCount: 10, tags: ["lieu", "N4"],
    examples: [{ word: "家", reading: "いえ", meaning: "maison" }, { word: "家族", reading: "かぞく", meaning: "famille" }]
  },
  {
    kanji: "駅", level: "N4", onyomi: ["えき"], kunyomi: [],
    meanings: ["gare"],
    strokeCount: 14, tags: ["lieu", "transport", "N4"],
    examples: [{ word: "駅", reading: "えき", meaning: "gare" }, { word: "駅前", reading: "えきまえ", meaning: "devant la gare" }]
  },
  {
    kanji: "店", level: "N4", onyomi: ["てん"], kunyomi: ["みせ"],
    meanings: ["magasin", "boutique"],
    strokeCount: 8, tags: ["lieu", "N4"],
    examples: [{ word: "店", reading: "みせ", meaning: "magasin" }, { word: "書店", reading: "しょてん", meaning: "librairie" }]
  },
  {
    kanji: "道", level: "N4", onyomi: ["どう", "とう"], kunyomi: ["みち"],
    meanings: ["route", "chemin", "voie"],
    strokeCount: 12, tags: ["lieu", "N4"],
    examples: [{ word: "道", reading: "みち", meaning: "route, chemin" }, { word: "北海道", reading: "ほっかいどう", meaning: "Hokkaido" }]
  },
  {
    kanji: "公", level: "N4", onyomi: ["こう"], kunyomi: ["おおやけ"],
    meanings: ["public", "officiel"],
    strokeCount: 4, tags: ["N4"],
    examples: [{ word: "公園", reading: "こうえん", meaning: "parc public" }, { word: "公共", reading: "こうきょう", meaning: "public" }]
  },
  {
    kanji: "園", level: "N4", onyomi: ["えん"], kunyomi: ["その"],
    meanings: ["jardin", "parc"],
    strokeCount: 13, tags: ["lieu", "N4"],
    examples: [{ word: "公園", reading: "こうえん", meaning: "parc" }, { word: "動物園", reading: "どうぶつえん", meaning: "zoo" }]
  },
  // --- Transport ---
  {
    kanji: "電", level: "N4", onyomi: ["でん"], kunyomi: [],
    meanings: ["électricité", "foudre"],
    strokeCount: 13, tags: ["transport", "N4"],
    examples: [{ word: "電車", reading: "でんしゃ", meaning: "train (électrique)" }, { word: "電話", reading: "でんわ", meaning: "téléphone" }]
  },
  {
    kanji: "車", level: "N4", onyomi: ["しゃ"], kunyomi: ["くるま"],
    meanings: ["voiture", "véhicule"],
    strokeCount: 7, tags: ["transport", "N4"],
    examples: [{ word: "電車", reading: "でんしゃ", meaning: "train" }, { word: "自動車", reading: "じどうしゃ", meaning: "automobile" }]
  },
  // --- École & apprentissage ---
  {
    kanji: "会", level: "N4", onyomi: ["かい", "え"], kunyomi: ["あ"],
    meanings: ["se rencontrer", "réunion", "association"],
    strokeCount: 6, tags: ["N4"],
    examples: [{ word: "会う", reading: "あう", meaning: "se rencontrer" }, { word: "会社", reading: "かいしゃ", meaning: "entreprise" }]
  },
  {
    kanji: "社", level: "N4", onyomi: ["しゃ"], kunyomi: ["やしろ"],
    meanings: ["société", "entreprise", "sanctuaire"],
    strokeCount: 7, tags: ["N4"],
    examples: [{ word: "会社", reading: "かいしゃ", meaning: "entreprise" }, { word: "社長", reading: "しゃちょう", meaning: "PDG" }]
  },
  {
    kanji: "試", level: "N4", onyomi: ["し"], kunyomi: ["こころ", "ため"],
    meanings: ["essai", "test", "tenter"],
    strokeCount: 13, tags: ["école", "N4"],
    examples: [{ word: "試験", reading: "しけん", meaning: "examen" }, { word: "試合", reading: "しあい", meaning: "match, compétition" }]
  },
  {
    kanji: "験", level: "N4", onyomi: ["けん", "げん"], kunyomi: [],
    meanings: ["expérience", "examen"],
    strokeCount: 18, tags: ["école", "N4"],
    examples: [{ word: "試験", reading: "しけん", meaning: "examen" }, { word: "経験", reading: "けいけん", meaning: "expérience" }]
  },
  {
    kanji: "問", level: "N4", onyomi: ["もん"], kunyomi: ["と"],
    meanings: ["question", "problème"],
    strokeCount: 11, tags: ["N4"],
    examples: [{ word: "問題", reading: "もんだい", meaning: "problème, question" }, { word: "質問", reading: "しつもん", meaning: "question" }]
  },
  {
    kanji: "題", level: "N4", onyomi: ["だい"], kunyomi: [],
    meanings: ["sujet", "thème", "titre"],
    strokeCount: 18, tags: ["N4"],
    examples: [{ word: "問題", reading: "もんだい", meaning: "problème" }, { word: "宿題", reading: "しゅくだい", meaning: "devoir à la maison" }]
  },
  {
    kanji: "答", level: "N4", onyomi: ["とう"], kunyomi: ["こた"],
    meanings: ["réponse", "répondre"],
    strokeCount: 12, tags: ["N4"],
    examples: [{ word: "答える", reading: "こたえる", meaning: "répondre" }, { word: "回答", reading: "かいとう", meaning: "réponse" }]
  },
  // --- Adjectifs courants ---
  {
    kanji: "近", level: "N4", onyomi: ["きん"], kunyomi: ["ちか"],
    meanings: ["proche", "près"],
    strokeCount: 7, tags: ["distance", "N4"],
    examples: [{ word: "近い", reading: "ちかい", meaning: "proche" }, { word: "近所", reading: "きんじょ", meaning: "voisinage" }]
  },
  {
    kanji: "遠", level: "N4", onyomi: ["えん"], kunyomi: ["とお"],
    meanings: ["loin", "éloigné"],
    strokeCount: 13, tags: ["distance", "N4"],
    examples: [{ word: "遠い", reading: "とおい", meaning: "loin" }, { word: "遠足", reading: "えんそく", meaning: "excursion scolaire" }]
  },
  {
    kanji: "早", level: "N4", onyomi: ["そう", "さっ"], kunyomi: ["はや"],
    meanings: ["tôt", "rapide"],
    strokeCount: 6, tags: ["temps", "N4"],
    examples: [{ word: "早い", reading: "はやい", meaning: "tôt, rapide" }, { word: "早起き", reading: "はやおき", meaning: "se lever tôt" }]
  },
  {
    kanji: "重", level: "N4", onyomi: ["じゅう", "ちょう"], kunyomi: ["おも", "かさ"],
    meanings: ["lourd", "important", "empiler"],
    strokeCount: 9, tags: ["N4"],
    examples: [{ word: "重い", reading: "おもい", meaning: "lourd" }, { word: "重要", reading: "じゅうよう", meaning: "important" }]
  },
  {
    kanji: "軽", level: "N4", onyomi: ["けい"], kunyomi: ["かる"],
    meanings: ["léger", "léger (au sens figuré)"],
    strokeCount: 12, tags: ["N4"],
    examples: [{ word: "軽い", reading: "かるい", meaning: "léger" }, { word: "軽食", reading: "けいしょく", meaning: "snack, repas léger" }]
  },
  {
    kanji: "強", level: "N4", onyomi: ["きょう", "ごう"], kunyomi: ["つよ", "し"],
    meanings: ["fort", "puissant"],
    strokeCount: 11, tags: ["N4"],
    examples: [{ word: "強い", reading: "つよい", meaning: "fort" }, { word: "勉強", reading: "べんきょう", meaning: "étudier" }]
  },
  {
    kanji: "弱", level: "N4", onyomi: ["じゃく"], kunyomi: ["よわ"],
    meanings: ["faible", "fragile"],
    strokeCount: 10, tags: ["N4"],
    examples: [{ word: "弱い", reading: "よわい", meaning: "faible" }, { word: "弱点", reading: "じゃくてん", meaning: "point faible" }]
  },
  // --- Corps & santé ---
  {
    kanji: "体", level: "N4", onyomi: ["たい", "てい"], kunyomi: ["からだ"],
    meanings: ["corps", "physique"],
    strokeCount: 7, tags: ["corps", "N4"],
    examples: [{ word: "体", reading: "からだ", meaning: "corps" }, { word: "体育", reading: "たいいく", meaning: "éducation physique" }]
  },
  {
    kanji: "頭", level: "N4", onyomi: ["とう", "ず"], kunyomi: ["あたま"],
    meanings: ["tête", "cerveau", "intelligent"],
    strokeCount: 16, tags: ["corps", "N4"],
    examples: [{ word: "頭", reading: "あたま", meaning: "tête" }, { word: "頭痛", reading: "ずつう", meaning: "mal de tête" }]
  },
  {
    kanji: "顔", level: "N4", onyomi: ["がん"], kunyomi: ["かお"],
    meanings: ["visage", "figure"],
    strokeCount: 18, tags: ["corps", "N4"],
    examples: [{ word: "顔", reading: "かお", meaning: "visage" }, { word: "顔色", reading: "かおいろ", meaning: "teint, mine" }]
  },
  // --- Famille étendue ---
  {
    kanji: "親", level: "N4", onyomi: ["しん"], kunyomi: ["おや", "した"],
    meanings: ["parent", "proche", "intime"],
    strokeCount: 16, tags: ["famille", "N4"],
    examples: [{ word: "親", reading: "おや", meaning: "parent" }, { word: "親切", reading: "しんせつ", meaning: "gentil, aimable" }]
  },
  {
    kanji: "兄", level: "N4", onyomi: ["けい", "きょう"], kunyomi: ["あに"],
    meanings: ["frère aîné"],
    strokeCount: 5, tags: ["famille", "N4"],
    examples: [{ word: "兄", reading: "あに", meaning: "mon frère aîné" }, { word: "お兄さん", reading: "おにいさん", meaning: "frère aîné (poli)" }]
  },
  {
    kanji: "弟", level: "N4", onyomi: ["てい", "だい"], kunyomi: ["おとうと"],
    meanings: ["frère cadet"],
    strokeCount: 7, tags: ["famille", "N4"],
    examples: [{ word: "弟", reading: "おとうと", meaning: "mon frère cadet" }]
  },
  {
    kanji: "姉", level: "N4", onyomi: ["し"], kunyomi: ["あね"],
    meanings: ["sœur aînée"],
    strokeCount: 8, tags: ["famille", "N4"],
    examples: [{ word: "姉", reading: "あね", meaning: "ma sœur aînée" }, { word: "お姉さん", reading: "おねえさん", meaning: "sœur aînée (poli)" }]
  },
  {
    kanji: "妹", level: "N4", onyomi: ["まい"], kunyomi: ["いもうと"],
    meanings: ["sœur cadette"],
    strokeCount: 8, tags: ["famille", "N4"],
    examples: [{ word: "妹", reading: "いもうと", meaning: "ma sœur cadette" }]
  },
  {
    kanji: "夫", level: "N4", onyomi: ["ふ", "ふう"], kunyomi: ["おっと"],
    meanings: ["mari", "époux"],
    strokeCount: 4, tags: ["famille", "N4"],
    examples: [{ word: "夫", reading: "おっと", meaning: "mon mari" }, { word: "夫婦", reading: "ふうふ", meaning: "couple marié" }]
  },
  {
    kanji: "妻", level: "N4", onyomi: ["さい"], kunyomi: ["つま"],
    meanings: ["femme", "épouse"],
    strokeCount: 8, tags: ["famille", "N4"],
    examples: [{ word: "妻", reading: "つま", meaning: "ma femme" }, { word: "夫妻", reading: "ふさい", meaning: "mari et femme" }]
  },
  // --- Actions ---
  {
    kanji: "着", level: "N4", onyomi: ["ちゃく"], kunyomi: ["き", "つ"],
    meanings: ["arriver", "porter (vêtement)", "attacher"],
    strokeCount: 12, tags: ["action", "N4"],
    examples: [{ word: "着る", reading: "きる", meaning: "porter (un vêtement)" }, { word: "着く", reading: "つく", meaning: "arriver" }]
  },
  {
    kanji: "走", level: "N4", onyomi: ["そう"], kunyomi: ["はし"],
    meanings: ["courir"],
    strokeCount: 7, tags: ["action", "N4"],
    examples: [{ word: "走る", reading: "はしる", meaning: "courir" }, { word: "走行", reading: "そうこう", meaning: "conduite, course" }]
  },
  {
    kanji: "起", level: "N4", onyomi: ["き"], kunyomi: ["お"],
    meanings: ["se lever", "se réveiller", "provoquer"],
    strokeCount: 10, tags: ["action", "N4"],
    examples: [{ word: "起きる", reading: "おきる", meaning: "se lever" }, { word: "起こす", reading: "おこす", meaning: "réveiller" }]
  },
  {
    kanji: "寝", level: "N4", onyomi: ["しん"], kunyomi: ["ね"],
    meanings: ["dormir", "se coucher"],
    strokeCount: 13, tags: ["action", "N4"],
    examples: [{ word: "寝る", reading: "ねる", meaning: "dormir, se coucher" }, { word: "寝室", reading: "しんしつ", meaning: "chambre à coucher" }]
  },
  {
    kanji: "開", level: "N4", onyomi: ["かい"], kunyomi: ["ひら", "あ"],
    meanings: ["ouvrir"],
    strokeCount: 12, tags: ["action", "N4"],
    examples: [{ word: "開ける", reading: "あける", meaning: "ouvrir" }, { word: "開始", reading: "かいし", meaning: "début, démarrage" }]
  },
  {
    kanji: "閉", level: "N4", onyomi: ["へい"], kunyomi: ["し", "と"],
    meanings: ["fermer"],
    strokeCount: 11, tags: ["action", "N4"],
    examples: [{ word: "閉める", reading: "しめる", meaning: "fermer" }, { word: "閉店", reading: "へいてん", meaning: "fermeture (d'un magasin)" }]
  },
  {
    kanji: "乗", level: "N4", onyomi: ["じょう"], kunyomi: ["の"],
    meanings: ["monter (dans), prendre (transport)"],
    strokeCount: 9, tags: ["transport", "action", "N4"],
    examples: [{ word: "乗る", reading: "のる", meaning: "monter dans, prendre" }, { word: "乗り換え", reading: "のりかえ", meaning: "correspondance" }]
  },
  {
    kanji: "降", level: "N4", onyomi: ["こう"], kunyomi: ["お", "ふ"],
    meanings: ["descendre", "tomber (pluie)"],
    strokeCount: 10, tags: ["transport", "action", "N4"],
    examples: [{ word: "降りる", reading: "おりる", meaning: "descendre" }, { word: "雨が降る", reading: "あめがふる", meaning: "il pleut" }]
  },
  {
    kanji: "使", level: "N4", onyomi: ["し"], kunyomi: ["つか"],
    meanings: ["utiliser", "employer"],
    strokeCount: 8, tags: ["action", "N4"],
    examples: [{ word: "使う", reading: "つかう", meaning: "utiliser" }, { word: "大使館", reading: "たいしかん", meaning: "ambassade" }]
  },
  {
    kanji: "持", level: "N4", onyomi: ["じ"], kunyomi: ["も"],
    meanings: ["tenir", "posséder", "porter"],
    strokeCount: 9, tags: ["action", "N4"],
    examples: [{ word: "持つ", reading: "もつ", meaning: "tenir, posséder" }, { word: "持ち物", reading: "もちもの", meaning: "affaires personnelles" }]
  },
  {
    kanji: "待", level: "N4", onyomi: ["たい"], kunyomi: ["ま"],
    meanings: ["attendre"],
    strokeCount: 9, tags: ["action", "N4"],
    examples: [{ word: "待つ", reading: "まつ", meaning: "attendre" }, { word: "待合室", reading: "まちあいしつ", meaning: "salle d'attente" }]
  },
  // --- Sens & pensée ---
  {
    kanji: "意", level: "N4", onyomi: ["い"], kunyomi: [],
    meanings: ["sens", "intention", "esprit"],
    strokeCount: 13, tags: ["N4"],
    examples: [{ word: "意味", reading: "いみ", meaning: "sens, signification" }, { word: "注意", reading: "ちゅうい", meaning: "attention, avertissement" }]
  },
  {
    kanji: "思", level: "N4", onyomi: ["し"], kunyomi: ["おも"],
    meanings: ["penser", "croire"],
    strokeCount: 9, tags: ["N4"],
    examples: [{ word: "思う", reading: "おもう", meaning: "penser, croire" }, { word: "思い出", reading: "おもいで", meaning: "souvenir" }]
  },
  {
    kanji: "感", level: "N4", onyomi: ["かん"], kunyomi: [],
    meanings: ["ressentir", "sentiment"],
    strokeCount: 13, tags: ["N4"],
    examples: [{ word: "感じる", reading: "かんじる", meaning: "ressentir" }, { word: "感謝", reading: "かんしゃ", meaning: "gratitude" }]
  },
  // --- Qualité ---
  {
    kanji: "良", level: "N4", onyomi: ["りょう"], kunyomi: ["よ", "い"],
    meanings: ["bon", "bien"],
    strokeCount: 7, tags: ["N4"],
    examples: [{ word: "良い", reading: "いい / よい", meaning: "bien, bon" }, { word: "良心", reading: "りょうしん", meaning: "conscience" }]
  },
  {
    kanji: "正", level: "N4", onyomi: ["せい", "しょう"], kunyomi: ["ただ", "まさ"],
    meanings: ["correct", "juste", "droit"],
    strokeCount: 5, tags: ["N4"],
    examples: [{ word: "正しい", reading: "ただしい", meaning: "correct, juste" }, { word: "正月", reading: "しょうがつ", meaning: "Nouvel An japonais" }]
  },
  {
    kanji: "同", level: "N4", onyomi: ["どう"], kunyomi: ["おな"],
    meanings: ["même", "identique"],
    strokeCount: 6, tags: ["N4"],
    examples: [{ word: "同じ", reading: "おなじ", meaning: "même, identique" }, { word: "同僚", reading: "どうりょう", meaning: "collègue" }]
  },
  {
    kanji: "別", level: "N4", onyomi: ["べつ"], kunyomi: ["わか"],
    meanings: ["séparé", "différent", "autre"],
    strokeCount: 7, tags: ["N4"],
    examples: [{ word: "別に", reading: "べつに", meaning: "pas particulièrement" }, { word: "別れる", reading: "わかれる", meaning: "se séparer" }]
  },
  // --- Travail & société ---
  {
    kanji: "仕", level: "N4", onyomi: ["し"], kunyomi: ["つか"],
    meanings: ["travail", "service"],
    strokeCount: 5, tags: ["travail", "N4"],
    examples: [{ word: "仕事", reading: "しごと", meaning: "travail, emploi" }, { word: "仕方", reading: "しかた", meaning: "façon de faire" }]
  },
  {
    kanji: "働", level: "N4", onyomi: ["どう"], kunyomi: ["はたら"],
    meanings: ["travailler"],
    strokeCount: 13, tags: ["travail", "N4"],
    examples: [{ word: "働く", reading: "はたらく", meaning: "travailler" }, { word: "労働", reading: "ろうどう", meaning: "travail (manuel)" }]
  },
  // --- Langue & communication ---
  {
    kanji: "言", level: "N4", onyomi: ["げん", "ごん"], kunyomi: ["い", "こと"],
    meanings: ["dire", "parole", "mot"],
    strokeCount: 7, tags: ["N4"],
    examples: [{ word: "言う", reading: "いう", meaning: "dire" }, { word: "言葉", reading: "ことば", meaning: "mot, langage" }]
  },
  {
    kanji: "字", level: "N4", onyomi: ["じ"], kunyomi: ["あざ"],
    meanings: ["lettre", "caractère", "écriture"],
    strokeCount: 6, tags: ["N4"],
    examples: [{ word: "漢字", reading: "かんじ", meaning: "kanji" }, { word: "文字", reading: "もじ", meaning: "caractère, lettre" }]
  },
  {
    kanji: "声", level: "N4", onyomi: ["せい", "しょう"], kunyomi: ["こえ"],
    meanings: ["voix", "son"],
    strokeCount: 7, tags: ["N4"],
    examples: [{ word: "声", reading: "こえ", meaning: "voix" }, { word: "声優", reading: "せいゆう", meaning: "acteur de doublage" }]
  },
  // --- Nature et météo ---
  {
    kanji: "暑", level: "N4", onyomi: ["しょ"], kunyomi: ["あつ"],
    meanings: ["chaud (temps)"],
    strokeCount: 12, tags: ["météo", "N4"],
    examples: [{ word: "暑い", reading: "あつい", meaning: "chaud (temps)" }, { word: "暑さ", reading: "あつさ", meaning: "chaleur" }]
  },
  {
    kanji: "寒", level: "N4", onyomi: ["かん"], kunyomi: ["さむ"],
    meanings: ["froid (temps)"],
    strokeCount: 12, tags: ["météo", "N4"],
    examples: [{ word: "寒い", reading: "さむい", meaning: "froid (temps)" }, { word: "寒さ", reading: "さむさ", meaning: "froid" }]
  },
  {
    kanji: "暖", level: "N4", onyomi: ["だん"], kunyomi: ["あたた"],
    meanings: ["tiède", "chaleureux"],
    strokeCount: 13, tags: ["météo", "N4"],
    examples: [{ word: "暖かい", reading: "あたたかい", meaning: "tiède, chaud (agréable)" }, { word: "暖房", reading: "だんぼう", meaning: "chauffage" }]
  },
  {
    kanji: "冷", level: "N4", onyomi: ["れい"], kunyomi: ["つめ", "さ", "ひ"],
    meanings: ["froid", "frais", "refroidir"],
    strokeCount: 7, tags: ["météo", "N4"],
    examples: [{ word: "冷たい", reading: "つめたい", meaning: "froid (au toucher)" }, { word: "冷蔵庫", reading: "れいぞうこ", meaning: "réfrigérateur" }]
  },
  // --- Nombre & quantité ---
  {
    kanji: "多", level: "N4", onyomi: ["た"], kunyomi: ["おお"],
    meanings: ["beaucoup", "nombreux"],
    strokeCount: 6, tags: ["quantité", "N4"],
    examples: [{ word: "多い", reading: "おおい", meaning: "nombreux, beaucoup" }, { word: "多分", reading: "たぶん", meaning: "probablement" }]
  },
  {
    kanji: "少", level: "N4", onyomi: ["しょう"], kunyomi: ["すく", "すこ"],
    meanings: ["peu", "peu nombreux"],
    strokeCount: 4, tags: ["quantité", "N4"],
    examples: [{ word: "少ない", reading: "すくない", meaning: "peu nombreux" }, { word: "少し", reading: "すこし", meaning: "un peu" }]
  },
  // --- Temps (suite) ---
  {
    kanji: "昨", level: "N4", onyomi: ["さく"], kunyomi: [],
    meanings: ["hier", "passé"],
    strokeCount: 9, tags: ["temps", "N4"],
    examples: [{ word: "昨日", reading: "きのう", meaning: "hier" }, { word: "昨年", reading: "さくねん", meaning: "l'année dernière" }]
  },
  {
    kanji: "明", level: "N4", onyomi: ["めい", "みょう"], kunyomi: ["あか", "あき", "あ"],
    meanings: ["clair", "lumineux", "demain"],
    strokeCount: 8, tags: ["temps", "N4"],
    examples: [{ word: "明日", reading: "あした / あす", meaning: "demain" }, { word: "明るい", reading: "あかるい", meaning: "lumineux, gai" }]
  },
  {
    kanji: "去", level: "N4", onyomi: ["きょ", "こ"], kunyomi: ["さ"],
    meanings: ["partir", "passé"],
    strokeCount: 5, tags: ["temps", "N4"],
    examples: [{ word: "去年", reading: "きょねん", meaning: "l'année dernière" }, { word: "去る", reading: "さる", meaning: "partir" }]
  },
  {
    kanji: "度", level: "N4", onyomi: ["ど", "たく"], kunyomi: ["たび"],
    meanings: ["degré", "fois", "fois"],
    strokeCount: 9, tags: ["quantité", "temps", "N4"],
    examples: [{ word: "今度", reading: "こんど", meaning: "cette fois, prochainement" }, { word: "温度", reading: "おんど", meaning: "température" }]
  },
  // --- Connexion ---
  {
    kanji: "自", level: "N4", onyomi: ["じ", "し"], kunyomi: ["みずか"],
    meanings: ["soi-même", "propre"],
    strokeCount: 6, tags: ["N4"],
    examples: [{ word: "自分", reading: "じぶん", meaning: "soi-même" }, { word: "自転車", reading: "じてんしゃ", meaning: "vélo" }]
  },
  {
    kanji: "他", level: "N4", onyomi: ["た"], kunyomi: ["ほか"],
    meanings: ["autre", "autrui"],
    strokeCount: 5, tags: ["N4"],
    examples: [{ word: "他に", reading: "ほかに", meaning: "en plus, d'autre part" }, { word: "その他", reading: "そのほか", meaning: "les autres, etc." }]
  },
];

// Liste complète regroupée
export const ALL_JLPT_KANJI: JLPTKanjiData[] = [...JLPT_N5, ...JLPT_N4];

// Stats utiles
export const JLPT_STATS = {
  N5: JLPT_N5.length,
  N4: JLPT_N4.length,
  total: JLPT_N5.length + JLPT_N4.length,
};
