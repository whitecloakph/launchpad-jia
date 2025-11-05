import { OpenAI } from "openai";

type Voice = "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";

export async function POST(req: Request) {
  const { text, voice = "alloy" } = await req.json();

  if (!text) {
    return new Response(JSON.stringify({ error: "Text is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const openai = new OpenAI();
    const speechResponse = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: voice as Voice,
      input: text,
    });

    return new Response(await speechResponse.arrayBuffer());
  } catch (error) {
    console.error("Text-to-speech error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate speech" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
