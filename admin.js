// ===== ADMIN TOKEN (el PIN se valida en el servidor, nunca aquí) =====
let adminToken = sessionStorage.getItem("shopnow_admin_token") || null;

function getAdminHeaders() {
  return {
    "Content-Type": "application/json",
    ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {})
  };
}

let editingProductId = null;
let adminProducts    = [];

// ===== AUTH =====
async function checkAdminAuth(e) {
  e.preventDefault();
  const pin = document.getElementById("adminPin").value.trim();
  const err = document.getElementById("adminAuthError");
  try {
    const res  = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin })
    });
    const data = await res.json();
    if (!res.ok) {
      err.textContent = data.error || "Código incorrecto. Inténtalo de nuevo.";
      document.getElementById("adminPin").value = "";
      document.getElementById("adminPin").focus();
      setTimeout(() => { err.textContent = ""; }, 3000);
      return;
    }
    adminToken = data.token;
    sessionStorage.setItem("shopnow_admin_token", adminToken);
    document.getElementById("adminAuthOverlay").style.display = "none";
    showAdminUI();
  } catch {
    err.textContent = "Error de conexión con el servidor.";
    setTimeout(() => { err.textContent = ""; }, 3000);
  }
}

function showAdminUI() {
  document.getElementById("adminNavbar").style.display    = "flex";
  document.getElementById("adminStatsBar").style.display  = "flex";
  document.getElementById("adminTabsWrap").style.display  = "block";
  document.getElementById("adminMain").style.display      = "block";
  loadDashboard();
}

function adminLogout() {
  adminToken = null;
  sessionStorage.removeItem("shopnow_admin_token");
  document.getElementById("adminAuthOverlay").style.display = "flex";
  document.getElementById("adminNavbar").style.display      = "none";
  document.getElementById("adminStatsBar").style.display    = "none";
  document.getElementById("adminTabsWrap").style.display    = "none";
  document.getElementById("adminMain").style.display        = "none";
}

// ===== TABS =====
function switchAdminTab(tab) {
  document.querySelectorAll(".admin-tab").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
  document.querySelectorAll(".admin-panel").forEach(p => p.classList.remove("active"));
  document.getElementById("admin-panel-" + tab)?.classList.add("active");
  if (tab === "analytics")    loadAnalytics();
  if (tab === "cupones")      loadCupones();
  if (tab === "resenas")      loadResenas();
  if (tab === "devoluciones") loadDevoluciones();
}

// ===== DASHBOARD =====
async function loadDashboard() {
  // Cargar productos desde la API (con fallback a localStorage si no hay DB)
  try {
    const res = await fetch("/api/productos");
    if (res.ok) {
      const prods = await res.json();
      adminProducts = prods.map(p => ({
        id:       p.id,
        name:     p.nombre,
        category: p.category || "general",
        price:    parseFloat(p.precio),
        oldPrice: p.precio_anterior ? parseFloat(p.precio_anterior) : null,
        stock:    p.stock || 0,
        img:      p.imagen_url || "",
        icon:     p.icono_fa ? p.icono_fa.replace("fa-solid ", "").replace("fa-regular ", "") : "fa-box",
        active:   !!p.activo
      }));
    }
  } catch { /* Sin BD: adminProducts permanece como arreglo vacío */ }

  // Stats
  const orders  = JSON.parse(localStorage.getItem("shopnow_orders") || "[]");
  const users   = JSON.parse(localStorage.getItem("shopnow_users")  || "[]");
  const revenue = orders.reduce((s, o) => s + (o.total || 0), 0);

  document.getElementById("statProducts").textContent = adminProducts.length;
  document.getElementById("statOrders").textContent   = orders.length;
  document.getElementById("statUsers").textContent    = users.length;
  document.getElementById("statRevenue").textContent  = "$" + revenue.toLocaleString();

  renderProductsTable();
  renderOrdersList(orders);
  renderUsersTable(users, orders);
}

