import { OpenAI } from "openai";

const messages: any = [
  { role: "system", content: "You are a helpful assistant." },
];

export async function POST(req: Request) {
  const { text } = await req.json();

  messages.push({
    role: "user",
    content: text,
  });

  const openai = new OpenAI();
  const chatResponse = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages,
  });

  messages.push({
    role: "assistant",
    content: chatResponse.choices[0].message.content,
  });

  return new Response(chatResponse.choices[0].message.content);
}
