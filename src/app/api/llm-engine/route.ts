import { NextResponse } from "next/server";
import OpenAI from "openai";
import connectMongoDB from "@/lib/mongoDB/mongoDB";

export async function POST(request: Request) {
  try {
    const { systemPrompt, prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Resolve API key and model
    let apiKey = process.env.OPENAI_API_KEY;
    let model = "gpt-4o-mini";
    try {
      if (!apiKey) {
        const { db } = await connectMongoDB();
        const settings = await db
          .collection("global-settings")
          .findOne({ name: "global-settings" }, { projection: { openai_api_key: 1, openai_model: 1 } });
        apiKey = settings?.openai_api_key || apiKey;
        if (settings?.openai_model) model = settings.openai_model;
      }
    } catch {}

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing OpenAI API key. Set OPENAI_API_KEY or save it in global settings." },
        { status: 400 }
      );
    }

    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: systemPrompt
            ? systemPrompt
            : "You are a helpful assistant that can answer questions and help with tasks.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return NextResponse.json({
      result: completion.choices[0].message.content,
    });
  } catch (error) {
    const message =
      (error as any)?.response?.data?.error ||
      (error as any)?.message ||
      "Failed to process request";
    console.error("Error in LLM engine:", message);
    return NextResponse.json(
      { error: message },
      { status: (error as any)?.status || 500 }
    );
  }
}
