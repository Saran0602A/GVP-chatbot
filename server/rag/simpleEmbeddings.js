const DIMENSIONS = 256;

const tokenize = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

const hashToken = (token) => {
  let hash = 2166136261;
  for (let i = 0; i < token.length; i += 1) {
    hash ^= token.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
};

const normalize = (vector) => {
  const sumSquares = vector.reduce((sum, val) => sum + val * val, 0);
  const magnitude = Math.sqrt(sumSquares) || 1;
  return vector.map((value) => value / magnitude);
};

const embed = (text) => {
  const vector = new Array(DIMENSIONS).fill(0);
  const tokens = tokenize(text);

  for (const token of tokens) {
    const idx = hashToken(token) % DIMENSIONS;
    vector[idx] += 1;
  }

  return normalize(vector);
};

export class SimpleEmbeddings {
  async embedDocuments(texts) {
    return texts.map((text) => embed(text));
  }

  async embedQuery(text) {
    return embed(text);
  }
}
