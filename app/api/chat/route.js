import { Groq } from "groq-sdk";
import { retrieveProducts } from "@/lib/retrieval";

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const TOP_K = 6;

export async function POST(req) {
  try {
    const { messages } = await req.json();

    // RAG retrieval: use the latest user message as the query and pull
    // only the top-K semantically relevant products from the vector store,
    // instead of injecting the entire catalog into the prompt every turn.
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
    const query = lastUserMessage?.content || "";

    const retrieved = await retrieveProducts(query, TOP_K);

    const catalog = retrieved
      .map(
        ({ product: p, score }) =>
          `ID: ${p.id} | ${p.name} (RM ${p.price}): ${p.description} (Stock: ${p.stockCount}) [relevance: ${score.toFixed(2)}]`
      )
      .join("\n");

    const systemPrompt = `You are the PulseCart AI Shopping Assistant.
You are an expert sales associate helping a customer on an e-commerce storefront in Malaysia.
Be concise, friendly, and nudging them towards making a purchase based on their needs.
Recommend specific items from the catalog. The currency is RM (Malaysian Ringgit).
IMPORTANT: Do NOT use any Markdown formatting. NO asterisks (**), NO hashes (#), NO bold or italics. Output raw plain text only.

When you recommend a product, MUST output its ID exactly in this format: [PRODUCT:id] (for example: [PRODUCT:1]). Do NOT output the product details in your text if you use this tag, because the tag will automatically render a rich visual card for the user. Just say something like "Here is a great option:" followed by the tag!

Below are the products retrieved as most relevant to the customer's latest message (via semantic search over the full catalog). Only recommend products from this retrieved list — if none of them truly fit, say so honestly instead of inventing details.
${catalog}`;

    const chatMessages = [
      { role: "system", content: systemPrompt },
      ...messages
    ];

    // Request stream from Groq
    const stream = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: chatMessages,
      temperature: 0.7,
      max_tokens: 512,
      stream: true,
    });

    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (chunk.choices[0]?.delta?.content) {
            controller.enqueue(chunk.choices[0].delta.content);
          }
        }
        controller.close();
      }
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/plain" }
    });

  } catch (error) {
    console.error("AI Route Error:", error);
    return new Response("Oops, something went wrong with the AI assistant.", { status: 500 });
  }
}
