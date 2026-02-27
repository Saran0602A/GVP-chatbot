import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { loadCollegeDocuments } from "./loader.js";
import { SimpleEmbeddings } from "./simpleEmbeddings.js";

let retriever;

export const initializeKnowledgeBase = async () => {
  const embeddings = new SimpleEmbeddings();

  const docs = await loadCollegeDocuments();
  const store = await MemoryVectorStore.fromDocuments(docs, embeddings);
  retriever = store.asRetriever(8);
  console.log(`Knowledge base initialized with ${docs.length} chunks.`);
};

export const getRetriever = () => {
  if (!retriever) {
    throw new Error("Knowledge base not initialized.");
  }
  return retriever;
};
