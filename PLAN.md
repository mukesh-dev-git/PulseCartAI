# PulseCart AI — Project Plan

**Tagline:** Real-time intent. Instant personalization.

---

## 1. Overview

**PulseCart AI** is an intelligent e-commerce prototype that demonstrates how AI can enhance the online shopping experience. It uses LLM-powered features to provide smart search, contextual recommendations, conversational assistance, and behavioral nudges — all in real-time.

This is a **demo/prototype** focused on showcasing AI capabilities in an e-commerce context, not a production-ready system.

---

## 2. Problem Statement

Traditional e-commerce platforms suffer from:
- Generic, keyword-only search that misses user intent
- Static recommendations that don't adapt to current session behavior
- No conversational assistance for product questions
- Missed conversion opportunities from hesitant users

---

## 3. Solution

A **smart storefront prototype** that:
- Understands natural language search queries (not just keywords)
- Provides AI-generated product recommendations based on cart context
- Offers a conversational shopping assistant that knows the entire catalog
- Detects user hesitation and proactively offers AI assistance
- Surfaces urgency and recovery nudges to improve conversions

---

## 4. Current Implementation

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 16 (App Router) |
| **UI** | React 19, Client Components |
| **Styling** | Vanilla CSS + CSS Modules |
| **Fonts** | Google Fonts (Saira Stencil One, Montserrat, Nunito) |
| **AI/LLM** | LLaMA 3.1 8B Instant via Groq SDK |
| **Data** | Static JSON product catalog (45 items) |
| **Deployment** | Vercel |

### Implemented Features

| Feature | Status | Description |
|---------|--------|-------------|
| Product Catalog | Done | 45 products across 5 categories with filtering |
| Shopping Cart | Done | Drawer with qty controls, subtotal, delivery logic |
| Wishlist | Done | Save/remove items, move to cart |
| AI Smart Search | Done | Natural language search with intent understanding |
| AI Chat Assistant | Done | Streaming LLM chat, catalog-aware, inline product cards |
| Smart Cart Suggestions | Done | AI recommends complementary products in cart |
| Hesitation Nudge | Done | Hover detection → AI insight with "Ask AI" button |
| Low Stock Nudge | Done | Alerts for low-stock wishlisted items |
| Cart Recovery Nudge | Done | Reminds users about idle cart items |

---

## 5. System Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERACTIONS                         │
└─────────────────────────────────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
   ┌─────────┐            ┌─────────┐            ┌─────────┐
   │ Search  │            │  Chat   │            │  Cart   │
   │  Bar    │            │ Widget  │            │ Drawer  │
   └────┬────┘            └────┬────┘            └────┬────┘
        │                      │                      │
        ▼                      ▼                      ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│ POST /api/    │    │ POST /api/    │    │ POST /api/    │
│    search     │    │     chat      │    │    suggest    │
└───────┬───────┘    └───────┬───────┘    └───────┬───────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             ▼
                    ┌─────────────────┐
                    │   Groq API      │
                    │ (LLaMA 3.1 8B)  │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  JSON Response  │
                    │ (parsed + post- │
                    │   filtered)     │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   React UI      │
                    │   Updates       │
                    └─────────────────┘
```

### Nudge Engine Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    NUDGE ENGINE (Client-Side)                    │
└─────────────────────────────────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
┌───────────────┐      ┌───────────────┐      ┌───────────────┐
│   Hover on    │      │  Wishlisted   │      │   Cart has    │
│  product >3s  │      │  item is low  │      │ items + idle  │
│               │      │    stock      │      │    30 sec     │
└───────┬───────┘      └───────┬───────┘      └───────┬───────┘
        │                      │                      │
        ▼                      ▼                      ▼
┌───────────────┐      ┌───────────────┐      ┌───────────────┐
│  Hesitation   │      │   Urgency     │      │   Recovery    │
│    Nudge      │      │    Nudge      │      │    Nudge      │
│ + Ask AI btn  │      │               │      │               │
└───────────────┘      └───────────────┘      └───────────────┘
```

---

## 6. API Endpoints

| Endpoint | Method | Purpose | Response |
|----------|--------|---------|----------|
| `/api/chat` | POST | Conversational AI assistant | Streaming text/plain |
| `/api/search` | POST | Natural language product search | JSON: `{summary, results}` |
| `/api/suggest` | POST | Cart-based product suggestions | JSON: `{suggestions}` |

---

## 7. Data Model

Products are stored in `data/products.json` with this schema:

```json
{
  "id": 1,
  "slug": "product-slug",
  "name": "Product Name",
  "category": "Category",
  "price": 1234,
  "originalPrice": 1500,
  "discount": 18,
  "rating": 4.5,
  "reviews": 1234,
  "badge": "Best Seller",
  "description": "Product description",
  "features": ["Feature 1", "Feature 2"],
  "image": "https://...",
  "inStock": true,
  "stockCount": 10
}
```

Categories: `Headphones`, `Smartwatch`, `Laptop`, `Camera`, `Keyboard`

---

## 8. Future Enhancements

| Feature | Description | Priority |
|---------|-------------|----------|
| Product Detail Modal | Click product → modal with AI-generated summary | High |
| Social Proof Toasts | "X people bought this" simulated activity | Medium |
| AI "For You" Section | Session-based personalized recommendations | Medium |
| Persistent Cart | LocalStorage or backend persistence | Medium |
| User Auth | Login/signup with session management | Low |
| Checkout Flow | Payment integration (Stripe) | Low |
| Voice Search | Speech-to-text for search queries | Low |

---

## 9. One-Line Summary

**Search naturally → Get AI recommendations → Chat for help → Complete your setup**
