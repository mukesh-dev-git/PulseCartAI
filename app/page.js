"use client";
import { useState, useCallback } from "react";
import products from "@/data/products.json";
import {
  PulseCartLogo, SearchIcon, CartIcon, UserIcon,
  HeartIcon, StarIcon, PlusIcon, MinusIcon, CloseIcon,
  ChevronRightIcon, ImageIcon, ShoppingBagIcon,
  HeadphonesIcon, WatchIcon, LaptopIcon, CameraIcon, KeyboardIcon,
  ProductPlaceholder, SparklesIcon,
} from "./components/Icons";
import AIChatWidget from "./components/AIChatWidget";
import NudgeEngine from "./components/NudgeEngine";
import NudgeToast from "./components/NudgeToast";

/* ─── Constants ─────────────────────────── */
const CATEGORIES = [
  { id: "All", label: "All", Icon: ShoppingBagIcon },
  { id: "Headphones", label: "Headphones", Icon: HeadphonesIcon },
  { id: "Smartwatch", label: "Smartwatches", Icon: WatchIcon },
  { id: "Laptop", label: "Laptops", Icon: LaptopIcon },
  { id: "Camera", label: "Cameras", Icon: CameraIcon },
  { id: "Keyboard", label: "Keyboards", Icon: KeyboardIcon },
];

const BADGE_CLASS = {
  "Best Seller": "bestseller",
  "Top Rated": "top",
  "New Arrival": "new",
  "Pro Pick": "top",
  "Fan Favourite": "bestseller",
  "Editor's Choice": "top",
};

const formatMYR = (n) => "RM" + n.toLocaleString("en-MY");

/* ─── Product Card ── Zepto-style compact ─ */
function ProductCard({ product, cartQty, onAdd, onQty, wishlist, onWish, aiReason }) {
  const inCart = cartQty > 0;
  const wished = wishlist.includes(product.id);

  return (
    <article className="p-card" id={`product-${product.id}`} aria-label={product.name}>

      {/* ── Inner image box (the white square) ── */}
      <div className="p-img-box">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        ) : (
          <ProductPlaceholder category={product.category} />
        )}

        {/* Badge */}
        {product.badge && (
          <span className={`p-badge ${BADGE_CLASS[product.badge] || "new"}`}>
            {product.badge}
          </span>
        )}

        {/* Wishlist */}
        <button
          className={`wish-btn${wished ? " active" : ""}`}
          onClick={(e) => { e.stopPropagation(); onWish(product.id); }}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
        >
          <HeartIcon size={12} filled={wished} />
        </button>

        {/* ADD / Qty control */}
        <div className="add-zone">
          {!inCart ? (
            <button
              id={`add-${product.id}`}
              className="add-btn"
              onClick={(e) => { e.stopPropagation(); onAdd(product); }}
              aria-label={`Add ${product.name} to cart`}
            >
              <PlusIcon size={11} /> ADD
            </button>
          ) : (
            <div className="qty-ctrl" role="group" aria-label="Quantity">
              <button className="q-btn" onClick={(e) => { e.stopPropagation(); onQty(product.id, -1); }} aria-label="Decrease">
                <MinusIcon size={12} />
              </button>
              <span className="q-num">{cartQty}</span>
              <button className="q-btn" onClick={(e) => { e.stopPropagation(); onQty(product.id, +1); }} aria-label="Increase">
                <PlusIcon size={12} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Card body — floats below the image box ── */}
      <div className="p-body">
        <div className="p-price-row">
          <span className="p-price">{formatMYR(product.price)}</span>
          <span className="p-mrp">{formatMYR(product.originalPrice)}</span>
          <span className="p-off">{product.discount}% off</span>
        </div>
        <p className="p-name">{product.name}</p>
        {product.features?.[0] && (
          <p className="p-feat">{product.features[0]}</p>
        )}
        <div className="p-rating">
          <div className="r-pill">
            <span style={{ color: "var(--star)" }}><StarIcon size={10} /></span>
            {product.rating}
          </div>
          <span className="r-count">({product.reviews?.toLocaleString()})</span>
        </div>
        {aiReason && (
          <div className="ai-reason">
            <SparklesIcon size={11} />
            <span>{aiReason}</span>
          </div>
        )}
      </div>
    </article>
  );
}

