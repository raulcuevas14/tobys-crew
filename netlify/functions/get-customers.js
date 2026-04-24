exports.handler = async (event) => {
  const NOTION_KEY = process.env.NOTION_KEY;
  const headers = { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" };
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers };

  try {
    // ── 1. Buscar DBs
    const searchRes = await fetch("https://api.notion.com/v1/search", {
      method: "POST",
      headers: { "Authorization": `Bearer ${NOTION_KEY}`, "Content-Type": "application/json", "Notion-Version": "2022-06-28" },
      body: JSON.stringify({ filter: { value: "database", property: "object" } })
    });
    const searchData = await searchRes.json();
    const pedidosDB  = searchData.results?.find(r => r.title?.[0]?.plain_text === "Pedidos");
    const clientesDB = searchData.results?.find(r => r.title?.[0]?.plain_text === "Clientes Fidelidad");
    if (!pedidosDB) return { statusCode: 404, headers, body: JSON.stringify({ error: "No se encontró DB Pedidos" }) };

    // ── 2. Leer todos los pedidos
    const pedidosRes = await fetch(`https://api.notion.com/v1/databases/${pedidosDB.id}/query`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${NOTION_KEY}`, "Content-Type": "application/json", "Notion-Version": "2022-06-28" },
      body: JSON.stringify({ sorts: [{ property: "Fecha", direction: "descending" }], page_size: 100 })
    });
    const pedidosData = await pedidosRes.json();

    // ── 3. Agrupar por cliente calculando puntos por pedido
    const clientesMap = {};
    for (const page of pedidosData.results) {
      const props     = page.properties;
      const nombre    = props.Cliente?.title?.[0]?.plain_text?.trim();
      const telefono  = props.Telefono?.phone_number?.trim() || "";
      const total     = props.Total?.number || 0;
      const estatus   = props.Estatus?.multi_select?.[0]?.name || "";
      const fecha     = props.Fecha?.date?.start || "";
      const itemsJSON = props.Items?.rich_text?.[0]?.plain_text || "";
      if (!nombre) continue;

      const key = telefono || nombre;
      if (!clientesMap[key]) {
        clientesMap[key] = {
          nombre, telefono,
          totalPedidos: 0, totalCompras: 0,
          pedidosEntregados: 0, ultimaCompra: "",
          puntosGanados: 0,
          historialPuntos: []
        };
      }

      clientesMap[key].totalPedidos++;
      clientesMap[key].totalCompras += total;
      if (fecha > clientesMap[key].ultimaCompra) clientesMap[key].ultimaCompra = fecha;

      // Puntos SOLO de pedidos Entregados
      if (estatus === "Entregado") {
        clientesMap[key].pedidosEntregados++;
        let puntosPedido = 0;
        let productosPedido = [];
        if (itemsJSON) {
          try {
            const items = JSON.parse(itemsJSON);
            items.forEach(item => {
              const pts = (item.puntos || 0) * (item.qty || 0);
              puntosPedido += pts;
              if (pts > 0) {
                productosPedido.push(`${item.name}${item.qty > 1 ? ` x${item.qty}` : ""} (+${pts} pts)`);
              }
            });
          } catch(e) {}
        }
        clientesMap[key].puntosGanados += puntosPedido;
        clientesMap[key].historialPuntos.push({ fecha, total, puntos: puntosPedido, productos: productosPedido });
      }
    }

    // ── 4. Leer canjes de Clientes Fidelidad
    let canjesMap = {};
    if (clientesDB) {
      const canjesRes = await fetch(`https://api.notion.com/v1/databases/${clientesDB.id}/query`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${NOTION_KEY}`, "Content-Type": "application/json", "Notion-Version": "2022-06-28" },
        body: JSON.stringify({ page_size: 100 })
      });
      const canjesData = await canjesRes.json();
      for (const page of canjesData.results) {
        const props = page.properties;
        const tel   = props.Telefono?.phone_number?.trim() || props.Cliente?.title?.[0]?.plain_text?.trim();
        if (tel) canjesMap[tel] = {
          canjes:          props.Canjes?.number          || 0,
          puntosCanjeados: props.PuntosCanjeados?.number || 0,
          notas:           props.Notas?.rich_text?.[0]?.plain_text || "",
          pageId:          page.id
        };
      }
    }

    // ── 5. Combinar
    const clientes = Object.values(clientesMap).map(c => {
      const key   = c.telefono || c.nombre;
      const canje = canjesMap[key] || { canjes: 0, puntosCanjeados: 0, notas: "", pageId: null };
      return {
        ...c,
        canjesRecibidos:   canje.canjes,
        puntosCanjeados:   canje.puntosCanjeados,
        puntosDisponibles: Math.max(0, c.puntosGanados - canje.puntosCanjeados),
        notasCanje:        canje.notas,
        canjePageId:       canje.pageId
      };
    }).sort((a, b) => (b.puntosDisponibles || 0) - (a.puntosDisponibles || 0));

    // ── 6. Sincronizar puntos ganados a Notion (Clientes Fidelidad)
    if (clientesDB) {
      const fecha = new Date().toISOString().split("T")[0];
      for (const c of clientes) {
        if (c.puntosGanados === 0) continue; // sin puntos, no hace falta crear registro
        const key   = c.telefono || c.nombre;
        const canje = canjesMap[key];

        if (canje?.pageId) {
          // Actualizar PuntosGanados en registro existente
          await fetch(`https://api.notion.com/v1/pages/${canje.pageId}`, {
            method: "PATCH",
            headers: { "Authorization": `Bearer ${NOTION_KEY}`, "Content-Type": "application/json", "Notion-Version": "2022-06-28" },
            body: JSON.stringify({
              properties: {
                PuntosGanados: { number: c.puntosGanados },
                Actualizado:   { date: { start: fecha } }
              }
            })
          }).catch(() => {});
        } else {
          // Crear nuevo registro en Clientes Fidelidad
          await fetch("https://api.notion.com/v1/pages", {
            method: "POST",
            headers: { "Authorization": `Bearer ${NOTION_KEY}`, "Content-Type": "application/json", "Notion-Version": "2022-06-28" },
            body: JSON.stringify({
              parent: { database_id: clientesDB.id },
              properties: {
                Cliente:         { title:       [{ text: { content: c.nombre   || "" } }] },
                Telefono:        { phone_number: c.telefono || "" },
                Canjes:          { number: 0 },
                PuntosCanjeados: { number: 0 },
                PuntosGanados:   { number: c.puntosGanados },
                Notas:           { rich_text: [] },
                Actualizado:     { date: { start: fecha } }
              }
            })
          }).catch(() => {});
        }
      }
    }

    return { statusCode: 200, headers, body: JSON.stringify({ clientes }) };

  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
