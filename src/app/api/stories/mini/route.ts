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
        ? `Les niveaux JLPT ciblés sont : ${safeJlpt.join(", ")}. Adapte approximativement la difficulté à ces niveaux, sans être trop strict.`
        : "Tu peux viser un niveau intermédiaire (autour de N4/N3).";

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
Génère une mini histoire en japonais en utilisant autant que possible les kanjis suivants :
${kanjiListText}

Contraintes importantes :
- Longueur : ${lengthHint}.
- ${jlptHint}
- ${themeHint}
- Tu peux ajouter du vocabulaire et d'autres kanjis si besoin pour que l'histoire soit naturelle, mais essaie d'intégrer en priorité ceux de la liste.
- Utilise un style narratif simple, au passé ou présent, adapté à un apprenant.
- Ne renvoie que le texte de l'histoire en japonais, sans explications supplémentaires, sans traduction, sans listes et sans mise en forme Markdown.
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
        temperature: 0.7,
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
    const story = data?.choices?.[0]?.message?.content || "";

    return NextResponse.json({ story });
  } catch (error) {
    console.error("/api/stories/mini error", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
