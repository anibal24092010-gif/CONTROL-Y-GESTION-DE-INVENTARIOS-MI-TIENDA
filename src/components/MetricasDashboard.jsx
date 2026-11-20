// =========================================================================
// IMPORTACIÓN DE LIBRERÍAS DE REACT
// =========================================================================
import React, { useState } from "react";

/**
 * =========================================================================
 * COMPONENTE: MetricasDashboard.jsx
 * DESCRIPCIÓN: Panel de indicadores clave de rendimiento (KPIs) del sistema.
 * Calcula en tiempo real: volumen total de inventario, existencias físicas,
 * alertas de bajo stock y alertas de vencimiento (<= 15 días o vencidos).
 * Incluye ventana modal al dar clic en Bajo Stock o Vencimiento.
 * =========================================================================
 */
function MetricasDashboard({ lotes = [] }) {
  const [modalActivo, setModalActivo] = useState(null); // "stock" | "vencimiento" | null

  const listaLotes = Array.isArray(lotes) ? lotes : [];

  // Helper para obtener días restantes de vencimiento
  const obtenerDiasRestantes = (lote) => {
    const fechaCaducidadStr =
      lote.vencimiento ||
      lote.fechaVencimiento ||
      lote.fechaVence ||
      lote.fecha_vencimiento;

    if (!fechaCaducidadStr || fechaCaducidadStr === "N/A") return null;

    const fechaHoy = new Date();
    fechaHoy.setHours(0, 0, 0, 0);

    const fechaVence = new Date(fechaCaducidadStr);
    if (Number.isNaN(fechaVence.getTime())) return null;

    fechaVence.setHours(0, 0, 0, 0);
    const diferenciaMilisegundos = fechaVence - fechaHoy;
    return Math.ceil(diferenciaMilisegundos / (1000 * 60 * 60 * 24));
  };

  // -----------------------------------------------------------------------
  // 1. MÉTRICA 1: TOTAL DE LOTES ACTIVOS REGISTRADOS
  // -----------------------------------------------------------------------
  const totalLotes = listaLotes.length;

  // -----------------------------------------------------------------------
  // 2. MÉTRICA 2: SUMATORIA TOTAL DE UNIDADES FÍSICAS INDIVIDUALES
  // -----------------------------------------------------------------------
  const totalUnidades = listaLotes.reduce(
    (acumulador, item) => acumulador + (Number(item.totalUnidades) || 0),
    0
  );

  // -----------------------------------------------------------------------
  // 3. MÉTRICA 3: ALERTAS DE BAJO STOCK (PUNTO DE REORDEN)
  // -----------------------------------------------------------------------
  const listaBajoStock = listaLotes.filter((l) => {
    const cantidadActual = Number(l.cantidadEmpaques) || 0;
    const minimoSeguridad = Number(l.stockMinimo) || 5;
    return cantidadActual <= minimoSeguridad;
  });
  const lotesBajoStock = listaBajoStock.length;

  // -----------------------------------------------------------------------
  // 4. MÉTRICA 4: ALERTAS DE VENCIMIENTO (<= 15 DÍAS O VENCIDOS)
  // -----------------------------------------------------------------------
  const listaPorVencer = listaLotes
    .map((l) => ({
      ...l,
      _diasRestantes: obtenerDiasRestantes(l),
    }))
    .filter((l) => l._diasRestantes !== null && l._diasRestantes <= 15);

  const lotesPorVencer = listaPorVencer.length;

  // Helpers para mostrar datos de forma segura sin depender de un solo nombre de campo
  const getNombreProducto = (l) =>
    l.nombreProducto || l.producto || l.nombre || "Producto sin nombre";

  const getSku = (l) => l.codigoSku || l.sku || l.codigo || "—";

  const getLote = (l) => l.numeroLote || l.lote || l.codigoLote || "—";

  const getUbicacion = (l) =>
    l.ubicacionBodega || l.ubicacion || l.estante || "—";

  const cerrarModal = () => setModalActivo(null);

  return (
    <>
      {/* Contenedor principal estructurado con CSS Grid para diseño responsivo */}
      <div style={estilos.grid}>
        {/* TARJETA KPI 1: TOTAL DE LOTES REGISTRADOS (SIN MODAL) */}
        <div style={{ ...estilos.card, borderLeft: "5px solid #0284c7" }}>
          <span style={estilos.titulo}>Lotes Registrados</span>
          <h2 style={estilos.valor}>{totalLotes}</h2>
        </div>

        {/* TARJETA KPI 2: TOTAL DE UNIDADES FÍSICAS EN EXISTENCIA (SIN MODAL) */}
        <div style={{ ...estilos.card, borderLeft: "5px solid #16a34a" }}>
          <span style={estilos.titulo}>Total Unidades Físicas</span>
          <h2 style={estilos.valor}>{totalUnidades.toLocaleString()} unds</h2>
        </div>

        {/* TARJETA KPI 3: ALERTAS DE REABASTECIMIENTO / BAJO STOCK (CON MODAL) */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setModalActivo("stock")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setModalActivo("stock");
          }}
          title="Clic para ver el detalle de lotes en bajo stock"
          style={{
            ...estilos.card,
            ...estilos.cardClickable,
            borderLeft: "5px solid #d97706",
          }}
        >
          <span style={estilos.titulo}>Alertas: Bajo Stock</span>
          <h2 style={{ ...estilos.valor, color: "#d97706" }}>
            {lotesBajoStock} lotes
          </h2>
          <span style={estilos.ayudaClic}>Clic para ver detalle</span>
        </div>

        {/* TARJETA KPI 4: ALERTAS DE VENCIMIENTO (<= 15 DÍAS) (CON MODAL) */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setModalActivo("vencimiento")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setModalActivo("vencimiento");
          }}
          title="Clic para ver lotes próximos a vencer (<= 15 días) o vencidos"
          style={{
            ...estilos.card,
            ...estilos.cardClickable,
            borderLeft: "5px solid #dc2626",
          }}
        >
          <span style={estilos.titulo}>Alertas: Vencimiento (&le; 15d)</span>
          <h2 style={{ ...estilos.valor, color: "#dc2626" }}>
            {lotesPorVencer}
          </h2>
          <span style={estilos.ayudaClic}>Clic para ver detalle</span>
        </div>
      </div>

      {/* VENTANA MODAL PARA BAJO STOCK O VENCIMIENTO */}
      {modalActivo && (
        <div style={estilos.overlay} onClick={cerrarModal}>
          <div style={estilos.modal} onClick={(e) => e.stopPropagation()}>
            <div style={estilos.modalHeader}>
              <h3 style={estilos.modalTitulo}>
                {modalActivo === "stock"
                  ? `Lotes en Bajo Stock (${listaBajoStock.length})`
                  : `Lotes Próximos a Vencer ≤ 15 días o Vencidos (${listaPorVencer.length})`}
              </h3>
              <button
                type="button"
                onClick={cerrarModal}
                style={estilos.btnCerrar}
                aria-label="Cerrar ventana"
              >
                ✕
              </button>
            </div>

            <div style={estilos.modalBody}>
              {modalActivo === "stock" ? (
                listaBajoStock.length === 0 ? (
                  <p style={estilos.vacio}>
                    No hay lotes en bajo stock en este momento.
                  </p>
                ) : (
                  <table style={estilos.tabla}>
                    <thead>
                      <tr>
                        <th style={estilos.th}>Producto / SKU</th>
                        <th style={estilos.th}>Lote</th>
                        <th style={estilos.th}>Ubicación</th>
                        <th style={estilos.th}>Stock Actual</th>
                        <th style={estilos.th}>Mínimo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listaBajoStock.map((item, idx) => {
                        const actual = Number(item.cantidadEmpaques) || 0;
                        const minimo = Number(item.stockMinimo) || 5;
                        const undsTotales = Number(item.totalUnidades) || 0;
                        return (
                          <tr key={item.id || `${getLote(item)}-${idx}`}>
                            <td style={estilos.td}>
                              <strong>{getNombreProducto(item)}</strong>
                              <div style={estilos.subtexto}>{getSku(item)}</div>
                            </td>
                            <td style={estilos.td}>{getLote(item)}</td>
                            <td style={estilos.td}>{getUbicacion(item)}</td>
                            <td style={estilos.td}>
                              <span
                                style={{
                                  ...estilos.badge,
                                  backgroundColor:
                                    actual === 0 ? "#fee2e2" : "#fef3c7",
                                  color: actual === 0 ? "#b91c1c" : "#b45309",
                                }}
                              >
                                {actual} emp ({undsTotales} unds)
                              </span>
                            </td>
                            <td style={estilos.td}>{minimo} emp</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )
              ) : listaPorVencer.length === 0 ? (
                <p style={estilos.vacio}>
                  No hay lotes que venzan en 15 días o menos ni lotes vencidos.
                </p>
              ) : (
                <table style={estilos.tabla}>
                  <thead>
                    <tr>
                      <th style={estilos.th}>Producto / SKU</th>
                      <th style={estilos.th}>Lote</th>
                      <th style={estilos.th}>Ubicación</th>
                      <th style={estilos.th}>Unidades</th>
                      <th style={estilos.th}>Estado Vencimiento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listaPorVencer.map((item, idx) => {
                      const dias = item._diasRestantes;
                      const yaVencio = dias < 0;
                      const venceHoy = dias === 0;
                      return (
                        <tr key={item.id || `${getLote(item)}-${idx}`}>
                          <td style={estilos.td}>
                            <strong>{getNombreProducto(item)}</strong>
                            <div style={estilos.subtexto}>{getSku(item)}</div>
                          </td>
                          <td style={estilos.td}>{getLote(item)}</td>
                          <td style={estilos.td}>{getUbicacion(item)}</td>
                          <td style={estilos.td}>
                            {Number(item.totalUnidades) || 0} unds
                          </td>
                          <td style={estilos.td}>
                            <span
                              style={{
                                ...estilos.badge,
                                backgroundColor: yaVencio
                                  ? "#fee2e2"
                                  : "#fef3c7",
                                color: yaVencio ? "#b91c1c" : "#b45309",
                              }}
                            >
                              {yaVencio
                                ? `Vencido (hace ${Math.abs(dias)} d)`
                                : venceHoy
                                ? "Vence hoy"
                                : `Vence en ${dias} d`}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// -------------------------------------------------------------------------
// OBJETO DE ESTILOS CSS EN JAVASCRIPT (INLINE STYLING)
// -------------------------------------------------------------------------
const estilos = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
    marginBottom: "20px",
  },
  card: {
    background: "#ffffff",
    padding: "16px",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    border: "1px solid #e2e8f0",
  },
  cardClickable: {
    cursor: "pointer",
    transition: "transform 0.15s ease, box-shadow 0.15s ease",
  },
  titulo: {
    fontSize: "11.5px",
    color: "#64748b",
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    display: "block",
  },
  valor: {
    margin: "8px 0 0 0",
    fontSize: "22px",
    fontWeight: "800",
    color: "#0f172a",
  },
  ayudaClic: {
    display: "inline-block",
    marginTop: "6px",
    fontSize: "11px",
    color: "#475569",
    textDecoration: "underline",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "16px",
  },
  modal: {
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    width: "100%",
    maxWidth: "760px",
    maxHeight: "82vh",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)",
    overflow: "hidden",
  },
  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 18px",
    borderBottom: "1px solid #e2e8f0",
  },
  modalTitulo: {
    margin: 0,
    fontSize: "16px",
    fontWeight: "700",
    color: "#0f172a",
  },
  btnCerrar: {
    background: "transparent",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    color: "#475569",
    padding: "4px 8px",
  },
  modalBody: {
    padding: "16px 18px",
    overflowY: "auto",
  },
  vacio: {
    margin: 0,
    color: "#475569",
    fontSize: "14px",
  },
  tabla: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "13px",
  },
  th: {
    textAlign: "left",
    padding: "10px 8px",
    borderBottom: "2px solid #e2e8f0",
    color: "#334155",
    fontWeight: "700",
  },
  td: {
    padding: "10px 8px",
    borderBottom: "1px solid #f1f5f9",
    color: "#1e293b",
    verticalAlign: "middle",
  },
  subtexto: {
    fontSize: "11.5px",
    color: "#64748b",
  },
  badge: {
    display: "inline-block",
    padding: "3px 8px",
    borderRadius: "999px",
    fontSize: "11.5px",
    fontWeight: "700",
  },
};

export default MetricasDashboard;