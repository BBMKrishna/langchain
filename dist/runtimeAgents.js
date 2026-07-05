import { createAgent, tool } from "langchain";
import z from "zod";
import "dotenv/config";
const systemPrompt = `
You are an expert weather forecaster.
you have access to two tools:

-get_weather: use this to get the weather for a specific location
-get_user_location: use this to get the user's location

if a user asks for the weather, make sure you have the location first, if you can figure out location from their prompt then use get_weather else you get_user_location and then get weather

`;
const getUserLocation = tool((_, config) => {
    const userId = config.context.user_id;
    return userId === "1" ? "nellore" : "sfo";
}, {
    name: "get_user_location",
    description: "retrieve user infomation based on user id",
    schema: z.object({}),
});
const getWeather = tool((input) => {
    return `its always cool in ${input.city}`;
}, {
    name: "get_weather",
    description: "Get the weather for a given city",
    schema: z.object({ city: z.string() }),
});
const config = {
    context: { user_id: "1" },
};
const agent = createAgent({
    model: "google-genai:gemini-2.5-flash",
    tools: [getUserLocation, getWeather],
    systemPrompt
});
const response = await agent.invoke({
    messages: [{ role: "user", content: "what is the weather outside?" }],
}, config);
console.log(response);
//# sourceMappingURL=runtimeAgents.js.map