// ===== PRODUCTS TABLE =====
function renderProductsTable() {
  const tbody = document.getElementById("productsTableBody");
  document.getElementById("productsCount").textContent = `${adminProducts.length} productos en catálogo`;

  tbody.innerHTML = adminProducts.map(p => {
    const stockClass = p.stock === 0 ? "stock-none" : p.stock <= 20 ? "stock-low" : "stock-ok";
    const stockText  = p.stock === 0 ? "Agotado" : p.stock <= 20 ? `⚡ ${p.stock} uds.` : `✓ ${p.stock}`;
    return `
      <tr>
        <td>${p.id}</td>
        <td>
          <div class="prod-cell">
            <div class="prod-thumb">
              <img src="${p.img}" alt="${p.name}"
                onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />
              <i class="fa-solid ${p.icon}" style="display:none"></i>
            </div>
            <div>
              <p class="prod-name">${p.name}</p>
            </div>
          </div>
        </td>
        <td><span class="cat-badge">${p.category}</span></td>
        <td>
          <strong style="color:var(--primary)">$${p.price.toLocaleString()}</strong>
          ${p.oldPrice ? `<br><small style="color:var(--text-light);text-decoration:line-through">$${p.oldPrice.toLocaleString()}</small>` : ""}
        </td>
        <td class="${stockClass}">${stockText}</td>
        <td><span class="status-badge ${p.active ? 'status-active' : 'status-inactive'}">${p.active ? "Activo" : "Inactivo"}</span></td>
        <td>
          <button class="btn-edit" onclick="openEditModal(${p.id})">
            <i class="fa-solid fa-pen"></i> Editar
          </button>
        </td>
      </tr>`;
  }).join("");
}

// ===== ORDERS =====
function renderOrdersList(orders) {
  const list = document.getElementById("adminOrdersList");
  document.getElementById("ordersCount").textContent = `${orders.length} pedidos registrados`;

  if (orders.length === 0) {
    list.innerHTML = `<div class="admin-empty"><i class="fa-solid fa-receipt"></i><p>No hay pedidos registrados aún.</p></div>`;
    return;
  }

  const metodoLabels = { card:"Tarjeta", paypal:"PayPal", oxxo:"OXXO", spei:"SPEI", mercadopago:"Mercado Pago" };
  list.innerHTML = orders.slice().reverse().map(o => `
    <div class="admin-order-card">
      <div class="admin-order-left">
        <p class="admin-order-id">${o.id}</p>
        <p class="admin-order-date">${o.fecha}</p>
        <p class="admin-order-items">${o.items?.length || 0} producto(s)</p>
      </div>
      <div class="admin-order-right">
        <span class="admin-order-method">${metodoLabels[o.metodo] || o.metodo}</span>
        <span class="admin-order-total">$${(o.total || 0).toLocaleString()}</span>
        <span class="status-badge status-active">Completado</span>
      </div>
    </div>`).join("");
}

// ===== USERS =====
function renderUsersTable(users, orders) {
  const tbody = document.getElementById("usersTableBody");
  document.getElementById("usersCount").textContent = `${users.length} usuarios registrados`;

  if (users.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--text-light)">No hay usuarios registrados aún.</td></tr>`;
    return;
  }

  tbody.innerHTML = users.map((u, i) => {
    const userOrders = orders.filter(o => o.usuario_id === u.id).length;
    const points     = parseInt(localStorage.getItem(`shopnow_points_${u.id}`) || "0");
    return `
      <tr>
        <td>${i + 1}</td>
        <td><strong>${u.nombre} ${u.apellido || ""}</strong></td>
        <td>${u.correo}</td>
        <td>${userOrders}</td>
        <td><span style="color:var(--accent);font-weight:700">⭐ ${points}</span></td>
      </tr>`;
  }).join("");
}

// ===== EDIT MODAL =====
function openEditModal(id) {
  editingProductId = id;
  const p = adminProducts.find(x => x.id === id);
  if (!p) return;
  document.getElementById("editModalTitle").textContent = `Editar: ${p.name}`;
  document.getElementById("editPrice").value    = p.price;
  document.getElementById("editOldPrice").value = p.oldPrice || "";
  document.getElementById("editStock").value    = p.stock;
  document.getElementById("editModalOverlay").classList.add("show");
  document.getElementById("editModal").classList.add("show");
}
function closeEditModal() {
  document.getElementById("editModalOverlay").classList.remove("show");
  document.getElementById("editModal").classList.remove("show");
  editingProductId = null;
}
async function saveProductEdit() {
  if (!editingProductId) return;
  const price    = parseInt(document.getElementById("editPrice").value) || 0;
  const oldPrice = parseInt(document.getElementById("editOldPrice").value) || null;
  const stock    = parseInt(document.getElementById("editStock").value) || 0;

  try {
    const res = await fetch(`/api/productos/${editingProductId}`, {
      method: "PUT",
      headers: getAdminHeaders(),
      body: JSON.stringify({ precio: price, precio_anterior: oldPrice, stock })
    });
    if (!res.ok) {
      const d = await res.json();
      adminToast(d.error || "Error al guardar en la base de datos");
      return;
    }
  } catch {
    // Sin conexión a BD — actualizar solo en memoria
  }

  // Actualizar en memoria para reflejar el cambio inmediatamente
  const p = adminProducts.find(x => x.id === editingProductId);
  if (p) { p.price = price; p.oldPrice = oldPrice; p.stock = stock; }

  renderProductsTable();
  closeEditModal();
  adminToast("Producto actualizado correctamente");
}

