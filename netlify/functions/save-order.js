exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };
  const NOTION_KEY = process.env.NOTION_KEY;
  try {
    const data = JSON.parse(event.body);
    const searchRes = await fetch("https://api.notion.com/v1/search", {
      method: "POST",
      headers: { "Authorization": `Bearer ${NOTION_KEY}`, "Content-Type": "application/json", "Notion-Version": "2022-06-28" },
      body: JSON.stringify({ query: "Pedidos", filter: { value: "database", property: "object" } })
    });
    const searchData = await searchRes.json();
    const database   = searchData.results?.[0];
    if (!database) return { statusCode: 500, body: JSON.stringify({ error: "No se encontró DB Pedidos" }) };

    const productosTexto = data.items
      ? data.items.map(i => `${i.name} × ${i.qty} = $${i.subtotal} (+${(i.puntos||0)*i.qty}pts)`).join(", ")
      : (data.productos || "");
    const itemsJSON  = data.items ? JSON.stringify(data.items) : "";
    const puntosTotal = data.items ? data.items.reduce((s, i) => s + ((i.puntos||0) * i.qty), 0) : 0;

    const response = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: { "Authorization": `Bearer ${NOTION_KEY}`, "Content-Type": "application/json", "Notion-Version": "2022-06-28" },
      body: JSON.stringify({
        parent: { database_id: database.id },
        properties: {
          Cliente:   { title:        [{ text: { content: data.nombre   || "" } }] },
          Telefono:  { phone_number:  data.telefono  || "" },
          Direccion: { rich_text:    [{ text: { content: data.direccion || "" } }] },
          Producto:  { rich_text:    [{ text: { content: productosTexto.slice(0, 2000) } }] },
          Items:     { rich_text:    [{ text: { content: itemsJSON.slice(0, 2000) } }] },
          Total:     { number:        data.total || 0 },
          Puntos:    { number:        puntosTotal },
          Fecha:     { date:          { start: new Date().toISOString().split("T")[0] } },
          Estatus:   { multi_select: [{ name: "Nuevo" }] }
        }
      })
    });

    if (!response.ok) {
      const err = await response.json();
      console.error("Notion error:", err);
      return { statusCode: 500, body: JSON.stringify({ error: "Error al guardar", detail: err }) };
    }
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
