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
        usage: politeSuffix(spec.tense, spec.polarity),
        tips: [
          'Registre poli – à utiliser avec inconnus, supérieur hiérarchique, contexte formel.',
          'Pas de distinction futur/présent en japonais: 〜ます couvre les deux selon le contexte.',
        ],
        examples: [
          '食べます (je mange/je mangerai)',
          '食べませんでした (je n’ai pas mangé)',
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
          '読んでください (lisez s.v.p.)',
          '今、読んでいる (je suis en train de lire)',
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
          '食べた (j’ai mangé)',
          '行った (je suis allé)',
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
          '読まない (je ne lis pas)',
          'しない (je ne fais pas)',
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
          '食べよう (mangeons !)',
          '読みましょう (lisons !)',
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
          '読める / 読めます (je peux lire)',
          '来られる / 来られます (je peux venir)',
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
          '読まれる / 読まれます (être lu)',
          'される / されます (être fait)',
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
          '読ませる / 読ませます (faire lire)',
          '来させる / 来させます (faire venir)',
        ],
      };
    }
    default:
      return { title: 'Forme', usage: '—' };
  }
}
