"use client";
import { useEffect, useRef } from "react";
import { BotIcon, LightningIcon, CartIcon } from "./Icons";
/**
 * NudgeEngine — Simulates a real-time AI intent prediction and
 * MAB (Multi-Armed Bandit) decision engine by monitoring user
 * micro-behaviours and firing contextual nudge notifications.
 *
 * Triggers:
 *  1. HESITATION  – hover on product card > 3s  → prompt to ask AI
 *  2. LOW STOCK   – a wishlisted item has ≤ 5 stock → urgency nudge
 *  3. CART IDLE   – cart has items but user is idle 30s → recovery nudge
 *  4. SOCIAL PROOF – a low-stock product is viewed (mouse-enter)
 */
export default function NudgeEngine({ cart, wishlist, allProducts, onNudge }) {
  const hoverTimers = useRef({});
  const cartIdleTimer = useRef(null);
  const firedNudges = useRef(new Set());
  const lastCartLength = useRef(0);

  /* ── 1. Hesitation detection: hover on .p-card > 3s ── */
  useEffect(() => {
    const handleMouseEnter = (e) => {
      const card = e.currentTarget;
      const productId = card.id?.replace("product-", "");
      if (!productId) return;

      hoverTimers.current[productId] = setTimeout(() => {
        const product = allProducts.find(p => p.id === parseInt(productId));
        if (!product) return;
        const key = `hesitation-${productId}`;
        if (firedNudges.current.has(key)) return;
        firedNudges.current.add(key);

        onNudge({
          type: "hesitation",
          icon: <BotIcon size={18} />,
          title: "AI Insight",
          message: `Curious about ${product.name.split(" ").slice(0, 3).join(" ")}? Ask our AI if it fits your needs!`,
        });
      }, 3000);
    };

    const handleMouseLeave = (e) => {
      const productId = e.currentTarget.id?.replace("product-", "");
      if (productId && hoverTimers.current[productId]) {
        clearTimeout(hoverTimers.current[productId]);
        delete hoverTimers.current[productId];
      }
    };

    const cards = document.querySelectorAll(".p-card");
    cards.forEach(card => {
      card.addEventListener("mouseenter", handleMouseEnter);
      card.addEventListener("mouseleave", handleMouseLeave);
    });

    return () => {
      cards.forEach(card => {
        card.removeEventListener("mouseenter", handleMouseEnter);
        card.removeEventListener("mouseleave", handleMouseLeave);
      });
      Object.values(hoverTimers.current).forEach(clearTimeout);
    };
  }, [allProducts, onNudge]);

  /* ── 2. Low-stock wishlist nudge ── */
  useEffect(() => {
    wishlist.forEach(id => {
      const key = `lowstock-${id}`;
      if (firedNudges.current.has(key)) return;

      const product = allProducts.find(p => p.id === id);
      if (!product || product.stockCount > 5) return;

      firedNudges.current.add(key);
      setTimeout(() => {
        onNudge({
          type: "urgency",
          icon: <LightningIcon size={18} />,
          title: "Low Stock Alert",
          message: `Only ${product.stockCount} left of "${product.name.split(" ").slice(0, 4).join(" ")}" — grab it before it's gone!`,
        });
      }, 800);
    });
  }, [wishlist, allProducts, onNudge]);

  /* ── 3. Cart idle recovery nudge ── */
  useEffect(() => {
    if (cart.length === 0) {
      clearTimeout(cartIdleTimer.current);
      lastCartLength.current = 0;
      return;
    }

    // Reset timer if cart changed
    if (cart.length !== lastCartLength.current) {
      lastCartLength.current = cart.length;
      clearTimeout(cartIdleTimer.current);

      const key = `cart-idle-${Date.now()}`;
      cartIdleTimer.current = setTimeout(() => {
        if (firedNudges.current.has("cart-idle")) return;
        firedNudges.current.add("cart-idle");
        const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
        onNudge({
          type: "recovery",
          icon: <CartIcon size={18} />,
          title: "Your cart misses you",
          message: `You have RM${total.toLocaleString("en-MY")} worth of items waiting. Complete your order?`,
        });
      }, 30000);
    }

    return () => clearTimeout(cartIdleTimer.current);
  }, [cart, onNudge]);

  return null; // pure logic — no DOM output
}
