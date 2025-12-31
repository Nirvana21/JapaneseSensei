import { AdjFormSpec, Polarity, Politeness, Tense } from "../types/grammar";

export interface AdjFormNote {
  title: string;
  usage: string;
  tips?: string[];
  examples?: string[];
}

function declarativeLabel(tense?: Tense, polarity?: Polarity, politeness?: Politeness) {
  const t = tense ?? 'present';
  const p = polarity ?? 'affirmative';
  const pol = politeness ?? 'plain';
  const parts: string[] = [];
  parts.push(pol === 'polite' ? 'polie' : 'courant');
  parts.push(t === 'present' ? 'présent/futur' : 'passé');
  parts.push(p === 'affirmative' ? 'affirmative' : 'négative');
  return parts.join(' · ');
}

export function getAdjFormNote(spec: AdjFormSpec): AdjFormNote {
  switch (spec.kind) {
    case 'declarative': {
      const label = declarativeLabel(spec.tense, spec.polarity, spec.politeness);
      return {
        title: 'Déclaratif (だ/です) — ' + label,
        usage: 'Affirmer une propriété à propos du sujet (être … / ne pas être …).',
        tips: [
          'i-adjectifs: négation 〜くない ; passé 〜かった ; formes polies ajoutent です.',
          'いい est irrégulier → よくない / よかった / よくなかった etc.',
          'na-adjectifs: copule だ (courant) / です (poli) ; négation じゃない.',
        ],
        examples: [
          'この本は面白いです。— Ce livre est intéressant.',
          '今日は寒くないです。— Aujourd’hui, il ne fait pas froid.',
          '部屋は静かだ。— La chambre est calme.',
          'この町は静かじゃない。— Cette ville n’est pas calme.',
        ],
      };
    }
    case 'te':
      return {
        title: 'Forme て (連用形) — liaison',
        usage: 'Relier des adjectifs/phrases (… et …), donner une raison douce (… et donc …).',
        tips: [
          'i-adjectifs: 〜くて ; na-adjectifs: 〜で.',
        ],
        examples: [
          '安くておいしい。— C’est pas cher et bon.',
          '便利で静かです。— C’est pratique et calme.',
        ],
      };
    case 'adverbial':
      return {
        title: 'Adverbialisation (副詞化)',
        usage: 'Modifier un verbe/adjectif: “faire … de manière …”.',
        tips: [
          'i-adjectifs: 〜く ; na-adjectifs: 〜に.',
        ],
        examples: [
          '早く起きる。— Se lever tôt.',
          '静かに話す。— Parler calmement.',
        ],
      };
    default:
      return { title: 'Forme', usage: '—' };
  }
}
