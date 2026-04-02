exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  const NOTION_KEY = process.env.NOTION_KEY;
  const headers    = { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" };

  try {
    const { nombre, telefono, premio, pageId } = JSON.parse(event.body);

    // Buscar DB de fidelidad, crearla si no existe
    const searchRes = await fetch("https://api.notion.com/v1/search", {
      method: "POST",
      headers: { "Authorization": `Bearer ${NOTION_KEY}`, "Content-Type": "application/json", "Notion-Version": "2022-06-28" },
      body: JSON.stringify({ filter: { value: "database", property: "object" } })
    });
    const searchData  = await searchRes.json();
    let clientesDB    = searchData.results?.find(r => r.title?.[0]?.plain_text === "Clientes Fidelidad");
    let parentPageId  = searchData.results?.find(r => r.object === "page")?.id;

    // Crear DB si no existe
    if (!clientesDB && parentPageId) {
      const createRes = await fetch("https://api.notion.com/v1/databases", {
        method: "POST",
        headers: { "Authorization": `Bearer ${NOTION_KEY}`, "Content-Type": "application/json", "Notion-Version": "2022-06-28" },
        body: JSON.stringify({
          parent: { type: "page_id", page_id: parentPageId },
          title: [{ type: "text", text: { content: "Clientes Fidelidad" } }],
          properties: {
            "Cliente":   { title: {} },
            "Telefono":  { phone_number: {} },
            "Canjes":    { number: { format: "number" } },
            "Notas":     { rich_text: {} },
            "Actualizado": { date: {} }
          }
        })
      });
      clientesDB = await createRes.json();
    }

    if (!clientesDB) return { statusCode: 500, headers, body: JSON.stringify({ error: "No se pudo crear la DB de fidelidad" }) };

    const dbId  = clientesDB.id;
    const fecha = new Date().toISOString().split("T")[0];

    if (pageId) {
      // Actualizar registro existente
      const getRes  = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
        headers: { "Authorization": `Bearer ${NOTION_KEY}`, "Notion-Version": "2022-06-28" }
      });
      const getData = await getRes.json();
      const canjesActuales = getData.properties?.Canjes?.number || 0;
      const notasActuales  = getData.properties?.Notas?.rich_text?.[0]?.plain_text || "";
      const nuevaNota      = notasActuales ? `${notasActuales}\n${fecha}: ${premio}` : `${fecha}: ${premio}`;

      await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${NOTION_KEY}`, "Content-Type": "application/json", "Notion-Version": "2022-06-28" },
        body: JSON.stringify({
          properties: {
            Canjes:      { number: canjesActuales + 1 },
            Notas:       { rich_text: [{ text: { content: nuevaNota } }] },
            Actualizado: { date: { start: fecha } }
          }
        })
      });
    } else {
      // Crear nuevo registro
      await fetch("https://api.notion.com/v1/pages", {
        method: "POST",
        headers: { "Authorization": `Bearer ${NOTION_KEY}`, "Content-Type": "application/json", "Notion-Version": "2022-06-28" },
        body: JSON.stringify({
          parent: { database_id: dbId },
          properties: {
            Cliente:     { title: [{ text: { content: nombre } }] },
            Telefono:    { phone_number: telefono || "" },
            Canjes:      { number: 1 },
            Notas:       { rich_text: [{ text: { content: `${fecha}: ${premio}` } }] },
            Actualizado: { date: { start: fecha } }
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
