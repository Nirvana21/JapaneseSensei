// Types pour l'API Jisho
export interface JishoApiResponse {
  data: JishoEntry[];
}

export interface JishoEntry {
  slug: string;
  is_common: boolean;
  tags: string[];
  jlpt: string[];
  japanese: JapaneseReading[];
  senses: Sense[];
}

export interface JapaneseReading {
  word?: string;
  reading?: string;
}

export interface Sense {
  english_definitions: string[];
  parts_of_speech: string[];
  links: unknown[];
  tags: string[];
  restrictions: string[];
  see_also: string[];
  antonyms: string[];
  source: unknown[];
  info: string[];
}

// Types pour les données Kanji enrichies (KanjiAlive API ou données supplémentaires)
export interface KanjiDetails {
  character: string;
  stroke_count: number;
  grade?: number;
  freq?: number;
  jlpt_old?: number;
  jlpt_new?: number;
  meanings: string[];
  readings_on: string[];
  readings_kun: string[];
  name_readings?: string[];
  radical?: {
    character: string;
    name: string;
    meaning: string;
    position: string;
  };
  parts?: string[];
  stroke_order?: string; // SVG ou image URL
}

// Notre modèle de données principal pour l'application
export interface KanjiEntry {
  id: string; // UUID généré
  kanji: string; // Le kanji ou mot principal

  // Lectures (de l'API + modifications manuelles)
  onyomi: string[]; // Lectures chinoises
  kunyomi: string[]; // Lectures japonaises
  primaryReading?: string; // Lecture principale choisie manuellement

  // Significations (de l'API + modifications manuelles)
  meanings: string[]; // Significations de l'API
  primaryMeaning?: string; // Signification principale choisie manuellement

  // Informations supplémentaires
  radicals?: string[]; // Clés/radicaux expliqués
  strokeCount?: number;
  grade?: number; // Niveau scolaire japonais
  jlptLevel?: string; // Niveau JLPT
  frequency?: number; // Fréquence d'usage

  // Décomposition pour mots composés
  kanjiComponents?: Array<{
    character: string;
    radicals: string[];
    meaning: string;
    strokeCount?: number;
  }>;

  // Données personnalisées
  customNotes?: string; // Détails supplémentaires ajoutés à la main
  tags?: string[]; // Tags personnalisés

  // Métadonnées
  dateAdded: Date;
  lastModified: Date;
  isCommon?: boolean;

  // Données d'apprentissage (pour les cartes plus tard)
  studyData?: {
    timesStudied: number;
    correctAnswers: number;
    lastStudied?: Date;
    difficulty: "easy" | "medium" | "hard";
  };
}
