# 🐾 Toby's Crew — MVP Catálogo Web

Catálogo web ligero con carrito y envío de pedidos por WhatsApp.
Sin frameworks, sin backend: puro HTML + CSS + JS.

---

## 📁 Estructura del proyecto

```
tobys-crew/
├── index.html          ← Página principal (todo el HTML)
├── products.json       ← ⭐ Aquí viven todos tus productos
├── css/
│   └── style.css       ← Estilos (fuentes, colores, layout)
├── js/
│   └── app.js          ← Lógica: catálogo, carrito, WhatsApp
└── images/             ← Aquí pones las fotos de tus productos
    └── (tus fotos aquí)
```

---

## 🚀 Cómo ejecutar en local

### Opción A — VS Code (recomendado)
1. Instala la extensión **Live Server** en VS Code
2. Abre la carpeta `tobys-crew/` en VS Code
3. Clic derecho en `index.html` → **"Open with Live Server"**
4. Se abre en `http://127.0.0.1:5500`

### Opción B — Python (si ya lo tienes instalado)
```bash
cd tobys-crew
python -m http.server 8080
# Abre http://localhost:8080 en tu navegador
```

### Opción C — Node.js
```bash
cd tobys-crew
npx serve .
```

> ⚠️ **Importante**: No abras `index.html` directamente con doble clic.
> El navegador bloquea la carga de archivos JSON locales por seguridad.
> Siempre usa un servidor local (cualquiera de las opciones de arriba).

---

## ⚙️ Configuración inicial

Abre `js/app.js` y cambia las primeras dos líneas:

```js
const WA_NUMBER  = "524771234567";  // ← Tu número (código país + número, sin + ni espacios)
const STORE_NAME = "Toby's Crew";   // ← Nombre de tu tienda
```

**Ejemplo para México (León, Gto.):**
```js
const WA_NUMBER = "524771234567";   // 52 = México, luego tu número a 10 dígitos
```

---

## 🛍️ Cómo gestionar productos (`products.json`)

Este archivo es tu "base de datos". Ábrelo con cualquier editor de texto (VS Code, Notepad++, etc.).

### Estructura de un producto

```json
{
  "id": 1,
  "name": "Royal Canin Adulto",
  "brand": "Royal Canin",
  "description": "Alimento balanceado para perros adultos",
  "weight": "3 kg",
  "price": 389,
  "category": "perro",
  "image": "images/royal-canin-adulto.jpg"
}
```

| Campo         | Descripción                                           | Requerido |
|---------------|-------------------------------------------------------|-----------|
| `id`          | Número único. Incrementa para cada producto nuevo     | ✅        |
| `name`        | Nombre del producto                                   | ✅        |
| `brand`       | Marca                                                 | ✅        |
| `description` | Descripción corta                                     | ❌        |
| `weight`      | Peso o presentación (ej: "3 kg", "500 g")            | ❌        |
| `price`       | Precio en pesos (solo el número, sin $ ni comas)      | ✅        |
| `category`    | `"perro"`, `"gato"` o `"snack"`                      | ✅        |
| `image`       | Ruta a la imagen (ver sección imágenes)               | ❌        |

### ➕ Agregar un producto

Abre `products.json` y agrega un objeto al final del arreglo (antes del `]` de cierre):

```json
[
  { ...producto existente... },
  { ...producto existente... },
  {
    "id": 9,
    "name": "Mi Nuevo Producto",
    "brand": "Marca",
    "weight": "2 kg",
    "price": 250,
    "category": "perro",
    "image": "images/mi-producto.jpg"
  }
]
```

> 💡 El `id` debe ser único. Si el último producto tiene `id: 8`, el nuevo debe ser `id: 9`.

### ✏️ Editar un producto

Busca el producto por su `name` o `id` en el JSON y cambia los valores que necesites.

**Ejemplo — cambiar precio:**
```json
"price": 389  →  "price": 420
```

### ❌ Eliminar un producto

Borra toda la línea del objeto incluyendo la `{` de apertura, la `}` de cierre, y la coma antes o después.

**Antes:**
```json
[
  { "id": 1, "name": "Producto A", ... },
  { "id": 2, "name": "Producto B", ... },
  { "id": 3, "name": "Producto C", ... }
]
```