function adminToast(msg) {
  const t = document.getElementById("adminToast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 3000);
}
// alias
function showAdminToast(msg) { adminToast(msg); }

// ===== ANALYTICS =====
let chartVentas  = null;
let chartEstados = null;

async function loadAnalytics() {
  try {
    const res  = await fetch("/api/analytics");
    if (!res.ok) throw new Error("Sin DB");
    const data = await res.json();

    document.getElementById("statOrders").textContent  = data.resumen.pedidos;
    document.getElementById("statUsers").textContent   = data.resumen.usuarios;
    document.getElementById("statRevenue").textContent = "$" + parseFloat(data.resumen.ingresos||0).toLocaleString();

    // Chart ventas/día
    if (chartVentas) chartVentas.destroy();
    const ctxV = document.getElementById("chartVentas")?.getContext("2d");
    if (ctxV) {
      chartVentas = new Chart(ctxV, {
        type: "line",
        data: {
          labels: data.ventasPorDia.map(d => d.fecha),
          datasets: [{ label:"Ingresos ($)", data: data.ventasPorDia.map(d => parseFloat(d.ingresos)),
            borderColor:"#e8520a", backgroundColor:"rgba(232,82,10,0.1)", tension:0.4, fill:true }]
        },
        options: { responsive:true, plugins:{ legend:{ display:false } }, scales:{ y:{ beginAtZero:true } } }
      });
    }

    // Chart estados
    if (chartEstados) chartEstados.destroy();
    const ctxE = document.getElementById("chartEstados")?.getContext("2d");
    if (ctxE && data.pedidosPorEstado.length) {
      chartEstados = new Chart(ctxE, {
        type: "doughnut",
        data: {
          labels: data.pedidosPorEstado.map(d => d.estado),
          datasets: [{ data: data.pedidosPorEstado.map(d => d.total),
            backgroundColor:["#e8520a","#43a047","#1e3a5f","#f5b800","#c62828","#7b1fa2"] }]
        },
        options: { responsive:true }
      });
    }

    // Top productos
    const topEl = document.getElementById("topProductosList");
    if (topEl) {
      topEl.innerHTML = data.topProductos.length
        ? data.topProductos.map((p,i) =>
            `<div class="top-product-row">
              <span class="top-rank">#${i+1}</span>
              <span class="top-name">${p.nombre}</span>
              <span class="top-sold">${p.vendidos} vendidos</span>
              <span class="top-rev">$${parseFloat(p.ingresos).toLocaleString()}</span>
            </div>`).join("")
        : '<p class="admin-empty-small">Sin ventas registradas aún.</p>';
    }

    // Últimos pedidos
    const ultEl = document.getElementById("ultimosPedidosList");
    if (ultEl) {
      ultEl.innerHTML = data.ultimosPedidos.length
        ? `<table class="admin-table"><thead><tr><th>ID</th><th>Cliente</th><th>Total</th><th>Método</th><th>Estado</th><th>Fecha</th><th>Acción</th></tr></thead>
           <tbody>${data.ultimosPedidos.map(p =>
             `<tr><td><code>${p.id}</code></td><td>${p.nombre_cliente}</td>
              <td>$${parseFloat(p.total).toLocaleString()}</td>
              <td>${p.metodo_pago}</td>
              <td><span class="estado-badge estado-${p.estado}">${p.estado.replace("_"," ")}</span></td>
              <td>${new Date(p.creado_en).toLocaleDateString("es-MX")}</td>
              <td><select onchange="updateOrderStatus('${p.id}',this.value)" class="estado-select">
                <option value="">-- Cambiar --</option>
                ${["pendiente","confirmado","preparando","en_camino","entregado","cancelado"].map(s =>
                  `<option value="${s}">${s.replace("_"," ")}</option>`).join("")}
              </select></td></tr>`).join("")}
           </tbody></table>`
        : '<p class="admin-empty-small">Sin pedidos aún.</p>';
    }
  } catch(e) {
    // Fallback localStorage
    const orders  = JSON.parse(localStorage.getItem("shopnow_orders") || "[]");
    const users   = JSON.parse(localStorage.getItem("shopnow_users")  || "[]");
    const revenue = orders.reduce((s,o) => s+(o.total||0), 0);
    document.getElementById("statOrders").textContent  = orders.length;
    document.getElementById("statUsers").textContent   = users.length;
    document.getElementById("statRevenue").textContent = "$" + revenue.toLocaleString();
    const topEl = document.getElementById("topProductosList");
    if (topEl) topEl.innerHTML = '<p class="admin-empty-small">Conecta MySQL para ver analytics en tiempo real.</p>';
  }
}

async function updateOrderStatus(id, estado) {
  if (!estado) return;
  try {
    await fetch(`/api/pedidos/${id}/estado`, {
      method:"PUT", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ estado })
    });
    adminToast("Estado actualizado");
    loadAnalytics();
  } catch { adminToast("Error al actualizar"); }
}

