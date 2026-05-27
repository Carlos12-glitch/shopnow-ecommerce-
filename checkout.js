// ===== ESTADO =====
const cart     = JSON.parse(localStorage.getItem("shopnow_cart") || "[]");
const TAX_RATE = 0.16;
let activeTab      = "card";
let savedMethods   = [];
let activeCoupon   = null;
let shippingCost   = 0;
const API          = "/api/metodos-pago";

const COUPONS_FALLBACK = {
  "SHOPNOW10":  0.10,
  "SHOPNOW20":  0.20,
  "BIENVENIDO": 0.15,
  "VERANO25":   0.25,
};

// ===== PUNTOS =====
const POINTS_REDEEM = 500; // 500 pts necesarios para canjear
const POINTS_VALUE  = 50;  // $50 MXN de descuento
let usePoints = false;

function checkoutGetSession() {
  try { return JSON.parse(localStorage.getItem("shopnow_session") || "null"); } catch { return null; }
}
function checkoutGetPoints(session) {
  if (!session) return 0;
  return parseInt(localStorage.getItem(`shopnow_points_${session.id}`) || "0");
}
function initPoints() {
  const session = checkoutGetSession();
  const points  = checkoutGetPoints(session);
  const row     = document.getElementById("pointsRedeemRow");
  if (!row) return;
  if (session && points >= POINTS_REDEEM) {
    document.getElementById("userPointsLabel").textContent = `⭐ ${points} puntos disponibles`;
    row.style.display = "flex";
  }
}
function togglePoints(checked) {
  usePoints = checked;
  updateAmounts();
}
function awardPoints(total) {
  const session = checkoutGetSession();
  if (!session) return;
  const earned  = Math.floor(total / 10);
  const key     = `shopnow_points_${session.id}`;
  const current = parseInt(localStorage.getItem(key) || "0");
  const deduct  = usePoints ? POINTS_REDEEM : 0;
  localStorage.setItem(key, Math.max(0, current - deduct + earned));
}

// ===== INIT =====
(async function init() {
  if (cart.length === 0) { window.location.href = "index.html"; return; }
  renderSummary();
  updateAmounts();
  generateOrderId();
  initPoints();
  await loadSavedMethods();
  renderSavedMethods();
})();

// ===== RESUMEN DEL PEDIDO =====
function renderSummary() {
  document.getElementById("summaryItems").innerHTML = cart.map(item => `
    <div class="summary-item">
      <div class="summary-item-img">
        <img src="${item.img}" alt="${item.name}"
          onerror="this.onerror=null;this.style.display='none'" />
      </div>
      <div class="summary-item-info">
        <p class="summary-item-name">${item.name}</p>
        <p class="summary-item-qty">Cantidad: ${item.qty}</p>
      </div>
      <span class="summary-item-price">$${(item.price * item.qty).toLocaleString()}</span>
    </div>
  `).join("");
}

function updateAmounts() {
  const subtotal    = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const couponDisc  = activeCoupon ? Math.round(subtotal * activeCoupon.discount) : 0;
  const pointsDisc  = usePoints ? POINTS_VALUE : 0;
  const discounted  = subtotal - couponDisc - pointsDisc;
  const tax         = Math.round(Math.max(0, discounted) * TAX_RATE);
  const total       = Math.max(0, discounted) + tax + shippingCost;
  const fmt         = `$${total.toLocaleString()}`;

  document.getElementById("summarySubtotal").textContent = `$${subtotal.toLocaleString()}`;
  document.getElementById("summaryTax").textContent      = `$${tax.toLocaleString()}`;
  document.getElementById("summaryTotal").textContent    = fmt;

  const shipEl = document.getElementById("summaryShipping");
  if (shipEl) shipEl.innerHTML = shippingCost > 0
    ? `$${shippingCost.toLocaleString()}`
    : `<i class="fa-solid fa-truck"></i> Gratis`;

  const discountRow = document.getElementById("discountRow");
  if (discountRow) {
    discountRow.style.display = activeCoupon ? "flex" : "none";
    if (activeCoupon) {
      document.getElementById("discountLabel").textContent   = activeCoupon.code;
      document.getElementById("summaryDiscount").textContent = `-$${couponDisc.toLocaleString()}`;
    }
  }
  const pointsRow = document.getElementById("pointsDiscountRow");
  if (pointsRow) pointsRow.style.display = usePoints ? "flex" : "none";

  document.querySelectorAll("#payAmount,#payAmountPaypal,#payAmountMp")
    .forEach(el => el.textContent = fmt);
  const speiMonto = document.getElementById("speiMonto");
  if (speiMonto) speiMonto.textContent = fmt;
}

