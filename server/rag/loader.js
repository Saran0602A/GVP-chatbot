import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, "../data");
const mainDataPath = path.join(dataDir, "collegeData.json");
const extraKnowledgeDir = path.join(dataDir, "knowledge");

const SUPPORTED_EXTENSIONS = new Set([".json", ".txt", ".md"]);

const flattenObject = (value, prefix = "") => {
  if (value === null || value === undefined) return [];

  if (typeof value !== "object") {
    return [`${prefix}: ${String(value)}`];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      flattenObject(item, `${prefix}[${index + 1}]`)
    );
  }

  return Object.entries(value).flatMap(([key, child]) => {
    const nextPrefix = prefix ? `${prefix}.${key}` : key;
    return flattenObject(child, nextPrefix);
  });
};

const safeReadDir = async (dirPath) => {
  try {
    return await fs.readdir(dirPath, { withFileTypes: true });
  } catch {
    return [];
  }
};

const toDocumentInput = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  const source = path.relative(dataDir, filePath).replaceAll("\\", "/");
  const raw = await fs.readFile(filePath, "utf-8");

  if (ext === ".json") {
    const json = JSON.parse(raw);
    const text = flattenObject(json)
      .map((line) => line.replaceAll("_", " "))
      .join("\n");
    return { text, metadata: { source, type: "json" } };
  }

  return { text: raw, metadata: { source, type: ext.slice(1) } };
};

const collectKnowledgeFiles = async () => {
  const inputs = [];

  inputs.push(await toDocumentInput(mainDataPath));

  const entries = await safeReadDir(extraKnowledgeDir);
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const fullPath = path.join(extraKnowledgeDir, entry.name);
    const ext = path.extname(entry.name).toLowerCase();
    if (!SUPPORTED_EXTENSIONS.has(ext)) continue;
    inputs.push(await toDocumentInput(fullPath));
  }

  return inputs;
};

export const loadCollegeDocuments = async () => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 700,
    chunkOverlap: 120
  });

  const inputs = await collectKnowledgeFiles();
  const allDocs = [];

  for (const input of inputs) {
    const docs = await splitter.createDocuments([input.text], [input.metadata]);
    allDocs.push(...docs);
  }

  return allDocs;
};
