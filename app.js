// ===== PRODUCTOS =====
const products = [
  {
    id: 1, name: "MacBook Pro M3", category: "electronica",
    icon: '<i class="fa-solid fa-laptop"></i>', iconClass: "fa-laptop",
    img: "https://images.unsplash.com/photo-1498049860654-af1a5c566876?auto=format&fit=crop&w=600&q=80",
    price: 28999, oldPrice: 34999, rating: 4.9, reviews: 312, badge: "Nuevo", stock: 15,
    variants: { label: "Almacenamiento", options: ["256GB", "512GB", "1TB"] },
    description: 'El laptop más potente de Apple con chip M3. Pantalla Liquid Retina XDR de 14", batería de hasta 22 horas, perfecto para desarrolladores y creativos.'
  },
  {
    id: 2, name: "iPhone 16 Pro", category: "electronica",
    icon: '<i class="fa-solid fa-mobile-screen"></i>', iconClass: "fa-mobile-screen",
    img: "https://images.unsplash.com/photo-1702289612974-dc67693a8cd4?auto=format&fit=crop&w=600&q=80",
    price: 22499, oldPrice: 25999, rating: 4.8, reviews: 587, badge: "Top Venta", stock: 42,
    variants: { label: "Almacenamiento", options: ["128GB", "256GB", "512GB"] },
    description: "El iPhone más avanzado con cámara de 48MP, chip A18 Pro, pantalla Always-On y Dynamic Island. El smartphone definitivo del año."
  },
  {
    id: 3, name: "Nike Air Max 270", category: "calzado",
    icon: '<i class="fa-solid fa-shoe-prints"></i>', iconClass: "fa-shoe-prints",
    img: "https://images.unsplash.com/photo-1562613521-6b5293e5b0ea?auto=format&fit=crop&w=600&q=80",
    price: 2499, oldPrice: 3200, rating: 4.7, reviews: 234, badge: "Oferta", stock: 75,
    variants: { label: "Talla", options: ["37","38","39","40","41","42","43"] },
    description: "Las icónicas zapatillas Nike con amortiguación Air Max de 270°. Comodidad extrema para el día a día, estilo inconfundible."
  },
  {
    id: 4, name: "Playera Oversize", category: "ropa",
    icon: '<i class="fa-solid fa-shirt"></i>', iconClass: "fa-shirt",
    img: "https://images.unsplash.com/photo-1620799139507-2a76f79a2f4d?auto=format&fit=crop&w=600&q=80",
    price: 549, oldPrice: null, rating: 4.5, reviews: 98, badge: null, stock: 200,
    variants: { label: "Talla", options: ["XS","S","M","L","XL","XXL"] },
    description: "Playera 100% algodón de alta calidad en corte oversize. Disponible en 12 colores, perfecta para cualquier ocasión."
  },
  {
    id: 5, name: 'Smart TV 55" 4K', category: "electronica",
    icon: '<i class="fa-solid fa-tv"></i>', iconClass: "fa-tv",
    img: "https://images.unsplash.com/photo-1521607630287-ee2e81ad3ced?auto=format&fit=crop&w=600&q=80",
    price: 12999, oldPrice: 15999, rating: 4.6, reviews: 176, badge: "Oferta", stock: 60,
    variants: null,
    description: "Televisor 4K Ultra HD con sistema operativo inteligente, HDR Dolby Vision, Dolby Atmos y conectividad Wi-Fi 6. La experiencia de cine en tu hogar."
  },
  {
    id: 6, name: "Sofá Modular 3P", category: "hogar",
    icon: '<i class="fa-solid fa-couch"></i>', iconClass: "fa-couch",
    img: "https://images.unsplash.com/photo-1757416654883-c73c67b3382b?auto=format&fit=crop&w=600&q=80",
    price: 8999, oldPrice: 11500, rating: 4.4, reviews: 63, badge: "Oferta", stock: 20,
    variants: { label: "Color", options: ["Gris","Beige","Azul","Verde"] },
    description: "Sofá modular de 3 plazas tapizado en tela de alta resistencia. Diseño escandinavo, estructura de madera maciza y cojines removibles."
  },
  {
    id: 7, name: "Sony WH-1000XM5", category: "electronica",
    icon: '<i class="fa-solid fa-headphones"></i>', iconClass: "fa-headphones",
    img: "https://images.unsplash.com/photo-1621208587196-0b2a7d2aeb03?auto=format&fit=crop&w=600&q=80",
    price: 6499, oldPrice: 7999, rating: 4.9, reviews: 425, badge: "Top Venta", stock: 88,
    variants: { label: "Color", options: ["Negro","Plata"] },
    description: "Los mejores audífonos de cancelación de ruido del mercado. 30 horas de batería, llamadas cristalinas y audio Hi-Res. Ideal para viajes y trabajo."
  },
  {
    id: 8, name: "Balón de Fútbol Pro", category: "deportes",
    icon: '<i class="fa-solid fa-futbol"></i>', iconClass: "fa-futbol",
    img: "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=600&q=80",
    price: 899, oldPrice: 1200, rating: 4.6, reviews: 142, badge: null, stock: 300,
    variants: { label: "Talla", options: ["3","4","5"] },
    description: "Balón oficial de competición FIFA. Cubierta de poliuretano termosellado de 32 paneles, cámara de butilo para retención de aire perfecta."
  },
  {
    id: 9, name: "Cafetera Espresso", category: "hogar",
    icon: '<i class="fa-solid fa-mug-hot"></i>', iconClass: "fa-mug-hot",
    img: "https://images.unsplash.com/photo-1754847307554-314a05e2ced6?auto=format&fit=crop&w=600&q=80",
    price: 3299, oldPrice: 4200, rating: 4.7, reviews: 208, badge: "Oferta", stock: 35,
    variants: { label: "Color", options: ["Negro","Plata"] },
    description: "Cafetera espresso automática con bomba de 15 bares, vaporizador de leche integrado y pantalla OLED. Tu barista personal en casa."
  },
  {
    id: 10, name: "Tenis Running X1", category: "calzado",
    icon: '<i class="fa-solid fa-person-running"></i>', iconClass: "fa-person-running",
    img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
    price: 1899, oldPrice: null, rating: 4.5, reviews: 87, badge: "Nuevo", stock: 120,
    variants: { label: "Talla", options: ["37","38","39","40","41","42","43"] },
    description: "Tenis diseñados para corredores de alto rendimiento. Suela de carbono, entresuela de espuma reactiva y upper de tejido transpirable."
  },
  {
    id: 11, name: "Sudadera Premium", category: "ropa",
    icon: '<i class="fa-solid fa-vest"></i>', iconClass: "fa-vest",
    img: "https://images.unsplash.com/photo-1703531293255-0b16d10fe09f?auto=format&fit=crop&w=600&q=80",
    price: 849, oldPrice: 1099, rating: 4.6, reviews: 156, badge: null, stock: 150,
    variants: { label: "Talla", options: ["S","M","L","XL","XXL"] },
    description: "Sudadera de fleece 300g con capucha ajustable, bolsillo canguro y cordones planos. Material suave, abrigador y duradero."
  },
  {
    id: 12, name: 'Bicicleta MTB 29"', category: "deportes",
    icon: '<i class="fa-solid fa-bicycle"></i>', iconClass: "fa-bicycle",
    img: "https://images.unsplash.com/photo-1506316940527-4d1c138978a0?auto=format&fit=crop&w=600&q=80",
    price: 9500, oldPrice: 12000, rating: 4.8, reviews: 94, badge: "Top Venta", stock: 18,
    variants: { label: "Talla", options: ["S","M","L"] },
    description: "Bicicleta de montaña con cuadro de aluminio 6061, frenos hidráulicos Shimano, 12 velocidades y horquilla de suspensión 120mm."
  },
];

