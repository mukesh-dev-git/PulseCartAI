import { Groq } from "groq-sdk";
import fs from "fs";
import path from "path";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req) {
  try {
    const { productId } = await req.json();
    if (!productId) {
      return Response.json({ verdict: null });
    }

    const dataPath = path.join(process.cwd(), "data", "products.json");
    const productsData = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
    const product = productsData.find(p => p.id === productId);

    if (!product) {
      return Response.json({ verdict: null });
    }

    const systemPrompt = `You are a concise product reviewer for PulseCart (electronics store, Malaysia, currency: RM).

Given a product, generate a quick verdict. Respond with ONLY valid JSON:

{
  "bestFor": "One sentence about who this product is ideal for",
  "pros": ["Pro 1 (5-8 words)", "Pro 2", "Pro 3"],
  "cons": ["Con 1 (5-8 words)", "Con 2"],
  "verdict": "One sentence final recommendation (15-20 words)"
}

Be honest and balanced. Keep it concise.`;

    const productInfo = `Product: ${product.name}
Price: RM${product.price} (was RM${product.originalPrice}, ${product.discount}% off)
Category: ${product.category}
Rating: ${product.rating}/5 (${product.reviews} reviews)
Description: ${product.description}
Features: ${product.features?.join(", ")}
Stock: ${product.stockCount} units`;

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: productInfo },
      ],
      temperature: 0.3,
      max_tokens: 300,
      response_format: { type: "json_object" },
    });

    const raw = response.choices[0]?.message?.content || "";

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const sanitized = raw.replace(/,\s*([}\]])/g, "$1");
      const match = sanitized.match(/\{[\s\S]*\}/);
      if (!match) return Response.json({ verdict: null });
      try {
        parsed = JSON.parse(match[0]);
      } catch {
        return Response.json({ verdict: null });
      }
    }

    return Response.json({ verdict: parsed });

  } catch (error) {
    console.error("Verdict API Error:", error);
    return Response.json({ verdict: null }, { status: 500 });
  }
}
