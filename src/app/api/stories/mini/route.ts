import { NextRequest, NextResponse } from "next/server";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

interface StoryKanjiPayload {
  char: string;
  meaning?: string;
  jlptLevel?: string;
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || "gpt-5-mini";

    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY manquant sur le serveur" },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const {
      kanjis,
      jlptLevels,
      lengthPreset,
      theme,
    } = body as {
      kanjis?: StoryKanjiPayload[];
      jlptLevels?: string[];
      lengthPreset?: "short" | "medium" | "long";
      theme?: string;
    };

    if (!kanjis || !Array.isArray(kanjis) || kanjis.length === 0) {
      return NextResponse.json(
        { error: "Aucun kanji fourni pour générer l'histoire" },
        { status: 400 }
      );
    }

    const safeJlpt = Array.isArray(jlptLevels) ? jlptLevels : [];
    const uniqueKanjis = Array.from(
      new Map(kanjis.map((k) => [k.char, k])).values()
    ).slice(0, 40); // limite pour garder le prompt léger

    const lengthHint =
      lengthPreset === "long"
        ? "environ 10 à 15 phrases"
        : lengthPreset === "medium"
        ? "environ 6 à 8 phrases"
        : "environ 3 à 5 phrases";

    const jlptHint =
      safeJlpt.length > 0
        ? `Les niveaux JLPT ciblés sont : ${safeJlpt.join(", ")}. Adapte approximativement la difficulté grammaticale et lexicale à ces niveaux, sans être trop strict (inspire-toi du style des manuels de JLPT).`
        : "Tu peux viser un niveau intermédiaire (autour de N4/N3), avec des structures simples et fréquentes.";

    const themeHint = theme && theme.trim().length > 0
      ? `Le thème souhaité est : "${theme.trim()}".`
      : "Choisis un thème simple de la vie quotidienne (école, travail, amis, famille).";

    const kanjiListText = uniqueKanjis
      .map((k) => {
        const parts: string[] = [`${k.char}`];
        if (k.meaning) parts.push(`sens: ${k.meaning}`);
        if (k.jlptLevel) parts.push(`JLPT: ${k.jlptLevel}`);
        return "- " + parts.join(", ");
      })
      .join("\n");

    const userInstruction = `
  Génère une mini histoire en japonais à partir des kanjis suivants :
  ${kanjiListText}

  Contraintes importantes :
  - Longueur : ${lengthHint}.
  - ${jlptHint}
  - ${themeHint}
  - Tu dois utiliser en priorité les kanjis de la liste, mais uniquement ceux qui servent vraiment l'histoire. Il n'est pas nécessaire d'utiliser tous les kanjis de la liste.
  - Tu peux réutiliser plusieurs fois quelques kanjis importants plutôt que d'essayer d'en caser un maximum.
  - Tu peux introduire d'autres kanjis si c'est nécessaire pour que l'histoire soit naturelle, mais chaque kanji qui ne vient pas de la liste doit être expliqué dans le champ "extra_kanji".
  - Utilise un style narratif simple, clair et naturel, en japonais moderne.
  - Évite les phrases qui ressemblent à une traduction littérale du français : écris comme le ferait un locuteur natif japonais pour un apprenant (phrases plutôt courtes, expressions fréquentes, registre neutre/poli en です・ます en dehors des dialogues).
  - Assure-toi que l'histoire a une petite structure narrative (mise en place → petit problème ou objectif → résolution/fin).

  Pour chaque entrée de "extra_kanji", donne aussi quelques exemples de mots ou formes conjuguées utilisés dans l'histoire qui contiennent ce kanji, écrits uniquement en kana (idéalement en hiragana), sans kanji ni romaji (par exemple 食べる → "たべる"). Choisis 1 à 3 exemples représentatifs, en privilégiant les verbes ou expressions un peu complexes.

  Tu dois répondre STRICTEMENT au format JSON suivant (sans texte avant ou après, sans commentaires) :
{
  "story_ja": "<l'histoire complète en japonais, sans traduction, sans furigana, sans romaji>",
  "translation_fr": "<une traduction naturelle et fluide en français de l'histoire, adaptée à un apprenant>",
  "extra_kanji": [
    {
      "char": "<un kanji utilisé dans l'histoire mais qui ne vient PAS de la liste de départ>",
      "lecture": "<lecture principale en hiragana>",
      "sens_fr": "<sens principal en français>",
      "examples_kana": [
        "<mot ou forme en kana utilisant ce kanji>",
        "..."
      ]
    }
  ]
}

Assure-toi que chaque kanji listé dans "extra_kanji" apparaît vraiment dans l'histoire, et qu'aucun kanji déjà présent dans la liste de départ n'est répété dans "extra_kanji".
`;

    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system" as const,
            content:
              "Tu es un professeur de japonais qui crée des mini histoires pour l'entraînement à la lecture. Tu écris en japonais uniquement, en restant clair et pédagogique.",
          },
          {
            role: "user" as const,
            content: userInstruction,
          },
        ],
        temperature: 1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI mini-story API error:", response.status, errorText);
      return NextResponse.json(
        { error: "Erreur lors de la génération de l'histoire" },
        { status: 502 }
      );
    }

    const data = await response.json();
    const rawContent = data?.choices?.[0]?.message?.content || "";

    let story = "";
    let translation = "";
    let extraKanji: {
      char: string;
      lecture?: string;
      sens_fr?: string;
      examplesKana?: string[];
    }[] = [];

    try {
      const parsed = JSON.parse(rawContent);
      if (typeof parsed.story_ja === "string") {
        story = parsed.story_ja.trim();
      }
      if (typeof parsed.translation_fr === "string") {
        translation = parsed.translation_fr.trim();
      }
      if (Array.isArray(parsed.extra_kanji)) {
        extraKanji = parsed.extra_kanji
          .filter((item: any) => item && typeof item.char === "string")
          .map((item: any) => ({
            char: item.char,
            lecture: typeof item.lecture === "string" ? item.lecture : undefined,
            sens_fr: typeof item.sens_fr === "string" ? item.sens_fr : undefined,
            examplesKana: Array.isArray(item.examples_kana)
              ? item.examples_kana.filter((v: any) => typeof v === "string")
              : undefined,
          }));
      }
    } catch (e) {
      console.warn("Impossible de parser la réponse JSON de l'histoire, utilisation du texte brut.");
      story = typeof rawContent === "string" ? rawContent.trim() : "";
      translation = "";
      extraKanji = [];
    }

    return NextResponse.json({ story, translation, extraKanji });
  } catch (error) {
    console.error("/api/stories/mini error", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
