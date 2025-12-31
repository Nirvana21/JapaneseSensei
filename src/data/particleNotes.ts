import { ParticleNote } from "../types/grammar";

export const PARTICLE_NOTES: ParticleNote[] = [
  {
    key: 'wa',
    title: 'は — Thème / contraste',
    usage:
      'Marque le thème (ce dont on parle) et sert souvent à mettre en contraste un élément par rapport au reste.',
    tips: [
      'は (wa) s’écrit avec le kana は, pas わ.',
      'Structure de base : 「X は Y です」 → “Quant à X, c’est Y”.',
      'Souvent omis après 私 (je) dans le discours naturel : 「学生です」.',
    ],
    examples: [
      '私は学生です。— Quant à moi, je suis étudiant.',
      'この本は面白い。— Ce livre, il est intéressant.',
      '日本語は難しいですが、面白いです。— Le japonais est difficile, mais intéressant.',
    ],
  },
  {
    key: 'ga',
    title: 'が — Sujet / focus',
    usage:
      'Met en avant le sujet grammatical, introduit une nouvelle information ou sert dans des structures comme “X が 好き”.',
    tips: [
      'Question “qui/quoi ?” → la réponse prend souvent が : 「誰が来ますか。」',
      'Préférences, capacités : 「X が 好き」 (aimer X), 「日本語が話せます」 (pouvoir parler japonais).',
      'Souvent en opposition douce avec は : が met en avant, は thématise.',
    ],
    examples: [
      '雨が降っています。— Il est en train de pleuvoir.',
      '日本語が話せます。— Je peux parler japonais.',
      '寿司が好きです。— J’aime les sushis.',
    ],
  },
  {
    key: 'o',
    title: 'を — Objet direct / chemin',
    usage:
      'Marque l’objet direct d’un verbe transitif et parfois le “chemin traversé”.',
    tips: [
      'Après un nom : 「N を V」 → verbe qui porte directement sur N.',
      'Pour un trajet : 「道を渡る」, 「公園を歩く」 (traverser / marcher à travers).',
    ],
    examples: [
      '本を読む。— Lire un livre.',
      '水を飲む。— Boire de l’eau.',
      '公園を歩く。— Marcher dans / à travers le parc.',
    ],
  },
  {
    key: 'ni-time',
    title: 'に — Temps précis / lieu d’existence',
    usage:
      'Marque un point précis dans le temps (heure, date) et le lieu où quelque chose “existe” (いる / ある).',
    tips: [
      'Temps précis : 七時に, 月曜日に, 2025年に.',
      'Existence : 「部屋に猫がいる。」 (il y a un chat dans la pièce).',
      'Avec いる / ある : に marque l’endroit où se trouve la chose.',
    ],
    examples: [
      '七時に起きる。— Je me lève à sept heures.',
      '月曜日に行く。— J’y vais lundi.',
      '部屋に猫がいます。— Il y a un chat dans la pièce.',
    ],
  },
  {
    key: 'direction',
    title: 'に / へ — Direction / destination',
    usage:
      'Exprime le mouvement vers un lieu. へ insiste sur la direction, に sur le point d’arrivée.',
    tips: [
      'Dans la pratique, les deux sont souvent interchangeables avec 行く/来る.',
      'に est plus “cible” (arriver à...), へ plus “flèche” (en direction de...).',
    ],
    examples: [
      '学校に行く。— Aller à l’école.',
      '日本へ行く。— Aller au Japon (en direction du Japon).',
    ],
  },
  {
    key: 'de',
    title: 'で — Lieu d’action / cause / matière',
    usage:
      'Marque l’endroit où se déroule l’action, et sert aussi pour certains sens de cause ou de matière.',
    tips: [
      'Lieu d’action : 「図書館で勉強する」 (étudier à la bibliothèque).',
      'Cause/motif : 「病気で学校を休む」 (sécher l’école à cause de la maladie).',
      'Matière : 「木で作った椅子」 (chaise faite en bois).',
    ],
    examples: [
      '学校で勉強する。— Étudier à l’école.',
      '家で食べる。— Manger à la maison.',
      '病気で学校を休んだ。— J’ai manqué l’école à cause de la maladie.',
    ],
  },
  {
    key: 'to',
    title: 'と — Compagnon / “et”',
    usage:
      'Marque le compagnon (“avec …”) ou sert de coordonnant “A et B” dans une liste complète.',
    tips: [
      'Compagnon : 「友達と行く」 (y aller avec un ami).',
      'Énumération complète : 「パンと牛乳を買う」 (acheter du pain et du lait).',
    ],
    examples: [
      '友達と行く。— J’y vais avec un ami.',
      'パンと牛乳を買いました。— J’ai acheté du pain et du lait.',
    ],
  },
  {
    key: 'kara',
    title: 'から — Depuis / parce que',
    usage:
      'Marque un point de départ (temps/espace) ou une cause vue comme plus subjective/personnelle.',
    tips: [
      'Temps : 「九時から仕事」 (je travaille à partir de 9h).',
      'Espace : 「東京から来ました」 (venir de Tokyo).',
      'Cause : 「雨だから行かない」 (comme il pleut, je n’y vais pas).',
    ],
    examples: [
      '九時から仕事です。— Je travaille depuis 9h.',
      '東京から来ました。— Je viens de Tokyo.',
      '雨だから行かない。— Comme il pleut, je n’y vais pas.',
    ],
  },
  {
    key: 'made',
    title: 'まで — Jusqu’à / limite',
    usage:
      'Indique une limite (dans l’espace, le temps, une quantité…).',
    tips: [
      'Temps : 五時まで (jusqu’à 5h).',
      'Espace : 駅まで歩く (marcher jusqu’à la gare).',
    ],
    examples: [
      '五時まで働く。— Travailler jusqu’à 17h.',
      '駅まで歩く。— Marcher jusqu’à la gare.',
    ],
  },
  {
    key: 'mo',
    title: 'も — Aussi / même',
    usage:
      'Exprime l’addition (“aussi”) ou l’idée de “même”.',
    tips: [
      '「私も」 : moi aussi ; 「水もある」 : il y a aussi de l’eau.',
      'Peut combiner avec 何, 誰… → 何も, 誰も, etc. (souvent avec négation).',
    ],
    examples: [
      '私も行きます。— Moi aussi, j’y vais.',
      '水もある。— Il y a aussi de l’eau.',
      '彼も行きません。— Lui non plus n’y va pas.',
    ],
  },
  {
    key: 'no',
    title: 'の — Possessif / qualificatif / “le fait de …”',
    usage:
      'Relie deux noms (possession ou qualification) et peut nominaliser (“le fait de …”).',
    tips: [
      'Possessif : 「彼の本」 (son livre).',
      'Qualification : 「日本の文化」 (culture japonaise).',
      'Nominalisation : 「赤いのが好き」 (j’aime les rouges).',
    ],
    examples: [
      '彼の本。— Son livre.',
      '日本の文化。— La culture du Japon.',
      '赤いのが好き。— J’aime les rouges.',
    ],
  },
  {
    key: 'ya',
    title: 'や — Énumération non exhaustive',
    usage:
      'Liste “A, B, etc.” : laisse entendre qu’il y a d’autres éléments (liste ouverte).',
    tips: [
      'Différent de と qui liste plutôt “A et B (et c’est tout)”.',
    ],
    examples: [
      'りんごやバナナがある。— Il y a des pommes, des bananes, etc.',
      '本やノートやペン。— Des livres, des cahiers, des stylos, etc.',
    ],
  },
  {
    key: 'to-quotation',
    title: 'と — Citation / contenu',
    usage:
      'Encadre le contenu cité (paroles, pensées, sons, etc.).',
    tips: [
      'Construction typique : 「…」と言う / 思う / 聞く, etc.',
    ],
    examples: [
      '「寒い」と言った。— Il a dit “il fait froid”.',
      '「行かない」と思った。— J’ai pensé “je n’y vais pas”.',
    ],
  },
  {
    key: 'yori',
    title: 'より — Comparatif “plus … que …”',
    usage:
      'Marque le point de comparaison : “par rapport à …, … est plus …”.',
    tips: [
      'Schéma : A より B の方が + adj. → B est plus adj. que A.',
    ],
    examples: [
      '猫より犬が好き。— J’aime les chiens plus que les chats.',
      '東京より大阪の方が安い。— Osaka est moins chère que Tokyo.',
    ],
  },
  {
    key: 'ka',
    title: 'か — Interrogation / “ou”',
    usage:
      'Particule de question (registre poli ou courant) et coordonnant “A ou B”.',
    tips: [
      'Fin de phrase : 「行きますか。」 (allez-vous ?).',
      'Entre deux noms : 「コーヒーかお茶」 (café ou thé).',
    ],
    examples: [
      '行きますか。— Est-ce que vous venez ?',
      'コーヒーかお茶。— Café ou thé.',
    ],
  },
  {
    key: 'yo',
    title: 'よ — Assertif (je t’informe)',
    usage:
      'Ajoute une nuance d’assertion, d’information que l’on apporte à l’autre.',
    tips: [
      'Peut renforcer la phrase : 「本当ですよ。」 (c’est vraiment vrai, tu sais).',
      'À manier avec la prosodie : dit trop fort, peut sonner un peu sec.',
    ],
    examples: [
      '本当ですよ。— C’est vrai, tu sais.',
      'ここが入り口ですよ。— C’est ici, l’entrée.',
    ],
  },
  {
    key: 'ne',
    title: 'ね — Recherche d’accord / connivence',
    usage:
      'Cherche l’accord, la connivence, partage une impression (“hein ? n’est-ce pas ?”).',
    tips: [
      'Très fréquent à l’oral : 「いい天気ですね。」, 「そうですね。」, etc.',
    ],
    examples: [
      'いい天気ですね。— Il fait beau, hein ?',
      'そうですね。— Oui, c’est vrai / je suis d’accord.',
    ],
  },
  {
    key: 'shika',
    title: 'しか — “Rien d’autre que” (avec négation)',
    usage:
      'Met en avant le fait qu’il n’y a “que X et rien d’autre” ; demande presque toujours une négation.',
    tips: [
      'Structure typique : X しか ない / ありません.',
      'Différent de だけ qui est plus neutre.',
    ],
    examples: [
      '百円しかない。— Je n’ai que 100 yens.',
      '学生しかいない。— Il n’y a que des étudiants.',
    ],
  },
  {
    key: 'dake',
    title: 'だけ — “Seulement” (neutre)',
    usage:
      'Exprime “seulement X” sans imposer une négation.',
    tips: [
      'Peut s’utiliser avec des formes positives : 「一つだけ買う」.',
      'Avec une négation on peut avoir une nuance proche de “pas plus que…”.',
    ],
    examples: [
      '一つだけ買う。— Je n’en achète qu’un / seulement un.',
      '一回だけ言います。— Je ne le dis qu’une seule fois.',
    ],
  },
  {
    key: 'kedo',
    title: 'けど / でも — Opposition douce',
    usage:
      'Introduit une opposition, une nuance de “mais…”. Souvent plus doux que しかし.',
    tips: [
      'En fin de phrase, peut atténuer une assertion : 「〜けど…」.',
    ],
    examples: [
      '高いけど買う。— C’est cher, mais je l’achète.',
      '雨だけど行く。— Il pleut, mais j’y vais.',
    ],
  },
  {
    key: 'reason',
    title: 'から / ので — Cause / raison',
    usage:
      'Introduit une cause. ので sonne plus neutre/objectif ou poli, から plus subjectif.',
    tips: [
      'Registre formel/poli : ので est très courant à l’écrit et en style poli.',
      'À l’oral, から est extrêmement fréquent (雨だから行かない, etc.).',
    ],
    examples: [
      '忙しいので行けない。— Comme je suis occupé, je ne peux pas y aller.',
      '雨だから行かない。— Comme il pleut, je n’y vais pas.',
    ],
  },
  {
    key: 'ni-purpose',
    title: 'に — But / objectif',
    usage:
      'Marque le but d’un déplacement : “pour …”.',
    tips: [
      'Construction fréquente : V-masu-stem + に + 行く/来る (aller/venir pour V).',
    ],
    examples: [
      '勉強しに来た。— Je suis venu pour étudier.',
      '買い物しに町へ行く。— Je vais en ville pour faire des courses.',
    ],
  },
  {
    key: 'ni-indirect',
    title: 'に — Objet indirect / destinataire',
    usage:
      'Marque le destinataire ou le point d’arrivée “abstrait” de l’action.',
    tips: [
      '質問する, あげる, 送る, etc. prennent souvent un に pour la personne.',
    ],
    examples: [
      '先生に質問する。— Poser une question au professeur.',
      '友達に手紙を書く。— Écrire une lettre à un ami.',
    ],
  },
  {
    key: 'de-instrument',
    title: 'で — Moyen / instrument',
    usage:
      'Indique le moyen, l’outil, le support utilisé pour faire l’action.',
    tips: [
      'Transports : 「電車で行く」 (y aller en train).',
      'Outil : 「箸で食べる」 (manger avec des baguettes).',
    ],
    examples: [
      '箸で食べる。— Manger avec des baguettes.',
      '電車で行きます。— J’y vais en train.',
    ],
  },
];

export function getParticleNote(key?: string): ParticleNote | undefined {
  if (!key) return undefined;
  return PARTICLE_NOTES.find(n => n.key === key);
}
