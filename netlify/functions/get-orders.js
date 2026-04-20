exports.handler = async (event) => {
  const NOTION_KEY = process.env.NOTION_KEY;

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  try {
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
    const database   = searchData.results?.[0];
    if (!database) return { statusCode: 404, headers, body: JSON.stringify({ error: "Base de datos no encontrada" }) };

    const dbRes = await fetch(`https://api.notion.com/v1/databases/${database.id}/query`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NOTION_KEY}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28"
      },
      body: JSON.stringify({
        sorts: [{ property: "Fecha", direction: "descending" }],
        page_size: 100
      })
    });

    const dbData = await dbRes.json();
    const pedidos = dbData.results.map(page => {
      const props = page.properties;
      return {
        id:        page.id,
        cliente:   props.Cliente?.title?.[0]?.plain_text   || "",
        telefono:  props.Telefono?.phone_number             || "",
        direccion: props.Direccion?.rich_text?.[0]?.plain_text || "",
        productos: props.Producto?.rich_text?.[0]?.plain_text  || "",
        itemsJSON: props.Items?.rich_text?.[0]?.plain_text     || "",  // ← campo añadido
        total:     props.Total?.number                      || 0,
        fecha:     props.Fecha?.date?.start                 || "",
        estatus:   props.Estatus?.multi_select?.[0]?.name  || "Nuevo",
      };
    });

    return { statusCode: 200, headers, body: JSON.stringify({ pedidos }) };

  } catch (err) {
    console.error("Error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
