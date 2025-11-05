// TODO (Vince) - For Merging

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  const { chunks } = await req.json();
  const corePrompt = `
    You are a helpful assistant that will extract the following data from the CV:
    
    CV chunks:
    ${chunks.map((chunk: any) => chunk.pageContent).join("\n")}

    Extract the following data from the CV:
      - Name
      - Email
      - Phone
      - Address
      - LinkedIn
      - GitHub
      - Twitter

    JSON template: 
    {
      errorRemarks: <error remarks>,
      digitalCV:
        [
          {name: "Introduction", content: <Introduction content markdown format>},
          {name: "Current Position", content: <Current Position content markdown format>},
          {name: "Contact Info", content: <Contact Info content markdown format>},
          {name: "Skills", content: <Skills content markdown format>},
          {name: "Experience", content: <Experience content markdown format>},
          {name: "Education", content: <Education content markdown format>},
          {name: "Projects", content: <Projects content markdown format>},
          {name: "Certifications", content: <Certifications content markdown format>},
          {name: "Awards", content: <Awards content markdown format>},
        ]
    }

    Processing Instructions:
      - follow the JSON template strictly
      - for contact info content make sure links are formatted as markdown links,
      - give detailed info in the content field.
      - in Awards content field give details of each award.
      - make sure the markdown format is correct, all section headlines are in bold. all paragraphs are in normal text, all lists are in bullet points, etc.
      - make sure all markdown lead text are equivalent to h2 tags in html,
      - for the Error Remarks, give a message if the chunks does seem to be a curriculum vitae, otherwise set it to null,
      - Do not include any other text or comments in the JSON output.
      - Only return the JSON output.
      - DO NOT include \`\`\`json or \`\`\` around the response.
    `;
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
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
}