// ===== CUPONES =====
let couponsData = [];

async function loadCupones() {
  try {
    const res = await fetch("/api/cupones");
    if (!res.ok) throw new Error();
    couponsData = await res.json();
  } catch { couponsData = []; }
  renderCupones();
}

function renderCupones() {
  const tbody = document.getElementById("cuponesTableBody");
  const count = document.getElementById("cuponesCount");
  if (!tbody) return;
  if (count) count.textContent = `${couponsData.length} cupones`;
  if (!couponsData.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--text-light)">Sin cupones. Crea uno.</td></tr>';
    return;
  }
  tbody.innerHTML = couponsData.map(c => `
    <tr>
      <td><code style="font-weight:700;color:var(--primary)">${c.codigo}</code></td>
      <td>${c.tipo==="porcentaje" ? (parseFloat(c.descuento)*100).toFixed(0)+"%" : "$"+c.monto_fijo}</td>
      <td>${c.usos_actuales}${c.usos_max ? " / "+c.usos_max : " / ∞"}</td>
      <td>${c.fecha_expira ? new Date(c.fecha_expira).toLocaleDateString("es-MX") : "Sin límite"}</td>
      <td><span class="badge-status ${c.activo ? "badge-active" : "badge-inactive"}">${c.activo ? "Activo" : "Inactivo"}</span></td>
      <td style="display:flex;gap:6px;flex-wrap:wrap">
        <button class="btn-admin-mini" onclick="toggleCoupon(${c.id},${!c.activo},${c.descuento})">${c.activo ? "Desactivar" : "Activar"}</button>
        <button class="btn-admin-mini btn-danger" onclick="deleteCoupon(${c.id})"><i class="fa-solid fa-trash"></i></button>
      </td>
    </tr>`).join("");
}

function openCouponModal() {
  document.getElementById("couponCode").value     = "";
  document.getElementById("couponDiscount").value = "";
  document.getElementById("couponUsos").value     = "";
  document.getElementById("couponExpira").value   = "";
  document.getElementById("couponModalOverlay").classList.add("show");
  document.getElementById("couponModal").classList.add("show");
}
function closeCouponModal() {
  document.getElementById("couponModalOverlay").classList.remove("show");
  document.getElementById("couponModal").classList.remove("show");
}
async function saveCoupon() {
  const codigo    = document.getElementById("couponCode").value.trim().toUpperCase();
  const pct       = parseFloat(document.getElementById("couponDiscount").value);
  const usos_max  = parseInt(document.getElementById("couponUsos").value) || null;
  const fecha_exp = document.getElementById("couponExpira").value || null;
  if (!codigo || isNaN(pct)) { adminToast("Completa código y descuento"); return; }
  try {
    const res = await fetch("/api/cupones", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ codigo, descuento: pct/100, tipo:"porcentaje", usos_max, activo:true, fecha_expira: fecha_exp })
    });
    if (!res.ok) { const d=await res.json(); adminToast(d.error||"Error"); return; }
    adminToast("Cupón creado");
    closeCouponModal();
    loadCupones();
  } catch { adminToast("Error de conexión"); }
}
async function toggleCoupon(id, activo, descuento) {
  try {
    await fetch(`/api/cupones/${id}`, {
      method:"PUT", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ activo, descuento })
    });
    loadCupones();
  } catch { adminToast("Error"); }
}
async function deleteCoupon(id) {
  if (!confirm("¿Eliminar este cupón?")) return;
  try {
    await fetch(`/api/cupones/${id}`, { method:"DELETE" });
    adminToast("Cupón eliminado");
    loadCupones();
  } catch { adminToast("Error"); }
}

