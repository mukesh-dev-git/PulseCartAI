# PulseCart AI

**Real-time intent. Instant personalization.**

PulseCart AI is a smart e-commerce prototype that demonstrates how AI can enhance the online shopping experience. It combines a modern storefront UI with an AI-powered assistant and intelligent nudge system to increase engagement and conversions.

---

## Features

### Product Catalog & Browsing
- Dynamic product grid with 30+ items across multiple categories
- Category tab filtering (Headphones, Smartwatches, Laptops, Cameras, Keyboards)
- Real-time client-side search
- Product badges (Best Seller, Top Rated, New Arrival, Pro Pick)
- Stock status indicators and discount highlights

### Shopping Cart
- Slide-out cart drawer with real-time quantity controls
- Subtotal, delivery fee calculation (free delivery above RM265), and total
- Toast notifications for add/remove actions

### Wishlist
- Save favourite products to a dedicated wishlist drawer
- Quick "Move to Cart" action from wishlist

### AI Smart Search
- Type a natural language query and press **Enter** (or click the sparkle button) to trigger AI-powered search
- **Retrieval-Augmented**: query is embedded and matched against a vector store of the catalog before the LLM ranks and explains the shortlist (see [RAG Pipeline](DOCUMENTATION.md#rag-pipeline))
- Understands intent — queries like *"best laptop for coding"*, *"gift under RM200"*, or *"wireless headphones for gym"* all work
- Returns ranked results with a per-product **AI reason chip** explaining why each product matches
- Results banner shows a summary of what the AI found, with a clear button to reset
- Falls back to instant text filtering while typing (AI triggers only on Enter)

### Product Detail Page
- Tap/click any product card to open a full detail modal
- Shows all product info: image, price, discount, rating, description, features, stock status
- **AI Quick Verdict** — auto-generated pros, cons, best-for summary, and final recommendation
- Sticky bottom bar with Wishlist, **Ask AI**, and Add to Cart buttons
- **Fully responsive** — takes full screen on mobile with touch-friendly layout

### AI Shopping Assistant
- Floating chat widget powered by **LLaMA 3.1** (via Groq)
- Streaming responses for real-time conversation feel
- **RAG-grounded** — each message is embedded and used to retrieve the top-6 relevant products from a vector store, rather than stuffing the whole catalog into the prompt (see [RAG Pipeline](DOCUMENTATION.md#rag-pipeline))
- Can recommend, compare, and answer questions grounded in retrieved products
- Rich product cards rendered inline when the AI references a product

### Smart Cart Suggestions
- When items are in the cart, AI analyzes what's there and suggests **2-3 complementary products** ("Complete Your Setup")
- Each suggestion includes a short reason (e.g., *"Perfect companion for your laptop"*) and a quick **Add** button
- Fetches fresh suggestions whenever the cart contents change
- Displayed in a warm-styled section inside the cart drawer with loading state

### Smart Nudge Engine
- **Hesitation Detection** — Detects when a user hovers on a product for 3+ seconds and surfaces an AI insight nudge with an **"Ask AI about this"** button that opens the chatbot with a pre-filled prompt about that product
- **Low Stock Urgency** — Alerts when a wishlisted item is running low on stock
- **Cart Recovery** — Reminds users about abandoned cart items after 30 seconds of inactivity
- Auto-dismissing toast notifications with type-specific styling and animations

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **UI** | React 19, Client Components |
| **Styling** | Vanilla CSS + CSS Modules, glassmorphism, micro-animations |
| **Fonts** | Saira Stencil One, Montserrat, Nunito (Google Fonts) |
| **AI Model** | LLaMA 3.1 8B Instant via Groq SDK |
| **Embeddings / RAG** | Xenova/all-MiniLM-L6-v2 via `@xenova/transformers` (local, no API key) — see [RAG Pipeline](DOCUMENTATION.md#rag-pipeline) |
| **Data** | Static JSON product catalog + precomputed vector store (`data/embeddings.json`) |
| **Analytics** | Vercel Analytics |
| **Deployment** | Vercel |

---

## Project Structure

```
PulseCartAI/
├── app/
│   ├── layout.js                    # Root layout, fonts, analytics
│   ├── page.js                      # Main storefront page
│   ├── globals.css                  # Global styles
│   ├── api/
│   │   ├── chat/route.js            # POST /api/chat — Groq streaming endpoint
│   │   ├── search/route.js          # POST /api/search — AI smart search endpoint
│   │   ├── suggest/route.js         # POST /api/suggest — Cart suggestion endpoint
│   │   └── verdict/route.js         # POST /api/verdict — AI product verdict
│   └── components/
│       ├── AIChatWidget.js          # Floating AI chat panel
│       ├── AIChatWidget.module.css
│       ├── Icons.js                 # SVG icon components
│       ├── NudgeEngine.js           # Rule-based nudge triggers
│       ├── NudgeToast.js            # Toast notification for nudges
│       └── NudgeToast.module.css
├── lib/
│   ├── embeddings.js                # Local embedding model wrapper (Xenova/all-MiniLM-L6-v2)
│   └── retrieval.js                 # RAG retrieval — cosine similarity search over the vector store
├── scripts/
│   └── build-embeddings.mjs         # Ingestion script — builds data/embeddings.json
├── data/
│   ├── products.json                # Product catalog (45 items)
│   └── embeddings.json              # Precomputed vector store (run `npm run embed` to rebuild)
├── package.json
└── vercel.json
```

---

## Getting Started

Install dependencies:

```bash
npm install
```

Set up your environment variables:

```bash
# Create a .env.local file with your Groq API key
GROQ_API_KEY=your_groq_api_key_here
```

Build the vector store (one-time, or whenever `data/products.json` changes):

```bash
npm run embed
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## API

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/chat` | Sends conversation to Groq LLaMA 3.1 and streams the response back |
| POST | `/api/search` | AI-powered product search — returns ranked product IDs with match reasons |
| POST | `/api/suggest` | Cart-based AI suggestions — returns complementary product recommendations |
| POST | `/api/verdict` | AI product verdict — returns pros, cons, best-for, and recommendation |

---

## License

MIT