// ===== CUPÓN =====
async function applyCoupon() {
  const code = document.getElementById("couponInput")?.value.trim().toUpperCase();
  if (!code) { showCouponMsg("Ingresa un código.", "err"); return; }
  try {
    const res  = await fetch("/api/cupones/validar", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ codigo: code })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Inválido");
    activeCoupon = { code: data.codigo, discount: data.descuento };
    showCouponMsg(`✓ Cupón ${data.codigo}: ${(data.descuento*100).toFixed(0)}% de descuento aplicado.`, "ok");
    updateAmounts();
  } catch(e) {
    if (COUPONS_FALLBACK[code]) {
      activeCoupon = { code, discount: COUPONS_FALLBACK[code] };
      showCouponMsg(`✓ Descuento del ${COUPONS_FALLBACK[code]*100}% aplicado.`, "ok");
      updateAmounts();
    } else {
      activeCoupon = null;
      showCouponMsg(e.message || "Código inválido o expirado.", "err");
      updateAmounts();
    }
  }
}
function showCouponMsg(text, type) {
  const el = document.getElementById("couponMsg");
  if (!el) return;
  el.textContent = text;
  el.className = `coupon-msg ${type}`;
}

// ===== CALCULADORA DE ENVÍO =====
async function calculateShipping() {
  const cp = document.getElementById("cpInput")?.value.trim();
  if (!cp || cp.length < 5) { showToast("Ingresa un CP válido (5 dígitos)"); return; }
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  try {
    const res  = await fetch("/api/calcular-envio", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ cp, subtotal })
    });
    const data = await res.json();
    shippingCost = data.costo;
    showShippingResult(data.gratis, data.costo, data.dias, cp);
  } catch {
    shippingCost = subtotal >= 1999 ? 0 : 149;
    showShippingResult(shippingCost === 0, shippingCost, "5-7", cp);
  }
  updateAmounts();
}
function showShippingResult(gratis, costo, dias, cp) {
  const el   = document.getElementById("shippingResult");
  if (!el) return;
  el.style.display = "flex";
  document.getElementById("shippingCostLabel").textContent = gratis ? "¡Envío gratis!" : `Envío a CP ${cp}`;
  document.getElementById("shippingDaysLabel").textContent = `Entrega estimada: ${dias} días hábiles`;
  const badge = document.getElementById("shippingCostBadge");
  badge.textContent  = gratis ? "GRATIS" : `$${costo}`;
  badge.style.background = gratis ? "#43a047" : "#e8520a";
}

// ===== ORDER ID =====
function generateOrderId() {
  const id = "SN-" + Date.now().toString(36).toUpperCase()
           + "-" + Math.random().toString(36).slice(2,6).toUpperCase();
  document.getElementById("orderId").textContent     = id;
  document.getElementById("speiConcepto").textContent = id;
}

// ===== TABS =====
function selectTab(tab) {
  activeTab = tab;
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
  document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
  event.currentTarget.classList.add("active");
  document.getElementById("tab-" + tab).classList.add("active");
}

// ===== CARD PREVIEW =====
function formatCardNumber(input) {
  const val = input.value.replace(/\D/g, "").slice(0, 16);
  input.value = val.replace(/(.{4})/g, "$1 ").trim();
  updateCardPreview();
  detectCardNetwork(val);
}

function formatExpiry(input) {
  let val = input.value.replace(/\D/g, "").slice(0, 4);
  if (val.length >= 2) val = val.slice(0,2) + "/" + val.slice(2);
  input.value = val;
  document.getElementById("cardExpDisplay").textContent = val || "MM/AA";
}

function updateCardPreview() {
  const num  = document.getElementById("cardNumber").value || "";
  const name = document.getElementById("cardName").value.toUpperCase();
  const exp  = document.getElementById("cardExp").value || "MM/AA";
  const raw  = num.replace(/\s/g, "");
  document.getElementById("cardNumberDisplay").textContent =
    (raw + "•".repeat(16)).slice(0,16).replace(/(.{4})/g,"$1 ").trim();
  document.getElementById("cardNameDisplay").textContent = name || "NOMBRE APELLIDO";
  document.getElementById("cardExpDisplay").textContent  = exp;
}

