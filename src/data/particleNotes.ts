import { ParticleNote } from "../types/grammar";

export const PARTICLE_NOTES: ParticleNote[] = [
  { key: 'wa', title: 'は — Thème', usage: 'Marque le thème (ce dont on parle), contraste possible.', tips: ['は (wa) s’écrit avec le は du kana, pas わ.', 'Souvent traduit par “quant à …”.'], examples: ['私は学生です。', 'この本は面白い。'] },
  { key: 'ga', title: 'が — Sujet / focus', usage: 'Met en focus le sujet, introduit une nouvelle information, capacité (〜ができる / 可能).', tips: ['Qui/quoi ? “X が …”', 'Opposition subtile avec は.'], examples: ['雨が降っています。', '日本語が話せます。'] },
  { key: 'o', title: 'を — Objet direct', usage: 'Marque l’objet direct du verbe transitif.', examples: ['本を読む', '水を飲む'] },
  { key: 'ni-time', title: 'に — Temps, point précis', usage: 'Heure/date exactes, rendez-vous.', examples: ['七時に起きる', '月曜日に行く'] },
  { key: 'direction', title: 'に / へ — Direction / destination', usage: 'Se diriger vers. へ met l’accent sur la direction; に sur le point d’arrivée.', examples: ['学校に行く', '日本へ行く'] },
  { key: 'de', title: 'で — Lieu d’action', usage: 'Endroit où l’action se déroule.', examples: ['学校で勉強する', '家で食べる'] },
  { key: 'to', title: 'と — Compagnon / citation', usage: '“Avec …” (compagnie) / citation (と 言う).', examples: ['友達と行く', '「行く」と言う'] },
  { key: 'kara', title: 'から — Depuis / parce que', usage: 'Point de départ (spatial/temporal) OU cause.', examples: ['九時から仕事', '雨だから行かない'] },
  { key: 'made', title: 'まで — Jusqu’à', usage: 'Limite (spatiale/temporal).', examples: ['五時まで働く', '駅まで歩く'] },
  { key: 'mo', title: 'も — Aussi', usage: 'Addition/“aussi”.', examples: ['私も行く', '水もある'] },
  { key: 'no', title: 'の — Possessif / nominalisation', usage: 'Lien possessif ou qualificatif ; parfois nominalisation.', examples: ['彼の本', '赤いのが好き'] },
  { key: 'ya', title: 'や — Énumération non exhaustive', usage: 'Liste “A, B, etc.” ; plus large que と (liste ouverte).', examples: ['りんごやバナナ', '本やノートやペン'] },
  { key: 'to-quotation', title: 'と — Citation', usage: 'Marque le contenu cité (“…” と 言う).', examples: ['「寒い」と言った'] },
  { key: 'yori', title: 'より — Comparatif', usage: '“Plus … que …”.', examples: ['猫より犬が好き', '東京より大阪の方が安い'] },
  { key: 'ka', title: 'か — Interrogation', usage: 'Particule de question (registre poli/courant).', examples: ['行きますか？', '誰か？'] },
  { key: 'yo', title: 'よ — Assertive', usage: 'Particule de renforcement/assertion (je t’informe).', examples: ['本当ですよ。'] },
  { key: 'ne', title: 'ね — Recherche d’accord', usage: 'Appelle l’acquiescement/connivence.', examples: ['いい天気ですね。'] },
  { key: 'shika', title: 'しか — “Rien d’autre que” (négatif)', usage: 'Nécessite une phrase négative.', tips: ['X しか ない : “il n’y a que X”.'], examples: ['百円しかない。'] },
  { key: 'dake', title: 'だけ — “Seulement”', usage: 'Ne force pas la négation ; neutre.', examples: ['一つだけ買う。'] },
  { key: 'kedo', title: 'けど/でも — Opposition légère', usage: 'Contraste/douce contradiction.', examples: ['高いけど買う', '雨だけど行く'] },
  { key: 'reason', title: 'から/ので — Cause', usage: 'ので (plus neutre/objectif) ; から (plus subjectif).', examples: ['忙しいので行けない', '雨だから行かない'] },
  { key: 'ni-purpose', title: 'に — But/objectif', usage: 'Marque l’objectif (V-stem + に).', examples: ['勉強しに来た'] },
  { key: 'ni-indirect', title: 'に — Objet indirect', usage: 'Destinataire de l’action.', examples: ['先生に質問する'] },
  { key: 'de-instrument', title: 'で — Moyen/instrument', usage: 'Indique le moyen utilisé.', examples: ['箸で食べる'] },
];

export function getParticleNote(key?: string): ParticleNote | undefined {
  if (!key) return undefined;
  return PARTICLE_NOTES.find(n => n.key === key);
}
