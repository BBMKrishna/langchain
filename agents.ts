import { createAgent, tool } from "langchain";
import "dotenv/config";
import z from "zod";

const getWeather = tool(
  (input) => {
    return `its always cool in ${input.city}`;
  },
  {
    name: "get_weather",
    description: "Get the weather for a given city",
    schema: z.object({ city: z.string() }),
  },
);

const getTime = tool(
  (input) => {
    return `the time in ${input.city} is 03:00 PM `;
  },
  {
    name: "get_time",
    description: "get the time in the city",
    schema: z.object({ city: z.string() }),
  },
);

const agent = createAgent({
  model: "google-genai:gemini-2.5-flash-lite",
  tools: [getWeather, getTime],
});

const response = await agent.invoke({
  messages: [{ role: "user", content: "what is the time and weeather in new york?" }],
});
console.log(response);
// console.log(response.messages[response.messages.length-1].content);
