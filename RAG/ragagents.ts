import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import "dotenv/config";
const loader = new PDFLoader(
  "/mnt/c/Users/ASUS/Downloads/ProjectDocs/ProjectDocs/nke-10k-2023.pdf",
);
const docs = await loader.load();
console.log(docs.length);

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

const allSplits = await textSplitter.splitDocuments(docs);

console.log(allSplits.length);

const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "gemini-embedding-001",
});

const vectorStore = new MemoryVectorStore(embeddings);

await vectorStore.addDocuments(allSplits);

//retreive from vectors
// const results = await vectorStore.similaritySearch(
//   "when was nike incorporated?",
// );

const retriever = vectorStore.asRetriever({
  searchType: "mmr",
  searchKwargs: { fetchK: 4 },
});

console.log(retriever);
