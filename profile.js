// ===== PRODUCTS (needed for wishlist display) =====
const PRODUCTS_DATA = [
  { id:1,  name:"MacBook Pro M3",     price:28999, img:"https://images.unsplash.com/photo-1498049860654-af1a5c566876?auto=format&fit=crop&w=600&q=80", icon:"fa-laptop" },
  { id:2,  name:"iPhone 16 Pro",      price:22499, img:"https://images.unsplash.com/photo-1702289612974-dc67693a8cd4?auto=format&fit=crop&w=600&q=80", icon:"fa-mobile-screen" },
  { id:3,  name:"Nike Air Max 270",   price:2499,  img:"https://images.unsplash.com/photo-1562613521-6b5293e5b0ea?auto=format&fit=crop&w=600&q=80", icon:"fa-shoe-prints" },
  { id:4,  name:"Playera Oversize",   price:549,   img:"https://images.unsplash.com/photo-1620799139507-2a76f79a2f4d?auto=format&fit=crop&w=600&q=80", icon:"fa-shirt" },
  { id:5,  name:'Smart TV 55" 4K',    price:12999, img:"https://images.unsplash.com/photo-1521607630287-ee2e81ad3ced?auto=format&fit=crop&w=600&q=80", icon:"fa-tv" },
  { id:6,  name:"Sofá Modular 3P",    price:8999,  img:"https://images.unsplash.com/photo-1757416654883-c73c67b3382b?auto=format&fit=crop&w=600&q=80", icon:"fa-couch" },
  { id:7,  name:"Sony WH-1000XM5",   price:6499,  img:"https://images.unsplash.com/photo-1621208587196-0b2a7d2aeb03?auto=format&fit=crop&w=600&q=80", icon:"fa-headphones" },
  { id:8,  name:"Balón de Fútbol Pro",price:899,   img:"https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=600&q=80", icon:"fa-futbol" },
  { id:9,  name:"Cafetera Espresso",  price:3299,  img:"https://images.unsplash.com/photo-1754847307554-314a05e2ced6?auto=format&fit=crop&w=600&q=80", icon:"fa-mug-hot" },
  { id:10, name:"Tenis Running X1",   price:1899,  img:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80", icon:"fa-person-running" },
  { id:11, name:"Sudadera Premium",   price:849,   img:"https://images.unsplash.com/photo-1703531293255-0b16d10fe09f?auto=format&fit=crop&w=600&q=80", icon:"fa-vest" },
  { id:12, name:'Bicicleta MTB 29"',  price:9500,  img:"https://images.unsplash.com/photo-1506316940527-4d1c138978a0?auto=format&fit=crop&w=600&q=80", icon:"fa-bicycle" },
];

// ===== INIT =====
let session = null;

window.addEventListener("DOMContentLoaded", () => {
  session = getSession();
  if (!session) { window.location.href = "login.html"; return; }
  populateNavbar();
  populateHero();
  renderOrders();
  renderWishlist();

  // Hash navigation
  const hash = window.location.hash.replace("#", "");
  const validTabs = ["info","seguridad","pedidos","favoritos","direcciones","devoluciones"];
  if (validTabs.includes(hash)) switchTab(hash);
});

// ===== NAVBAR =====
function populateNavbar() {
  document.getElementById("navAvatar").textContent   = (session.nombre || "U")[0].toUpperCase();
  document.getElementById("navUserName").textContent = session.nombre;
  document.getElementById("navFullName").textContent = `${session.nombre} ${session.apellido || ""}`.trim();
  document.getElementById("navUserEmail").textContent = session.correo;
}

function toggleUserMenu() {
  document.getElementById("navUserBtn")?.classList.toggle("open");
  document.getElementById("navUserDropdown")?.classList.toggle("open");
}
document.addEventListener("click", e => {
  if (!e.target.closest(".nav-user")) {
    document.getElementById("navUserBtn")?.classList.remove("open");
    document.getElementById("navUserDropdown")?.classList.remove("open");
  }
});

function logoutProfile() { clearSession(); window.location.href = "index.html"; }

// ===== HERO =====
function getUserPoints() {
  if (!session) return 0;
  return parseInt(localStorage.getItem(`shopnow_points_${session.id}`) || "0");
}

function populateHero() {
  const fullName = `${session.nombre} ${session.apellido || ""}`.trim();
  document.getElementById("profileAvatar").textContent = (session.nombre || "U")[0].toUpperCase();
  document.getElementById("profileName").textContent   = fullName;
  document.getElementById("profileEmail").textContent  = session.correo;

  const orders   = getOrders();
  const wishlist = getWishlist();
  const points   = getUserPoints();
  document.getElementById("pstatOrders").textContent = orders.length;
  document.getElementById("pstatWish").textContent   = wishlist.length;
  document.getElementById("pstatPoints").textContent = points;

  if (orders.length > 0) {
    document.getElementById("ordersBadge").textContent    = orders.length;
    document.getElementById("ordersBadge").style.display  = "inline-block";
  }
  if (wishlist.length > 0) {
    document.getElementById("wishBadge").textContent   = wishlist.length;
    document.getElementById("wishBadge").style.display = "inline-block";
  }

  // Prefill info form
  document.getElementById("pNombre").value   = session.nombre  || "";
  document.getElementById("pApellido").value = session.apellido || "";
  document.getElementById("pCorreo").value   = session.correo  || "";
  document.getElementById("pTelefono").value = session.telefono || "";
}

// ===== TABS =====
function switchTab(tab) {
  document.querySelectorAll(".p-tab").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
  document.querySelectorAll(".p-panel").forEach(p => p.classList.remove("active"));
  document.getElementById("panel-" + tab)?.classList.add("active");
  window.history.replaceState(null, "", "#" + tab);
  if (tab === "direcciones")  loadAddresses();
  if (tab === "devoluciones") loadDevolucionesProfile();
}

// ===== PROFILE INFO FORM =====
function saveInfo(e) {
  e.preventDefault();
  const nombre   = document.getElementById("pNombre").value.trim();
  const apellido = document.getElementById("pApellido").value.trim();
  const correo   = document.getElementById("pCorreo").value.trim();
  const telefono = document.getElementById("pTelefono").value.trim();

  if (!nombre || !correo) {
    showPAlert("infoAlert", "El nombre y el correo son obligatorios.", "error");
    return;
  }

  // Update session
  session = { ...session, nombre, apellido, correo, telefono };
  saveSession(session);

  // Update navbar & hero
  populateNavbar();
  document.getElementById("profileName").textContent = `${nombre} ${apellido}`.trim();
  document.getElementById("profileEmail").textContent = correo;
  document.getElementById("navAvatar").textContent    = nombre[0].toUpperCase();
  document.getElementById("profileAvatar").textContent = nombre[0].toUpperCase();

  showPAlert("infoAlert", "Información actualizada correctamente.", "success");
  profileToast("Cambios guardados");
}

// ===== CHANGE PASSWORD =====
function changePassword(e) {
  e.preventDefault();
  const current = document.getElementById("pwCurrent").value;
  const newPw   = document.getElementById("pwNew").value;
  const confirm = document.getElementById("pwConfirm").value;

  if (!current) { showPAlert("pwAlert", "Ingresa tu contraseña actual.", "error"); return; }
  if (newPw.length < 8) { showPAlert("pwAlert", "La nueva contraseña debe tener al menos 8 caracteres.", "error"); return; }
  if (newPw !== confirm) { showPAlert("pwAlert", "Las contraseñas no coinciden.", "error"); return; }

  // Verify against localStorage user record
  const users = JSON.parse(localStorage.getItem("shopnow_users") || "[]");
  const user  = users.find(u => u.correo === session.correo);
  if (user && user.password !== current) {
    showPAlert("pwAlert", "La contraseña actual es incorrecta.", "error"); return;
  }
  if (user) {
    user.password = newPw;
    localStorage.setItem("shopnow_users", JSON.stringify(users));
  }

  document.getElementById("pwCurrent").value = "";
  document.getElementById("pwNew").value     = "";
  document.getElementById("pwConfirm").value = "";
  document.getElementById("profilePwStrength").style.display = "none";
  showPAlert("pwAlert", "Contraseña actualizada correctamente.", "success");
  profileToast("Contraseña cambiada");
}

function profileCheckStrength(pw) {
  const wrap  = document.getElementById("profilePwStrength");
  const fill  = document.getElementById("profilePwFill");
  const label = document.getElementById("profilePwLabel");
  wrap.style.display = pw.length > 0 ? "block" : "none";
  let score = 0;
  if (pw.length >= 8)          score++;
  if (/[A-Z]/.test(pw))        score++;
  if (/[0-9]/.test(pw))        score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const l = [
    { pct:"25%", bg:"#e53935", text:"Muy débil",  color:"#e53935" },
    { pct:"50%", bg:"#fb8c00", text:"Débil",      color:"#fb8c00" },
    { pct:"75%", bg:"#f5b800", text:"Buena",      color:"#f5b800" },
    { pct:"100%",bg:"#43a047", text:"Muy fuerte", color:"#43a047" },
  ][Math.max(0, score - 1)];
  fill.style.width      = l.pct;
  fill.style.background = l.bg;
  label.textContent     = l.text;
  label.style.color     = l.color;
}

function togglePwField(id, btn) {
  const inp = document.getElementById(id);
  const ico = btn.querySelector("i");
  inp.type = inp.type === "password" ? "text" : "password";
  ico.className = inp.type === "password" ? "fa-solid fa-eye" : "fa-solid fa-eye-slash";
}

// ===== ORDERS =====
const METODO_LABELS = {
  card: "Tarjeta",  paypal: "PayPal",
  oxxo: "OXXO",    spei: "SPEI",
  mercadopago: "Mercado Pago",
};
const METODO_ICONS = {
  card: "fa-credit-card", paypal: "fa-brands fa-paypal",
  oxxo: "fa-store",       spei: "fa-building-columns",
  mercadopago: "fa-wallet",
};

function getOrders() {
  try {
    const all = JSON.parse(localStorage.getItem("shopnow_orders") || "[]");
    return session ? all.filter(o => o.usuario_id === session.id) : all;
  } catch { return []; }
}

function renderOrders() {
  const orders  = getOrders();
  const list    = document.getElementById("ordersList");
  if (orders.length === 0) {
    list.innerHTML = `
      <div class="order-empty">
        <i class="fa-solid fa-bag-shopping"></i>
        <p>Aún no has realizado ningún pedido.</p>
        <a href="index.html" style="display:inline-flex;align-items:center;gap:8px;background:var(--primary);color:white;padding:10px 22px;border-radius:50px;text-decoration:none;font-weight:600;font-size:0.9rem">
          <i class="fa-solid fa-store"></i> Ir a la tienda
        </a>
      </div>`;
    return;
  }
  list.innerHTML = orders.slice().reverse().map(o => `
    <div class="order-card">
      <div class="order-header">
        <div>
          <p class="order-id">${o.id}</p>
          <p class="order-date">${o.fecha}</p>
        </div>
        <span class="order-status"><i class="fa-solid fa-check"></i> Completado</span>
      </div>
      <div class="order-body">
        <div class="order-items">
          ${o.items.map(item => `
            <div class="order-item">
              <div class="order-item-img">
                <img src="${item.img}" alt="${item.name}"
                  onerror="this.style.display='none'" />
              </div>
              <div>
                <p class="order-item-name">${item.name}</p>
                <p class="order-item-qty">Cantidad: ${item.qty} · $${(item.price * item.qty).toLocaleString()}</p>
              </div>
            </div>`).join("")}
        </div>
        <div class="order-footer">
          <span class="order-metodo">
            <i class="fa-solid ${METODO_ICONS[o.metodo] || 'fa-credit-card'}"></i>
            ${METODO_LABELS[o.metodo] || o.metodo}
          </span>
          <span class="order-total">Total: $${o.total.toLocaleString()}</span>
        </div>
        <div class="order-actions">
          ${o.puntosGanados ? `<span class="order-points-badge">⭐ +${o.puntosGanados} pts ganados</span>` : ""}
          <button class="order-track-btn" onclick="openTracking('${o.id}', '${o.fecha}')">
            <i class="fa-solid fa-truck"></i> Ver seguimiento
          </button>
        </div>
      </div>
    </div>`).join("");
}

// ===== WISHLIST =====
function getWishlist() {
  const key = session ? `shopnow_wishlist_${session.id}` : "shopnow_wishlist";
  try { return JSON.parse(localStorage.getItem(key) || "[]"); }
  catch { return []; }
}

function removeFromWishlist(productId) {
  const key  = session ? `shopnow_wishlist_${session.id}` : "shopnow_wishlist";
  const list = getWishlist().filter(id => id !== productId);
  localStorage.setItem(key, JSON.stringify(list));
  renderWishlist();
  document.getElementById("pstatWish").textContent = list.length;
  if (list.length > 0) {
    document.getElementById("wishBadge").textContent = list.length;
  } else {
    document.getElementById("wishBadge").style.display = "none";
  }
  profileToast("Eliminado de favoritos");
}

function renderWishlist() {
  const ids    = getWishlist();
  const grid   = document.getElementById("wishlistGrid");
  const items  = ids.map(id => PRODUCTS_DATA.find(p => p.id === id)).filter(Boolean);

  if (items.length === 0) {
    grid.innerHTML = `
      <div class="wish-empty">
        <i class="fa-solid fa-heart"></i>
        <p>Aún no tienes productos favoritos.</p>
        <a href="index.html" style="display:inline-flex;align-items:center;gap:8px;background:var(--primary);color:white;padding:10px 22px;border-radius:50px;text-decoration:none;font-weight:600;font-size:0.9rem">
          <i class="fa-solid fa-store"></i> Explorar productos
        </a>
      </div>`;
    return;
  }
  grid.innerHTML = items.map(p => `
    <div class="wish-card">
      <div class="wish-card-img">
        <img src="${p.img}" alt="${p.name}"
          onerror="this.onerror=null;this.style.display='none';this.nextElementSibling.style.display='flex'" />
        <i class="fa-solid ${p.icon}" style="display:none"></i>
      </div>
      <div class="wish-card-info">
        <p class="wish-card-name">${p.name}</p>
        <p class="wish-card-price">$${p.price.toLocaleString()}</p>
        <div class="wish-card-actions">
          <button class="wish-add-btn" onclick="addWishToCart(${p.id})">
            <i class="fa-solid fa-cart-plus"></i> Agregar
          </button>
          <button class="wish-remove-btn" onclick="removeFromWishlist(${p.id})" title="Quitar de favoritos">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    </div>`).join("");
}

function addWishToCart(productId) {
  // Add to cart via localStorage and navigate to store
  const existing = JSON.parse(localStorage.getItem("shopnow_cart") || "[]");
  const product  = PRODUCTS_DATA.find(p => p.id === productId);
  if (!product) return;
  const idx = existing.findIndex(i => i.id === productId);
  if (idx >= 0) existing[idx].qty++;
  else existing.push({ ...product, qty: 1, icon: `<i class="fa-solid ${product.icon}"></i>` });
  localStorage.setItem("shopnow_cart", JSON.stringify(existing));
  profileToast(`${product.name} agregado al carrito`);
}

// ===== HELPERS =====
function showPAlert(id, msg, type) {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = `p-alert show ${type}`;
  const icon = type === "success" ? "fa-circle-check" : "fa-circle-exclamation";
  el.innerHTML = `<i class="fa-solid ${icon}"></i> ${msg}`;
  setTimeout(() => el.classList.remove("show"), 5000);
}

function profileToast(msg) {
  const t = document.getElementById("profileToast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 3000);
}

// ===== DIRECCIONES =====
async function loadAddresses() {
  const token = localStorage.getItem("shopnow_token");
  try {
    const res = await fetch("/api/direcciones", {
      headers: token ? { "Authorization": "Bearer " + token } : {}
    });
    if (!res.ok) throw new Error();
    renderAddresses(await res.json());
  } catch {
    renderAddresses(JSON.parse(localStorage.getItem(`shopnow_dir_${session?.id}`) || "[]"));
  }
}

function renderAddresses(dirs) {
  const el = document.getElementById("addressesList");
  if (!el) return;
  if (!dirs.length) {
    el.innerHTML = `<div class="addr-empty"><i class="fa-solid fa-location-dot"></i><p>Aún no tienes direcciones guardadas.</p></div>`;
    return;
  }
  el.innerHTML = dirs.map(d => `
    <div class="addr-card ${d.es_principal ? "addr-principal" : ""}">
      <div class="addr-header">
        <span class="addr-alias"><i class="fa-solid fa-location-dot"></i> ${d.alias || "Casa"}</span>
        ${d.es_principal ? '<span class="addr-badge-principal">Principal</span>' : ""}
      </div>
      <p class="addr-name">${d.nombre}</p>
      <p class="addr-line">${d.calle}${d.colonia ? ", " + d.colonia : ""}, ${d.ciudad}${d.estado ? ", " + d.estado : ""} CP ${d.cp}</p>
      ${d.telefono ? `<p class="addr-tel"><i class="fa-solid fa-phone"></i> ${d.telefono}</p>` : ""}
      <div class="addr-actions">
        <button class="addr-btn" onclick="editAddress(${JSON.stringify(d).replace(/"/g, "&quot;")})">
          <i class="fa-solid fa-pen"></i> Editar
        </button>
        <button class="addr-btn addr-del" onclick="deleteAddress(${d.id})">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>`).join("");
}

function openAddressModal(addr) {
  document.getElementById("addrModalTitle").innerHTML =
    '<i class="fa-solid fa-location-dot"></i> ' + (addr ? "Editar dirección" : "Nueva dirección");
  document.getElementById("addressEditId").value  = addr?.id   || "";
  document.getElementById("addrAlias").value      = addr?.alias    || "";
  document.getElementById("addrNombre").value     = addr?.nombre   || "";
  document.getElementById("addrCalle").value      = addr?.calle    || "";
  document.getElementById("addrColonia").value    = addr?.colonia  || "";
  document.getElementById("addrCP").value         = addr?.cp       || "";
  document.getElementById("addrCiudad").value     = addr?.ciudad   || "";
  document.getElementById("addrEstado").value     = addr?.estado   || "";
  document.getElementById("addrTel").value        = addr?.telefono || "";
  document.getElementById("addrPrincipal").checked = !!(addr?.es_principal);
  document.getElementById("addrModalOverlay").classList.add("show");
  document.getElementById("addrModal").classList.add("show");
}
function closeAddressModal() {
  document.getElementById("addrModalOverlay").classList.remove("show");
  document.getElementById("addrModal").classList.remove("show");
}
function editAddress(addr) { openAddressModal(addr); }

async function saveAddress() {
  const id   = document.getElementById("addressEditId").value;
  const body = {
    alias:       document.getElementById("addrAlias").value.trim()   || "Casa",
    nombre:      document.getElementById("addrNombre").value.trim(),
    calle:       document.getElementById("addrCalle").value.trim(),
    colonia:     document.getElementById("addrColonia").value.trim(),
    cp:          document.getElementById("addrCP").value.trim(),
    ciudad:      document.getElementById("addrCiudad").value.trim(),
    estado:      document.getElementById("addrEstado").value.trim(),
    telefono:    document.getElementById("addrTel").value.trim(),
    es_principal: document.getElementById("addrPrincipal").checked,
  };
  if (!body.nombre || !body.calle || !body.ciudad || !body.cp) {
    profileToast("Completa los campos obligatorios"); return;
  }
  const token   = localStorage.getItem("shopnow_token");
  const headers = { "Content-Type": "application/json", ...(token ? { "Authorization": "Bearer " + token } : {}) };
  try {
    const res = id
      ? await fetch(`/api/direcciones/${id}`, { method:"PUT",  headers, body: JSON.stringify(body) })
      : await fetch("/api/direcciones",        { method:"POST", headers, body: JSON.stringify(body) });
    if (!res.ok) throw new Error();
    profileToast(id ? "Dirección actualizada" : "Dirección guardada");
    closeAddressModal();
    loadAddresses();
  } catch {
    const key  = `shopnow_dir_${session?.id}`;
    const dirs = JSON.parse(localStorage.getItem(key) || "[]");
    if (id) { const idx = dirs.findIndex(d => String(d.id) === id); if (idx >= 0) dirs[idx] = { ...dirs[idx], ...body }; }
    else    { dirs.push({ ...body, id: Date.now() }); }
    localStorage.setItem(key, JSON.stringify(dirs));
    profileToast(id ? "Dirección actualizada" : "Dirección guardada");
    closeAddressModal();
    renderAddresses(dirs);
  }
}

async function deleteAddress(id) {
  if (!confirm("¿Eliminar esta dirección?")) return;
  const token = localStorage.getItem("shopnow_token");
  try {
    await fetch(`/api/direcciones/${id}`, { method:"DELETE", headers: token ? { "Authorization":"Bearer "+token } : {} });
    profileToast("Dirección eliminada"); loadAddresses();
  } catch {
    const key  = `shopnow_dir_${session?.id}`;
    const dirs = JSON.parse(localStorage.getItem(key) || "[]").filter(d => d.id !== id);
    localStorage.setItem(key, JSON.stringify(dirs));
    profileToast("Dirección eliminada"); renderAddresses(dirs);
  }
}

// ===== DEVOLUCIONES =====
async function loadDevolucionesProfile() {
  if (!session) return;
  try {
    const res  = await fetch(`/api/devoluciones?usuario_id=${session.id}`);
    if (!res.ok) throw new Error();
    renderDevolucionesProfile(await res.json());
  } catch {
    renderDevolucionesProfile(JSON.parse(localStorage.getItem(`shopnow_devs_${session.id}`) || "[]"));
  }
}

const DEV_ESTADOS = { solicitada:"Solicitada", en_revision:"En revisión", aprobada:"Aprobada", rechazada:"Rechazada", completada:"Completada" };

function renderDevolucionesProfile(devs) {
  const el = document.getElementById("devolucionesListProfile");
  if (!el) return;
  if (!devs.length) {
    el.innerHTML = `<div class="addr-empty" style="margin-bottom:24px"><i class="fa-solid fa-rotate-left"></i><p>No tienes solicitudes de devolución.</p></div>`;
    return;
  }
  el.innerHTML = devs.map(d => `
    <div class="dev-user-card">
      <div class="dev-user-header">
        <span>Pedido: <code>${d.pedido_id}</code></span>
        <span class="dev-estado dev-estado-${d.estado}">${DEV_ESTADOS[d.estado] || d.estado}</span>
        <span class="dev-date">${new Date(d.creado_en || Date.now()).toLocaleDateString("es-MX")}</span>
      </div>
      <p class="dev-motivo-text">${d.motivo}</p>
    </div>`).join("");
}

async function submitDevolucion(e) {
  e.preventDefault();
  const pedido_id = document.getElementById("devPedidoId").value.trim();
  const motivo    = document.getElementById("devMotivo").value.trim();
  if (!pedido_id || !motivo) { profileToast("Completa todos los campos"); return; }
  try {
    const res = await fetch("/api/devoluciones", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ pedido_id, usuario_id: session?.id, motivo })
    });
    if (!res.ok) throw new Error();
    profileToast("Solicitud enviada correctamente");
    document.getElementById("devPedidoId").value = "";
    document.getElementById("devMotivo").value   = "";
    loadDevolucionesProfile();
  } catch {
    const key  = `shopnow_devs_${session?.id}`;
    const devs = JSON.parse(localStorage.getItem(key) || "[]");
    devs.push({ pedido_id, motivo, estado:"solicitada", creado_en: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(devs));
    profileToast("Solicitud enviada");
    document.getElementById("devPedidoId").value = "";
    document.getElementById("devMotivo").value   = "";
    renderDevolucionesProfile(devs);
  }
}

// ===== ORDER TRACKING =====
function openTracking(orderId, orderDate) {
  document.getElementById("trackingOrderId").textContent = `Orden: ${orderId}`;

  // Build 5 mock dates from the order date
  const steps = [
    "Pedido recibido",
    "Pago confirmado",
    "Preparando tu pedido",
    "En camino",
    "Entregado",
  ];
  steps.forEach((_, i) => {
    document.getElementById(`tsdate-${i + 1}`).textContent = orderDate;
  });

  document.getElementById("trackingOverlay").classList.add("show");
  document.getElementById("trackingModal").classList.add("show");
}

function closeTracking() {
  document.getElementById("trackingOverlay").classList.remove("show");
  document.getElementById("trackingModal").classList.remove("show");
}
