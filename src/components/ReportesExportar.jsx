import React, { useState, useRef, useEffect } from "react";

/**
 * =========================================================================
 * COMPONENTE: ReportesExportar.jsx
 * DESCRIPCIÓN: Módulo de Reportes con filtrado condicional flexible.
 * - Si el campo de búsqueda está en blanco, lista e imprime TODO el catálogo
 *   según el filtro de tipo (General, Entradas o Salidas) y rango de fechas.
 * - Si se escribe un texto, aplica filtro en tiempo real en mayúsculas y sugerencias.
 * =========================================================================
 */
export default function ReportesExportar({
  lotes = [],
  historialMovimientos = []
}) {
  const [tipoReporte, setTipoReporte] = useState("TODOS");
  const [busquedaTexto, setBusquedaTexto] = useState("");
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

  // Filtros de fecha (Desde / Hasta)
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const contenedorBusquedaRef = useRef(null);
  const textoLimpio = busquedaTexto.trim().toUpperCase();

  // Cerrar lista de sugerencias al hacer clic fuera
  useEffect(() => {
    const clickAfuera = (e) => {
      if (contenedorBusquedaRef.current && !contenedorBusquedaRef.current.contains(e.target)) {
        setMostrarSugerencias(false);
      }
    };
    document.addEventListener("mousedown", clickAfuera);
    return () => document.removeEventListener("mousedown", clickAfuera);
  }, []);

  // Sugerencias predictivas basadas en coincidencias
  const sugerencias = textoLimpio
    ? historialMovimientos
        .filter((m) => {
          return (
            (m.codigo && m.codigo.toUpperCase().includes(textoLimpio)) ||
            (m.nombreProducto && m.nombreProducto.toUpperCase().includes(textoLimpio)) ||
            (m.lote && m.lote.toUpperCase().includes(textoLimpio))
          );
        })
        .reduce((acc, current) => {
          const existe = acc.find((item) => item.codigo === current.codigo && item.lote === current.lote);
          if (!existe) return acc.concat([current]);
          return acc;
        }, [])
    : [];

  const handleSeleccionarSugerencia = (item) => {
    setBusquedaTexto(item.codigo || item.nombreProducto || item.lote);
    setMostrarSugerencias(false);
  };

  // =========================================================================
  // MOTOR DE FILTRADO: Si el texto está vacío, incluye todos los registros
  // =========================================================================
  const movimientosFiltrados = historialMovimientos.filter((m) => {
    // 1. Filtro por texto: si está vacío pasa directo (true)
    const coincideTexto =
      !textoLimpio ||
      (m.codigo && m.codigo.toUpperCase().includes(textoLimpio)) ||
      (m.serial && m.serial.toUpperCase().includes(textoLimpio)) ||
      (m.nombreProducto && m.nombreProducto.toUpperCase().includes(textoLimpio)) ||
      (m.lote && m.lote.toUpperCase().includes(textoLimpio)) ||
      (m.usuario && m.usuario.toUpperCase().includes(textoLimpio));

    // 2. Filtro por tipo: TODOS, ENTRADA o SALIDA
    const coincideTipo = tipoReporte === "TODOS" || m.tipo === tipoReporte;

    // 3. Filtro por rango de fechas (si se definieron)
    let coincideFecha = true;
    if (fechaInicio && m.fecha < fechaInicio) coincideFecha = false;
    if (fechaFin && m.fecha > fechaFin) coincideFecha = false;

    return coincideTexto && coincideTipo && coincideFecha;
  });

  const fechaHoy = new Date().toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" });
  const totalEntradas = movimientosFiltrados.filter((m) => m.tipo === "ENTRADA").reduce((acc, m) => acc + Number(m.cantidadUnds), 0);
  const totalSalidas = movimientosFiltrados.filter((m) => m.tipo === "SALIDA").reduce((acc, m) => acc + Number(m.cantidadUnds), 0);

  // =========================================================================
  // IMPRESIÓN OFICIAL EN PDF CON LOGO
  // =========================================================================
  const imprimirReporte = () => {
    if (movimientosFiltrados.length === 0) {
      alert("No hay registros que coincidan con los filtros seleccionados.");
      return;
    }

    const ventana = window.open("", "_blank");
    ventana.document.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Reporte de Inventario - MI TIENDA</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; margin: 20px; color: #0f172a; }
          .header-reporte { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #0284c7; padding-bottom: 12px; margin-bottom: 15px; }
          .logo-box { display: flex; align-items: center; gap: 12px; }
          .logo-img { width: 48px; height: 48px; object-fit: contain; }
          .titulo-tienda { margin: 0; font-size: 19px; font-weight: 900; color: #0f172a; }
          .subtitulo { margin: 0; font-size: 10px; font-weight: bold; color: #0284c7; }
          .resumen-cajas { display: flex; gap: 15px; margin: 12px 0; background: #f8fafc; padding: 10px; border-radius: 6px; border: 1px solid #e2e8f0; }
          .resumen-item { font-size: 11px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th { background: #0f172a; color: #fff; text-align: left; padding: 7px; font-size: 10px; text-transform: uppercase; }
          td { padding: 6px 7px; border-bottom: 1px solid #e2e8f0; font-size: 10.5px; }
          tr:nth-child(even) { background-color: #f8fafc; }
          .badge-entrada { color: #166534; font-weight: bold; }
          .badge-salida { color: #991b1b; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header-reporte">
          <div class="logo-box">
            <img class="logo-img" src="${window.location.origin}/logo.svg" onerror="this.src='https://cdn-icons-png.flaticon.com/512/3081/3081840.png'" alt="Logo" />
            <div>
              <h1 class="titulo-tienda">MI TIENDA</h1>
              <p class="subtitulo">SISTEMA DE CONTROL &amp; GESTIÓN DE INVENTARIOS</p>
            </div>
          </div>
          <div style="text-align: right; font-size: 10px; color: #64748b;">
            <div><strong>Fecha de Emisión:</strong> ${fechaHoy}</div>
            <div><strong>Rango:</strong> ${fechaInicio || "Inicio"} al ${fechaFin || "Hoy"}</div>
            <div><strong>Filtro:</strong> ${tipoReporte} ${textoLimpio ? `(Criterio: ${textoLimpio})` : "(Todos los productos)"}</div>
          </div>
        </div>

        <div class="resumen-cajas">
          <div class="resumen-item"><strong>Entradas Registradas:</strong> <span style="color: #16a34a;">+${totalEntradas} unds</span></div>
          <div class="resumen-item"><strong>Salidas Realizadas:</strong> <span style="color: #dc2626;">-${totalSalidas} unds</span></div>
          <div class="resumen-item"><strong>Total Movimientos:</strong> ${movimientosFiltrados.length}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th>FECHA</th>
              <th>TIPO</th>
              <th>SKU / SERIE</th>
              <th>PRODUCTO</th>
              <th>LOTE</th>
              <th>F. VENCIMIENTO</th>
              <th>CANTIDAD</th>
              <th>MOTIVO</th>
              <th>RESPONSABLE</th>
            </tr>
          </thead>
          <tbody>
            ${movimientosFiltrados.map((m) => `
              <tr>
                <td>${m.fecha}</td>
                <td class="${m.tipo === "ENTRADA" ? "badge-entrada" : "badge-salida"}">${m.tipo}</td>
                <td><strong>${m.codigo}</strong></td>
                <td>${m.nombreProducto}</td>
                <td style="color: #0284c7; font-weight: bold;">${m.lote}</td>
                <td>${m.fechaVencimiento || "N/A"}</td>
                <td><strong>${m.cantidadUnds} unds</strong></td>
                <td>${m.motivo}</td>
                <td>${m.usuario || m.alias || m.nombreUsuario || `Usuario #${m.id_usuario || 'N/A'}`}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        <script>window.onload = function() { window.print(); };</script>
      </body>
      </html>
    `);
    ventana.document.close();
  };

  // =========================================================================
  // EXPORTACIÓN DE ARCHIVO CSV PARA EXCEL
  // =========================================================================
  const exportarCSV = () => {
    if (movimientosFiltrados.length === 0) {
      alert("No hay registros para exportar en este rango.");
      return;
    }
    const encabezados = ["Fecha", "Tipo", "SKU", "Producto", "Lote", "Fecha Vencimiento", "Cantidad Unds", "Motivo", "Responsable"];
    const filas = movimientosFiltrados.map((m) => [
      m.fecha,
      m.tipo,
      m.codigo,
      m.nombreProducto,
      m.lote,
      m.fechaVencimiento || "N/A",
      m.cantidadUnds,
      m.motivo,
      m.usuario
    ]);
    const csvContent = "\uFEFF" + [encabezados.join(";"), ...filas.map((e) => e.join(";"))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Reporte_${fechaInicio || "inicio"}_al_${fechaFin || "hoy"}.csv`;
    link.click();
  };

  return (
    <div style={estilos.tarjeta}>
      {/* Barra de Filtros y Rango de Fechas */}
      <div style={estilos.header}>
        <div>
          <strong style={{ color: "#0f172a", fontSize: "14px" }}>📊 Reportes y Auditoría Oficial</strong>
          <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "#64748b" }}>
            Si la búsqueda está vacía, se incluirán todos los productos según el tipo y rango de fechas.
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <span style={estilos.labelFecha}>Desde:</span>
            <input 
              type="date" 
              value={fechaInicio} 
              onChange={(e) => setFechaInicio(e.target.value)} 
              style={estilos.inputFecha} 
            />
          </div>

          <div>
            <span style={estilos.labelFecha}>Hasta:</span>
            <input 
              type="date" 
              value={fechaFin} 
              onChange={(e) => setFechaFin(e.target.value)} 
              style={estilos.inputFecha} 
            />
          </div>

          <div>
            <span style={estilos.labelFecha}>Tipo:</span>
            <select value={tipoReporte} onChange={(e) => setTipoReporte(e.target.value)} style={estilos.select}>
              <option value="TODOS">Consolidado General</option>
              <option value="ENTRADA">Solo Entradas</option>
              <option value="SALIDA">Solo Salidas</option>
            </select>
          </div>

          {/* Campo de búsqueda opcional con mayúsculas y lista desplegable */}
          <div style={{ position: "relative" }} ref={contenedorBusquedaRef}>
            <span style={estilos.labelFecha}>Búsqueda:</span>
            <input 
              type="text" 
              placeholder="SKU, PRODUCTO, LOTE..." 
              value={busquedaTexto} 
              onChange={(e) => {
                setBusquedaTexto(e.target.value.toUpperCase());
                setMostrarSugerencias(true);
              }}
              onFocus={() => { if (busquedaTexto.trim()) setMostrarSugerencias(true); }}
              style={estilos.input}
              autoComplete="off"
            />

            {mostrarSugerencias && sugerencias.length > 0 && (
              <div style={estilos.dropdownSugerencias}>
                {sugerencias.map((item) => (
                  <div
                    key={`${item.codigo}-${item.lote}`}
                    onClick={() => handleSeleccionarSugerencia(item)}
                    style={estilos.itemSugerencia}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f1f5f9")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ffffff")}
                  >
                    <strong style={{ color: "#0f172a", fontSize: "11px" }}>
                      {item.nombreProducto}
                    </strong>
                    <div style={{ fontSize: "10px", color: "#64748b" }}>
                      SKU: <strong>{item.codigo}</strong> | Lote: <strong style={{ color: "#0284c7" }}>{item.lote}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Botones para Imprimir PDF y Descargar CSV */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", margin: "10px 0" }}>
        <button onClick={imprimirReporte} style={estilos.btnPdf}>🖨️ Imprimir / PDF</button>
        <button onClick={exportarCSV} style={estilos.btnCsv}>📥 Descargar CSV</button>
      </div>

      {/* Tabla de Resultados */}
      <div style={{ overflowX: "auto" }}>
        <table style={estilos.tabla}>
          <thead>
            <tr>
              <th style={estilos.th}>FECHA</th>
              <th style={estilos.th}>TIPO</th>
              <th style={estilos.th}>SKU / SERIE</th>
              <th style={estilos.th}>PRODUCTO</th>
              <th style={estilos.th}>LOTE</th>
              <th style={estilos.th}>F. VENCIMIENTO</th>
              <th style={estilos.th}>CANTIDAD</th>
              <th style={estilos.th}>MOTIVO</th>
              <th style={estilos.th}>RESPONSABLE</th>
            </tr>
          </thead>
          <tbody>
            {movimientosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>
                  No se registran movimientos para los filtros seleccionados.
                </td>
              </tr>
            ) : (
              movimientosFiltrados.map((m) => (
                <tr key={m.id}>
                  <td style={estilos.td}>{m.fecha}</td>
                  <td style={estilos.td}>
                    <span style={{
                      padding: "2px 6px",
                      borderRadius: "4px",
                      fontSize: "10.5px",
                      fontWeight: "bold",
                      backgroundColor: m.tipo === "ENTRADA" ? "#dcfce7" : "#fee2e2",
                      color: m.tipo === "ENTRADA" ? "#166534" : "#991b1b"
                    }}>
                      {m.tipo}
                    </span>
                  </td>
                  <td style={estilos.td}><strong>{m.codigo}</strong></td>
                  <td style={estilos.td}>{m.nombreProducto} ({m.marca})</td>
                  <td style={{ ...estilos.td, color: "#0284c7", fontWeight: "bold" }}>{m.lote}</td>
                  <td style={{ ...estilos.td, color: "#c2410c", fontWeight: "600" }}>{m.fechaVencimiento || "N/A"}</td>
                  <td style={{ ...estilos.td, fontWeight: "bold" }}>{m.cantidadUnds} unds</td>
                  <td style={estilos.td}>{m.motivo}</td>
                  <td style={{ ...estilos.td, fontWeight: "600", color: "#334155" }}>👤 {m.usuario || m.alias || m.nombreUsuario || `Usuario #${m.id_usuario || 'Sistema'}`}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const estilos = {
  tarjeta: { background: "#ffffff", borderRadius: "10px", padding: "14px 18px", border: "1px solid #e2e8f0" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px" },
  labelFecha: { fontSize: "10px", fontWeight: "bold", color: "#475569", display: "block", marginBottom: "2px" },
  inputFecha: { padding: "5px 8px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "11px", background: "#ffffff" },
  select: { padding: "6px 8px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "11px", background: "#ffffff" },
  input: { padding: "6px 8px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "11px", width: "170px", textTransform: "uppercase", outline: "none" },
  dropdownSugerencias: { position: "absolute", top: "100%", left: 0, right: 0, background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "6px", marginTop: "4px", maxHeight: "150px", overflowY: "auto", zIndex: 100, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" },
  itemSugerencia: { padding: "6px 10px", cursor: "pointer", borderBottom: "1px solid #f1f5f9" },
  btnPdf: { background: "#0284c7", color: "#ffffff", border: "none", padding: "7px 14px", borderRadius: "5px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" },
  btnCsv: { background: "#0f766e", color: "#ffffff", border: "none", padding: "7px 14px", borderRadius: "5px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" },
  tabla: { width: "100%", borderCollapse: "collapse" },
  th: { background: "#0f172a", color: "#ffffff", textAlign: "left", padding: "8px 10px", fontSize: "10.5px", textTransform: "uppercase" },
  td: { padding: "8px 10px", borderBottom: "1px solid #e2e8f0", fontSize: "11.5px" }
};