let cart = [];
let filteredProducts = [...products];
let activeMinRating  = 0;
let activeMaxPrice   = 35000;
let compareList      = [];

// ===== RENDER PRODUCTOS =====
function renderProducts(list) {
  const grid = document.getElementById("productsGrid");
  if (list.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--text-light)"><i class="fa-solid fa-magnifying-glass" style="font-size:3rem"></i><p style="margin-top:12px;font-size:1.1rem">No se encontraron productos</p></div>`;
    return;
  }
  grid.innerHTML = list.map(p => `
    <div class="product-card" onclick="openModal(${p.id})">
      <div class="product-image">
        <img src="${p.img}" alt="${p.name}" onerror="this.onerror=null;this.style.display='none';this.nextElementSibling.style.display='flex'" />
        <div class="product-icon-fallback">${p.icon}</div>
        ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ""}
        ${p.stock === 0 ? `<span class="product-badge badge-agotado">Agotado</span>` : p.stock <= 20 ? `<span class="product-badge badge-low">¡Solo ${p.stock}!</span>` : ""}
        <button class="wish-btn ${isWishlisted(p.id) ? 'active' : ''}"
          onclick="event.stopPropagation(); toggleWishlist(${p.id}, this)"
          title="Agregar a favoritos">
          <i class="fa-${isWishlisted(p.id) ? 'solid' : 'regular'} fa-heart"></i>
        </button>
        <button class="compare-btn ${compareList.some(x => x.id === p.id) ? 'active' : ''}"
          data-id="${p.id}"
          onclick="event.stopPropagation(); toggleCompare(${p.id}, this)"
          title="Comparar producto">
          <i class="fa-solid fa-table-columns"></i>
        </button>
      </div>
      <div class="product-info">
        <p class="product-category">${p.category}</p>
        <p class="product-name">${p.name}</p>
        <p class="product-rating">${stars(p.rating)} <span>(${p.reviews})</span></p>
        <div class="product-price-row">
          <div>
            <span class="product-price">$${p.price.toLocaleString()}</span>
            ${p.oldPrice ? `<span class="product-price-old">$${p.oldPrice.toLocaleString()}</span>` : ""}
          </div>
          <button class="add-cart-btn" onclick="addToCart(event, ${p.id})"><i class="fa-solid fa-plus"></i></button>
        </div>
      </div>
    </div>
  `).join("");
}

