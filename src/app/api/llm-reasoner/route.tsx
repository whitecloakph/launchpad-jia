import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { corePrompt } = await request.json();

    if (!corePrompt) {
      return NextResponse.json(
        { error: "corePrompt is required" },
        { status: 400 }
      );
    }

    const completion = await openai.responses.create({
      model: "o4-mini",
      reasoning: { effort: "high" },
      input: [
        {
          role: "user",
          content: corePrompt,
        },
      ],
    });

    return NextResponse.json({
      result: completion.output_text,
    });
  } catch (error) {
    console.error("Error in LLM reasoner:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