function updateCvvPreview(input) {
  document.getElementById("cardCvvDisplay").textContent =
    input.value ? "•".repeat(input.value.length) : "•••";
}

function flipCard(toBack) {
  document.getElementById("cardPreview").classList.toggle("flipped", toBack);
}

const cardNetworks = {
  visa:       { pattern: /^4/,              logo: "https://raw.githubusercontent.com/gilbarbara/logos/main/logos/visa.svg",       name: "Visa" },
  mastercard: { pattern: /^5[1-5]|^2[2-7]/, logo: "https://raw.githubusercontent.com/gilbarbara/logos/main/logos/mastercard.svg", name: "Mastercard" },
  amex:       { pattern: /^3[47]/,           logo: "https://raw.githubusercontent.com/gilbarbara/logos/main/logos/amex.svg",       name: "Amex" },
};

let detectedNetwork = null;
function detectCardNetwork(num) {
  const img = document.getElementById("cardNetworkImg");
  for (const [key, net] of Object.entries(cardNetworks)) {
    if (net.pattern.test(num)) {
      img.src = net.logo; img.style.display = "block";
      detectedNetwork = key; return;
    }
  }
  img.src = ""; img.style.display = "none";
  detectedNetwork = null;
}

// ===== API — CRUD DE MÉTODOS DE PAGO =====

async function loadSavedMethods() {
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error();
    savedMethods = await res.json();
  } catch {
    // Si el servidor no responde, cargar desde localStorage como respaldo
    savedMethods = JSON.parse(localStorage.getItem("shopnow_payment_methods") || "[]");
  }
}

async function apiSaveMethod(method) {
  try {
    const res = await fetch(API, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(method),
    });
    if (!res.ok) throw new Error();
  } catch {
    // Respaldo en localStorage si el servidor no está disponible
    const local = JSON.parse(localStorage.getItem("shopnow_payment_methods") || "[]");
    local.push(method);
    localStorage.setItem("shopnow_payment_methods", JSON.stringify(local));
  }
}

async function apiDeleteMethod(id) {
  try {
    await fetch(`${API}/${id}`, { method: "DELETE" });
  } catch {
    const local = JSON.parse(localStorage.getItem("shopnow_payment_methods") || "[]");
    localStorage.setItem("shopnow_payment_methods",
      JSON.stringify(local.filter(m => m.id !== id)));
  }
}

function buildMethodId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2,6);
}

async function deleteSavedMethod(id) {
  await apiDeleteMethod(id);
  savedMethods = savedMethods.filter(m => m.id !== id);
  renderSavedMethods();
}

// ===== RENDER MÉTODOS GUARDADOS =====
const methodIcons = {
  card:        { icon: "fa-credit-card",      color: "#6c63ff", label: "Tarjeta" },
  paypal:      { icon: "fa-brands fa-paypal", color: "#003087", label: "PayPal" },
  oxxo:        { icon: "fa-store",            color: "#e2122a", label: "OXXO" },
  mercadopago: { icon: "fa-wallet",           color: "#009ee3", label: "Mercado Pago" },
};

function renderSavedMethods() {
  const panel = document.getElementById("savedMethodsPanel");
  const list  = document.getElementById("savedMethodsList");

  if (savedMethods.length === 0) {
    panel.style.display = "none";
    showNewMethodForm();
    return;
  }

  panel.style.display = "block";
  document.querySelector(".payment-tabs").style.display = "none";
  document.querySelectorAll(".tab-panel").forEach(p => p.style.display = "none");

  list.innerHTML = savedMethods.map(m => {
    const meta = methodIcons[m.tipo] || methodIcons.card;
    const net  = cardNetworks[m.red];
    const title = m.alias ||
      (m.tipo === "card" ? `${net?.name || "Tarjeta"} ••••${m.ultimos_4}` : m.correo || meta.label);
    const sub = m.tipo === "card"
      ? `${net?.name || ""} · Vence ${m.vencimiento} · ${m.titular}`
      : `${meta.label} · ${new Date(m.guardado_en).toLocaleDateString("es-MX")}`;

    return `
      <div class="saved-method-card" onclick="useSavedMethod('${m.id}')">
        <div class="sm-icon" style="background:${meta.color}20;color:${meta.color}">
          <i class="fa-solid ${meta.icon}"></i>
        </div>
        <div class="sm-info">
          <p class="sm-title">${title}</p>
          <p class="sm-sub">${sub}</p>
        </div>
        <div class="sm-actions">
          <button class="sm-use-btn"
            onclick="event.stopPropagation();useSavedMethod('${m.id}')">Usar</button>
          <button class="sm-delete-btn"
            onclick="event.stopPropagation();deleteSavedMethod('${m.id}')" title="Eliminar">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>`;
  }).join("");
}