function stars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return "★".repeat(full) + (half ? "☆" : "") + `  ${rating}`;
}

// ===== FILTRO CATEGORIAS =====
function filterCategory(cat) {
  filteredProducts = cat === "todos" ? [...products] : products.filter(p => p.category === cat);
  renderProducts(filteredProducts);
  document.getElementById("productos").scrollIntoView({ behavior: "smooth" });
}

// ===== BUSQUEDA =====
function searchProducts() {
  const q = document.getElementById("searchInput").value.toLowerCase().trim();
  const result = q ? products.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)) : [...products];
  filteredProducts = result;
  renderProducts(filteredProducts);
  document.getElementById("productos").scrollIntoView({ behavior: "smooth" });
}

document.getElementById("searchInput").addEventListener("keydown", e => {
  if (e.key === "Enter") searchProducts();
});

// ===== CARRITO =====
function addToCart(e, id) {
  e.stopPropagation();
  const product = products.find(p => p.id === id);
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  updateCart();
  showToast(`${product.name} agregado al carrito`);
}

function updateCart() {
  const prevCount = parseInt(document.getElementById("cartCount").textContent) || 0;
  const count = cart.reduce((s, i) => s + i.qty, 0);
  document.getElementById("cartCount").textContent = count;

  // Bounce animation when count changes
  if (count !== prevCount) {
    const el = document.getElementById("cartCount");
    el.classList.remove("bounce");
    void el.offsetWidth;
    el.classList.add("bounce");
  }

  const container = document.getElementById("cartItems");
  const footer = document.getElementById("cartFooter");

  if (cart.length === 0) {
    container.innerHTML = `<div class="empty-cart"><i class="fa-solid fa-cart-shopping"></i><p>Tu carrito está vacío</p></div>`;
    footer.style.display = "none";
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-icon">
        <img src="${item.img}" alt="${item.name}" onerror="this.onerror=null;this.style.display='none';this.nextElementSibling.style.display='flex'" />
        <div class="cart-icon-fallback">${item.icon}</div>
      </div>
      <div class="cart-item-info">
        <p class="cart-item-name">${item.name}</p>
        <p class="cart-item-price">$${(item.price * item.qty).toLocaleString()}</p>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn" onclick="changeQty(${item.id}, -1)"><i class="fa-solid fa-minus"></i></button>
        <span class="qty-num">${item.qty}</span>
        <button class="qty-btn" onclick="changeQty(${item.id}, 1)"><i class="fa-solid fa-plus"></i></button>
      </div>
    </div>
  `).join("");

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  document.getElementById("cartTotal").textContent = `$${total.toLocaleString()}`;
  footer.style.display = "block";
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  updateCart();
}

function toggleCart() {
  document.getElementById("cartSidebar").classList.toggle("open");
  document.getElementById("cartOverlay").classList.toggle("active");
}

function checkout() {
  if (cart.length === 0) return;
  localStorage.setItem("shopnow_cart", JSON.stringify(cart));
  window.location.href = "checkout.html";
}

// ===== MODAL =====
let selectedVariant = null;

function openModal(id) {
  const p = products.find(prod => prod.id === id);
  if (!p) return;
  trackRecentlyViewed(p);
  selectedVariant = p.variants ? p.variants.options[0] : null;

  const stockBadge = p.stock === 0
    ? `<span class="modal-stock stock-out"><i class="fa-solid fa-ban"></i> Agotado</span>`
    : p.stock <= 20
      ? `<span class="modal-stock stock-low"><i class="fa-solid fa-bolt"></i> ¡Solo quedan ${p.stock}!</span>`
      : `<span class="modal-stock stock-ok"><i class="fa-solid fa-circle-check"></i> En stock</span>`;

  const variantsHtml = p.variants ? `
    <div class="modal-variants">
      <p class="variant-label">${p.variants.label}: <strong id="variantSelected">${selectedVariant}</strong></p>
      <div class="variant-options">
        ${p.variants.options.map((opt, i) => `
          <button class="variant-btn ${i === 0 ? 'active' : ''}"
            onclick="selectVariant(this, '${opt}')">${opt}</button>`).join("")}
      </div>
    </div>` : "";

  const relatedHtml = buildRelatedProducts(p);
  const reviewsHtml = buildReviews(p);

  document.getElementById("modalContent").innerHTML = `
    <div class="modal-img">
      <img src="${p.img}" alt="${p.name}" onerror="this.onerror=null;this.style.display='none';this.nextElementSibling.style.display='flex'" />
      <div class="modal-icon-fallback">${p.icon}</div>
    </div>
    <div class="modal-top-row">
      <p class="modal-category">${p.category}</p>
      <button class="modal-share-btn" onclick="shareProduct(${p.id})">
        <i class="fa-solid fa-share-nodes"></i> Compartir
      </button>
    </div>
    <h2 class="modal-title">${p.name}</h2>
    ${stockBadge}
    <div style="display:flex;align-items:center;gap:10px;margin:10px 0 14px">
      <span style="color:#fbbf24">${stars(p.rating)}</span>
      <span style="color:var(--text-light);font-size:0.83rem">(${p.reviews} reseñas)</span>
    </div>
    <p class="modal-description">${p.description}</p>
    ${variantsHtml}
    <div style="display:flex;align-items:center;gap:10px;margin:18px 0">
      <span class="modal-price">$${p.price.toLocaleString()}</span>
      ${p.oldPrice ? `<span style="color:var(--text-light);text-decoration:line-through;font-size:1rem">$${p.oldPrice.toLocaleString()}</span>` : ""}
    </div>
    <div class="modal-actions">
      <button class="btn-primary" onclick="addToCartFromModal(${p.id})"
        ${p.stock === 0 ? "disabled style='opacity:0.5;cursor:not-allowed'" : ""}>
        <i class="fa-solid fa-cart-plus"></i> Agregar al Carrito
      </button>
      <button class="wish-btn-modal ${isWishlisted(p.id) ? 'active' : ''}"
        onclick="toggleWishlist(${p.id}, this)">
        <i class="fa-${isWishlisted(p.id) ? 'solid' : 'regular'} fa-heart"></i>
      </button>
    </div>
    ${relatedHtml}
    ${reviewsHtml}
  `;
  document.getElementById("productModal").classList.add("open");
  document.getElementById("modalOverlay").classList.add("active");
  document.body.style.overflow = "hidden";
}

function selectVariant(btn, val) {
  selectedVariant = val;
  document.querySelectorAll(".variant-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  const lbl = document.getElementById("variantSelected");
  if (lbl) lbl.textContent = val;
}

function addToCartFromModal(id) {
  const product = products.find(p => p.id === id);
  if (!product || product.stock === 0) return;
  const existing = cart.find(item => item.id === id && item.variant === selectedVariant);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...product, qty: 1, variant: selectedVariant });
  }
  updateCart();
  showToast(`${product.name}${selectedVariant ? " · " + selectedVariant : ""} agregado`);
  closeModal();
}

function buildRelatedProducts(p) {
  const related = products.filter(x => x.category === p.category && x.id !== p.id).slice(0, 4);
  if (related.length === 0) return "";
  return `
    <div class="modal-related">
      <h4><i class="fa-solid fa-wand-magic-sparkles"></i> También te puede interesar</h4>
      <div class="related-scroll">
        ${related.map(r => `
          <div class="related-card" onclick="closeModal(); setTimeout(()=>openModal(${r.id}),150)">
            <div class="related-img">
              <img src="${r.img}" alt="${r.name}"
                onerror="this.onerror=null;this.style.display='none';this.nextElementSibling.style.display='flex'" />
              <i class="fa-solid ${r.iconClass}" style="display:none;font-size:1.8rem;color:var(--primary);opacity:0.7"></i>
            </div>
            <p class="related-name">${r.name}</p>
            <p class="related-price">$${r.price.toLocaleString()}</p>
          </div>`).join("")}
      </div>
    </div>`;
}

// ===== REVIEWS =====
function getReviews(productId) {
  try { return (JSON.parse(localStorage.getItem("shopnow_reviews") || "[]")).filter(r => r.productId === productId); }
  catch { return []; }
}
function saveReview(review) {
  const all = JSON.parse(localStorage.getItem("shopnow_reviews") || "[]");
  all.push(review);
  localStorage.setItem("shopnow_reviews", JSON.stringify(all));
}
let reviewRating = 0;

function buildReviews(p) {
  const reviews  = getReviews(p.id);
  const session  = getSession();
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : p.rating;

  const reviewsListHtml = reviews.length
    ? reviews.slice().reverse().map(r => `
        <div class="review-card">
          <div class="review-header">
            <div class="review-avatar">${r.userName[0]}</div>
            <div>
              <p class="review-user">${r.userName}</p>
              <p class="review-date">${r.fecha}</p>
            </div>
            <div class="review-stars">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</div>
          </div>
          <p class="review-comment">${r.comment}</p>
        </div>`).join("")
    : `<p class="review-empty">Sé el primero en dejar una reseña.</p>`;

  const formHtml = session ? `
    <div class="review-form" id="reviewForm-${p.id}">
      <h5>Deja tu reseña</h5>
      <div class="star-selector" id="starSelector-${p.id}">
        ${[1,2,3,4,5].map(n => `
          <button type="button" class="star-btn" onclick="setReviewRating(${n}, ${p.id})">☆</button>`).join("")}
      </div>
      <textarea id="reviewText-${p.id}" placeholder="Comparte tu experiencia con este producto..." rows="3"></textarea>
      <button class="btn-review-submit" onclick="submitReview(${p.id})">
        <i class="fa-solid fa-paper-plane"></i> Publicar reseña
      </button>
    </div>` : `<p class="review-login-hint"><a href="login.html">Inicia sesión</a> para dejar una reseña.</p>`;

  return `
    <div class="modal-reviews">
      <div class="reviews-header">
        <h4><i class="fa-solid fa-star"></i> Reseñas</h4>
        <div class="reviews-avg">
          <span class="avg-num">${avgRating}</span>
          <span class="avg-stars" style="color:#fbbf24">${"★".repeat(Math.round(avgRating))}</span>
          <span class="avg-count">(${reviews.length + p.reviews})</span>
        </div>
      </div>
      <div class="reviews-list">${reviewsListHtml}</div>
      ${formHtml}
    </div>`;
}

function setReviewRating(n, productId) {
  reviewRating = n;
  const sel = document.getElementById("starSelector-" + productId);
  if (!sel) return;
  sel.querySelectorAll(".star-btn").forEach((btn, i) => {
    btn.textContent = i < n ? "★" : "☆";
    btn.classList.toggle("active", i < n);
  });
}

function submitReview(productId) {
  const session = getSession();
  if (!session) return;
  if (!reviewRating) { showToast("Selecciona una calificación"); return; }
  const text = document.getElementById(`reviewText-${productId}`)?.value.trim();
  if (!text) { showToast("Escribe un comentario"); return; }

  const review = {
    id:        Date.now().toString(36),
    productId,
    userId:    session.id,
    userName:  `${session.nombre} ${(session.apellido || "")[0] || ""}.`.trim(),
    rating:    reviewRating,
    comment:   text,
    fecha:     new Date().toLocaleDateString("es-MX", { year:"numeric", month:"long", day:"numeric" }),
  };
  saveReview(review);
  reviewRating = 0;
  openModal(productId);
  showToast("¡Reseña publicada!");
}

// ===== SHARE =====
function shareProduct(id) {
  const p    = products.find(x => x.id === id);
  const url  = window.location.origin + window.location.pathname + "?p=" + id;
  const text = `¡Mira este producto en ShopNow! ${p.name} por $${p.price.toLocaleString()}`;
  if (navigator.share) {
    navigator.share({ title: p.name, text, url }).catch(() => {});
  } else {
    showShareFallback(p, text, url);
  }
}
function showShareFallback(p, text, url) {
  const existing = document.getElementById("sharePanel");
  if (existing) { existing.remove(); return; }
  const panel = document.createElement("div");
  panel.id = "sharePanel";
  panel.className = "share-panel";
  panel.innerHTML = `
    <a href="https://wa.me/?text=${encodeURIComponent(text + " " + url)}" target="_blank" rel="noopener">
      <i class="fa-brands fa-whatsapp"></i> WhatsApp
    </a>
    <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}" target="_blank" rel="noopener">
      <i class="fa-brands fa-x-twitter"></i> Twitter / X
    </a>
    <button onclick="copyProductLink('${url}')">
      <i class="fa-solid fa-link"></i> Copiar enlace
    </button>`;
  document.querySelector(".modal-share-btn")?.after(panel);
}
function copyProductLink(url) {
  navigator.clipboard.writeText(url).then(() => showToast("¡Enlace copiado!")).catch(() => {});
  document.getElementById("sharePanel")?.remove();
}

function closeModal() {
  document.getElementById("productModal").classList.remove("open");
  document.getElementById("modalOverlay").classList.remove("active");
  document.body.style.overflow = "";
}

// ===== COUNTDOWN (con pulse en cada cambio) =====
function startCountdown() {
  const end = new Date();
  end.setHours(end.getHours() + 5, end.getMinutes() + 47, end.getSeconds() + 33);

  let prevS = -1;
  function tick() {
    const now  = new Date();
    const diff = Math.max(0, Math.floor((end - now) / 1000));
    const h = String(Math.floor(diff / 3600)).padStart(2, "0");
    const m = String(Math.floor((diff % 3600) / 60)).padStart(2, "0");
    const s = String(diff % 60).padStart(2, "0");

    const elS = document.getElementById("seconds");
    if (s !== prevS) {
      elS.classList.remove("pulse");
      void elS.offsetWidth;
      elS.classList.add("pulse");
      prevS = s;
    }
    document.getElementById("hours").textContent   = h;
    document.getElementById("minutes").textContent = m;
    elS.textContent = s;
    if (diff > 0) setTimeout(tick, 1000);
  }
  tick();
}

// ===== TOAST =====
function showToast(msg) {
  const t = document.getElementById("toast");
  t.innerHTML = `<i class="fa-solid fa-check" style="color:var(--accent)"></i>${msg}`;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 3000);
}

// ===== FORMULARIO =====
function submitForm(e) {
  e.preventDefault();
  showToast("¡Mensaje enviado! Te contactaremos pronto.");
  e.target.reset();
}

// ===== EFECTOS VISUALES =====
(function initEffects() {

  // 1. Navbar shadow on scroll
  const navbar = document.querySelector(".navbar");
  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 10);
  }, { passive: true });

  // 2. Scroll reveal con Intersection Observer
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("revealed");

      // Revelar grids escalonados
      const grid = entry.target.querySelector(".products-grid, .categories-grid");
      if (grid) {
        setTimeout(() => grid.classList.add("grid-revealed"), 100);
      }
      revealObs.unobserve(entry.target);
    });
  }, { threshold: 0.1 });

  document.querySelectorAll(".reveal").forEach(el => revealObs.observe(el));

  // Activar fancy-title en secciones no-reveal (hero area)
  document.querySelectorAll(".fancy-title").forEach(el => {
    if (!el.closest(".reveal")) el.classList.add("active");
  });

  // 3. Contador animado en stats bar
  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll(".counter").forEach(el => animateCounter(el));
      counterObs.unobserve(entry.target);
    });
  }, { threshold: 0.5 });

  const statsBar = document.querySelector(".stats-bar");
  if (statsBar) counterObs.observe(statsBar);

  function animateCounter(el) {
    const target = parseInt(el.dataset.target);
    const duration = 1800;
    const step = 16;
    const increment = target / (duration / step);
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + increment, target);
      el.textContent = Math.floor(current).toLocaleString();
      if (current >= target) clearInterval(timer);
    }, step);
  }

  // 4. Ripple en botones con clase .ripple
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".ripple");
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const wave = document.createElement("span");
    wave.className = "ripple-wave";
    wave.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px`;
    btn.appendChild(wave);
    wave.addEventListener("animationend", () => wave.remove());
  });

  // 5. Quick view overlay en product-image
  document.getElementById("productsGrid").addEventListener("mouseover", (e) => {
    const img = e.target.closest(".product-image");
    if (!img || img.querySelector(".product-quick-view")) return;
    const overlay = document.createElement("div");
    overlay.className = "product-quick-view";
    overlay.innerHTML = "<span>Ver detalles</span>";
    img.appendChild(overlay);
  });

  // 6. Re-observar el grid de productos tras renderizar
  const productsObs = new MutationObserver(() => {
    const grid = document.querySelector(".products-grid");
    if (grid && document.querySelector(".products-section.revealed")) {
      setTimeout(() => grid.classList.add("grid-revealed"), 50);
    }
  });
  productsObs.observe(document.getElementById("productsGrid"), { childList: true });

  // 7. Ripple también en botones .btn-primary y .add-cart-btn
  document.querySelectorAll(".btn-primary, .cart-btn").forEach(btn => {
    btn.classList.add("ripple");
  });

})();

