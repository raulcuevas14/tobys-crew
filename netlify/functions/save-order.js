exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const NOTION_KEY = process.env.NOTION_KEY;
  const NOTION_DB  = process.env.NOTION_DB;

  try {
    const data = JSON.parse(event.body);

    // Primero buscamos la base de datos hija dentro de la página
    const searchRes = await fetch("https://api.notion.com/v1/search", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NOTION_KEY}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28"
      },
      body: JSON.stringify({
        query: "Pedidos",
        filter: { value: "database", property: "object" }
      })
    });

    const searchData = await searchRes.json();
    console.log("Databases encontradas:", JSON.stringify(searchData.results?.map(r => ({ id: r.id, title: r.title?.[0]?.plain_text }))));

    // Tomamos la primera base de datos que encuentre
    const database = searchData.results?.[0];
    if (!database) {
      return { statusCode: 500, body: JSON.stringify({ error: "No se encontró ninguna base de datos en Notion" }) };
    }

    const dbId = database.id;
    console.log("Usando database_id:", dbId);

    const response = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NOTION_KEY}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28"
      },
      body: JSON.stringify({
        parent: { database_id: dbId },
        properties: {
          Cliente: {
            title: [{ text: { content: data.nombre || "" } }]
          },
          Telefono: {
            phone_number: data.telefono || ""
          },
          Direccion: {
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
