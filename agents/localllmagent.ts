import { createAgent, tool } from "langchain";
import { ChatOllama } from "@langchain/ollama";
import "dotenv/config";
import z from "zod";

// 1. Define Tools
const getWeather = tool(
  (input) => `its always cool in ${input.city}`,
  {
    name: "get_weather",
    description: "Get the weather for a given city",
    schema: z.object({ city: z.string() }),
  }
);

const getTime = tool(
  (input) => `the time in ${input.city} is 03:00 PM `,
  {
    name: "get_time",
    description: "get the time in the city",
    schema: z.object({ city: z.string() }),
  }
);

// 2. Initialize Local Ollama Model
const localModel = new ChatOllama({
  model: "gemma4:12b",
  temperature: 0,
  baseUrl: "http://localhost:11434", // Default Ollama server URL
});

// 3. Create the Agent
const agent = createAgent({
  model: localModel,
  tools: [getWeather, getTime],
});

// 4. Stream the Response
const eventStream = agent.streamEvents(
  {
    messages: [{ role: "user", content: "what is the time and weather in new york?" }],
  },
  { version: "v2" }
);

for await (const event of eventStream) {
  if (event.event === "on_chat_model_stream") {
    const chunk = event.data?.chunk;
    if (chunk?.content) {
      process.stdout.write(chunk.content);
    }
  }
}

console.log("\n");