// ===== SKELETON SCREENS =====
function showSkeletons(count = 8) {
  const grid = document.getElementById("productsGrid");
  grid.innerHTML = Array(count).fill(`
    <div class="skeleton-card">
      <div class="skeleton-img"></div>
      <div class="skeleton-body">
        <div class="skeleton-line w80"></div>
        <div class="skeleton-line w60"></div>
        <div class="skeleton-line w40"></div>
        <div class="skeleton-line w50"></div>
      </div>
    </div>`).join("");
}

// ===== POINTS SYSTEM =====
const POINTS_PER_PESO = 1 / 10; // 1 punto por cada $10
const POINTS_TO_REDEEM = 500;   // 500 puntos = $50 descuento
const POINTS_VALUE = 50;

function getPoints() {
  const s = getSession();
  if (!s) return 0;
  return parseInt(localStorage.getItem(`shopnow_points_${s.id}`) || "0");
}
function addPoints(amount) {
  const s = getSession();
  if (!s) return;
  const earned  = Math.floor(amount * POINTS_PER_PESO);
  const current = getPoints();
  localStorage.setItem(`shopnow_points_${s.id}`, current + earned);
  updatePointsBadge();
  return earned;
}
function updatePointsBadge() {
  const badge = document.getElementById("pointsBadge");
  if (!badge) return;
  const pts = getPoints();
  badge.textContent = `⭐ ${pts}`;
  badge.style.display = pts > 0 ? "inline-flex" : "none";
}

