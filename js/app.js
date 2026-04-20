// ── TOBY'S CREW — app.js ──────────────────────────────────────────
const WA_NUMBER  = "524771998610";  // ← Tu número de WhatsApp
const STORE_NAME = "Toby's Crew";   // ← Nombre de la tienda

// ── CONFIGURACIÓN DE OFERTAS ──────────────────────────────────────
const CODIGO_PRIMERA_COMPRA = "PRIMERA10"; // ← Código primera compra
const DESCUENTO_PRIMERA_PCT = 10;          // ← % descuento primera compra
const DESCUENTO_SEGUNDO_PCT = 5;           // ← % descuento 2do artículo

// ─────────────────────────────────────────────────────────────────
let products       = [];
let cart           = {};      // { id: qty }
let cartStep       = "items"; // "items" | "form"
let codigoAplicado = false;   // true cuando PRIMERA10 está activo

// ── INIT ──────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
  await loadProducts();
  renderCatalog(products);
  initFilters();
  initCartEvents();
  console.log(`${STORE_NAME} cargado. ${products.length} productos disponibles.`);
});

// ── PRODUCTS ──────────────────────────────────────────────────────
async function loadProducts() {
  try {
    const res = await fetch("products.json");
    if (!res.ok) throw new Error("No se pudo cargar products.json");
    products = await res.json();
  } catch (err) {
    console.error("Error cargando productos:", err);
    document.getElementById("catalog-grid").innerHTML =
      `<p style="color:red;padding:1rem">Error: ${err.message}</p>`;
  }
}

// ── DESCUENTOS POR PRODUCTO ───────────────────────────────────────
function calcularPrecioFinal(p) {
  const d = p.descuento;
  if (!d || !d.activo || !d.valor) return p.price;
  if (d.tipo === "porcentaje") return Math.round(p.price * (1 - d.valor / 100));
  if (d.tipo === "fijo")       return Math.max(0, p.price - d.valor);
  return p.price;
}

function renderBadgeDescuento(p) {
  const d = p.descuento;
  if (!d || !d.activo || !d.valor) return "";
  const label = d.tipo === "porcentaje" ? `−${d.valor}%` : `−$${d.valor}`;
  return `<span class="discount-badge">${label}</span>`;
}

function renderPrecio(p) {
  const d = p.descuento;
  if (!d || !d.activo || !d.valor) {
    return `<span class="card-price-normal">$${formatPrice(p.price)}</span>`;
  }
  const final = calcularPrecioFinal(p);
  return `
    <div class="card-price-wrap">
      <span class="card-price-original">$${formatPrice(p.price)}</span>
      <span class="card-price-final">$${formatPrice(final)}</span>
    </div>`;
}

function actualizarBanner() {
  const hayOfertas = products.some(p => p.descuento?.activo && p.descuento?.valor);
  const banner = document.getElementById("promo-banner");
  if (banner) banner.classList.toggle("visible", hayOfertas);
}

// ── OFERTA: 5% EN SEGUNDO ARTÍCULO ───────────────────────────────
// Retorna el monto a descontar del segundo producto más costoso
function getDescuentoSegundoMonto() {
  if (codigoAplicado) return 0;
  // Expandir en unidades individuales para capturar 2× el mismo producto
  const unidades = [];
  cartItems().forEach(({ product: p, qty }) => {
    for (let i = 0; i < qty; i++) {
      unidades.push(calcularPrecioFinal(p));
    }
  });
  if (unidades.length < 2) return 0;
  unidades.sort((a, b) => b - a);
  return Math.round(unidades[1] * DESCUENTO_SEGUNDO_PCT / 100);
}

// ── OFERTA: CÓDIGO PRIMERA COMPRA ────────────────────────────────
function aplicarCodigo() {
  const input  = document.getElementById("f-codigo");
  const status = document.getElementById("codigo-status");
  if (!input) return;
  const val = input.value.trim().toUpperCase();
  if (val === CODIGO_PRIMERA_COMPRA) {
    codigoAplicado      = true;
    input.readOnly      = true;
    input.style.borderColor = "var(--green)";
    status.textContent  = `✓ ${DESCUENTO_PRIMERA_PCT}% de descuento aplicado`;
    status.style.color  = "var(--green)";
    renderOrderSummaryMini();
  } else {
    input.style.borderColor = "var(--red)";
    status.textContent  = "Código inválido";
    status.style.color  = "var(--red)";
    setTimeout(() => { input.style.borderColor = ""; status.textContent = ""; }, 2000);
  }
}

