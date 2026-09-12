import { StateGraph, Annotation, START, END } from "@langchain/langgraph";
import { ChatOllama } from "@langchain/ollama";
import "dotenv/config";

// 1. Define the Shared State Schema
// Every node can read and mutate this state object
const GraphState = Annotation.Root({
  task: Annotation<string>(),
  code: Annotation<string>(),
  feedback: Annotation<string>(),
  attempts: Annotation<number>(),
  isApproved: Annotation<boolean>(),
});
console.log("🚀 Starting the LangGraph LLM Agent Workflow with the initial state", GraphState);
// Initialize the local LLM
const model = new ChatOllama({
  model: "gemma4:12b",
  temperature: 0.1,
  baseUrl: "http://localhost:11434",
});

// 2. Node 1: Code Generator
async function generateCodeNode(state: typeof GraphState.State) {
  console.log(`\n🤖 [Generator] Attempt #${(state.attempts || 0) + 1}...`);

  const prompt = state.feedback
    ? `Task: ${state.task}\n\nPrevious code:\n${state.code}\n\nFix this feedback: ${state.feedback}\nReturn ONLY the revised code block.`
    : `Write a clean TypeScript function for: ${state.task}. Return ONLY the code block.`;

  const response = await model.invoke(prompt);

  return {
    code: response.content as string,
    attempts: (state.attempts || 0) + 1,
  };
}

// 3. Node 2: Code Reviewer / Evaluator
async function reviewCodeNode(state: typeof GraphState.State) {
  console.log("🔍 [Reviewer] Inspecting code quality...");

  // Simple deterministic rule check (or you can use an LLM-as-a-judge here)
  const code = state.code;
  const hasTypes = code.includes(":") || code.includes("interface");
  const hasComments = code.includes("//") || code.includes("/*");

  if (!hasTypes) {
    return {
      isApproved: false,
      feedback: "Missing explicit TypeScript type annotations. Please add types.",
    };
  }

  if (!hasComments) {
    return {
      isApproved: false,
      feedback: "Missing JSDoc or explanatory comments. Please add comments.",
    };
  }

  return {
    isApproved: true,
    feedback: "Looks good! All criteria met.",
  };
}

// 4. Conditional Edge: Decide whether to loop or finish
function shouldContinue(state: typeof GraphState.State) {
  if (state.isApproved) {
    console.log("✅ [Router] Approved! Finishing pipeline.");
    return END;
  }

  if (state.attempts >= 3) {
    console.log("⚠️ [Router] Max retry limit reached (3). Exiting.");
    return END;
  }

  console.log(`❌ [Router] Rejected: "${state.feedback}". Looping back to generator...`);
  return "generateCode";
}

// 5. Build the Graph
const workflow = new StateGraph(GraphState)
  .addNode("generateCode", generateCodeNode)
  .addNode("reviewCode", reviewCodeNode)
  .addEdge(START, "generateCode")
  .addEdge("generateCode", "reviewCode")
  .addConditionalEdges("reviewCode", shouldContinue);

// Compile to an executable runner
const app = workflow.compile();

// 6. Run the Project
const result = await app.invoke({
  task: "create a function that calculates the factorial of a number",
  attempts: 0,
});

console.log("\n================ Final Result ================");
console.log(result.code);