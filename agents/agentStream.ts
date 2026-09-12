import { createAgent, tool } from "langchain";
import "dotenv/config";
import z from "zod";

const getWeather = tool(
  async (input) => `its always cool in ${input.city}`,
  {
    name: "get_weather",
    description: "Get the weather for a given city",
    schema: z.object({ city: z.string() }),
  }
);

const getTime = tool(
  async (input) => `the time in ${input.city} is 03:00 PM `,
  {
    name: "get_time",
    description: "get the time in the city",
    schema: z.object({ city: z.string() }),
  }
);

const agent = createAgent({
  model: "google-genai:gemini-2.5-flash-lite",
  tools: [getWeather, getTime],
});

const eventStream = agent.streamEvents(
  {
    messages: [{ role: "user", content: "what is the time and weeather in new york?" }],
  },
  { version: "v2" }
);

for await (const event of eventStream) {
  // Catch only the actual token stream from the LLM
  if (event.event === "on_chat_model_stream") {
    const chunk = event.data?.chunk;
    if (chunk?.content) {
      process.stdout.write(chunk.content);
    }
  }
}
console.log("\n\nDone.");