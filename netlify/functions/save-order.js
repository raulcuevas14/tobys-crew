exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const NOTION_KEY = process.env.NOTION_KEY;
  const NOTION_DB  = process.env.NOTION_DB;

  try {
    const data = JSON.parse(event.body);

    const response = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NOTION_KEY}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28"
      },
      body: JSON.stringify({
        parent: { database_id: NOTION_DB },
        properties: {
          Cliente: {
            title: [{ text: { content: data.nombre || "" } }]
          },
          Teléfono: {
            phone_number: data.telefono || ""
          },
          Dirección: {
            rich_text: [{ text: { content: data.direccion || "" } }]
          },
          Producto: {
            rich_text: [{ text: { content: data.productos || "" } }]
          },
          Total: {
            number: data.total || 0
          },
          Fecha: {
            date: { start: new Date().toISOString().split("T")[0] }
          },
          Estatus: {
            select: { name: "Nuevo" }
          }
        }
      })
    });

    if (!response.ok) {
      const err = await response.json();
      console.error("Notion error:", err);
      return { statusCode: 500, body: JSON.stringify({ error: "Error al guardar en Notion", detail: err }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true })
    };

  } catch (err) {
    console.error("Function error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
