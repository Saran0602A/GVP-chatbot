import { ChatGroq } from "@langchain/groq";
import { getRetriever } from "../rag/vectorStore.js";

const INTRO_LINE =
  "I am the Official AI Assistant of Gayatri Vidya Parishad College.";
const COLLEGE_FALLBACK =
  "I\u2019m not sure about that. Please contact the college administration.";
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
      temperature: 0.3,
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
      .map((part) => {
        if (typeof part === "string") return part;
        if (part?.type === "text") return part.text || "";
        return "";
      })
      .join("");
  }

  return "";
};

const classifyIntent = async (classifier, message) => {
  const result = await classifier.invoke([
    {
      role: "system",
      content:
        "Classify the user query. Respond with only one word: college or general. Use college for questions related to Gayatri Vidya Parishad College details, admissions, courses, placements, academics, facilities, attendance, accreditation, contact, address, timings."
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
  onToken(`${INTRO_LINE}\n\n`);

  const intent = await classifyIntent(classifier, message);

  if (intent === "general") {
    const messages = [
      {
        role: "system",
        content:
          "You are a helpful AI assistant. Give accurate and concise responses for general questions."
      },
      { role: "user", content: message }
    ];

    for await (const token of streamModelText(responder, messages)) {
      onToken(token);
    }
    return;
  }

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
      content:
        "You are the official college assistant. Answer using only the provided college context. If asked for role-based people (like director, dean, principal), return names and roles from context clearly. If the answer is not present in context, reply exactly: I\u2019m not sure about that. Please contact the college administration."
    },
    {
      role: "user",
      content: `Question:\n${message}\n\nCollege Context:\n${context}`
    }
  ];

  for await (const token of streamModelText(responder, messages)) {
    onToken(token);
  }
};
