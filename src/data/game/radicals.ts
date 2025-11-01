export type RadicalInfo = {
  nameFr?: string;
  nameJa?: string;
  meaningFr: string;
};

// Mini-lexique des composants/radicaux utilisés par le prototype (FR)
export const RADICAL_INFO: Record<string, RadicalInfo> = {
  '日': { meaningFr: 'soleil; jour', nameJa: 'ひ/にち' },
  '月': { meaningFr: 'lune; mois', nameJa: 'つき/げつ' },
  '木': { meaningFr: 'arbre; bois', nameJa: 'き/もく' },
  '亻': { meaningFr: 'personne (clé)', nameJa: 'にんべん' },
  '女': { meaningFr: 'femme', nameJa: 'おんな' },
  '子': { meaningFr: 'enfant', nameJa: 'こ' },
  '言': { meaningFr: 'parole; dire', nameJa: 'ごんべん/ことば' },
  '五': { meaningFr: 'cinq', nameJa: 'ご' },
  '口': { meaningFr: 'bouche', nameJa: 'くち' },
  '飠': { meaningFr: 'nourriture (clé)', nameJa: 'しょくへん' },
  '欠': { meaningFr: 'manquer; bâiller', nameJa: 'あくび' },
  '人': { meaningFr: 'personne', nameJa: 'ひと' },
  '良': { meaningFr: 'bon; correct', nameJa: 'りょう' },
  '田': { meaningFr: 'rizière; champ', nameJa: 'た' },
  '力': { meaningFr: 'force', nameJa: 'ちから' },
  '辶': { meaningFr: 'marche; mouvement (clé)', nameJa: 'しんにょう' },
  '周': { meaningFr: 'tour; semaine (comp.)', nameJa: 'しゅう' },
  '雨': { meaningFr: 'pluie (clé)', nameJa: 'あめ/う' },
  '馬': { meaningFr: 'cheval', nameJa: 'うま' },
  '尺': { meaningFr: 'shaku (mesure); pied', nameJa: 'しゃく' },
  '氵': { meaningFr: 'eau (clé)', nameJa: 'さんずい' },
  '毎': { meaningFr: 'chaque; tous les', nameJa: 'まい' },
  '可': { meaningFr: 'possible; permission', nameJa: 'か' },
  '火': { meaningFr: 'feu', nameJa: 'ひ' },
  '丁': { meaningFr: 'quartier; clou', nameJa: 'ちょう/てい' },
  '禾': { meaningFr: 'grain; épi (clé)', nameJa: 'のぎへん' },
};