// ===== AUTOCOMPLETE =====
let autocompleteTimeout = null;
function handleSearchInput(val) {
  clearTimeout(autocompleteTimeout);
  const dd = document.getElementById("autocompleteDropdown");
  if (!dd) return;
  if (!val.trim()) { dd.classList.remove("open"); return; }
  autocompleteTimeout = setTimeout(() => {
    const q       = val.toLowerCase();
    const matches = products.filter(p =>
      p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    ).slice(0, 6);
    if (matches.length === 0) { dd.classList.remove("open"); return; }
    dd.innerHTML = matches.map(p => `
      <div class="ac-item" onclick="selectAutocomplete(${p.id})">
        <div class="ac-img">
          <img src="${p.img}" alt="${p.name}"
            onerror="this.onerror=null;this.style.display='none';this.nextElementSibling.style.display='flex'" />
          <i class="fa-solid ${p.iconClass}" style="display:none;color:var(--primary);font-size:1rem"></i>
        </div>
        <div class="ac-info">
          <p class="ac-name">${p.name}</p>
          <p class="ac-price">$${p.price.toLocaleString()}</p>
        </div>
      </div>`).join("");
    dd.classList.add("open");
  }, 200);
}
function selectAutocomplete(id) {
  document.getElementById("autocompleteDropdown")?.classList.remove("open");
  document.getElementById("searchInput").value = "";
  openModal(id);
}
document.addEventListener("click", e => {
  if (!e.target.closest(".search-box")) {
    document.getElementById("autocompleteDropdown")?.classList.remove("open");
  }
});

