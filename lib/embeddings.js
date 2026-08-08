// Local embedding model wrapper — runs entirely on-device (no external API key).
// Uses Xenova/all-MiniLM-L6-v2 (a distilled sentence-transformer), the same
// family of model commonly used for lightweight semantic search / RAG demos.
import { pipeline } from "@xenova/transformers";

let embedderPromise = null;

/**
 * Lazily loads (and caches) the feature-extraction pipeline.
 * The model (~30MB, quantized) downloads once and is cached on disk by
 * transformers.js afterwards, so subsequent calls are fast.
 */
function getEmbedder() {
  if (!embedderPromise) {
    embedderPromise = pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }
  return embedderPromise;
}

/**
 * Embeds a piece of text into a 384-dim vector (mean-pooled, L2-normalized).
 * @param {string} text
 * @returns {Promise<number[]>}
 */
export async function embedText(text) {
  const embedder = await getEmbedder();
  const output = await embedder(text, { pooling: "mean", normalize: true });
  return Array.from(output.data);
}

/**
 * Cosine similarity between two equal-length vectors.
 * Since embeddings are already L2-normalized, this is just the dot product.
 */
export function cosineSimilarity(a, b) {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot;
}
