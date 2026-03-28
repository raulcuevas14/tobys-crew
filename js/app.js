// ── TOBY'S CREW — app.js ──────────────────────────────────────────
// Configuración: cambia solo estas dos líneas
const WA_NUMBER   = "524771998610";   // ← Tu número de WhatsApp (con código de país, sin + ni espacios)
const STORE_NAME  = "Toby's Crew";    // ← Nombre de la tienda

// ─────────────────────────────────────────────────────────────────
let products  = [];
let cart      = {};           // { id: qty }
let cartStep  = "items";      // "items" | "form"

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

    return `
      <article class="product-card" data-id="${p.id}">
        <div class="card-img-wrap">
          ${imgHtml}
          ${fallback}
          <span class="category-tag ${tagClass}">${tagLabel}</span>
        </div>
        <div class="card-body">
          <p class="card-brand">${p.brand || ""}</p>
          <h3 class="card-name">${p.name}</h3>
          <p class="card-weight">${p.weight || ""}</p>
          <div class="card-footer">
            <span class="card-price">$${formatPrice(p.price)}</span>
            <button class="add-btn" onclick="addToCart(${p.id})" aria-label="Agregar ${p.name}">+</button>
          </div>
        </div>
      </article>`;
  }).join("");
}

// ── FILTERS ───────────────────────────────────────────────────────
function initFilters() {
  document.querySelectorAll(".filter-chip").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-chip").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const cat = btn.dataset.filter;
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
  // Pulse animation on badge
  const badge = document.getElementById("cart-badge");
  badge.classList.remove("pulse");
  void badge.offsetWidth;
  badge.classList.add("pulse");
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

function cartTotal() {
  return Object.entries(cart).reduce((sum, [id, qty]) => {
    const p = products.find(x => x.id == id);
    return sum + (p ? p.price * qty : 0);
  }, 0);
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
  const items = cartItems();
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
    const emoji = { perro: "🐕", gato: "🐱", snack: "🦴" }[p.category] || "🐾";
    const thumbImg = p.image
      ? `<img src="${p.image}" alt="${p.name}" onerror="this.style.display='none';this.parentElement.textContent='${emoji}'">`
      : emoji;

    return `
      <div class="cart-item-row">
        <div class="ci-thumb">${p.image ? `<img src="${p.image}" alt="${p.name}" onerror="this.style.display='none'">` : emoji}</div>
        <div class="ci-info">
          <p class="ci-name">${p.name}</p>
          <p class="ci-price">$${formatPrice(p.price)} × ${qty} = <strong>$${formatPrice(p.price * qty)}</strong></p>
        </div>
        <div class="qty-ctrl">
          <button class="qty-btn" onclick="changeQty(${p.id}, -1)">−</button>
          <span class="qty-num">${qty}</span>
          <button class="qty-btn" onclick="changeQty(${p.id}, 1)">+</button>
        </div>
      </div>`;
  }).join("");

  document.getElementById("cart-subtotal").textContent = `$${formatPrice(cartTotal())}`;
  document.getElementById("btn-to-form").disabled = false;
}

// ── ORDER FORM STEP ───────────────────────────────────────────────
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
  const items = cartItems();
  const rows  = items.map(({ product: p, qty }) =>
    `<div class="osm-row"><span>${p.name} ×${qty}</span><strong>$${formatPrice(p.price * qty)}</strong></div>`
  ).join("");
  document.getElementById("order-summary-mini").innerHTML = `
    ${rows}
    <div class="osm-total"><span>Total</span><span>$${formatPrice(cartTotal())}</span></div>`;
}

// ── WHATSAPP SEND ─────────────────────────────────────────────────
function sendOrder() {
  const name    = document.getElementById("f-name").value.trim();
  const phone   = document.getElementById("f-phone").value.trim();
  const address = document.getElementById("f-address").value.trim();
  const notes   = document.getElementById("f-notes").value.trim();

  // Validation
  if (!name)    { focusField("f-name",    "Escribe tu nombre"); return; }
  if (!phone)   { focusField("f-phone",   "Escribe tu teléfono"); return; }
  if (!address) { focusField("f-address", "Escribe tu dirección"); return; }

  const items = cartItems();
  if (!items.length) { alert("El carrito está vacío"); return; }

  // ── Build the WhatsApp message ─────────────────────────────────
  let msg = `🐾 *Pedido - ${STORE_NAME}*\n\n`;
  msg += `👤 *Nombre:* ${name}\n`;
  msg += `📱 *Teléfono:* ${phone}\n`;
  msg += `📍 *Dirección:* ${address}\n`;
  if (notes) msg += `📝 *Notas:* ${notes}\n`;
  msg += `\n*─── Productos ───*\n`;
  items.forEach(({ product: p, qty }) => {
    msg += `• ${p.name} (${p.weight || ""}) × ${qty} = $${formatPrice(p.price * qty)}\n`;
  });
  msg += `\n💰 *Total estimado: $${formatPrice(cartTotal())} MXN*`;
  msg += `\n\n_Pedido generado desde el catálogo web de ${STORE_NAME}_`;

  // Log to console (opcional: revisar desde DevTools)
  console.log("── NUEVO PEDIDO ──────────────────────────────");
  console.log({ nombre: name, telefono: phone, direccion: address, notas: notes, items: items.map(i => ({ producto: i.product.name, cantidad: i.qty, subtotal: i.product.price * i.qty })), total: cartTotal() });
  console.log("──────────────────────────────────────────────");

  fetch("/.netlify/functions/save-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nombre:    name,
      telefono:  phone,
      direccion: address,
      productos: items.map(i => `${i.product.name} x${i.qty}`).join(", "),
      total:     cartTotal()
    })
  }).catch(err => console.error("Error guardando pedido:", err));

  const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
  
  // Open WhatsApp
  //const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  //window.open(url, "_blank");


  // Reset
  cart = {};
  updateCartBadge();
  closeCart();
  document.getElementById("f-name").value    = "";
  document.getElementById("f-phone").value   = "";
  document.getElementById("f-address").value = "";
  document.getElementById("f-notes").value   = "";
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
