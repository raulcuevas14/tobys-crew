# 🐾 Toby's Crew — Investigador de Precios

Script de Python que busca precios en Google Shopping México y genera un reporte Excel con métricas estadísticas para ayudarte a fijar precios competitivos.

---

## 📁 Archivos

```
price-research/
├── buscar_precios.py   ← Script principal
├── productos.txt       ← Lista de productos (opción alternativa)
└── reportes/           ← Aquí se guardan los Excel generados (se crea automáticamente)
```

---

## 🚀 Instalación

Abre la terminal y ejecuta:

```bash
pip3 install requests openpyxl
```

---

## 🔑 Obtener API Key de SerpApi

1. Ve a https://serpapi.com y crea una cuenta gratis
2. En el dashboard, copia tu **API Key**
3. Abre `buscar_precios.py` y reemplaza en la línea 17:
   ```python
   SERPAPI_KEY = "TU_API_KEY_AQUI"
   ```
   Por tu key real:
   ```python
   SERPAPI_KEY = "abc123xyz..."
   ```

El plan gratuito incluye **100 búsquedas/mes** — suficiente para tu catálogo completo.

---

## ▶️ Cómo ejecutar

### Opción A — Con tu catálogo (products.json)

Copia tu archivo `products.json` del proyecto Toby's Crew a esta carpeta y ejecuta:

```bash
python3 buscar_precios.py products.json
```

### Opción B — Con lista manual (productos.txt)

Edita `productos.txt` con un producto por línea y ejecuta:

```bash
python3 buscar_precios.py productos.txt
```

---

## 📊 Qué incluye el reporte Excel

### Hoja "Resumen"
Una fila por producto con todas las métricas:

| Métrica | Qué significa | Para qué sirve |
|---|---|---|
| **Mínimo** | Precio más bajo encontrado | Tu piso — no debes bajar de aquí |
| **Máximo** | Precio más alto encontrado | El techo del mercado |
| **Promedio** | Media aritmética | Referencia general |
| **Mediana** | Valor central | Más estable que el promedio si hay outliers |
| **Desv. Std** | Qué tan dispersos están los precios | Alta = mercado inconsistente |
| **CV (%)** | Coeficiente de variación | <20% = mercado estable, >40% = muy variado |
| **IQR** | Rango intercuartil | Dispersión del 50% central de precios |
| **Precio P40** | Percentil 40 | **Tu precio sugerido**: competitivo sin ser el más barato |
| **Diferencia** | P40 vs tu precio actual | Verde = puedes subir, Rojo = estás caro |

### Hojas individuales por producto
Cada producto tiene su propia hoja con los 10 resultados encontrados: tienda, nombre exacto del producto, precio y link.

---

## 💡 Cómo usar los resultados para fijar precios

1. **Si CV < 20%**: El mercado es estable. Usa el precio P40 como referencia directa.
2. **Si CV 20-40%**: Hay variación. Revisa los resultados individuales para entender por qué.
3. **Si CV > 40%**: Mucha variación (distintas presentaciones mezcladas). Revisa manualmente.
4. **Diferencia en verde**: Tu precio actual está por debajo del mercado — tienes margen para subir.
5. **Diferencia en rojo**: Tu precio está por encima del P40 — considera ajustarlo.

---

## ⚙️ Configuración adicional

En `buscar_precios.py` puedes cambiar:

```python
RESULTADOS = 10    # Cuántos resultados buscar por producto (máx 10 recomendado)
PAIS       = "mx"  # País: "mx" México, "us" USA, "co" Colombia
```
