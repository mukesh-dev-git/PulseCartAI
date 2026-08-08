// RAG ingestion script.
//
// Reads the product catalog (data/products.json), builds one retrieval
// "document" per product, embeds each document with a local sentence
// embedding model, and writes the resulting vectors to data/embeddings.json.
// That file acts as our (lightweight, file-backed) vector store — loaded
// into memory at request time by lib/retrieval.js for cosine-similarity
// search.
//
// Run this once whenever data/products.json changes:
//   npm run embed

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pipeline } from "@xenova/transformers";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const productsPath = path.join(__dirname, "..", "data", "products.json");
const outPath = path.join(__dirname, "..", "data", "embeddings.json");

// Same document-building strategy used at query time — keep in sync with
// how the catalog is described to the LLM so retrieval matches intent.
function buildDocument(p) {
  return [
    p.name,
    p.category,
    p.description,
    Array.isArray(p.features) ? p.features.join(", ") : "",
    `Price RM ${p.price}`,
    p.badge || "",
  ]
    .filter(Boolean)
    .join(". ");
}

async function main() {
  console.log("Loading products.json...");
  const products = JSON.parse(fs.readFileSync(productsPath, "utf-8"));

  console.log("Loading embedding model (Xenova/all-MiniLM-L6-v2)...");
  const embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");

  console.log(`Embedding ${products.length} products...`);
  const vectors = [];
  for (const p of products) {
    const doc = buildDocument(p);
    const output = await embedder(doc, { pooling: "mean", normalize: true });
    vectors.push({ id: p.id, document: doc, embedding: Array.from(output.data) });
    process.stdout.write(".");
  }
  console.log("\nDone.");

  fs.writeFileSync(outPath, JSON.stringify(vectors));
  console.log(`Wrote ${vectors.length} vectors to ${path.relative(process.cwd(), outPath)}`);
}

main().catch((err) => {
  console.error("Embedding build failed:", err);
  process.exit(1);
});
