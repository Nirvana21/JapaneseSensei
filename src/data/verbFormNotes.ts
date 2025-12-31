import { Polarity, Politeness, Tense, VerbFormKind, VerbFormSpec } from "../types/grammar";

export interface VerbFormNote {
  title: string;
  usage: string;
  tips?: string[];
  examples?: string[];
}

function politeSuffix(tense?: Tense, polarity?: Polarity) {
  const t = tense ?? 'present';
  const p = polarity ?? 'affirmative';
  if (t === 'present' && p === 'affirmative') return '〜ます: présent/futur poli affirmatif';
  if (t === 'present' && p === 'negative') return '〜ません: présent/futur poli négatif';
  if (t === 'past' && p === 'affirmative') return '〜ました: passé poli affirmatif';
  return '〜ませんでした: passé poli négatif';
}

export function getVerbFormNote(spec: VerbFormSpec): VerbFormNote {
  const kind: VerbFormKind = spec.kind;
  switch (kind) {
    case 'masu':
      return {
        title: 'Forme ます (polie)',
        usage: politeSuffix(spec.tense, spec.polarity) + ' — registre poli pour parler de ses actions.',
        tips: [
          'Registre poli – à utiliser avec inconnus, supérieur hiérarchique, contexte formel.',
          'Pas de distinction futur/présent en japonais: 〜ます couvre les deux selon le contexte.',
        ],
        examples: [
          '毎朝七時に起きます。— Je me lève à sept heures tous les matins.',
          '昨日映画を見ました。— J’ai regardé un film hier.',
          '今日は行きません。— Aujourd’hui, je n’y vais pas.',
        ],
      };
    case 'te':
      return {
        title: 'Forme て',
        usage:
          'Chaînage d’actions, demandes polies (〜てください), progressif (〜ている), permission/interdiction (〜ていい/〜てはいけない), etc.',
        tips: [
          'Très polyvalente, sert aussi pour relier des propositions.',
        ],
        examples: [
          '本を読んで、寝ます。— Je lis un livre et je vais dormir.',
          '窓を開けてください。— Ouvrez la fenêtre, s’il vous plaît.',
          '今、本を読んでいる。— Je suis en train de lire un livre.',
        ],
      };
    case 'ta':
      return {
        title: 'Forme た (passé plain)',
        usage: 'Passé (registre neutre/courant).',
        tips: [
          'Équivalent familier de ました.',
        ],
        examples: [
          '晩ご飯を食べた。— J’ai mangé le dîner.',
          '昨日京都に行った。— Je suis allé à Kyoto hier.',
        ],
      };
    case 'nai':
      return {
        title: 'Négative ない (plain)',
        usage: 'Présent/futur négatif (registre neutre/courant).',
        tips: [
          'Pour le poli, utilisez 〜ません.',
        ],
        examples: [
          'お酒を飲まない。— Je ne bois pas d’alcool.',
          '宿題をしない。— Je ne fais pas mes devoirs.',
        ],
      };
    case 'volitional': {
      const politeness: Politeness = spec.politeness ?? 'plain';
      return {
        title: 'Volitif (' + (politeness === 'polite' ? 'polie' : 'courant') + ')',
        usage: 'Proposition/volonté: “et si on … ?”, “je vais …”.',
        tips: [
          'Courant: 〜よう / Godan: o + う. Polie: 〜ましょう.',
        ],
        examples: [
          '映画を見よう。— Et si on regardait un film ?',
          '一緒に勉強しましょう。— Étudions ensemble.',
        ],
      };
    }
    case 'potential': {
      const politeness: Politeness = spec.politeness ?? 'plain';
      return {
        title: 'Potentiel (' + (politeness === 'polite' ? 'polie' : 'courant') + ')',
        usage: 'Capacité/possibilité: “pouvoir/être capable de …”.',
        tips: [
          'Ichidan: 〜られる ; Godan: rang e + る ; する→できる ; 来る→来られる.',
        ],
        examples: [
          '日本語が話せます。— Je peux parler japonais.',
          '泳げない。— Je ne peux pas nager.',
        ],
      };
    }
    case 'passive': {
      const politeness: Politeness = spec.politeness ?? 'plain';
      return {
        title: 'Passif (' + (politeness === 'polite' ? 'polie' : 'courant') + ')',
        usage: 'Action subie: “être … par …”. Peut aussi marquer un inconvénient subi (受け身).',
        tips: [
          'Ichidan: 〜られる ; Godan: rang a + れる ; する→される ; 来る→来られる.',
        ],
        examples: [
          '犬に噛まれた。— Je me suis fait mordre par un chien.',
          '先生にほめられた。— J’ai été félicité par le professeur.',
        ],
      };
    }
    case 'causative': {
      const politeness: Politeness = spec.politeness ?? 'plain';
      return {
        title: 'Causatif (' + (politeness === 'polite' ? 'polie' : 'courant') + ')',
        usage: 'Faire/laisser faire: “faire faire … à …” ou “laisser …”.',
        tips: [
          'Ichidan: 〜させる ; Godan: rang a + せる ; 来る→来させる ; する→させる.',
        ],
        examples: [
          '子どもに野菜を食べさせる。— Faire manger des légumes à l’enfant.',
          '友達を待たせてしまった。— J’ai laissé/fait attendre mon ami.',
        ],
      };
    }
    default:
      return { title: 'Forme', usage: '—' };
  }
}