**Después de eliminar el producto 2:**
```json
[
  { "id": 1, "name": "Producto A", ... },
  { "id": 3, "name": "Producto C", ... }
]
```

> ⚠️ Asegúrate de que el JSON sea válido. Puedes verificarlo en https://jsonlint.com

---

## 🖼️ Cómo cambiar imágenes

1. **Agrega tu imagen** a la carpeta `images/`
   - Formatos soportados: `.jpg`, `.jpeg`, `.png`, `.webp`
   - Tamaño recomendado: **600×600 px** (cuadrada)
   - Peso máximo recomendado: **200 KB** (para que cargue rápido en celular)

2. **Referencia la imagen** en `products.json`:
   ```json
   "image": "images/nombre-de-tu-imagen.jpg"
   ```

3. Si un producto **no tiene imagen**, simplemente pon `""` o elimina el campo `"image"`.
   El catálogo mostrará automáticamente un emoji según la categoría.

### Herramientas gratuitas para optimizar imágenes
- **Squoosh** (web): https://squoosh.app
- **TinyPNG** (web): https://tinypng.com

---

## 📦 Cómo subir a internet (hosting gratuito)

### Opción 1 — Netlify (más fácil, recomendado)
1. Ve a https://netlify.com y crea una cuenta gratis
2. Arrastra y suelta la carpeta `tobys-crew/` en el área de deploy
3. ¡Listo! Netlify te da una URL tipo `https://tobys-crew.netlify.app`

### Opción 2 — GitHub Pages
1. Sube el proyecto a un repositorio de GitHub
2. Ve a Settings → Pages → Source: `main` branch
3. GitHub publica el sitio automáticamente

---

## 📋 Qué pasa cuando un cliente hace un pedido

1. El cliente selecciona productos y cantidades
2. Llena su nombre, teléfono y dirección
3. Al presionar "Enviar por WhatsApp" se abre WhatsApp con un mensaje así:

```
🐾 Pedido - Toby's Crew

👤 Nombre: María García
📱 Teléfono: 477 123 4567
📍 Dirección: Calle Flores 45, Col. Centro

─── Productos ───
• Royal Canin Adulto (3 kg) × 2 = $778
• Pedigree Snack Dental (180 g) × 1 = $89

💰 Total estimado: $867 MXN

_Pedido generado desde el catálogo web de Toby's Crew_
```

4. El cliente envía el mensaje y tú lo recibes en tu WhatsApp

> 💡 El pedido también queda registrado en la **Consola del navegador** (F12 → Consola).
> En el futuro puedes conectar un formulario como Formspree o un Google Sheet para guardar pedidos automáticamente.

---

## 🎨 Personalización rápida

### Cambiar colores
Abre `css/style.css` y modifica las variables al inicio del archivo:

```css
:root {
  --gold:       #C8860A;  ← Color principal (dorado)
  --green:      #2D6A4F;  ← Color categoría gato
  --ink:        #1A1208;  ← Color oscuro / texto
  --cream:      #FAF6EF;  ← Fondo general
}
```

### Cambiar nombre de la tienda
- En `js/app.js`: `const STORE_NAME = "Toby's Crew";`
- En `index.html`: busca "Toby's Crew" y reemplaza

### Agregar una nueva categoría
1. Agrega productos con una nueva `category` en `products.json` (ej: `"ave"`)
2. Agrega el filtro en `index.html`:
   ```html
   <button class="filter-chip" data-filter="ave">🐦 Aves</button>
   ```
3. Agrega el estilo del tag en `css/style.css`:
   ```css
   .tag-ave { background: #E8F4FD; color: #1A6B9A; }
   ```

---

## ❓ Preguntas frecuentes

**¿Necesito saber programar para modificar el catálogo?**
No. Solo editas el archivo `products.json` como si fuera una lista de texto.

**¿Funciona en celular?**
Sí. El diseño está optimizado primero para móvil.

**¿Los pedidos se guardan en algún lado?**
Por ahora solo en WhatsApp y en la consola del navegador. Para guardarlos automáticamente, puedes integrar Formspree (gratis) más adelante.

**¿Puedo tener más de 3 categorías?**
Sí, puedes agregar las que quieras siguiendo las instrucciones de "Agregar nueva categoría".