function quitarCodigo() {
  codigoAplicado = false;
  const input  = document.getElementById("f-codigo");
  const status = document.getElementById("codigo-status");
  if (input)  { input.value = ""; input.readOnly = false; input.style.borderColor = ""; }
  if (status) status.textContent = "";
  renderOrderSummaryMini();
}

// ── TOTALES CON OFERTAS ───────────────────────────────────────────
function subtotalSinOfertas() {
  return Object.entries(cart).reduce((sum, [id, qty]) => {
    const p = products.find(x => x.id == id);
    return sum + (p ? calcularPrecioFinal(p) * qty : 0);
  }, 0);
}

function cartTotal() {
  let total = subtotalSinOfertas();
  total -= getDescuentoSegundoMonto();
  if (codigoAplicado) total = Math.round(total * (1 - DESCUENTO_PRIMERA_PCT / 100));
  return Math.max(0, total);
}

function cartPuntosTotal() {
  return Object.entries(cart).reduce((sum, [id, qty]) => {
    const p = products.find(x => x.id == id);
    return sum + ((p?.puntos || 0) * qty);
  }, 0);
}

// ── CATALOG RENDER ────────────────────────────────────────────────
function renderCatalog(list) {
  const grid = document.getElementById("catalog-grid");
  if (!list.length) {
    grid.innerHTML = `<p style="color:var(--ink-muted);padding:1rem;text-align:center;grid-column:1/-1">Sin productos en esta categoría.</p>`;
    return;
  }

  grid.innerHTML = list.map(p => {
    const tagClass = `tag-${p.category}`;
    const tagLabel = { perro: "🐕 Perro", gato: "🐈 Gato", snack: "⭐ Snack" }[p.category] || p.category;
    const imgHtml  = p.image
      ? `<img src="${p.image}" alt="${p.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
      : "";
    const emoji    = { perro: "🐕", gato: "🐱", snack: "🦴" }[p.category] || "🐾";
    const fallback = `<span class="img-fallback" style="${p.image ? 'display:none' : ''}">${emoji}</span>`;
    const ptsBadge = p.puntos ? `<span class="pts-badge">+${p.puntos} pts</span>` : "";

    return `
      <article class="product-card" data-id="${p.id}">
        <div class="card-img-wrap">
          ${imgHtml}
          ${fallback}
          <span class="category-tag ${tagClass}">${tagLabel}</span>
          ${renderBadgeDescuento(p)}
          ${ptsBadge}
        </div>
        <div class="card-body">
          <p class="card-brand">${p.brand || ""}</p>
          <h3 class="card-name">${p.name}</h3>
          <p class="card-weight">${p.weight || ""}</p>
          <div class="card-footer">
            ${renderPrecio(p)}
            <button class="add-btn" onclick="addToCart(${p.id})" aria-label="Agregar ${p.name}">+</button>
          </div>
        </div>
      </article>`;
  }).join("");

  actualizarBanner();
}

// ── FILTERS ───────────────────────────────────────────────────────
function initFilters() {
  document.querySelectorAll(".filter-chip").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-chip").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const cat      = btn.dataset.filter;
      const filtered = cat === "todos" ? products : products.filter(p => p.category === cat);
      renderCatalog(filtered);
    });
  });
}

// ── CART ──────────────────────────────────────────────────────────
function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  updateCartBadge();
  showToast("Agregado al carrito 🐾");
  const badge = document.getElementById("cart-badge");
  badge.classList.remove("pulse");
  void badge.offsetWidth;
  badge.classList.add("pulse");
  // Refrescar carrito si está abierto
  if (document.getElementById("cart-drawer").classList.contains("open")) {
    renderCartItems();
  }
}

function changeQty(id, delta) {
  cart[id] = (cart[id] || 0) + delta;
  if (cart[id] <= 0) delete cart[id];
  updateCartBadge();
  renderCartItems();
}

function updateCartBadge() {
  const total = Object.values(cart).reduce((a, b) => a + b, 0);
  document.getElementById("cart-badge").textContent = total;
}

function cartItems() {
  return Object.entries(cart)
    .filter(([, qty]) => qty > 0)
    .map(([id, qty]) => ({ product: products.find(p => p.id == id), qty }))
    .filter(x => x.product);
}

// ── CART DRAWER ───────────────────────────────────────────────────
function initCartEvents() {
  document.getElementById("cart-toggle").addEventListener("click", openCart);
  document.getElementById("cart-backdrop").addEventListener("click", closeCart);
  document.getElementById("cart-close").addEventListener("click", closeCart);
}

function openCart() {
  setCartStep("items");
  renderCartItems();
  document.getElementById("cart-backdrop").classList.add("open");
  document.getElementById("cart-drawer").classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeCart() {
  document.getElementById("cart-backdrop").classList.remove("open");
  document.getElementById("cart-drawer").classList.remove("open");
  document.body.style.overflow = "";
}

function setCartStep(step) {
  cartStep = step;
  document.querySelectorAll(".cart-step").forEach(el => el.classList.remove("active"));
  document.getElementById(`step-${step}`).classList.add("active");
}

function renderCartItems() {
  const items     = cartItems();
  const container = document.getElementById("cart-items-list");

  if (!items.length) {
    container.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🛒</div>
        <p>Tu carrito está vacío.<br>¡Agrega productos del catálogo!</p>
      </div>`;
    document.getElementById("cart-subtotal").textContent = "$0";
    document.getElementById("btn-to-form").disabled = true;
    return;
  }

  container.innerHTML = items.map(({ product: p, qty }) => {
    const emoji   = { perro: "🐕", gato: "🐱", snack: "🦴" }[p.category] || "🐾";
    const ptsItem = p.puntos
      ? `<span style="font-size:10px;color:var(--gold);font-weight:700;margin-left:4px">+${p.puntos * qty} pts</span>`
      : "";
    return `
      <div class="cart-item-row">
        <div class="ci-thumb">${p.image ? `<img src="${p.image}" alt="${p.name}" onerror="this.style.display='none'">` : emoji}</div>
        <div class="ci-info">
          <p class="ci-name">${p.name}</p>
          <p class="ci-price">$${formatPrice(calcularPrecioFinal(p))} × ${qty} = <strong>$${formatPrice(calcularPrecioFinal(p) * qty)}</strong>${ptsItem}</p>
        </div>
        <div class="qty-ctrl">
          <button class="qty-btn" onclick="changeQty(${p.id}, -1)">−</button>
          <span class="qty-num">${qty}</span>
          <button class="qty-btn" onclick="changeQty(${p.id}, 1)">+</button>
        </div>
      </div>`;
  }).join("");

  // Banner 5% segundo artículo
  const desc2do = getDescuentoSegundoMonto();
  if (desc2do > 0) {
    container.innerHTML += `
      <div style="margin-top:10px;padding:9px 12px;background:var(--green-light);border-radius:8px;font-size:12px;font-weight:700;color:var(--green);display:flex;align-items:center;gap:6px">
        ⚡ 5% en el 2do artículo más costoso — ahorras $${formatPrice(desc2do)}
      </div>`;
  }

  // Banner puntos
  const puntosTotal = cartPuntosTotal();
  if (puntosTotal > 0) {
    container.innerHTML += `
      <div style="margin-top:8px;padding:8px 12px;background:var(--gold-light);border-radius:8px;font-size:12px;font-weight:700;color:var(--gold);text-align:center">
        ⭐ Ganarás ${puntosTotal} puntos con este pedido
      </div>`;
  }

  document.getElementById("cart-subtotal").textContent = `$${formatPrice(cartTotal())}`;
  document.getElementById("btn-to-form").disabled = false;
}

// ── ORDER FORM ────────────────────────────────────────────────────
function goToForm() {
  if (!cartItems().length) return;
  renderOrderSummaryMini();
  setCartStep("form");
}

function goBackToItems() {
  setCartStep("items");
  renderCartItems();
}

function renderOrderSummaryMini() {
  const items      = cartItems();
  const subtotal   = subtotalSinOfertas();
  const desc2do    = getDescuentoSegundoMonto();
  const puntosTotal = cartPuntosTotal();

  const rows = items.map(({ product: p, qty }) =>
    `<div class="osm-row"><span>${p.name} ×${qty}</span><strong>$${formatPrice(calcularPrecioFinal(p) * qty)}</strong></div>`
  ).join("");

  const desc2doRow = desc2do > 0
    ? `<div class="osm-row" style="color:var(--green)"><span>⚡ 5% en 2do artículo</span><strong>−$${formatPrice(desc2do)}</strong></div>`
    : "";

  const descCodigoMonto = codigoAplicado
    ? Math.round((subtotal - desc2do) * DESCUENTO_PRIMERA_PCT / 100)
    : 0;
  const desc1raRow = codigoAplicado
    ? `<div class="osm-row" style="color:var(--green)">
        <span>🎉 ${DESCUENTO_PRIMERA_PCT}% primera compra
          <span style="font-size:10px;cursor:pointer;text-decoration:underline;margin-left:4px" onclick="quitarCodigo()">quitar</span>
        </span>
        <strong>−$${formatPrice(descCodigoMonto)}</strong>
      </div>`
    : "";

  const ptsRow = puntosTotal > 0
    ? `<div class="osm-row" style="color:var(--gold);font-weight:700"><span>⭐ Puntos a ganar</span><strong>+${puntosTotal} pts</strong></div>`
    : "";

  document.getElementById("order-summary-mini").innerHTML = `
    ${rows}
    ${desc2doRow}
    ${desc1raRow}
    <div class="osm-total"><span>Total</span><span>$${formatPrice(cartTotal())}</span></div>
    ${ptsRow}`;
}

// ── WHATSAPP SEND ─────────────────────────────────────────────────
function sendOrder() {
  const name    = document.getElementById("f-name").value.trim();
  const phone   = document.getElementById("f-phone").value.trim();
  const address = document.getElementById("f-address").value.trim();
  const notes   = document.getElementById("f-notes").value.trim();

  if (!name)    { focusField("f-name",    "Escribe tu nombre"); return; }
  if (!phone)   { focusField("f-phone",   "Escribe tu teléfono"); return; }
  if (!address) { focusField("f-address", "Escribe tu dirección"); return; }

  const items       = cartItems();
  const desc2do     = getDescuentoSegundoMonto();
  const puntosTotal = cartPuntosTotal();
  if (!items.length) { alert("El carrito está vacío"); return; }

  // ── Mensaje WhatsApp ───────────────────────────────────────────
  let msg = `🐾 *Pedido - ${STORE_NAME}*\n\n`;
  msg += `👤 *Nombre:* ${name}\n`;
  msg += `📱 *Teléfono:* ${phone}\n`;
  msg += `📍 *Dirección:* ${address}\n`;
  if (notes) msg += `📝 *Notas:* ${notes}\n`;
  msg += `\n*─── Productos ───*\n`;
  items.forEach(({ product: p, qty }) => {
    msg += `• ${p.name} (${p.weight || ""}) × ${qty} = $${formatPrice(calcularPrecioFinal(p) * qty)}\n`;
  });
  if (desc2do > 0) {
    msg += `⚡ *Descuento 5% 2do artículo: −$${formatPrice(desc2do)}*\n`;
  }
  if (codigoAplicado) {
    const descCodigo = Math.round((subtotalSinOfertas() - desc2do) * DESCUENTO_PRIMERA_PCT / 100);
    msg += `🎉 *Descuento primera compra ${DESCUENTO_PRIMERA_PCT}%: −$${formatPrice(descCodigo)}*\n`;
  }
  msg += `\n💰 *Total: $${formatPrice(cartTotal())} MXN*`;
  if (puntosTotal > 0) msg += `\n⭐ *Puntos ganados: +${puntosTotal} pts*`;
  msg += `\n\n_Pedido generado desde el catálogo web de ${STORE_NAME}_`;

  // ── Guardar en Notion ──────────────────────────────────────────
  const itemsData = items.map(({ product: p, qty }) => ({
    id:       p.id,
    name:     p.name,
    brand:    p.brand  || "",
    weight:   p.weight || "",
    qty,
    price:    calcularPrecioFinal(p),
    costo:    p.costo   || 0,
    puntos:   p.puntos  || 0,
    semanas:  p.semanas || 4,
    subtotal: calcularPrecioFinal(p) * qty,
  }));

  fetch("/.netlify/functions/save-order", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nombre:    name,
      telefono:  phone,
      direccion: address,
      notas:     notes,
      items:     itemsData,
      total:     cartTotal()
    })
  }).catch(err => console.error("Error guardando pedido:", err));

  window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");

  // ── Reset ──────────────────────────────────────────────────────
  cart = {}; codigoAplicado = false;
  updateCartBadge();
  closeCart();
  document.getElementById("f-name").value    = "";
  document.getElementById("f-phone").value   = "";
  document.getElementById("f-address").value = "";
  document.getElementById("f-notes").value   = "";
  quitarCodigo();
  showToast("¡Pedido enviado! Revisa WhatsApp 🚀");
}

// ── HELPERS ───────────────────────────────────────────────────────
function formatPrice(n) {
  return Number(n).toLocaleString("es-MX");
}

function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2400);
}

function focusField(id, hint) {
  const el = document.getElementById(id);
  el.focus();
  el.placeholder = hint;
  el.style.borderColor = "var(--red)";
  setTimeout(() => { el.style.borderColor = ""; }, 2000);
}