function useSavedMethod(id) {
  const m = savedMethods.find(x => x.id === id);
  if (!m) return;

  document.querySelectorAll(".saved-method-card").forEach(c => c.classList.remove("selected"));
  document.querySelector(`.saved-method-card[onclick*="${id}"]`)?.classList.add("selected");

  showNewMethodForm();

  if (m.tipo === "card") {
    switchToTab("card");
    document.getElementById("cardName").value   = m.titular  || "";
    document.getElementById("cardExp").value    = m.vencimiento || "";
    document.getElementById("cardNumber").value = `•••• •••• •••• ${m.ultimos_4}`;
    document.getElementById("cardAlias").value  = m.alias    || "";
    if (m.red && cardNetworks[m.red]) {
      const img = document.getElementById("cardNetworkImg");
      img.src = cardNetworks[m.red].logo; img.style.display = "block";
      detectedNetwork = m.red;
    }
    updateCardPreview();
    showPrefilledNotice(`Tarjeta ••••${m.ultimos_4} seleccionada. Solo ingresa tu CVV.`);
  } else if (m.tipo === "paypal") {
    switchToTab("paypal");
    document.getElementById("paypalEmail").value = m.correo || "";
    document.getElementById("paypalAlias").value  = m.alias  || "";
    showPrefilledNotice(`Cuenta PayPal ${m.correo} lista para pagar.`);
  } else if (m.tipo === "oxxo") {
    switchToTab("oxxo");
    document.getElementById("oxxoEmail").value = m.correo || "";
    showPrefilledNotice(`Correo OXXO precargado: ${m.correo}`);
  } else if (m.tipo === "mercadopago") {
    switchToTab("mercadopago");
    document.getElementById("mpEmail").value = m.correo || "";
    document.getElementById("mpAlias").value = m.alias  || "";
    showPrefilledNotice(`Cuenta Mercado Pago ${m.correo} lista.`);
  }
}

function switchToTab(tab) {
  activeTab = tab;
  document.querySelectorAll(".tab-btn").forEach(b => {
    b.classList.toggle("active", b.getAttribute("onclick")?.includes(`'${tab}'`));
  });
  document.querySelectorAll(".tab-panel").forEach(p => {
    p.style.display = "";
    p.classList.toggle("active", p.id === "tab-" + tab);
  });
}

function showNewMethodForm() {
  document.querySelector(".payment-tabs").style.display = "flex";
  document.querySelectorAll(".tab-panel").forEach(p => { p.style.display = ""; });
  document.getElementById("tab-" + activeTab).classList.add("active");
}

function showPrefilledNotice(msg) {
  document.getElementById("prefilledNotice")?.remove();
  const notice = Object.assign(document.createElement("div"), {
    id: "prefilledNotice", className: "prefilled-notice",
    innerHTML: `<i class="fa-solid fa-circle-info"></i> ${msg}`
  });
  const panel = document.getElementById("tab-" + activeTab);
  panel.insertBefore(notice, panel.firstChild);
  setTimeout(() => notice.remove(), 5000);
}

