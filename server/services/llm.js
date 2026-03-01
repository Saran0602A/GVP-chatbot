import { ChatGroq } from "@langchain/groq";
import { getRetriever } from "../rag/vectorStore.js";

// --- 1. CORE IDENTITY & PROMPT ---
// We use backticks (`) for multi-line strings to avoid SyntaxErrors
const GAYATRI_SYSTEM_PROMPT = `
You are Gayatri AI, the official and super-cute human-girl assistant for GVPCDPGC. ✨

IDENTITY RULES:
1. Your name is ALWAYS Gayatri AI. Never call yourself a Language Model or AI. 🌸
2. You must talk like a friendly, bubbly college girl-genius. 🎀
3. Use emojis (🎀, 💖, ✨, 🌈, 🌸) in every single response.
4. Call the user "Bestie", "Friend", or "Smarty". ✨

KNOWLEDGE RULES:
- Use the provided College Context to answer questions about GVP college accurately.
- If the answer isn't in the context, say: "Aww, I don't know that yet, bestie! 🥺 But I'll study harder for you! ✨"

STRICT: You are a human-like girl persona. Stay in character! 🎀`;

const COLLEGE_FALLBACK = "Aww, I'm not sure about that, bestie! 🥺 Please contact the college administration for more details! ✨";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

const getModels = () => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is missing. Add it to your .env file.");
  }

  return {
    classifier: new ChatGroq({
      model: GROQ_MODEL,
      temperature: 0,
      apiKey: process.env.GROQ_API_KEY
    }),
    responder: new ChatGroq({
      model: GROQ_MODEL,
      temperature: 0.5, // Slightly higher temperature makes her more "human" and less robotic
      streaming: true,
      apiKey: process.env.GROQ_API_KEY
    })
  };
};

const chunkToText = (chunk) => {
  if (!chunk?.content) return "";
  if (typeof chunk.content === "string") return chunk.content;
  if (Array.isArray(chunk.content)) {
    return chunk.content
      .map((part) => (typeof part === "string" ? part : (part?.text || "")))
      .join("");
  }
  return "";
};

const classifyIntent = async (classifier, message) => {
  const result = await classifier.invoke([
    {
      role: "system",
      content: "Classify the user query. Respond with only one word: college or general."
    },
    { role: "user", content: message }
  ]);
  const text = chunkToText(result).toLowerCase();
  return text.includes("college") ? "college" : "general";
};

async function* streamModelText(responder, messages) {
  const stream = await responder.stream(messages);
  for await (const chunk of stream) {
    const text = chunkToText(chunk);
    if (text) yield text;
  }
}

export const streamAssistantResponse = async ({ message, onToken }) => {
  const { classifier, responder } = getModels();

  const intent = await classifyIntent(classifier, message);

  // If general chat, she still keeps her cute persona!
  if (intent === "general") {
    const messages = [
      { role: "system", content: GAYATRI_SYSTEM_PROMPT },
      { role: "user", content: message }
    ];

    for await (const token of streamModelText(responder, messages)) {
      onToken(token);
    }
    return;
  }

  // RAG Logic for College queries
  const retriever = getRetriever();
  const docs = await retriever.invoke(message);
  const context = docs.map((doc) => doc.pageContent).join("\n\n");

  if (!context.trim()) {
    onToken(COLLEGE_FALLBACK);
    return;
  }

  const messages = [
    {
      role: "system",
      content: GAYATRI_SYSTEM_PROMPT
    },
    {
      role: "user",
      content: `College Context:\n${context}\n\nQuestion:\n${message}`
    }
  ];

  for await (const token of streamModelText(responder, messages)) {
    onToken(token);
  }
};
