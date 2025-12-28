import { NextRequest, NextResponse } from "next/server";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

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
    const { message, history } = body as {
      message?: string;
      history?: { role: "user" | "assistant" | "system"; content: string }[];
    };

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Champ 'message' requis" },
        { status: 400 }
      );
    }

    const messages = [
      {
        role: "system" as const,
        content:
          "Tu es un professeur de japonais (Japanese Sensei) pédagogue et bienveillant. Tu expliques les kanjis, les radicaux, les lectures (on/kun) et corriges les phrases en t'adaptant au niveau de l'utilisateur. Réponds en français quand la question est en français, mais n'hésite pas à donner les formes japonaises avec furigana ou romaji quand c'est utile.",
      },
      ...(Array.isArray(history) ? history : []),
      { role: "user" as const, content: message },
    ];

    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      return NextResponse.json(
        { error: "Erreur lors de l'appel à l'API ChatGPT" },
        { status: 502 }
      );
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content || "";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("/api/chat error", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
