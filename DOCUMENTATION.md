# PulseCart AI — Technical Documentation

Complete technical reference for the PulseCart AI prototype.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Environment Setup](#environment-setup)
4. [API Reference](#api-reference)
5. [LLM Integration](#llm-integration)
6. [Component Architecture](#component-architecture)
7. [Styling System](#styling-system)
8. [Data Schema](#data-schema)

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.x | React framework with App Router |
| React | 19.x | UI library |
| Vanilla CSS | - | Global styles (`globals.css`) |
| CSS Modules | - | Component-scoped styles |

### Backend

| Technology | Purpose |
|------------|---------|
| Next.js API Routes | Serverless API endpoints |
| Groq SDK | LLM API client |

### AI/LLM

| Component | Details |
|-----------|---------|
| **Provider** | Groq (https://groq.com) |
| **Model** | `llama-3.1-8b-instant` |
| **Use Cases** | Chat, Search, Suggestions |

### External Services

| Service | Purpose |
|---------|---------|
| Groq API | LLM inference |
| Vercel | Hosting & deployment |
| Vercel Analytics | Usage tracking |

---

## Project Structure

```
PulseCartAI/
├── app/
│   ├── layout.js                 # Root layout (fonts, metadata, analytics)
│   ├── page.js                   # Main storefront (all UI components)
│   ├── globals.css               # Global CSS variables and styles
│   │
│   ├── api/
│   │   ├── chat/
│   │   │   └── route.js          # POST /api/chat — Streaming chat endpoint
│   │   ├── search/
│   │   │   └── route.js          # POST /api/search — AI search endpoint
│   │   └── suggest/
│   │       └── route.js          # POST /api/suggest — Cart suggestions
│   │
│   └── components/
│       ├── AIChatWidget.js       # Floating chat panel
│       ├── AIChatWidget.module.css
│       ├── Icons.js              # SVG icon components
│       ├── NudgeEngine.js        # Behavioral nudge logic
│       ├── NudgeToast.js         # Nudge toast UI
│       └── NudgeToast.module.css
│
├── data/
│   └── products.json             # Product catalog (45 items)
│
├── .env.local                    # Environment variables (not in git)
├── .gitignore
├── jsconfig.json                 # Path aliases (@/*)
├── next.config.mjs               # Next.js configuration
├── package.json                  # Dependencies and scripts
├── vercel.json                   # Vercel deployment config
├── README.md                     # Project overview
├── PLAN.md                       # Project plan and roadmap
└── DOCUMENTATION.md              # This file
```

---

## Environment Setup

### Required Environment Variables

Create a `.env.local` file in the project root:

```env
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Getting a Groq API Key

1. Sign up at https://console.groq.com
2. Navigate to API Keys section
3. Create a new API key
4. Copy and add to `.env.local`

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

## API Reference

### POST /api/chat

Conversational AI assistant with streaming responses.

**Request:**
```json
{
  "messages": [
    { "role": "user", "content": "Which laptop is best for coding?" }
  ]
}
```

**Response:** `text/plain` stream

**Features:**
- Streams response tokens in real-time
- Catalog-aware (entire product list in system prompt)
- Can reference products using `[PRODUCT:id]` syntax
- Strips markdown formatting from output

**System Prompt Behavior:**
- Acts as PulseCart AI Shopping Assistant
- Recommends specific products from catalog
- Uses `[PRODUCT:id]` to render rich product cards in UI

---

### POST /api/search

AI-powered natural language product search.

**Request:**
```json
{
  "query": "best laptop for coding under RM5000"
}
```

**Response:**
```json
{
  "summary": "Found 4 great laptops for coding under RM5000",
  "results": [
    { "id": 7, "reason": "Powerful i5 with RTX 3050 at great price" },
    { "id": 8, "reason": "AMD Ryzen 7 with excellent multitasking" }
  ]
}
```

**Features:**
- Understands intent, not just keywords
- Enforces price constraints (server-side post-filter)
- Returns ranked results with explanations
- Summary count auto-corrected after filtering
- Uses `response_format: { type: "json_object" }` for reliable JSON

**Price Filter Patterns Recognized:**
- "under RM500", "below 500", "max RM500"
- "above RM1000", "over 1000", "more than RM1000"
- Handles commas in numbers (e.g., "RM5,000")

---

### POST /api/suggest

Cart-based complementary product suggestions.

**Request:**
```json
{
  "cartItems": [
    { "id": 7, "name": "Lenovo LOQ 15...", "category": "Laptop" }
  ]
}
```

**Response:**
```json
{
  "suggestions": [
    { "id": 6, "reason": "Perfect keyboard for your new laptop" },
    { "id": 1, "reason": "Great headphones for focused work" }
  ]
}
```

**Features:**
- Analyzes cart contents to find complementary items
- Excludes items already in cart
- Returns 2-3 suggestions with reasons
- Only suggests in-stock items

---

## LLM Integration

### Provider: Groq

Groq provides fast inference for open-source LLMs. We use the `groq-sdk` npm package.

```javascript
import { Groq } from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});
```

### Model: LLaMA 3.1 8B Instant

| Parameter | Value |
|-----------|-------|
| Model ID | `llama-3.1-8b-instant` |
| Context Window | 128K tokens |
| Speed | ~800 tokens/sec |
| Cost | Free tier available |

### Configuration by Endpoint

| Endpoint | Temperature | Max Tokens | Response Format |
|----------|-------------|------------|-----------------|
| `/api/chat` | 0.7 | 512 | Streaming text |
| `/api/search` | 0.2 | 600 | JSON object |
| `/api/suggest` | 0.4 | 300 | JSON object |

### Prompt Engineering

**Chat Prompt Strategy:**
- System prompt includes full product catalog
- Instructs model to use `[PRODUCT:id]` for rich cards
- Requests plain text output (no markdown)

**Search Prompt Strategy:**
- Strict rules about price constraints
- Requests JSON-only output
- Example format provided in prompt
- Low temperature for consistent results

**Suggest Prompt Strategy:**
- Cart items summarized in system prompt
- Asks for "complementary" products
- Limited to 2-3 suggestions

---

## AI/ML Implementation

This section explains how "intelligence" is implemented in PulseCart AI. The prototype uses **LLM-based AI** rather than traditional ML models.

### Approach: LLM as the Intelligence Layer

Instead of training custom ML models (which would require large datasets and infrastructure), we leverage a pre-trained Large Language Model (LLaMA 3.1) to provide intelligent behavior through **prompt engineering** and **in-context learning**.

| Traditional ML Approach | Our LLM Approach |
|------------------------|------------------|
| Train intent classifier on user behavior data | LLM understands intent from natural language |
| Build recommendation model on purchase history | LLM reasons about product compatibility |
| Train NER model for query understanding | LLM parses queries with world knowledge |
| Requires training data, GPUs, MLOps | Requires only API key and good prompts |

### Intelligence Features Breakdown

#### 1. AI Smart Search — Semantic Understanding

**How it works:**
- User query is sent to LLM along with the full product catalog
- LLM uses its pre-trained knowledge to understand intent (not just keyword matching)
- LLM ranks products by relevance and generates explanations

**Example:**
```
Query: "something for long flights"
```

The LLM understands:
- Long flights → need for entertainment/comfort
- → Noise-cancelling headphones are relevant
- → Long battery life is important
- → Generates: "Sony WH-1000XM5 — 30hr battery with ANC, perfect for travel"

**Prompt technique:** Few-shot with strict output format + explicit constraint rules

```javascript
const systemPrompt = `You are a strict product search engine...

STRICT RULES:
1. PRICE CONSTRAINTS ARE MANDATORY. If the query says "under RM500", 
   EVERY result MUST have a price below RM500...
2. Match products by meaning and intent, not just keywords...`;
```

#### 2. AI Chat — Conversational Reasoning

**How it works:**
- Full product catalog injected into system prompt (~4K tokens)
- LLM maintains conversation context across messages
- Can compare products, explain features, make recommendations

**In-context learning:** The LLM learns the store's inventory from the prompt itself:

```javascript
const catalog = productsData.map(p =>
  `ID: ${p.id} | ${p.name} (RM ${p.price}): ${p.description}`
).join("\n");

const systemPrompt = `You are the PulseCart AI Shopping Assistant...
Here is the current live catalog:
${catalog}`;
```

**Capability examples:**
- "Compare Sony WH-1000XM5 vs AirPods Pro" → LLM reasons about specs
- "I need a laptop for coding, budget RM4000" → LLM filters and recommends
- "Is this camera good for beginners?" → LLM explains based on features

#### 3. Smart Cart Suggestions — Associative Reasoning

**How it works:**
- Cart items are summarized and sent to LLM
- LLM uses world knowledge to find complementary products
- Mimics "frequently bought together" without purchase data

**Prompt technique:** Role-based with explicit task

```javascript
const systemPrompt = `You are a smart shopping assistant...

The customer has these items in their cart: ${cartSummary}

Suggest 2-3 complementary products that would pair well with their cart items.
Think "complete the setup" — if they have a laptop, suggest a keyboard...`;
```

**Reasoning chain (implicit):**
```
Cart: [Laptop]
→ Laptops need peripherals
→ Keyboard improves productivity
→ Headphones for focus
→ Suggest: Keyboard + Headphones
```

#### 4. Nudge Engine — Rule-Based Heuristics

**How it works:**
- Unlike the above, nudges use **simple heuristic rules**, not ML
- Client-side JavaScript monitors user behavior
- Triggers are deterministic, not probabilistic

**Rules implemented:**

| Trigger | Condition | Action |
|---------|-----------|--------|
| Hesitation | Hover on product > 3 seconds | Show "Ask AI" nudge |
| Urgency | Wishlisted item has stockCount ≤ 5 | Show low-stock alert |
| Recovery | Cart non-empty + 30s idle | Show cart reminder |

**Code example:**
```javascript
// Hesitation detection
hoverTimers.current[productId] = setTimeout(() => {
  onNudge({
    type: "hesitation",
    message: `Curious about ${product.name}? Ask our AI!`,
  });
}, 3000); // 3 second threshold
```

**Why heuristics instead of ML:**
- No training data needed
- Instant implementation
- Transparent, debuggable logic
- Good enough for prototype/demo

### Post-Processing & Guardrails

LLMs can hallucinate or make errors. We add server-side safeguards:

#### Price Constraint Enforcement

```javascript
// Extract price bounds from query
const underMatch = query.match(/under\s*(?:rm\s*)?(\d[\d,]*)/i);
const priceMax = underMatch?.[1];

// Filter results server-side (LLM can't be trusted with math)
if (priceMax) {
  const cap = parseInt(priceMax.replace(/,/g, ""), 10);
  results = results.filter(r => priceById[r.id] <= cap);
}
```

#### ID Validation

```javascript
// Only return products that actually exist
const validIds = new Set(productsData.map(p => p.id));
const results = (parsed.results || []).filter(r => validIds.has(r.id));
```

#### JSON Parsing Fallback

```javascript
let parsed;
try {
  parsed = JSON.parse(raw);
} catch {
  // Sanitize common LLM JSON errors
  const sanitized = raw
    .replace(/,\s*([}\]])/g, "$1")  // trailing commas
    .replace(/[\x00-\x1F]/g, " ");   // control chars
  parsed = JSON.parse(sanitized.match(/\{[\s\S]*\}/)[0]);
}
```

### Summary: ML/AI Techniques Used

| Technique | Where Used | Implementation |
|-----------|------------|----------------|
| **Large Language Model** | Search, Chat, Suggestions | Groq API (LLaMA 3.1) |
| **Prompt Engineering** | All LLM features | Custom system prompts |
| **In-Context Learning** | Catalog awareness | Product data in prompt |
| **Structured Output** | Search, Suggestions | `response_format: json_object` |
| **Heuristic Rules** | Nudge Engine | Client-side JS timers |
| **Post-Processing** | Price filtering | Server-side validation |

### Why This Approach Works for a Prototype

1. **Zero training data required** — LLM has pre-trained world knowledge
2. **Fast iteration** — Change behavior by editing prompts, not retraining
3. **Low infrastructure** — Just API calls, no GPU clusters
4. **Good enough quality** — LLaMA 3.1 8B handles e-commerce tasks well
5. **Easy to upgrade** — Swap to better model (70B, GPT-4) without code changes

### Limitations & Future ML Opportunities

| Current Limitation | Future ML Enhancement |
|--------------------|----------------------|
| No personalization | Train user embedding model on behavior |
| No learning from conversions | Reinforcement learning for nudge timing |
| Static product embeddings | Fine-tune embeddings for semantic search |
| Rule-based nudges | Train classifier on engagement data |

---

## Component Architecture

### Page Components (in `page.js`)

| Component | Purpose |
|-----------|---------|
| `Home` | Main page, manages all state |
| `ProductCard` | Individual product display |
| `CartDrawer` | Slide-out cart with suggestions |
| `WishlistDrawer` | Slide-out wishlist |
| `AdBanner` | Promotional banner |

### Standalone Components

| Component | File | Purpose |
|-----------|------|---------|
| `AIChatWidget` | `components/AIChatWidget.js` | Floating chat panel |
| `NudgeEngine` | `components/NudgeEngine.js` | Behavioral triggers (no UI) |
| `NudgeToast` | `components/NudgeToast.js` | Nudge notification display |
| `Icons` | `components/Icons.js` | SVG icon library |

### State Management

All state is managed in the `Home` component using React hooks:

| State | Purpose |
|-------|---------|
| `cart` | Array of cart items with qty |
| `wishlist` | Array of product IDs |
| `search` | Current search input |
| `aiSearch` | AI search state (loading, results, summary) |
| `nudge` | Current nudge to display |
| `chatPrompt` | External prompt for chat widget |

---

## Styling System

### CSS Variables

Defined in `:root` in `globals.css`:

```css
/* Fonts */
--f-saira: 'Saira Stencil One', cursive;
--f-montserrat: 'Montserrat', sans-serif;
--f-nunito: 'Nunito', sans-serif;

/* Brand Colors */
--orange: #d4480a;
--orange-mid: #a83508;
--black: #111111;

/* UI Colors */
--bg: #fafafa;
--surface: #ffffff;
--border: #ebebeb;
--text: #1a1a1a;
--text-2: #555555;
--text-3: #999999;

/* Product Colors */
--green: #1e7e34;
--star: #e4a008;
--red: #c0392b;
```

### Class Naming Convention

- Prefixed by component: `.p-card`, `.p-badge`, `.c-item`, `.d-hd`
- State classes: `.active`, `.open`, `.show`
- AI-specific: `.ai-banner`, `.ai-reason`, `.sug-section`

### Responsive Breakpoints

```css
@media (max-width: 860px) { /* Tablet */ }
@media (max-width: 640px) { /* Mobile */ }
```

---

## Data Schema

### Product Object

```typescript
interface Product {
  id: number;              // Unique identifier
  slug: string;            // URL-friendly name
  name: string;            // Display name
  category: string;        // One of: Headphones, Smartwatch, Laptop, Camera, Keyboard
  price: number;           // Current price in RM
  originalPrice: number;   // Original price in RM
  discount: number;        // Discount percentage
  rating: number;          // 1-5 star rating
  reviews: number;         // Number of reviews
  badge?: string;          // Optional badge text
  description: string;     // Short description
  features: string[];      // Array of feature strings
  image: string;           // Image URL
  inStock: boolean;        // Availability flag
  stockCount: number;      // Units in stock
}
```

### Cart Item (extends Product)

```typescript
interface CartItem extends Product {
  qty: number;             // Quantity in cart
}
```

### Nudge Object

```typescript
interface Nudge {
  type: 'hesitation' | 'urgency' | 'recovery';
  icon: ReactNode;         // Icon component
  title: string;           // Nudge title
  message: string;         // Nudge message
  productName?: string;    // For hesitation nudges
}
```

### AI Search State

```typescript
interface AISearchState {
  active: boolean;         // Is AI search active
  loading: boolean;        // Is search in progress
  query: string;           // Search query
  summary: string;         // AI-generated summary
  results: Array<{
    id: number;
    reason: string;
  }>;
}
```

---

## Deployment

### Vercel Configuration

`vercel.json`:
```json
{
  "framework": "nextjs"
}
```

### Environment Variables in Vercel

Add `GROQ_API_KEY` in Vercel project settings under Environment Variables.

### Build Command

```bash
npm run build
```

### Output

Static + serverless functions deployed to Vercel Edge Network.
