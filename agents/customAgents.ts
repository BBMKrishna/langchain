import { createAgent, initChatModel, tool } from "langchain";
import z from "zod";
import "dotenv/config";
import { MemorySaver } from "@langchain/langgraph";
const systemPrompt = `
You are an expert weather forecaster.
you have access to two tools:

-get_weather: use this to get the weather for a specific location
-get_user_location: use this to get the user's location

if a user asks for the weather, make sure you have the location first, if you can figure out location from their prompt then use get_weather else you get_user_location and then get weather

`;
const getUserLocation = tool(
  (_, config) => {
    const userId = config.context.user_id;

    return userId === "1" ? "nellore" : "sfo";
  },
  {
    name: "get_user_location",
    description: "retrieve user infomation based on user id",
    schema: z.object({}),
  },
);

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
const config = {
  configurable: { thread_id: "1" },
  context: { user_id: "1" },
};
const qaconfig = {
  configurable: { thread_id: "2" },
  context: { user_id: "3" },
};

const checkpointer = new MemorySaver();

const model = await initChatModel("google-genai:gemini-2.5-flash-lite",{});
const agent = createAgent({
  model: model,
  tools: [getUserLocation, getWeather],
  systemPrompt,
});

const response = await agent.invoke(
  {
    messages: [{ role: "user", content: "what is the weather outside?" }],
  },
  config,
);
console.log(response.messages[response.messages.length-1].content)
await new Promise(resolve => setTimeout(resolve, 10000));
const response1 = await agent.invoke(
  {
    messages: [{ role: "user", content: "what location did you just told?" }],
  },
  config,
);
console.log(response1.messages[response1.messages.length-1].content)
await new Promise(resolve => setTimeout(resolve, 10000));
const response2 = await agent.invoke(
  {
    messages: [{ role: "user", content: "what is the favourite places here?" }],
  },
  qaconfig,
);
console.log(response2.messages[response2.messages.length-1].content)
await new Promise(resolve => setTimeout(resolve, 10000));
const response3 = await agent.invoke(
  {
    messages: [{ role: "user", content: "what is the favourite food here?" }],
  },
  qaconfig,
);
console.log(response3.messages[response3.messages.length-1].content)
