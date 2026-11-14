import React, { useState, useRef, useEffect } from "react";

export default function FormularioSalida({ lotes = [], onRegistrarSalida, usuarioActual }) {
  const [codigoBusqueda, setCodigoBusqueda] = useState("");
  const [loteSeleccionado, setLoteSeleccionado] = useState(null);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [tipoSalida, setTipoSalida] = useState("Unidades");
  const [cantidad, setCantidad] = useState("");
  const [motivo, setMotivo] = useState("Venta Directa en Mostrador");
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });

  const contenedorBusquedaRef = useRef(null);
  const texto = codigoBusqueda.trim().toUpperCase();

  // 1. Filtro predictivo
  const sugerencias = texto
    ? lotes.filter((l) => {
        return (
          (l.codigo && l.codigo.toUpperCase().includes(texto)) ||
          (l.serial && l.serial.toUpperCase().includes(texto)) ||
          (l.nombre && l.nombre.toUpperCase().includes(texto)) ||
          (l.marca && l.marca.toUpperCase().includes(texto)) ||
          (l.lote && l.lote.toUpperCase().includes(texto))
        );
      })
    : [];

  useEffect(() => {
    const clickAfuera = (e) => {
      if (contenedorBusquedaRef.current && !contenedorBusquedaRef.current.contains(e.target)) {
        setMostrarSugerencias(false);
      }
    };
    document.addEventListener("mousedown", clickAfuera);
    return () => document.removeEventListener("mousedown", clickAfuera);
  }, []);

  const handleSeleccionarSugerencia = (item) => {
    setLoteSeleccionado(item);
    setCodigoBusqueda(`${item.codigo || "S/C"} - ${item.nombre} (${item.lote})`);
    setMostrarSugerencias(false);
    setMensaje({ tipo: "", texto: "" });
  };

  const manejarEnvio = (e) => {
    e.preventDefault();

    let loteAProcesar = loteSeleccionado;
    if (!loteAProcesar && texto) {
      loteAProcesar = lotes.find(
        (l) =>
          (l.codigo && l.codigo.toUpperCase() === texto) ||
          (l.serial && l.serial.toUpperCase() === texto) ||
          (l.lote && l.lote.toUpperCase() === texto)
      );
    }

    if (!loteAProcesar) {
      setMensaje({ tipo: "error", texto: "Seleccione un producto de la lista predictiva." });
      return;
    }

    const cantNum = Number(cantidad);
    if (cantNum <= 0 || isNaN(cantNum)) {
      setMensaje({ tipo: "error", texto: "Ingrese una cantidad mayor a 0." });
      return;
    }

    let unidadesADescontar = 0;
    const undsPorEmpaque = Number(loteAProcesar.unidadesPorEmpaque) || 1;

    if (tipoSalida === "Empaques") {
      const empaquesDisp = Number(loteAProcesar.cantidadEmpaques) || 0;
      if (cantNum > empaquesDisp) {
        setMensaje({ tipo: "error", texto: `Stock insuficiente: Solo quedan ${empaquesDisp} empaques.` });
        return;
      }
      unidadesADescontar = Math.round(cantNum * undsPorEmpaque);
    } else {
      const totalUndsDisp = Number(loteAProcesar.totalUnidades) || 0;
      if (cantNum > totalUndsDisp) {
        setMensaje({ tipo: "error", texto: `Stock insuficiente: Solo quedan ${totalUndsDisp} unidades.` });
        return;
      }
      unidadesADescontar = cantNum;
    }

    if (typeof onRegistrarSalida === "function") {
      onRegistrarSalida({
        tipo: "SALIDA",
        cantidadUnds: unidadesADescontar,
        motivo: motivo,
        idLote: loteAProcesar.id,
        idUsuario: usuarioActual?.id || 1 
      });
    }

    setMensaje({ tipo: "exito", texto: `Salida de ${unidadesADescontar} unidades procesada con éxito.` });
    setCantidad("");
    setCodigoBusqueda("");
    setLoteSeleccionado(null);
  };

  return (
    <div style={estilos.tarjeta}>
      <div style={estilos.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "15px" }}>📤</span>
          <h3 style={{ margin: 0, color: "#0f172a", fontSize: "13.5px", fontWeight: "800" }}>
            Registro de Salidas / Ventas y Mermas
          </h3>
        </div>
      </div>

      {mensaje.texto && (
        <div style={{
          ...estilos.alerta,
          backgroundColor: mensaje.tipo === "error" ? "#fee2e2" : "#dcfce7",
          color: mensaje.tipo === "error" ? "#991b1b" : "#166534"
        }}>
          {mensaje.texto}
        </div>
      )}

      <form onSubmit={manejarEnvio}>
        <div style={estilos.gridFluido}>
          
          {/* Buscador predictivo */}
          <div style={{ position: "relative", flex: "2 1 260px" }} ref={contenedorBusquedaRef}>
            <label style={estilos.label}>Producto / Lote a Despachar *</label>
            <input
              type="text"
              required
              placeholder="BUSCAR POR SKU, NOMBRE, SERIAL O LOTE..."
              value={codigoBusqueda}
              onChange={(e) => {
                setCodigoBusqueda(e.target.value.toUpperCase());
                setLoteSeleccionado(null);
                setMostrarSugerencias(true);
                setMensaje({ tipo: "", texto: "" });
              }}
              onFocus={() => { if (codigoBusqueda.trim()) setMostrarSugerencias(true); }}
              style={estilos.input}
              autoComplete="off"
            />

            {mostrarSugerencias && sugerencias.length > 0 && (
              <div style={estilos.dropdownSugerencias}>
                {sugerencias.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSeleccionarSugerencia(item)}
                    style={estilos.itemSugerencia}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f1f5f9")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ffffff")}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong style={{ color: "#0f172a", fontSize: "11.5px" }}>
                        {item.nombre} <span style={{ color: "#64748b", fontWeight: "normal" }}>({item.marca})</span>
                      </strong>
                      <span style={{ fontSize: "11px", fontWeight: "bold", color: "#16a34a" }}>
                        {item.totalUnidades} unds
                      </span>
                    </div>
                    <div style={{ fontSize: "10px", color: "#64748b", marginTop: "2px" }}>
                      SKU: <strong>{item.codigo || "S/C"}</strong> | Lote: <strong style={{ color: "#0284c7" }}>{item.lote}</strong> | Vence: <strong style={{ color: "#c2410c" }}>{item.vencimiento || item.fechaVencimiento || "N/A"}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {mostrarSugerencias && texto && sugerencias.length === 0 && (
              <div style={estilos.dropdownVacio}>
                No se encontraron productos coincidentes.
              </div>
            )}
          </div>

          {/* Descontar por */}
          <div style={{ flex: "1 1 150px" }}>
            <label style={estilos.label}>Descontar Por *</label>
            <select value={tipoSalida} onChange={(e) => setTipoSalida(e.target.value)} style={estilos.select}>
              <option value="Unidades">Unidades Sueltas</option>
              <option value="Empaques">Empaques Completos ({loteSeleccionado?.presentacion || "Pacas/Cajas"})</option>
            </select>
          </div>

          {/* Cantidad */}
          <div style={{ flex: "1 1 110px" }}>
            <label style={estilos.label}>Cantidad a Retirar *</label>
            <input type="number" min="1" step="1" required placeholder="Ej: 5" value={cantidad} onChange={(e) => setCantidad(e.target.value)} style={estilos.input} />
          </div>

          {/* Motivo */}
          <div style={{ flex: "1 1 100%" }}>
            <label style={estilos.label}>Concepto / Motivo de Salida *</label>
            <select value={motivo} onChange={(e) => setMotivo(e.target.value)} style={estilos.select}>
              <option value="Venta Directa en Mostrador">Venta Directa en Mostrador</option>
              <option value="Baja por Merma / Daño / Caducidad">Baja por Merma / Daño / Caducidad</option>
              <option value="Traslado a Otra Sucursal">Traslado a Otra Sucursal</option>
              <option value="Ajuste de Inventario (Faltante)">Ajuste de Inventario (Faltante)</option>
            </select>
          </div>
        </div>

        {/* Ficha producto */}
        {loteSeleccionado && (
          <div style={estilos.tarjetaProducto}>
            <strong>📦 Seleccionado:</strong> {loteSeleccionado.nombre} ({loteSeleccionado.marca}) &nbsp;|&nbsp;
            <strong>SKU:</strong> {loteSeleccionado.codigo || "S/C"} &nbsp;|&nbsp;
            <strong>Lote:</strong> <span style={{ color: "#0284c7" }}>{loteSeleccionado.lote}</span> &nbsp;|&nbsp;
            <strong>Disponibles:</strong> <span style={{ color: "#16a34a" }}>{loteSeleccionado.totalUnidades} unds</span> ({loteSeleccionado.cantidadEmpaques} {loteSeleccionado.presentacion || "empaques"})
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
          <button type="submit" style={estilos.btnDescontar}>
            Descontar
          </button>
        </div>
      </form>
    </div>
  );
}

