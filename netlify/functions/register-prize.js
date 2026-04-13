exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };
  const NOTION_KEY = process.env.NOTION_KEY;
  const headers    = { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" };

  try {
    const { nombre, telefono, premio, puntosUsados, pageId } = JSON.parse(event.body);
    const searchRes = await fetch("https://api.notion.com/v1/search", {
      method: "POST",
      headers: { "Authorization": `Bearer ${NOTION_KEY}`, "Content-Type": "application/json", "Notion-Version": "2022-06-28" },
      body: JSON.stringify({ filter: { value: "database", property: "object" } })
    });
    const searchData = await searchRes.json();
    let clientesDB   = searchData.results?.find(r => r.title?.[0]?.plain_text === "Clientes Fidelidad");

    if (!clientesDB) {
      const pedidosDB = searchData.results?.find(r => r.title?.[0]?.plain_text === "Pedidos");
      if (!pedidosDB) return { statusCode: 500, headers, body: JSON.stringify({ error: "No se encontró DB Pedidos" }) };
      const parentId = pedidosDB.parent?.page_id || pedidosDB.parent?.database_id;
      const createRes = await fetch("https://api.notion.com/v1/databases", {
        method: "POST",
        headers: { "Authorization": `Bearer ${NOTION_KEY}`, "Content-Type": "application/json", "Notion-Version": "2022-06-28" },
        body: JSON.stringify({
          parent: { type: "page_id", page_id: parentId },
          title: [{ type: "text", text: { content: "Clientes Fidelidad" } }],
          properties: {
            "Cliente":         { title: {} },
            "Telefono":        { phone_number: {} },
            "Canjes":          { number: { format: "number" } },
            "PuntosCanjeados": { number: { format: "number" } },
            "Notas":           { rich_text: {} },
            "Actualizado":     { date: {} }
          }
        })
      });
      clientesDB = await createRes.json();
    }

    const fecha    = new Date().toISOString().split("T")[0];
    const notaNueva = `${fecha}: ${premio} (−${puntosUsados || 0} pts)`;

    if (pageId) {
      const getRes  = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
        headers: { "Authorization": `Bearer ${NOTION_KEY}`, "Notion-Version": "2022-06-28" }
      });
      const getData         = await getRes.json();
      const canjesActuales  = getData.properties?.Canjes?.number || 0;
      const ptsActuales     = getData.properties?.PuntosCanjeados?.number || 0;
      const notasActuales   = getData.properties?.Notas?.rich_text?.[0]?.plain_text || "";
      await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${NOTION_KEY}`, "Content-Type": "application/json", "Notion-Version": "2022-06-28" },
        body: JSON.stringify({
          properties: {
            Canjes:          { number: canjesActuales + 1 },
            PuntosCanjeados: { number: ptsActuales + (puntosUsados || 0) },
            Notas:           { rich_text: [{ text: { content: (notasActuales ? notasActuales + "\n" : "") + notaNueva } }] },
            Actualizado:     { date: { start: fecha } }
          }
        })
      });
    } else {
      await fetch("https://api.notion.com/v1/pages", {
        method: "POST",
        headers: { "Authorization": `Bearer ${NOTION_KEY}`, "Content-Type": "application/json", "Notion-Version": "2022-06-28" },
        body: JSON.stringify({
          parent: { database_id: clientesDB.id },
          properties: {
            Cliente:         { title: [{ text: { content: nombre || "" } }] },
            Telefono:        { phone_number: telefono || "" },
            Canjes:          { number: 1 },
            PuntosCanjeados: { number: puntosUsados || 0 },
            Notas:           { rich_text: [{ text: { content: notaNueva } }] },
            Actualizado:     { date: { start: fecha } }
          }
        })
      });
    }
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