// ===== DARK MODE =====
function toggleDarkMode() {
  const isDark = document.documentElement.dataset.theme === "dark";
  document.documentElement.dataset.theme = isDark ? "light" : "dark";
  localStorage.setItem("shopnow_theme", isDark ? "light" : "dark");
  document.getElementById("darkIcon").className = isDark ? "fa-solid fa-moon" : "fa-solid fa-sun";
}
function initDarkMode() {
  const saved = localStorage.getItem("shopnow_theme");
  if (saved === "dark") {
    document.documentElement.dataset.theme = "dark";
    document.getElementById("darkIcon").className = "fa-solid fa-sun";
  }
}

// ===== WISHLIST =====
function getWishlistKey() {
  const session = getSession();
  return session ? `shopnow_wishlist_${session.id}` : "shopnow_wishlist";
}
function getWishlist() {
  try { return JSON.parse(localStorage.getItem(getWishlistKey()) || "[]"); }
  catch { return []; }
}
function isWishlisted(id) { return getWishlist().includes(id); }
function toggleWishlist(id, btn) {
  let list = getWishlist();
  const on = list.includes(id);
  list = on ? list.filter(x => x !== id) : [...list, id];
  localStorage.setItem(getWishlistKey(), JSON.stringify(list));
  btn.classList.toggle("active", !on);
  btn.querySelector("i").className = !on ? "fa-solid fa-heart" : "fa-regular fa-heart";
  showToast(on ? "Eliminado de favoritos" : "Agregado a favoritos ❤️");
}

