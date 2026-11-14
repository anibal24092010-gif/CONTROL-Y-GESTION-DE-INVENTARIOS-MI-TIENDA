import React, { useState } from "react";

/**
 * =========================================================================
 * COMPONENTE: ProductosSalida.jsx (Control de Entradas y Salidas)
 * DESCRIPCIÓN: Módulo exclusivo para Administradores con rango de fechas,
 * selector de tipo (Entradas / Salidas / Todos) y corrección de cantidades,
 * lotes y motivos con ajuste automático de stock.
 * =========================================================================
 */
export default function ProductosSalida({
  movimientos = [],
  usuarioActivo,
  onEditarMovimiento
}) {
  const [tipoFiltro, setTipoFiltro] = useState("TODOS");
  const [busqueda, setBusqueda] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  // Estados del modal de edición
  const [modalEditar, setModalEditar] = useState(false);
  const [movimientoSeleccionado, setMovimientoSeleccionado] = useState(null);
  const [nuevaCantidad, setNuevaCantidad] = useState("");
  const [nuevoMotivo, setNuevoMotivo] = useState("");

  const txt = busqueda.trim().toUpperCase();

  // Filtrar movimientos por Tipo, Fechas y Texto
  const movimientosFiltrados = movimientos.filter((m) => {
    const coincideTipo = tipoFiltro === "TODOS" || m.tipo === tipoFiltro;

    const coincideTexto =
      !txt ||
      (m.codigo && m.codigo.toUpperCase().includes(txt)) ||
      (m.nombreProducto && m.nombreProducto.toUpperCase().includes(txt)) ||
      (m.lote && m.lote.toUpperCase().includes(txt)) ||
      (m.usuario && m.usuario.toUpperCase().includes(txt));

    let coincideFecha = true;
    if (fechaInicio && m.fecha < fechaInicio) coincideFecha = false;
    if (fechaFin && m.fecha > fechaFin) coincideFecha = false;

    return coincideTipo && coincideTexto && coincideFecha;
  });

  const abrirCorreccion = (mov) => {
    setMovimientoSeleccionado(mov);
    setNuevaCantidad(mov.cantidadUnds);
    setNuevoMotivo(mov.motivo);
    setModalEditar(true);
  };

  const guardarCorreccion = (e) => {
    e.preventDefault();
    const cantNum = Number(nuevaCantidad);
    if (cantNum <= 0 || isNaN(cantNum)) {
      alert("Ingrese una cantidad válida mayor a 0.");
      return;
    }

    if (typeof onEditarMovimiento === "function") {
      onEditarMovimiento(movimientoSeleccionado, cantNum, nuevoMotivo);
    }
    setModalEditar(false);
    setMovimientoSeleccionado(null);
  };

  return (
    <div style={estilos.tarjeta}>
      {/* Encabezado y Barra de Filtros Completa */}
      <div style={estilos.header}>
        <div>
          <strong style={{ color: "#0f172a", fontSize: "14.5px" }}>
            📦 Control y Corrección de Entradas / Salidas
          </strong>
          <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "#64748b" }}>
            Audita, coteja y corrige los registros de ingresos y despachos ajustando el inventario automáticamente.
          </p>
        </div>

        {/* 4 Controles alineados */}
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
            <select
              value={tipoFiltro}
              onChange={(e) => setTipoFiltro(e.target.value)}
              style={estilos.select}
            >
              <option value="TODOS">Todos los Movimientos</option>
              <option value="ENTRADA">Solo Entradas</option>
              <option value="SALIDA">Solo Salidas</option>
            </select>
          </div>

          <div>
            <span style={estilos.labelFecha}>Búsqueda:</span>
            <input
              type="text"
              placeholder="SKU, PRODUCTO, LOTE..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value.toUpperCase())}
              style={estilos.inputBusqueda}
            />
          </div>
        </div>
      </div>

      {/* Tabla de Movimientos con botón de corrección para ambos tipos */}
      <div style={{ overflowX: "auto" }}>
        <table style={estilos.tabla}>
          <thead>
            <tr>
              <th style={estilos.th}>FECHA</th>
              <th style={estilos.th}>TIPO</th>
              <th style={estilos.th}>SKU</th>
              <th style={estilos.th}>PRODUCTO &amp; MARCA</th>
              <th style={estilos.th}>LOTE</th>
              <th style={estilos.th}>F. VENCIMIENTO</th>
              <th style={estilos.th}>CANTIDAD</th>
              <th style={estilos.th}>CONCEPTO / MOTIVO</th>
              <th style={estilos.th}>RESPONSABLE</th>
              <th style={{ ...estilos.th, textAlign: "center" }}>ACCIÓN</th>
            </tr>
          </thead>
          <tbody>
            {movimientosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="10" style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>
                  No se registran movimientos con los filtros aplicados.
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
                  <td style={estilos.td}>
                    <strong style={{ color: "#0f172a" }}>{m.nombreProducto}</strong>
                    <div style={{ fontSize: "10.5px", color: "#0284c7" }}>{m.marca}</div>
                  </td>
                  <td style={{ ...estilos.td, color: "#0284c7", fontWeight: "bold" }}>{m.lote}</td>
                  <td style={{ ...estilos.td, color: "#c2410c", fontWeight: "600" }}>{m.fechaVencimiento || "N/A"}</td>
                  <td style={{
                    ...estilos.td,
                    fontWeight: "bold",
                    color: m.tipo === "ENTRADA" ? "#16a34a" : "#dc2626"
                  }}>
                    {m.tipo === "ENTRADA" ? `+${m.cantidadUnds}` : `-${m.cantidadUnds}`} unds
                  </td>
                  <td style={estilos.td}>{m.motivo}</td>
                  <td style={{ ...estilos.td, fontWeight: "600", color: "#334155" }}>👤 {m.usuario}</td>
                  <td style={{ ...estilos.td, textAlign: "center" }}>
                    <button onClick={() => abrirCorreccion(m)} style={estilos.btnCorregir}>
                      ✏️ Corregir
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para corregir Entrada o Salida */}
      {modalEditar && movimientoSeleccionado && (
        <div style={estilos.overlayModal} onClick={() => setModalEditar(false)}>
          <div style={estilos.modalContenido} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#0f172a" }}>
              Corregir {movimientoSeleccionado.tipo === "ENTRADA" ? "Entrada" : "Salida"}: {movimientoSeleccionado.nombreProducto}
            </h3>
            <p style={{ fontSize: "11px", color: "#64748b", margin: "0 0 12px 0" }}>
              Lote: <strong>{movimientoSeleccionado.lote}</strong> | Cantidad actual registrada: <strong>{movimientoSeleccionado.cantidadUnds} unds</strong>
            </p>

            <form onSubmit={guardarCorreccion}>
              <div style={{ marginBottom: "10px" }}>
                <label style={estilos.label}>
                  Nueva Cantidad {movimientoSeleccionado.tipo === "ENTRADA" ? "Ingresada" : "Descontada"} (Unidades) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={nuevaCantidad}
                  onChange={(e) => setNuevaCantidad(e.target.value)}
                  style={estilos.inputModal}
                />
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={estilos.label}>Motivo / Justificación *</label>
                <input
                  type="text"
                  required
                  value={nuevoMotivo}
                  onChange={(e) => setNuevoMotivo(e.target.value.toUpperCase())}
                  style={estilos.inputModal}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                <button type="button" onClick={() => setModalEditar(false)} style={estilos.btnCancelar}>
                  Cancelar
                </button>
                <button type="submit" style={estilos.btnGuardarModal}>
                  Guardar Ajuste
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const estilos = {
  tarjeta: { background: "#ffffff", borderRadius: "10px", padding: "14px 18px", border: "1px solid #e2e8f0" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "12px", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px" },
  labelFecha: { fontSize: "10px", fontWeight: "bold", color: "#475569", display: "block", marginBottom: "2px" },
  inputFecha: { padding: "5px 8px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "11px", background: "#ffffff" },
  select: { padding: "5px 8px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "11px", background: "#ffffff" },
  inputBusqueda: { padding: "5px 10px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "11px", width: "180px", textTransform: "uppercase", outline: "none" },
  tabla: { width: "100%", borderCollapse: "collapse" },
  th: { background: "#0f172a", color: "#ffffff", textAlign: "left", padding: "8px 10px", fontSize: "10.5px", textTransform: "uppercase" },
  td: { padding: "8px 10px", borderBottom: "1px solid #e2e8f0", fontSize: "11.5px" },
  btnCorregir: { background: "#fef3c7", color: "#b45309", border: "1px solid #fde68a", borderRadius: "4px", padding: "3px 8px", fontSize: "10.5px", fontWeight: "bold", cursor: "pointer" },
  overlayModal: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "14px" },
  modalContenido: { background: "#ffffff", width: "100%", maxWidth: "420px", borderRadius: "10px", padding: "18px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" },
  label: { fontSize: "11px", fontWeight: "bold", color: "#475569", display: "block", marginBottom: "4px" },
  inputModal: { width: "100%", padding: "7px 9px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "11.5px", boxSizing: "border-box" },
  btnCancelar: { background: "#94a3b8", color: "#ffffff", border: "none", padding: "7px 14px", borderRadius: "5px", fontSize: "11.5px", fontWeight: "bold", cursor: "pointer" },
  btnGuardarModal: { background: "#0284c7", color: "#ffffff", border: "none", padding: "7px 16px", borderRadius: "5px", fontSize: "11.5px", fontWeight: "bold", cursor: "pointer" }
};