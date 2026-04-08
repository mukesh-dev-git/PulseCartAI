import { Groq } from "groq-sdk";
import fs from "fs";
import path from "path";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req) {
  try {
    const { cartItems } = await req.json();
    if (!cartItems?.length) {
      return Response.json({ suggestions: [] });
    }

    const dataPath = path.join(process.cwd(), "data", "products.json");
    const productsData = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

    const cartIds = new Set(cartItems.map(i => i.id));
    const available = productsData.filter(p => !cartIds.has(p.id) && p.inStock);

    const catalog = available.map(p =>
      `ID:${p.id} | ${p.name} | RM${p.price} | ${p.category} | ${p.features?.[0] || ""}`
    ).join("\n");

    const cartSummary = cartItems.map(i => `${i.name} (${i.category})`).join(", ");

    const systemPrompt = `You are a smart shopping assistant for PulseCart (electronics store, Malaysia).

The customer has these items in their cart: ${cartSummary}

Suggest 2-3 complementary products from the available catalog that would pair well with their cart items. Think "complete the setup" — if they have a laptop, suggest a keyboard or headphones; if they have headphones, suggest a case or a smartwatch, etc.

AVAILABLE PRODUCTS (not in cart):
${catalog}

RULES:
1. Pick 2-3 products that genuinely complement what is in the cart.
2. For each, write a short reason (under 10 words) explaining why it pairs well.
3. Respond with ONLY valid JSON:
{"suggestions":[{"id":1,"reason":"Perfect companion for your laptop"}]}`;

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "What should I add to complete my setup?" },
      ],
      temperature: 0.4,
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
      if (!match) return Response.json({ suggestions: [] });
      try {
        parsed = JSON.parse(match[0]);
      } catch {
        return Response.json({ suggestions: [] });
      }
    }

    const validIds = new Set(available.map(p => p.id));
    const suggestions = (parsed.suggestions || [])
      .filter(s => validIds.has(s.id))
      .slice(0, 3);

    return Response.json({ suggestions });

  } catch (error) {
    console.error("Suggest API Error:", error);
    return Response.json({ suggestions: [] }, { status: 500 });
  }
}
