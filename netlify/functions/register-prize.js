exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  const NOTION_KEY = process.env.NOTION_KEY;
  const headers    = { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" };

  try {
    const { nombre, telefono, premio, pageId } = JSON.parse(event.body);

    // Buscar todas las DBs disponibles
    const searchRes = await fetch("https://api.notion.com/v1/search", {
      method: "POST",
      headers: { "Authorization": `Bearer ${NOTION_KEY}`, "Content-Type": "application/json", "Notion-Version": "2022-06-28" },
      body: JSON.stringify({ filter: { value: "database", property: "object" } })
    });
    const searchData = await searchRes.json();
    let clientesDB   = searchData.results?.find(r => r.title?.[0]?.plain_text === "Clientes Fidelidad");

    // Si no existe, buscar la DB de Pedidos para usar su página padre
    if (!clientesDB) {
      const pedidosDB = searchData.results?.find(r => r.title?.[0]?.plain_text === "Pedidos");
      if (!pedidosDB) return { statusCode: 500, headers, body: JSON.stringify({ error: "No se encontró la DB Pedidos para crear Clientes Fidelidad" }) };

      const parentId = pedidosDB.parent?.page_id || pedidosDB.parent?.database_id;
      if (!parentId) return { statusCode: 500, headers, body: JSON.stringify({ error: "No se pudo obtener página padre" }) };

      // Crear DB Clientes Fidelidad en la misma página que Pedidos
      const createRes = await fetch("https://api.notion.com/v1/databases", {
        method: "POST",
        headers: { "Authorization": `Bearer ${NOTION_KEY}`, "Content-Type": "application/json", "Notion-Version": "2022-06-28" },
        body: JSON.stringify({
          parent: { type: "page_id", page_id: parentId },
          title: [{ type: "text", text: { content: "Clientes Fidelidad" } }],
          properties: {
            "Cliente":     { title: {} },
            "Telefono":    { phone_number: {} },
            "Canjes":      { number: { format: "number" } },
            "Notas":       { rich_text: {} },
            "Actualizado": { date: {} }
          }
        })
      });
      const createData = await createRes.json();
      if (!createRes.ok) {
        console.error("Error creando DB:", createData);
        return { statusCode: 500, headers, body: JSON.stringify({ error: "No se pudo crear DB de fidelidad", detail: createData }) };
      }
      clientesDB = createData;
    }

    const dbId  = clientesDB.id;
    const fecha = new Date().toISOString().split("T")[0];

    if (pageId) {
      // Actualizar registro existente
      const getRes  = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
        headers: { "Authorization": `Bearer ${NOTION_KEY}`, "Notion-Version": "2022-06-28" }
      });
      const getData       = await getRes.json();
      const canjesActuales = getData.properties?.Canjes?.number || 0;
      const notasActuales  = getData.properties?.Notas?.rich_text?.[0]?.plain_text || "";
      const nuevaNota      = notasActuales ? `${notasActuales}\n${fecha}: ${premio}` : `${fecha}: ${premio}`;

      const patchRes = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${NOTION_KEY}`, "Content-Type": "application/json", "Notion-Version": "2022-06-28" },
        body: JSON.stringify({
          properties: {
            Canjes:      { number: canjesActuales + 1 },
            Notas:       { rich_text: [{ text: { content: nuevaNota.slice(0, 2000) } }] },
            Actualizado: { date: { start: fecha } }
          }
        })
      });
      if (!patchRes.ok) {
        const err = await patchRes.json();
        return { statusCode: 500, headers, body: JSON.stringify({ error: "Error actualizando", detail: err }) };
      }
    } else {
      // Crear nuevo registro
      const createRes = await fetch("https://api.notion.com/v1/pages", {
        method: "POST",
        headers: { "Authorization": `Bearer ${NOTION_KEY}`, "Content-Type": "application/json", "Notion-Version": "2022-06-28" },
        body: JSON.stringify({
          parent: { database_id: dbId },
          properties: {
            Cliente:     { title: [{ text: { content: nombre || "" } }] },
            Telefono:    { phone_number: telefono || "" },
            Canjes:      { number: 1 },
            Notas:       { rich_text: [{ text: { content: `${fecha}: ${premio}` } }] },
            Actualizado: { date: { start: fecha } }
          }
        })
      });
      if (!createRes.ok) {
        const err = await createRes.json();
        return { statusCode: 500, headers, body: JSON.stringify({ error: "Error creando registro", detail: err }) };
      }
    }

    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };

  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