// ===== FILTERS & SORT =====
function updatePriceLabel(val) {
  activeMaxPrice = parseInt(val);
  document.getElementById("priceLabel").textContent = `$${parseInt(val).toLocaleString()}`;
}
function setRating(val, btn) {
  activeMinRating = val;
  document.querySelectorAll(".rating-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  applyFilters();
}
function applyFilters() {
  const sort = document.getElementById("sortSelect")?.value || "default";
  let list = products.filter(p => p.price <= activeMaxPrice && p.rating >= activeMinRating);
  if (sort === "price-asc")  list = [...list].sort((a, b) => a.price - b.price);
  if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
  if (sort === "rating")     list = [...list].sort((a, b) => b.rating - a.rating);
  filteredProducts = list;
  renderProducts(filteredProducts);
}
function resetFilters() {
  activeMinRating = 0;
  activeMaxPrice  = 35000;
  const range = document.getElementById("priceRange");
  const sort  = document.getElementById("sortSelect");
  if (range) range.value = 35000;
  if (sort)  sort.value  = "default";
  document.getElementById("priceLabel").textContent = "$35,000";
  document.querySelectorAll(".rating-btn").forEach((b, i) => b.classList.toggle("active", i === 0));
  filteredProducts = [...products];
  renderProducts(filteredProducts);
}

// ===== RECENTLY VIEWED =====
function trackRecentlyViewed(product) {
  let recent = JSON.parse(localStorage.getItem("shopnow_recent") || "[]");
  recent = recent.filter(id => id !== product.id);
  recent.unshift(product.id);
  recent = recent.slice(0, 6);
  localStorage.setItem("shopnow_recent", JSON.stringify(recent));
  renderRecentlyViewed();
}
function renderRecentlyViewed() {
  const ids    = JSON.parse(localStorage.getItem("shopnow_recent") || "[]");
  const section = document.getElementById("recentSection");
  const grid    = document.getElementById("recentGrid");
  if (!section || !grid || ids.length === 0) { if (section) section.style.display = "none"; return; }
  const items = ids.map(id => products.find(p => p.id === id)).filter(Boolean);
  section.style.display = "block";
  grid.innerHTML = items.map(p => `
    <div class="recent-card" onclick="openModal(${p.id})">
      <div class="recent-card-img">
        <img src="${p.img}" alt="${p.name}"
          onerror="this.onerror=null;this.style.display='none';this.nextElementSibling.style.display='flex'" />
        <i class="fa-solid ${p.icon.match(/fa-[\w-]+/g)?.[1] || 'fa-box'}" style="display:none"></i>
      </div>
      <div class="recent-card-info">
        <p class="recent-card-name">${p.name}</p>
        <p class="recent-card-price">$${p.price.toLocaleString()}</p>
      </div>
    </div>`).join("");
}

// ===== NAVBAR: USER SESSION =====
function initNavUser() {
  const session = getSession();
  const loginBtn = document.getElementById("navLoginBtn");
  const userMenu = document.getElementById("navUser");
  if (!loginBtn || !userMenu) return;

  if (session) {
    loginBtn.style.display = "none";
    userMenu.style.display = "block";
    const initial = (session.nombre || "U")[0].toUpperCase();
    document.getElementById("navAvatar").textContent    = initial;
    document.getElementById("navUserName").textContent  = session.nombre;
    document.getElementById("navFullName").textContent  = `${session.nombre} ${session.apellido || ""}`.trim();
    document.getElementById("navUserEmail").textContent = session.correo;
  } else {
    loginBtn.style.display = "";
    userMenu.style.display = "none";
  }
}

function toggleUserMenu() {
  const btn = document.querySelector(".nav-user-btn");
  const dd  = document.getElementById("navUserDropdown");
  btn.classList.toggle("open");
  dd.classList.toggle("open");
}

// Close dropdown when clicking outside
document.addEventListener("click", (e) => {
  if (!e.target.closest(".nav-user")) {
    document.querySelector(".nav-user-btn")?.classList.remove("open");
    document.getElementById("navUserDropdown")?.classList.remove("open");
  }
});

// ===== COMPARADOR =====
function toggleCompare(id, btn) {
  const p   = products.find(x => x.id === id);
  if (!p) return;
  const idx = compareList.findIndex(x => x.id === id);
  if (idx >= 0) {
    compareList.splice(idx, 1);
    btn.classList.remove("active");
  } else {
    if (compareList.length >= 3) { showToast("Máximo 3 productos para comparar"); return; }
    compareList.push(p);
    btn.classList.add("active");
  }
  updateCompareBar();
}

function updateCompareBar() {
  const bar  = document.getElementById("compareBar");
  const prod = document.getElementById("compareBarProducts");
  const cnt  = document.getElementById("compareCount");
  if (!bar) return;
  if (!compareList.length) { bar.style.display = "none"; return; }
  bar.style.display = "flex";
  if (cnt) cnt.textContent = compareList.length;
  if (prod) {
    prod.innerHTML = compareList.map(p => `
      <div class="compare-bar-item">
        <img src="${p.img}" alt="${p.name}" onerror="this.style.display='none'" />
        <span>${p.name}</span>
        <button onclick="removeFromCompare(${p.id})"><i class="fa-solid fa-xmark"></i></button>
      </div>`).join("");
  }
}

function removeFromCompare(id) {
  compareList = compareList.filter(p => p.id !== id);
  document.querySelectorAll(`.compare-btn[data-id="${id}"]`).forEach(b => b.classList.remove("active"));
  updateCompareBar();
}

function clearComparison() {
  compareList = [];
  document.querySelectorAll(".compare-btn").forEach(b => b.classList.remove("active"));
  updateCompareBar();
}

function openComparison() {
  if (compareList.length < 2) { showToast("Selecciona al menos 2 productos"); return; }
  const rows = [
    { label:"Imagen",         fn: p => `<img src="${p.img}" alt="${p.name}" class="compare-img" onerror="this.style.display='none'" />` },
    { label:"Nombre",         fn: p => `<strong>${p.name}</strong>` },
    { label:"Categoría",      fn: p => p.category },
    { label:"Precio",         fn: p => `<strong style="color:var(--primary)">$${p.price.toLocaleString()}</strong>` },
    { label:"Precio anterior",fn: p => p.oldPrice ? `<span style="text-decoration:line-through;color:#999">$${p.oldPrice.toLocaleString()}</span>` : "—" },
    { label:"Calificación",   fn: p => `${"★".repeat(Math.floor(p.rating))} ${p.rating}` },
    { label:"Reseñas",        fn: p => `${p.reviews} reseñas` },
    { label:"Stock",          fn: p => p.stock===0 ? '<span style="color:red">Agotado</span>' : p.stock<=20 ? `<span style="color:orange">¡Solo ${p.stock}!</span>` : '<span style="color:green">En stock</span>' },
    { label:"Variantes",      fn: p => p.variants ? p.variants.options.join(", ") : "—" },
    { label:"",               fn: p => `<button class="btn-primary" style="font-size:0.82rem;padding:7px 14px" onclick="addToCart(event,${p.id});closeComparison()"><i class="fa-solid fa-cart-plus"></i> Agregar</button>` },
  ];
  const html = `
    <table class="compare-table">
      <thead><tr><th class="compare-row-label"></th>${compareList.map(p=>`<th>${p.name}</th>`).join("")}</tr></thead>
      <tbody>${rows.map(row=>`<tr><td class="compare-row-label">${row.label}</td>${compareList.map(p=>`<td>${row.fn(p)}</td>`).join("")}</tr>`).join("")}</tbody>
    </table>`;
  document.getElementById("compareTableWrap").innerHTML = html;
  document.getElementById("compareOverlay").classList.add("active");
  document.getElementById("compareModal").classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeComparison() {
  document.getElementById("compareOverlay").classList.remove("active");
  document.getElementById("compareModal").classList.remove("open");
  document.body.style.overflow = "";
}

// ===== INIT =====
showSkeletons(8);
setTimeout(() => renderProducts(products), 600);
startCountdown();
initNavUser();
initDarkMode();
renderRecentlyViewed();
updatePointsBadge();