const estilos = {
  tarjeta: { backgroundColor: "#ffffff", borderRadius: "10px", padding: "14px 18px", marginBottom: "14px", border: "1px solid #e2e8f0", boxShadow: "0 1px 2px rgba(0,0,0,0.03)" },
  header: { marginBottom: "10px", borderBottom: "1px solid #f1f5f9", paddingBottom: "6px" },
  gridFluido: { display: "flex", flexWrap: "wrap", gap: "10px" },
  label: { fontSize: "11px", fontWeight: "bold", color: "#334155", marginBottom: "3px", display: "block" },
  input: { width: "100%", padding: "6px 9px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "11.5px", boxSizing: "border-box", textTransform: "uppercase", outline: "none", background: "#ffffff" },
  select: { width: "100%", padding: "6px 9px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "11.5px", boxSizing: "border-box", outline: "none", background: "#ffffff", color: "#0f172a" },
  dropdownSugerencias: { position: "absolute", top: "100%", left: 0, right: 0, background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "6px", marginTop: "4px", maxHeight: "170px", overflowY: "auto", zIndex: 50, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" },
  itemSugerencia: { padding: "7px 10px", cursor: "pointer", borderBottom: "1px solid #f1f5f9" },
  dropdownVacio: { position: "absolute", top: "100%", left: 0, right: 0, background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "6px", padding: "8px", fontSize: "11px", color: "#64748b", marginTop: "4px", zIndex: 50 },
  tarjetaProducto: { background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "5px", padding: "7px 10px", fontSize: "11px", color: "#166534", marginTop: "8px" },
  btnDescontar: { backgroundColor: "#dc2626", color: "#ffffff", border: "none", padding: "8px 22px", borderRadius: "5px", fontSize: "11.5px", fontWeight: "bold", cursor: "pointer" },
  alerta: { padding: "7px 10px", borderRadius: "5px", fontSize: "11.5px", marginBottom: "10px", fontWeight: "600" }
};