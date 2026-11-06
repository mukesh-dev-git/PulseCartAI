<div align="center">

<img src="https://capsule-render.vercel.app/api?type=cylinder&color=0:C2410C,100:FB923C&height=200&section=header&text=PulseCart%20AI&fontSize=54&fontColor=ffffff&animation=scaleIn&fontAlignY=38&desc=Real-time%20intent.%20Instant%20personalization.&descAlignY=60&descSize=18" width="100%" alt="PulseCart AI banner"/>

<a href="#screenshots"><img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=20&pause=1200&color=FB923C&center=true&vCenter=true&width=760&lines=An+AI+shopping+assistant+grounded+in+the+catalog;Natural-language+search+with+a+reason+for+every+result;Cart+suggestions%2C+product+verdicts+and+smart+nudges;RAG+over+a+local+vector+store+%C2%B7+no+embedding+API+key" alt="Typing summary"/></a>

<br/>

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Groq](https://img.shields.io/badge/LLM-Groq%20gpt--oss--20b-F55036)](https://groq.com)
[![Transformers.js](https://img.shields.io/badge/Embeddings-MiniLM--L6--v2-FFD21E?logo=huggingface&logoColor=black)](https://huggingface.co/Xenova/all-MiniLM-L6-v2)
[![License](https://img.shields.io/badge/License-MIT-blue)](#license)

</div>

---

## <img src="https://api.iconify.design/lucide/target.svg?color=%23EA580C" width="26" align="top" alt=""/> Project Overview

PulseCart AI is an e-commerce prototype that shows how AI can sit inside the shopping experience instead of beside it. A modern storefront is paired with an assistant that knows the catalog, a search box that understands intent, and a nudge engine that reacts to what the shopper is doing.

The assistant never has the whole catalog pasted into its prompt. Each question is embedded, matched against a local vector store, and only the closest products are handed to the model, so answers stay grounded in real items and prices.

### Key Features

- <img src="https://api.iconify.design/lucide/search.svg?color=%230EA5E9" width="18" align="top" alt=""/> **AI smart search**: queries like "best laptop for coding" or "gift under RM200" return ranked products, each with a one-line reason.
- <img src="https://api.iconify.design/lucide/message-circle.svg?color=%238B5CF6" width="18" align="top" alt=""/> **Shopping assistant**: a streaming chat widget that recommends and compares products, with product cards shown inline.
- <img src="https://api.iconify.design/lucide/scale.svg?color=%2310B981" width="18" align="top" alt=""/> **AI quick verdict**: every product page gets generated pros, cons, a best-for line and a recommendation.
- <img src="https://api.iconify.design/lucide/shopping-cart.svg?color=%23F59E0B" width="18" align="top" alt=""/> **Smart cart suggestions**: "Complete Your Setup" proposes two or three complementary products with a short reason.
- <img src="https://api.iconify.design/lucide/bell-ring.svg?color=%23EF4444" width="18" align="top" alt=""/> **Nudge engine**: detects hesitation on a product, low stock on wishlist items and abandoned carts, and offers an "Ask AI about this" shortcut.
- <img src="https://api.iconify.design/lucide/store.svg?color=%2364748B" width="18" align="top" alt=""/> **Storefront basics**: 45 products in five categories, category filters, wishlist, cart drawer and free delivery above RM265.

## <img src="https://api.iconify.design/lucide/image.svg?color=%23EA580C" width="26" align="top" alt=""/> Screenshots

**Storefront**

![Storefront](docs/screenshots/storefront.png)

**AI smart search**

![AI smart search](docs/screenshots/ai-search.png)

**Product detail with AI quick verdict**

![Product detail with AI quick verdict](docs/screenshots/product-ai-verdict.png)

**Cart with suggestions**

![Cart with suggestions](docs/screenshots/cart-ai-suggestions.png)

**AI shopping assistant**

![AI shopping assistant](docs/screenshots/ai-chat.png)

## <img src="https://api.iconify.design/lucide/clipboard-list.svg?color=%23EA580C" width="26" align="top" alt=""/> Requirements

- Node.js 20 or newer
- A free [Groq API key](https://console.groq.com)

## <img src="https://api.iconify.design/lucide/zap.svg?color=%23EA580C" width="26" align="top" alt=""/> Quick Start

```bash
git clone https://github.com/mukesh-dev-git/PulseCartAI.git
cd PulseCartAI
npm install

# Add your Groq key
echo "GROQ_API_KEY=your_key_here" > .env.local

# Build the vector store (only needed again if data/products.json changes)
npm run embed

npm run dev
```

Open http://localhost:3000.

## <img src="https://api.iconify.design/lucide/network.svg?color=%23EA580C" width="26" align="top" alt=""/> How It Works

```mermaid
flowchart TD
    A[Shopper<br/>search · chat · cart · product page] --> B[Next.js API routes]
    B --> C[Embed the query<br/>MiniLM-L6-v2, runs locally]
    C --> D[Cosine search<br/>data/embeddings.json]
    D --> E[Top matching products]
    E --> F[Groq gpt-oss-20b<br/>ranks, explains, writes the verdict]
    F --> G[Ranked results · streamed chat · suggestions · verdicts]
    A --> H[Nudge engine<br/>hover time · stock · idle cart]
    H --> A

    classDef ui fill:#FFEDD5,stroke:#EA580C,color:#222
    classDef core fill:#F1EFE8,stroke:#888780,color:#222
    classDef ai fill:#EEEDFE,stroke:#7F77DD,color:#222
    class A,H,G ui
    class B,C,D,E core
    class F ai
```

### API

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/chat` | Streams the assistant's reply to a conversation |
| POST | `/api/search` | Ranked product ids with a reason for each match |
| POST | `/api/suggest` | Complementary products for the current cart |
| POST | `/api/verdict` | Pros, cons, best-for and recommendation for one product |

## <img src="https://api.iconify.design/lucide/folder-tree.svg?color=%23EA580C" width="26" align="top" alt=""/> Project Structure

```
PulseCartAI/
├── app/
│   ├── page.js                # storefront
│   ├── api/                   # chat, search, suggest, verdict routes
│   └── components/            # chat widget, nudge engine, toasts, icons
├── lib/
│   ├── embeddings.js          # local embedding model wrapper
│   └── retrieval.js           # cosine search over the vector store
├── scripts/build-embeddings.mjs
├── data/
│   ├── products.json          # catalog, 45 items
│   └── embeddings.json        # precomputed vectors
├── docs/screenshots/
├── DOCUMENTATION.md           # deeper write-up
└── PLAN.md
```

## <img src="https://api.iconify.design/lucide/cloud.svg?color=%23EA580C" width="26" align="top" alt=""/> Deployment

The app deploys to Vercel as a standard Next.js project with `GROQ_API_KEY` set as an environment variable. The original Vercel deployment has been taken down, so it runs locally for now.

## <img src="https://api.iconify.design/lucide/scale.svg?color=%23EA580C" width="26" align="top" alt=""/> License

MIT

## <img src="https://api.iconify.design/lucide/heart-handshake.svg?color=%23EA580C" width="26" align="top" alt=""/> Acknowledgments

- [Groq](https://groq.com) for fast inference
- [Transformers.js](https://huggingface.co/docs/transformers.js) and the `Xenova/all-MiniLM-L6-v2` model for local embeddings
- Built with Next.js and React

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=soft&color=0:FB923C,100:C2410C&height=110&section=footer&animation=blinking" width="100%" alt=""/>

</div>
