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

### AI Shopping Assistant
- Floating chat widget powered by **LLaMA 3.1** (via Groq)
- Streaming responses for real-time conversation feel
- Catalog-aware — the AI knows every product in the store and can recommend, compare, and answer questions
- Rich product cards rendered inline when the AI references a product

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
| **Data** | Static JSON product catalog |
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
│   │   └── chat/route.js            # POST /api/chat — Groq streaming endpoint
│   └── components/
│       ├── AIChatWidget.js          # Floating AI chat panel
│       ├── AIChatWidget.module.css
│       ├── Icons.js                 # SVG icon components
│       ├── NudgeEngine.js           # Rule-based nudge triggers
│       ├── NudgeToast.js            # Toast notification for nudges
│       └── NudgeToast.module.css
├── data/
│   └── products.json                # Product catalog (31 items)
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

---

## License

MIT