/* ─── Cart Drawer ───────────────────────── */
function CartDrawer({ open, onClose, cart, onQty, onRemove }) {
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal > 0 && subtotal < 265 ? 10 : 0;

  return (
    <>
      <div className={`overlay${open ? " open" : ""}`} onClick={onClose} aria-hidden="true" />
      <aside className={`cart-drawer${open ? " open" : ""}`} aria-label="Shopping cart">

        <div className="d-hd">
          <h3>My Cart&nbsp;({cart.reduce((s, i) => s + i.qty, 0)})</h3>
          <button className="d-close" onClick={onClose} aria-label="Close cart">
            <CloseIcon size={14} />
          </button>
        </div>

        <div className="d-body">
          {cart.length === 0 ? (
            <div className="d-empty">
              <CartIcon size={38} />
              <p>Your cart is empty.<br />Add items to get started.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="c-item">
                <div className="c-img">
                  {item.image
                    ? <img src={item.image} alt={item.name} />
                    : <ProductPlaceholder category={item.category} />
                  }
                </div>
                <div className="c-info">
                  <p className="c-name">{item.name}</p>
                  <p className="c-price">{formatMYR(item.price)}</p>
                  <div className="c-qty">
                    <button className="cq-btn" onClick={() => onQty(item.id, -1)} aria-label="Decrease"><MinusIcon size={11} /></button>
                    <span className="cq-val">{item.qty}</span>
                    <button className="cq-btn" onClick={() => onQty(item.id, +1)} aria-label="Increase"><PlusIcon size={11} /></button>
                  </div>
                </div>
                <button className="c-rm-btn c-rm" onClick={() => onRemove(item.id)} aria-label={`Remove ${item.name}`}>
                  <CloseIcon size={12} />
                </button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="d-ft">
            <div className="d-row"><span>Subtotal</span><span>{formatMYR(subtotal)}</span></div>
            <div className="d-row">
              <span>Delivery</span>
              <span>{shipping === 0 ? "Free" : formatMYR(shipping)}</span>
            </div>
            <div className="d-row total">
              <span>Total</span>
              <span>{formatMYR(subtotal + shipping)}</span>
            </div>
            <button className="d-checkout" id="btn-checkout">
              Proceed to Checkout
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

/* ─── Wishlist Drawer ───────────────────── */
function WishlistDrawer({ open, onClose, wishlistIds, allProducts, onAddToCart, onRemove }) {
  const wishedItems = allProducts.filter((p) => wishlistIds.includes(p.id));

  return (
    <>
      <div className={`overlay${open ? " open" : ""}`} onClick={onClose} aria-hidden="true" />
      <aside className={`cart-drawer${open ? " open" : ""}`} aria-label="Your wishlist">
        <div className="d-hd">
          <h3>Wishlist&nbsp;({wishlistIds.length})</h3>
          <button className="d-close" onClick={onClose} aria-label="Close wishlist">
            <CloseIcon size={14} />
          </button>
        </div>
        <div className="d-body">
          {wishedItems.length === 0 ? (
            <div className="d-empty">
              <HeartIcon size={38} />
              <p>Your wishlist is empty.<br />Save items you love here.</p>
            </div>
          ) : (
            wishedItems.map((item) => (
              <div key={item.id} className="c-item">
                <div className="c-img">
                  {item.image
                    ? <img src={item.image} alt={item.name} />
                    : <ProductPlaceholder category={item.category} />
                  }
                </div>
                <div className="c-info">
                  <p className="c-name" style={{ WebkitLineClamp: 2 }}>{item.name}</p>
                  <p className="c-price">{formatMYR(item.price)}</p>
                  <button
                    className="btn-primary"
                    style={{ marginTop: '8px', padding: '6px 12px', fontSize: '0.8rem', width: 'auto' }}
                    onClick={() => {
                      onAddToCart(item);
                      onRemove(item.id);
                    }}
                  >
                    Move to Cart
                  </button>
                </div>
                <button className="c-rm-btn c-rm" onClick={() => onRemove(item.id)} aria-label={`Remove ${item.name}`}>
                  <CloseIcon size={12} />
                </button>
              </div>
            ))
          )}
        </div>
      </aside>
    </>
  );
}

/* ─── Ad Banner ─────────────────────────── */
function AdBanner({ src, alt = "Advertisement", id }) {
  return (
    <div className="ad-card" id={id} role="img" aria-label={alt}>
      {src ? (
        <img src={src} alt={alt} />
      ) : (
        <div className="ad-ph">
          <div style={{ color: "#c4a882" }}><ImageIcon size={34} /></div>
          <p>Advertisement Banner</p>
          <small>Place image at public/ads/{id}.jpg</small>
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ─────────────────────────── */
export default function Home() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishOpen, setWishOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState({ show: false, msg: "" });
  const [nudge, setNudge] = useState(null);
  const [chatPrompt, setChatPrompt] = useState(null);
  const [aiSearch, setAiSearch] = useState({ active: false, loading: false, query: "", summary: "", results: [] });

  const handleAskAI = useCallback((productName) => {
    setChatPrompt(`Tell me about ${productName}. Is it worth buying? What are its pros and cons?`);
  }, []);

  const handleAISearch = useCallback(async (query) => {
    if (!query.trim()) return;
    setAiSearch(prev => ({ ...prev, loading: true, active: true, query }));
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setAiSearch({ active: true, loading: false, query, summary: data.summary, results: data.results || [] });
    } catch {
      setAiSearch(prev => ({ ...prev, loading: false, summary: "Something went wrong. Try again." }));
    }
  }, []);

  const clearAISearch = useCallback(() => {
    setAiSearch({ active: false, loading: false, query: "", summary: "", results: [] });
    setSearch("");
    setActiveCategory("All");
  }, []);

  const handleNudge = useCallback((n) => {
    setNudge(null); // reset first so same nudge type can re-fire visually
    setTimeout(() => setNudge(n), 50);
  }, []);

  const showToast = useCallback((msg) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: "" }), 2200);
  }, []);

  const handleAdd = useCallback((product) => {
    setCart((prev) => {
      const ex = prev.find((i) => i.id === product.id);
      return ex
        ? prev.map((i) => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
        : [...prev, { ...product, qty: 1 }];
    });
    showToast(`${product.name.split(" ").slice(0, 3).join(" ")} added to cart`);
  }, [showToast]);

  const handleQty = useCallback((id, delta) => {
    setCart((prev) =>
      prev.map((i) => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i)
        .filter((i) => i.qty > 0)
    );
  }, []);

  const handleRemove = useCallback((id) => setCart((p) => p.filter((i) => i.id !== id)), []);
  const handleWish = useCallback((id) => {
    setWishlist((prev) => {
      const has = prev.includes(id);
      showToast(has ? "Removed from wishlist" : "Saved to wishlist");
      return has ? prev.filter((w) => w !== id) : [...prev, id];
    });
  }, [showToast]);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const wishCount = wishlist.length;

  const aiReasonMap = {};
  if (aiSearch.active && !aiSearch.loading) {
    aiSearch.results.forEach(r => { aiReasonMap[r.id] = r.reason; });
  }

  const filtered = aiSearch.active && !aiSearch.loading
    ? aiSearch.results
        .map(r => products.find(p => p.id === r.id))
        .filter(Boolean)
    : products.filter((p) => {
        const matchCat = activeCategory === "All" || p.category === activeCategory;
        const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
      });

  const handleRenderProduct = useCallback((id) => {
    const p = products.find(prod => prod.id === parseInt(id));
    if (!p) return null;
    return (
      <div style={{ padding: '12px 0 4px', width: '100%' }} key={`chat-prod-${p.id}`}>
        <ProductCard
          product={p}
          cartQty={cart.find((i) => i.id === p.id)?.qty || 0}
          onAdd={handleAdd}
          onQty={handleQty}
          wishlist={wishlist}
          onWish={handleWish}
        />
      </div>
    );
  }, [cart, wishlist, handleAdd, handleQty, handleWish]);

  return (
    <>
      {/* ── Navbar ── */}
      <nav className="navbar" role="navigation" aria-label="Main navigation">
        <div className="navbar-inner">

          {/* Logo: pulse waveform SVG + Saira Stencil word */}
          <div className="logo" aria-label="PulseCart home">
            <PulseCartLogo size={36} />
            <span className="logo-text">PulseCart</span>
          </div>

          {/* Search */}
          <div className="search-wrap" role="search">
            <div className={`search-bar${aiSearch.active ? " ai-active" : ""}`}>
              <span className="s-icon" aria-hidden="true"><SearchIcon size={19} /></span>
              <input
                id="search-input"
                type="search"
                placeholder="Try &quot;best laptop for coding&quot; or &quot;gift under RM200&quot;…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  if (aiSearch.active) clearAISearch();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && search.trim()) {
                    e.preventDefault();
                    handleAISearch(search.trim());
                  }
                }}
                aria-label="Search products — press Enter for AI search"
              />
              {search.trim() && !aiSearch.loading && (
                <button
                  className="ai-search-btn"
                  onClick={() => handleAISearch(search.trim())}
                  aria-label="AI Search"
                  title="AI Search"
                >
                  <SparklesIcon size={16} />
                </button>
              )}
              {aiSearch.loading && (
                <span className="ai-search-spinner" aria-label="Searching..." />
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="nav-actions">
            <button className="nav-btn" id="btn-login" aria-label="Login">
              <UserIcon size={22} />
              <span className="nav-label">Login</span>
            </button>

            <button
              className="nav-btn"
              id="btn-wishlist-nav"
              aria-label={`Wishlist (${wishCount})`}
              onClick={() => { setCartOpen(false); setWishOpen(true); }}
              style={{ position: "relative" }}
            >
              <HeartIcon size={22} />
              <span className="nav-label">Wishlist</span>
              {wishCount > 0 && <span className="cart-badge">{wishCount}</span>}
            </button>

            <button
              className="nav-btn"
              id="btn-cart-nav"
              aria-label={`Cart, ${cartCount} items`}
              onClick={() => { setWishOpen(false); setCartOpen(true); }}
              style={{ position: "relative" }}
            >
              <CartIcon size={23} />
              <span className="nav-label">Cart</span>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Category Bar ── */}
      <div className="cat-bar" role="navigation" aria-label="Product categories">
        <div className="cat-scroll" role="tablist">
          {CATEGORIES.map(({ id, label, Icon }) => (
            <button
              key={id}
              id={`cat-${id.toLowerCase()}`}
              role="tab"
              aria-selected={activeCategory === id}
              className={`cat-tab${activeCategory === id ? " active" : ""}`}
              onClick={() => setActiveCategory(id)}
            >
              <span className="cat-icon" aria-hidden="true"><Icon size={20} /></span>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main content ── */}
      <main className="page">

        {/* Advertisement banners */}
        <section className="ad-row" aria-label="Promotions">
          <AdBanner
            id="banner1"
            alt="Featured deal banner"
            src="https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&w=1400&h=430&q=80"
          />
          <AdBanner
            id="banner2"
            alt="Special offer banner"
            src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1400&h=430&q=80"
          />
        </section>

        {/* Products */}
        <section aria-label="Product listing">
          {aiSearch.active && !aiSearch.loading ? (
            <div className="ai-banner">
              <div className="ai-banner-left">
                <SparklesIcon size={18} />
                <div>
                  <p className="ai-banner-title">AI Search: &ldquo;{aiSearch.query}&rdquo;</p>
                  <p className="ai-banner-summary">{aiSearch.summary}</p>
                </div>
              </div>
              <button className="ai-banner-clear" onClick={clearAISearch}>
                <CloseIcon size={12} /> Clear
              </button>
            </div>
          ) : aiSearch.loading ? (
            <div className="ai-banner ai-banner-loading">
              <span className="ai-search-spinner" />
              <p className="ai-banner-title">AI is searching for &ldquo;{aiSearch.query}&rdquo;...</p>
            </div>
          ) : (
            <div className="sec-hd">
              <h2 className="sec-title">
                {activeCategory === "All" ? "Featured Products" : activeCategory}
                {search && ` · "${search}"`}
              </h2>
              <button className="see-all" id="btn-see-all">
                See All <ChevronRightIcon size={12} />
              </button>
            </div>
          )}

          {!aiSearch.loading && (
            <div className="p-grid" role="list" aria-label="Products">
              {filtered.length === 0 ? (
                <p className="p-empty">
                  {aiSearch.active
                    ? "AI couldn't find matching products. Try a different query."
                    : "No products found for this selection."}
                </p>
              ) : (
                filtered.map((p) => (
                  <div key={p.id} role="listitem">
                    <ProductCard
                      product={p}
                      cartQty={cart.find((i) => i.id === p.id)?.qty || 0}
                      onAdd={handleAdd}
                      onQty={handleQty}
                      wishlist={wishlist}
                      onWish={handleWish}
                      aiReason={aiReasonMap[p.id]}
                    />
                  </div>
                ))
              )}
            </div>
          )}
        </section>
      </main>

      {/* ── Cart Drawer ── */}
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        onQty={handleQty}
        onRemove={handleRemove}
      />

      {/* ── Wishlist Drawer ── */}
      <WishlistDrawer
        open={wishOpen}
        onClose={() => setWishOpen(false)}
        wishlistIds={wishlist}
        allProducts={products}
        onAddToCart={handleAdd}
        onRemove={handleWish}
      />

      {/* ── Toast notification ── */}
      <div className={`toast${toast.show ? " show" : ""}`} role="status" aria-live="polite">
        <span className="t-dot" aria-hidden="true" />
        {toast.msg}
      </div>

      <NudgeEngine
        cart={cart}
        wishlist={wishlist}
        allProducts={products}
        onNudge={handleNudge}
      />

      <NudgeToast nudge={nudge} onDismiss={() => setNudge(null)} onAskAI={handleAskAI} />

      <AIChatWidget
        renderProduct={handleRenderProduct}
        externalPrompt={chatPrompt}
        onExternalPromptHandled={() => setChatPrompt(null)}
      />

      {/* ── Footer ── */}
      <footer className="footer">
        © 2026 PulseCart AI · Smart Shopping, Powered by AI
      </footer>
    </>
  );
}
