import { OpenAI } from "openai";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const openai = new OpenAI();
  const transcription = await openai.audio.transcriptions.create({
    file,
    model: "whisper-1",
  });

  return new Response(JSON.stringify({ text: transcription.text }));
}