// ===== GUARDAR MÉTODO TRAS EL PAGO =====
async function collectAndSave() {
  let method = null;

  if (activeTab === "card" && document.getElementById("saveCard")?.checked) {
    const raw = document.getElementById("cardNumber").value.replace(/\D/g,"");
    if (raw.length < 4) return;
    method = {
      id:         buildMethodId(),
      tipo:       "card",
      red:        detectedNetwork || "visa",
      ultimos_4:  raw.slice(-4),
      titular:    document.getElementById("cardName").value.toUpperCase().trim(),
      vencimiento:document.getElementById("cardExp").value.trim(),
      alias:      document.getElementById("cardAlias")?.value.trim() || "",
      correo:     null,
    };
  } else if (activeTab === "paypal" && document.getElementById("savePaypal")?.checked) {
    const correo = document.getElementById("paypalEmail")?.value.trim();
    if (!correo) return;
    method = { id: buildMethodId(), tipo: "paypal", correo,
      alias: document.getElementById("paypalAlias")?.value.trim() || "",
      red: null, ultimos_4: null, titular: null, vencimiento: null };
  } else if (activeTab === "oxxo" && document.getElementById("saveOxxo")?.checked) {
    const correo = document.getElementById("oxxoEmail")?.value.trim();
    if (!correo) return;
    method = { id: buildMethodId(), tipo: "oxxo", correo, alias: "OXXO - " + correo,
      red: null, ultimos_4: null, titular: null, vencimiento: null };
  } else if (activeTab === "mercadopago" && document.getElementById("saveMp")?.checked) {
    const correo = document.getElementById("mpEmail")?.value.trim();
    if (!correo) return;
    method = { id: buildMethodId(), tipo: "mercadopago", correo,
      alias: document.getElementById("mpAlias")?.value.trim() || "",
      red: null, ultimos_4: null, titular: null, vencimiento: null };
  }

  if (method) {
    await apiSaveMethod(method);
    savedMethods.unshift(method);
  }
}

// ===== PROCESAR PAGO =====
function processPayment(e) {
  e.preventDefault();
  const btn = e.currentTarget.tagName === "BUTTON"
    ? e.currentTarget
    : document.querySelector("#tab-" + activeTab + " .btn-pay");
  btn.classList.add("loading");
  btn.disabled = true;

  const messages = {
    card:        "¡Tu pago con tarjeta fue procesado exitosamente!",
    paypal:      "¡Pago completado vía PayPal exitosamente!",
    oxxo:        "¡Referencia generada! Tienes 24 h para pagar en OXXO.",
    spei:        "¡Recibimos tu notificación! Verificando transferencia...",
    mercadopago: "¡Pago completado con Mercado Pago!",
  };

  setTimeout(async () => {
    btn.classList.remove("loading");
    btn.disabled = false;
    await collectAndSave();
    document.getElementById("confirmMsg").textContent = messages[activeTab] || messages.card;
    showConfirmation();
  }, 2000);
}

function showConfirmation() {
  const subtotal   = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const couponDisc = activeCoupon ? Math.round(subtotal * activeCoupon.discount) : 0;
  const total      = Math.max(0, subtotal - couponDisc - (usePoints ? POINTS_VALUE : 0))
                   + Math.round(Math.max(0, subtotal - couponDisc - (usePoints ? POINTS_VALUE : 0)) * TAX_RATE);
  saveOrder();
  awardPoints(total);
  localStorage.removeItem("shopnow_cart");

  // Show points earned in confirmation
  const earned = Math.floor(total / 10);
  const bonus  = document.getElementById("confirmPoints");
  if (bonus) {
    bonus.textContent = `+${earned} puntos ganados con esta compra`;
    bonus.style.display = "block";
  }

  document.getElementById("confirmationOverlay").classList.add("show");
}

function saveOrder() {
  try {
    const subtotal    = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const couponDisc  = activeCoupon ? Math.round(subtotal * activeCoupon.discount) : 0;
    const pointsDisc  = usePoints ? POINTS_VALUE : 0;
    const discounted  = Math.max(0, subtotal - couponDisc - pointsDisc);
    const tax         = Math.round(discounted * TAX_RATE);
    const total       = discounted + tax;
    const session     = JSON.parse(localStorage.getItem("shopnow_session") || "null");
    const orderId     = document.getElementById("orderId")?.textContent || "SN-???";
    const order = {
      id:           orderId,
      fecha:        new Date().toLocaleDateString("es-MX", { year:"numeric", month:"long", day:"numeric" }),
      items:        cart.map(i => ({ name: i.name, price: i.price, qty: i.qty, img: i.img })),
      subtotal, couponDisc, pointsDisc, tax, total,
      metodo:       activeTab,
      cupon:        activeCoupon?.code || null,
      puntosUsados: usePoints ? POINTS_REDEEM : 0,
      puntosGanados:Math.floor(total / 10),
      usuario_id:   session?.id || "guest",
    };
    const orders = JSON.parse(localStorage.getItem("shopnow_orders") || "[]");
    orders.push(order);
    localStorage.setItem("shopnow_orders", JSON.stringify(orders));
  } catch { /* silently fail */ }
}
