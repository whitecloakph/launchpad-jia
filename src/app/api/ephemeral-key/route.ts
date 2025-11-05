import axios from "axios";

export async function POST(req: Request) {
  const { config, instructions, tools } = await req.json();

  let settings: any = {
    model: config.llm_realtime_model,
    input_audio_transcription: {
      model: config.transcription_model,
      prompt: config.transcription_prompt,
    },
    tool_choice: "auto",
    turn_detection: {
      type: "server_vad",
      prefix_padding_ms: 300,
      silence_duration_ms: 2500,
      create_response: true,
      interrupt_response: true,
      threshold: 0.7,
    },
    voice: config.voice,
    temperature: config.temperature,
    max_response_output_tokens: config.max_response_output_tokens,
  };

  if (config.turn_detection.type === "semantic_vad") {
    settings.turn_detection = {
      type: "semantic_vad",
      eagerness: "high",
      create_response: true,
      interrupt_response: true,
    };
  }

  if (instructions) {
    settings.instructions = instructions;
  }

  if (tools) {
    settings.tools = tools;
  }

  const key: any = await axios
    .post("https://api.openai.com/v1/realtime/sessions", settings, {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    })
    .then((res) => {
      return res;
    })
    .catch((err) => {
      console.log(err.response);
    });

  return new Response(JSON.stringify({ key: key.data }));
}
