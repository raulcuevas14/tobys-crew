exports.handler = async (event) => {
  const NOTION_KEY = process.env.NOTION_KEY;

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers };
  }

  try {
    // 1. Buscar la DB de pedidos
    const searchRes = await fetch("https://api.notion.com/v1/search", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NOTION_KEY}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28"
      },
      body: JSON.stringify({
        filter: { value: "database", property: "object" }
      })
    });
    const searchData = await searchRes.json();
    const pedidosDB  = searchData.results?.find(r => r.title?.[0]?.plain_text === "Pedidos");
    const clientesDB = searchData.results?.find(r => r.title?.[0]?.plain_text === "Clientes Fidelidad");

    if (!pedidosDB) return { statusCode: 404, headers, body: JSON.stringify({ error: "No se encontró DB Pedidos" }) };

    // 2. Leer todos los pedidos entregados
    const pedidosRes = await fetch(`https://api.notion.com/v1/databases/${pedidosDB.id}/query`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NOTION_KEY}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28"
      },
      body: JSON.stringify({ page_size: 100 })
    });
    const pedidosData = await pedidosRes.json();

    // 3. Agrupar por cliente
    const clientesMap = {};
    for (const page of pedidosData.results) {
      const props    = page.properties;
      const nombre   = props.Cliente?.title?.[0]?.plain_text?.trim();
      const telefono = props.Telefono?.phone_number?.trim() || "";
      const total    = props.Total?.number || 0;
      const estatus  = props.Estatus?.multi_select?.[0]?.name || "";
      const fecha    = props.Fecha?.date?.start || "";
      if (!nombre) continue;

      const key = telefono || nombre;
      if (!clientesMap[key]) {
        clientesMap[key] = {
          nombre, telefono,
          totalPedidos: 0, totalCompras: 0,
          pedidosEntregados: 0, ultimaCompra: "",
        };
      }
      clientesMap[key].totalPedidos++;
      clientesMap[key].totalCompras += total;
      if (estatus === "Entregado") clientesMap[key].pedidosEntregados++;
      if (fecha > clientesMap[key].ultimaCompra) clientesMap[key].ultimaCompra = fecha;
    }

    // 4. Si existe DB de fidelidad, leer canjes registrados
    let canjesMap = {};
    if (clientesDB) {
      const canjesRes = await fetch(`https://api.notion.com/v1/databases/${clientesDB.id}/query`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${NOTION_KEY}`,
          "Content-Type": "application/json",
          "Notion-Version": "2022-06-28"
        },
        body: JSON.stringify({ page_size: 100 })
      });
      const canjesData = await canjesRes.json();
      for (const page of canjesData.results) {
        const props    = page.properties;
        const tel      = props.Telefono?.phone_number?.trim() || props.Cliente?.title?.[0]?.plain_text?.trim();
        const canjes   = props.Canjes?.number || 0;
        const notas    = props.Notas?.rich_text?.[0]?.plain_text || "";
        const pageId   = page.id;
        if (tel) canjesMap[tel] = { canjes, notas, pageId };
      }
    }

    // 5. Combinar datos
    const clientes = Object.values(clientesMap).map(c => {
      const key    = c.telefono || c.nombre;
      const canje  = canjesMap[key] || { canjes: 0, notas: "", pageId: null };
      return { ...c, canjesRecibidos: canje.canjes, notasCanje: canje.notas, canjePageId: canje.pageId };
    }).sort((a, b) => b.totalCompras - a.totalCompras);

    return { statusCode: 200, headers, body: JSON.stringify({ clientes, tieneDBFidelidad: !!clientesDB }) };

  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
