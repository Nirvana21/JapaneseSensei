import { NextRequest, NextResponse } from "next/server";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

interface WordEntry {
  word: string;
  meaning: string;
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY manquant" },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { words, allWords } = body as {
      words: WordEntry[];
      allWords: string[];
    };

    if (!words || words.length < 2) {
      return NextResponse.json(
        { error: "Pas assez de mots fournis" },
        { status: 400 }
      );
    }

    // Construire 3 leurres par mot cible depuis allWords
    const shuffled = [...allWords].sort(() => Math.random() - 0.5);
    const blanksList = words.map((w, i) => {
      const distractors = shuffled
        .filter((x) => x !== w.word)
        .slice(i * 3, i * 3 + 3);
      return {
        index: i,
        word: w.word,
        meaning: w.meaning,
        options: [...[w.word, ...distractors].sort(() => Math.random() - 0.5)],
      };
    });

    const wordList = words
      .map((w) => `${w.word} (${w.meaning})`)
      .join(", ");

    const prompt = `Tu es un professeur de japonais. Génère une mini-histoire en japonais simple (niveau JLPT N5/N4) qui utilise naturellement ces ${words.length} mots exactement dans cet ordre : ${wordList}.

Réponds UNIQUEMENT avec un JSON valide dans ce format exact (sans markdown, sans explication) :
{
  "title": "titre court en japonais",
  "segments": ["texte avant trou 0", "texte entre trous 0 et 1", "texte entre trous 1 et 2", "texte entre trous 2 et 3", "texte après trou 3"],
  "translation": "traduction française de l'histoire complète"
}

Règles :
- Les "segments" sont le texte japonais ENTRE chaque mot-cible. Il y a toujours exactement ${words.length + 1} segments.
- Chaque segment peut être vide "" si les mots se suivent directement.
- L'histoire doit être courte : 3-5 phrases simples.
- Utilise uniquement du vocabulaire N5/N4.`;

    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI error:", errText);
      return NextResponse.json(
        { error: "Erreur OpenAI" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content ?? "";

    // Parser le JSON retourné
    let parsed: { title: string; segments: string[]; translation: string };
    try {
      // Nettoyer d'éventuels backticks markdown
      const clean = raw.replace(/```json?/g, "").replace(/```/g, "").trim();
      parsed = JSON.parse(clean);
    } catch {
      console.error("Parse error. Raw:", raw);
      return NextResponse.json(
        { error: "Impossible de parser la réponse de l'IA" },
        { status: 500 }
      );
    }

    // Valider les segments
    if (
      !parsed.segments ||
      parsed.segments.length !== words.length + 1
    ) {
      return NextResponse.json(
        { error: "Structure de l'histoire invalide" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      story: {
        title: parsed.title ?? "Mini histoire",
        segments: parsed.segments,
        blanks: blanksList,
        translation: parsed.translation ?? "",
      },
    });
  } catch (err) {
    console.error("fill-blanks error:", err);
    return NextResponse.json(
      { error: "Erreur serveur inattendue" },
      { status: 500 }
    );
  }
}