// ===== RESEÑAS =====
async function loadResenas() {
  const el = document.getElementById("resenasList");
  if (!el) return;
  try {
    const res   = await fetch("/api/resenas");
    if (!res.ok) throw new Error();
    const items = await res.json();
    if (!items.length) { el.innerHTML='<div class="admin-empty"><i class="fa-solid fa-star"></i><p>Sin reseñas aún.</p></div>'; return; }
    el.innerHTML = items.map(r => `
      <div class="resena-card ${r.aprobada ? "" : "resena-pending"}">
        <div class="resena-header">
          <div><strong>${r.usuario_nombre}</strong> <span style="color:#fbbf24">${"★".repeat(r.rating)}${"☆".repeat(5-r.rating)}</span></div>
          <span style="color:var(--text-light);font-size:0.82rem">${new Date(r.creado_en).toLocaleDateString("es-MX")}</span>
          ${!r.aprobada ? '<span class="resena-badge-pending">Pendiente</span>' : ''}
        </div>
        <p class="resena-text">${r.comentario}</p>
        <div class="resena-actions">
          <button class="btn-admin-mini" onclick="toggleResena('${r.id}',${!r.aprobada})">${r.aprobada?"Ocultar":"Aprobar"}</button>
          <button class="btn-admin-mini btn-danger" onclick="deleteResena('${r.id}')"><i class="fa-solid fa-trash"></i> Eliminar</button>
        </div>
      </div>`).join("");
  } catch { el.innerHTML='<div class="admin-empty"><i class="fa-solid fa-star"></i><p>Conecta MySQL para ver reseñas.</p></div>'; }
}
async function toggleResena(id, aprobada) {
  try {
    await fetch(`/api/resenas/${id}/aprobar`, {
      method:"PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ aprobada })
    });
    adminToast(aprobada ? "Reseña aprobada" : "Reseña ocultada");
    loadResenas();
  } catch { adminToast("Error"); }
}
async function deleteResena(id) {
  if (!confirm("¿Eliminar esta reseña?")) return;
  try {
    await fetch(`/api/resenas/${id}`, { method:"DELETE" });
    adminToast("Reseña eliminada");
    loadResenas();
  } catch { adminToast("Error"); }
}

// ===== DEVOLUCIONES =====
async function loadDevoluciones() {
  const el = document.getElementById("devolucionesList");
  if (!el) return;
  try {
    const res  = await fetch("/api/devoluciones");
    if (!res.ok) throw new Error();
    const devs = await res.json();
    if (!devs.length) { el.innerHTML='<div class="admin-empty"><i class="fa-solid fa-rotate-left"></i><p>Sin solicitudes de devolución.</p></div>'; return; }
    el.innerHTML = devs.map(d => `
      <div class="dev-card">
        <div class="dev-header">
          <span>Pedido: <code>${d.pedido_id}</code></span>
          <span class="estado-badge estado-${d.estado}">${d.estado.replace("_"," ")}</span>
          <span style="color:var(--text-light);font-size:0.82rem">${new Date(d.creado_en).toLocaleDateString("es-MX")}</span>
        </div>
        <p class="dev-motivo"><strong>Motivo:</strong> ${d.motivo}</p>
        <div class="dev-actions">
          <select onchange="updateDevolucion(${d.id},this.value)" class="estado-select">
            <option value="">-- Cambiar estado --</option>
            ${["en_revision","aprobada","rechazada","completada"].map(s =>
              `<option value="${s}">${s.replace("_"," ")}</option>`).join("")}
          </select>
        </div>
      </div>`).join("");
  } catch { el.innerHTML='<div class="admin-empty"><i class="fa-solid fa-rotate-left"></i><p>Conecta MySQL para ver devoluciones.</p></div>'; }
}
async function updateDevolucion(id, estado) {
  if (!estado) return;
  try {
    await fetch(`/api/devoluciones/${id}/estado`, {
      method:"PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ estado })
    });
    adminToast("Estado actualizado");
    loadDevoluciones();
  } catch { adminToast("Error"); }
}
