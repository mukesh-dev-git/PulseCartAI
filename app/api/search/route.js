import { Groq } from "groq-sdk";
import fs from "fs";
import path from "path";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req) {
  try {
    const { query } = await req.json();
    if (!query?.trim()) {
      return Response.json({ results: [], summary: "" });
    }

    const dataPath = path.join(process.cwd(), "data", "products.json");
    const productsData = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

    const catalog = productsData.map(p =>
      `ID:${p.id} | ${p.name} | RM${p.price} (was RM${p.originalPrice}, ${p.discount}% off) | ${p.category} | Rating:${p.rating} (${p.reviews} reviews) | Stock:${p.stockCount} | Features: ${p.features?.join(", ")} | ${p.description}`
    ).join("\n");

    const systemPrompt = `You are a strict product search engine for PulseCart, an electronics store in Malaysia (currency: RM).

Given a user's search query and the catalog below, return ONLY products that match ALL criteria.

CATALOG:
${catalog}

STRICT RULES:
1. PRICE CONSTRAINTS ARE MANDATORY. If the query says "under RM500", EVERY result MUST have a price below RM500. If it says "between RM1000 and RM3000", every result must be in that range. Check the actual RM price in the catalog for each product. NEVER include a product that violates a price constraint.
2. Match products by meaning and intent, not just keywords. Example: "budget laptop" = cheapest laptops, "gift for a gamer" = gaming gear.
3. Return 1-10 products ranked by relevance. Only include genuinely matching products.
4. For each product, write a short reason (under 12 words, plain text) explaining the match.
5. Write a 1-sentence summary.
6. Respond with ONLY valid JSON. No trailing commas.

Example: {"summary":"Found 3 laptops under RM3000","results":[{"id":5,"reason":"Affordable at RM2499 with great specs for coding"},{"id":12,"reason":"Budget-friendly at RM1899 with 16GB RAM"}]}`;

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query },
      ],
      temperature: 0.2,
      max_tokens: 600,
      response_format: { type: "json_object" },
    });

    const raw = response.choices[0]?.message?.content || "";

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const sanitized = raw
        .replace(/,\s*([}\]])/g, "$1")   // trailing commas
        .replace(/[\x00-\x1F]/g, " ");   // control chars
      const jsonMatch = sanitized.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return Response.json({ results: [], summary: "Couldn't understand that query. Try something else!" });
      }
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch {
        return Response.json({ results: [], summary: "AI returned an unexpected format. Please try again." });
      }
    }

    const validIds = new Set(productsData.map(p => p.id));
    const priceById = Object.fromEntries(productsData.map(p => [p.id, p.price]));
    let results = (parsed.results || []).filter(r => validIds.has(r.id));

    const underMatch = query.match(/under\s*(?:rm\s*)?(\d[\d,]*)/i);
    const belowMatch = query.match(/below\s*(?:rm\s*)?(\d[\d,]*)/i);
    const maxMatch = query.match(/max\s*(?:rm\s*)?(\d[\d,]*)/i);
    const priceMax = underMatch?.[1] || belowMatch?.[1] || maxMatch?.[1];

    const aboveMatch = query.match(/(?:above|over|more than)\s*(?:rm\s*)?(\d[\d,]*)/i);
    const minMatch = query.match(/min\s*(?:rm\s*)?(\d[\d,]*)/i);
    const priceMin = aboveMatch?.[1] || minMatch?.[1];

    if (priceMax) {
      const cap = parseInt(priceMax.replace(/,/g, ""), 10);
      results = results.filter(r => priceById[r.id] <= cap);
    }
    if (priceMin) {
      const floor = parseInt(priceMin.replace(/,/g, ""), 10);
      results = results.filter(r => priceById[r.id] >= floor);
    }

    let summary = parsed.summary || "";
    const countMatch = summary.match(/\d+/);
    if (countMatch && parseInt(countMatch[0]) !== results.length) {
      summary = summary.replace(/\d+/, results.length);
    }

    return Response.json({ summary, results });

  } catch (error) {
    console.error("AI Search Error:", error);
    return Response.json(
      { results: [], summary: "Something went wrong with AI search." },
      { status: 500 }
    );
  }
}
