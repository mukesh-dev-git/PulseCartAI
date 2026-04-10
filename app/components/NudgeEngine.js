"use client";
import { useEffect, useRef, useCallback } from "react";
import { BotIcon, LightningIcon, CartIcon } from "./Icons";
/**
 * NudgeEngine — Monitors user micro-behaviours and fires contextual
 * nudge notifications.
 *
 * Triggers:
 *  1. HESITATION
 *     Desktop: hover on product card > 3s (event delegation)
 *     Mobile:  product card visible in viewport center > 4s while scroll idle
 *  2. LOW STOCK – wishlisted item has ≤ 5 stock → urgency nudge
 *  3. CART IDLE – cart has items but user idle 30s → recovery nudge
 */
export default function NudgeEngine({ cart, wishlist, allProducts, onNudge }) {
  const hoverTimers = useRef({});
  const visibilityTimers = useRef({});
  const cartIdleTimer = useRef(null);
  const firedHesitation = useRef(new Set());
  const firedLowStock = useRef(new Set());
  const cartIdleFired = useRef(false);
  const isTouchDevice = useRef(false);
  const allProductsRef = useRef(allProducts);
  allProductsRef.current = allProducts;
  const onNudgeRef = useRef(onNudge);
  onNudgeRef.current = onNudge;

  const fireHesitationNudge = useCallback((productId) => {
    if (firedHesitation.current.has(productId)) return;
    const product = allProductsRef.current.find(p => p.id === parseInt(productId));
    if (!product) return;
    firedHesitation.current.add(productId);

    onNudgeRef.current({
      type: "hesitation",
      icon: <BotIcon size={18} />,
      title: "AI Insight",
      message: `Curious about ${product.name.split(" ").slice(0, 3).join(" ")}? Ask our AI if it fits your needs!`,
      productName: product.name,
    });
  }, []);

  /* ── 1a. Desktop: Hover detection via event delegation ── */
  useEffect(() => {
    const getCardProductId = (target) => {
      const card = target.closest(".p-card");
      if (!card) return null;
      return card.id?.replace("product-", "") || null;
    };

    const handleMouseOver = (e) => {
      if (isTouchDevice.current) return;
      const productId = getCardProductId(e.target);
      if (!productId || hoverTimers.current[productId]) return;

      hoverTimers.current[productId] = setTimeout(() => {
        delete hoverTimers.current[productId];
        fireHesitationNudge(productId);
      }, 3000);
    };

    const handleMouseOut = (e) => {
      if (isTouchDevice.current) return;
      const productId = getCardProductId(e.target);
      if (!productId) return;

      const card = document.getElementById(`product-${productId}`);
      if (card && !card.contains(e.relatedTarget)) {
        if (hoverTimers.current[productId]) {
          clearTimeout(hoverTimers.current[productId]);
          delete hoverTimers.current[productId];
        }
      }
    };

    const handleTouchStart = () => { isTouchDevice.current = true; };

    document.addEventListener("touchstart", handleTouchStart, { once: true, passive: true });
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
      Object.values(hoverTimers.current).forEach(clearTimeout);
      hoverTimers.current = {};
    };
  }, [fireHesitationNudge]);

  /* ── 1b. Mobile: IntersectionObserver + scroll-idle detection ── */
  useEffect(() => {
    let scrollTimeout = null;
    let isScrolling = false;
    let observer = null;
    const visibleCards = new Set();

    const startTimerForCard = (productId) => {
      if (visibilityTimers.current[productId] || firedHesitation.current.has(productId)) return;
      visibilityTimers.current[productId] = setTimeout(() => {
        delete visibilityTimers.current[productId];
        fireHesitationNudge(productId);
      }, 4000);
    };

    const clearTimerForCard = (productId) => {
      if (visibilityTimers.current[productId]) {
        clearTimeout(visibilityTimers.current[productId]);
        delete visibilityTimers.current[productId];
      }
    };

    const onScrollIdle = () => {
      isScrolling = false;
      visibleCards.forEach(id => startTimerForCard(id));
    };

    const onScroll = () => {
      isScrolling = true;
      Object.keys(visibilityTimers.current).forEach(clearTimerForCard);
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(onScrollIdle, 600);
    };

    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const productId = entry.target.id?.replace("product-", "");
        if (!productId) return;

        if (entry.isIntersecting) {
          visibleCards.add(productId);
          if (!isScrolling) startTimerForCard(productId);
        } else {
          visibleCards.delete(productId);
          clearTimerForCard(productId);
        }
      });
    }, {
      threshold: 0.6,
    });

    const attachObserver = () => {
      document.querySelectorAll(".p-card").forEach(card => {
        observer.observe(card);
      });
    };

    attachObserver();
    const mutationObs = new MutationObserver(() => {
      document.querySelectorAll(".p-card").forEach(card => {
        observer.observe(card);
      });
    });
    mutationObs.observe(document.body, { childList: true, subtree: true });

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(scrollTimeout);
      observer.disconnect();
      mutationObs.disconnect();
      Object.values(visibilityTimers.current).forEach(clearTimeout);
      visibilityTimers.current = {};
    };
  }, [fireHesitationNudge]);

  /* ── 2. Low-stock wishlist nudge ── */
  useEffect(() => {
    wishlist.forEach(id => {
      const key = `${id}`;
      if (firedLowStock.current.has(key)) return;

      const product = allProducts.find(p => p.id === id);
      if (!product || product.stockCount > 5) return;

      firedLowStock.current.add(key);
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
  const resetIdleTimer = useCallback(() => {
    clearTimeout(cartIdleTimer.current);
    cartIdleTimer.current = null;
  }, []);

  useEffect(() => {
    if (cart.length === 0) {
      resetIdleTimer();
      cartIdleFired.current = false;
      return;
    }

    resetIdleTimer();
    cartIdleFired.current = false;

    cartIdleTimer.current = setTimeout(() => {
      if (cartIdleFired.current) return;
      cartIdleFired.current = true;
      const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
      onNudge({
        type: "recovery",
        icon: <CartIcon size={18} />,
        title: "Your cart misses you",
        message: `You have RM${total.toLocaleString("en-MY")} worth of items waiting. Complete your order?`,
      });
    }, 30000);

    return () => resetIdleTimer();
  }, [cart, onNudge, resetIdleTimer]);

  return null;
}
