// RAG retrieval layer.
//
// Loads the precomputed vector store (data/embeddings.json, built by
// scripts/build-embeddings.mjs) and, at query time, embeds the user's
// query with the same model and returns the top-K most similar products
// by cosine similarity. This replaces "stuff the entire catalog into the
// prompt" with real semantic retrieval — only relevant products are sent
// to the LLM, which keeps prompts small, accurate, and able to scale past
// a catalog that no longer fits in a context window.
import fs from "fs";
import path from "path";
import { embedText, cosineSimilarity } from "./embeddings.js";

let vectorStore = null; // [{ id, document, embedding }]
let productsById = null; // Map<id, product>

function loadStore() {
  if (vectorStore && productsById) return;

  const embeddingsPath = path.join(process.cwd(), "data", "embeddings.json");
  const productsPath = path.join(process.cwd(), "data", "products.json");

  if (!fs.existsSync(embeddingsPath)) {
    throw new Error(
      "data/embeddings.json not found. Run `npm run embed` to build the vector store before starting the server."
    );
  }

  vectorStore = JSON.parse(fs.readFileSync(embeddingsPath, "utf-8"));
  const products = JSON.parse(fs.readFileSync(productsPath, "utf-8"));
  productsById = new Map(products.map((p) => [p.id, p]));
}

/**
 * Retrieve the top-K products most semantically relevant to `query`.
 * @param {string} query
 * @param {number} topK
 * @returns {Promise<Array<{product: object, score: number}>>}
 */
export async function retrieveProducts(query, topK = 6) {
  loadStore();

  const queryVector = await embedText(query);

  const scored = vectorStore.map((entry) => ({
    id: entry.id,
    score: cosineSimilarity(queryVector, entry.embedding),
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored
    .slice(0, topK)
    .map(({ id, score }) => ({ product: productsById.get(id), score }))
    .filter((r) => r.product);
}
