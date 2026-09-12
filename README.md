# LangChain Playground

A TypeScript playground for experimenting with [LangChain](https://js.langchain.com/), [LangGraph](https://langchain-ai.github.io/langgraphjs/), and [LangSmith](https://smith.langchain.com/) — agents, tool calling, stateful graphs, local LLMs via Ollama, and retrieval-augmented generation (RAG).

## Structure

```
agents/       createAgent demos — tool calling, streaming, memory/context, local Ollama models
langgraph/    StateGraph workflows (multi-node graphs with conditional edges)
RAG/          Document loading, chunking, embeddings, and retrieval
```

| File | What it shows |
|---|---|
| `agents/agents.ts` | Minimal `createAgent` setup with two tools |
| `agents/agentStream.ts` | Streaming agent output token-by-token via `streamEvents` |
| `agents/customAgents.ts` | System prompts, per-call context, and conversation memory (`MemorySaver`) |
| `agents/runtimeAgents.ts` | Passing runtime context (e.g. user id) into tool calls |
| `agents/localllmagent.ts` | Running an agent against a local model through `ChatOllama` |
| `langgraph/langgraph_llm.ts` | A generate → review → retry loop built as a `StateGraph` |
| `RAG/ragagents.ts` | PDF loading, text splitting, embeddings, and an MMR retriever |

## Setup

```bash
npm install
```

Create a `.env` file in the project root (never commit this — it's gitignored):

```bash
GOOGLE_API_KEY=your_google_api_key

# Optional — enables LangSmith tracing
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=your_langsmith_api_key
LANGCHAIN_PROJECT=your_project_name
LANGSMITH_ENDPOINT=https://api.smith.langchain.com
```

Some scripts (`localllmagent.ts`, `langgraph_llm.ts`) call a local [Ollama](https://ollama.com/) server at `http://localhost:11434` instead of a hosted model — make sure Ollama is running and the referenced model is pulled first.

## Running a script

There's no bundler/dev script wired up yet — run any file directly with `tsx`:

```bash
npx tsx agents/agents.ts
npx tsx langgraph/langgraph_llm.ts
npx tsx RAG/ragagents.ts
```

## Notes

- `RAG/ragagents.ts` currently points at a hardcoded local PDF path — update it to a file you actually have before running.
- These are exploratory scripts, not a packaged library — expect rough edges and hardcoded values.
