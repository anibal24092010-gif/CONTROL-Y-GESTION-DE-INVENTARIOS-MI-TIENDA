// Importa la librería principal de React y los hooks useState y useEffect necesarios para manejar estados y ciclos de vida en el componente
import React, { useState, useEffect } from "react";

export default function FormularioEntrada({ onGuardar, loteAEditar, onCerrar }) {
  // Declaración del estado "formulario" usando el hook useState de React
  // Se inicializa con un objeto que contiene todos los campos necesarios vacíos o con sus valores por defecto
  const [formulario, setFormulario] = useState({
    codigo: "",           // Código o SKU del producto
    serial: "",           // Número de serie opcional
    nombre: "",           // Nombre descriptivo del producto
    marca: "",            // Marca del producto
    categoria: "ABARROTES / GRANOS",      // Categoría por defecto seleccionada
    ubicacion: "PASILLO 1 - ESTANTE 1",    // Ubicación física por defecto en bodega
    presentacion: "CARTONES",              // Tipo de empaque o presentación por defecto
    unidadesPorEmpaque: "30",              // Cantidad de unidades que trae cada empaque por defecto
    cantidadEmpaques: "",                  // Cantidad de empaques a ingresar (vacío al iniciar)
    valorUnitario: "",                     // Precio por cada unidad individual
    valorPresentacion: "",                 // Precio total por el empaque completo
    lote: "",              // Número de lote (opcional)
    vencimiento: "",       // Fecha de vencimiento del producto
    stockMinimo: "5"       // Cantidad mínima establecida para alertas de stock
  });

  // Estado para manejar mensajes de alerta (éxito o error) en la interfaz
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });

  // Función para formatear números agregando puntos de miles (estilo colombiano es-CO)
  const formatearConPuntos = (valor) => {
    if (!valor && valor !== 0) return "";
    const numeroLimpio = String(valor).replace(/\D/g, "");
    if (!numeroLimpio) return "";
    return Number(numeroLimpio).toLocaleString("es-CO");
  };

  // Función para limpiar los puntos de miles y obtener un número plano para cálculos
  const limpiarPuntos = (valor) => {
    if (!valor) return 0;
    return Number(String(valor).replace(/\./g, "").replace(/\D/g, "")) || 0;
  };

  // Hook useEffect para cargar los datos del lote cuando se encuentra en modo edición
  useEffect(() => {
    if (loteAEditar) {
      let valUnitExtraido = Number(loteAEditar.valorUnitario) || Number(loteAEditar.valor_unitario) || 0;
      let valPresExtraido = Number(loteAEditar.valorPresentacion) || Number(loteAEditar.valor_presentacion) || 0;

      // Si no hay valor unitario pero el serial contiene información de precio incrustada
      if (!valUnitExtraido && loteAEditar.serial && loteAEditar.serial.includes("|P:")) {
        const partes = loteAEditar.serial.split("|P:");
        valUnitExtraido = Number(partes[1]) || 0;
        const unds = Number(loteAEditar.unidadesPorEmpaque || loteAEditar.unidades_por_empaque) || 1;
        valPresExtraido = valUnitExtraido * unds;
      }

      const undsEmp = loteAEditar.presentacion === "UNIDAD" ? 1 : (Number(loteAEditar.unidadesPorEmpaque || loteAEditar.unidades_por_empaque) || 30);
      const totalUnds = Number(loteAEditar.totalUnidades) || 0;
      const empaquesCalculados = undsEmp > 0 ? Math.floor(totalUnds / undsEmp) : (loteAEditar.cantidadEmpaques || loteAEditar.cantidad_empaques || "");

      // Actualiza el estado del formulario con los valores del lote a editar
      setFormulario({
        codigo: loteAEditar.codigo || "",
        serial: loteAEditar.serial ? loteAEditar.serial.split("|P:")[0] : "",
        nombre: loteAEditar.nombre || "",
        marca: loteAEditar.marca || "",
        categoria: (loteAEditar.categoria || "ABARROTES / GRANOS").toUpperCase(),
        ubicacion: (loteAEditar.ubicacion || "PASILLO 1 - ESTANTE 1").toUpperCase(),
        presentacion: (loteAEditar.presentacion || "CARTONES").toUpperCase(),
        unidadesPorEmpaque: String(undsEmp),
        cantidadEmpaques: String(empaquesCalculados),
        valorUnitario: valUnitExtraido ? formatearConPuntos(valUnitExtraido) : "",
        valorPresentacion: valPresExtraido ? formatearConPuntos(valPresExtraido) : "",
        lote: loteAEditar.lote || "",
        vencimiento: loteAEditar.vencimiento || loteAEditar.fechaVencimiento || loteAEditar.fecha_vencimiento || "",
        stockMinimo: String(loteAEditar.stockMinimo || loteAEditar.stock_minimo || "5")
      });
    }
  }, [loteAEditar]);

  // Manejador genérico para los cambios en los inputs y selects del formulario
  const manejarCambio = (e) => {
    const { name, value, type } = e.target;

    // Validación especial si la presentación cambia a UNIDAD
    if (name === "presentacion" && value === "UNIDAD") {
      setFormulario((prev) => ({
        ...prev,
        presentacion: "UNIDAD",
        unidadesPorEmpaque: "1",
        valorPresentacion: prev.valorUnitario
      }));
      return;
    }

    // Cálculo automático del valor por presentación al modificar el valor unitario
    if (name === "valorUnitario") {
      const numUnit = limpiarPuntos(value);
      const undsEmpaque = formulario.presentacion === "UNIDAD" ? 1 : (Number(formulario.unidadesPorEmpaque) || 1);
      const calcPres = Math.round(numUnit * undsEmpaque);

      setFormulario((prev) => ({
        ...prev,
        valorUnitario: numUnit ? formatearConPuntos(numUnit) : "",
        valorPresentacion: calcPres ? formatearConPuntos(calcPres) : ""
      }));
      return;
    }

    // Cálculo automático del valor unitario al modificar el valor por presentación
    if (name === "valorPresentacion") {
      const numPres = limpiarPuntos(value);
      const undsEmpaque = formulario.presentacion === "UNIDAD" ? 1 : (Number(formulario.unidadesPorEmpaque) || 1);
      const calcUnit = undsEmpaque > 0 ? Math.round(numPres / undsEmpaque) : 0;

      setFormulario((prev) => ({
        ...prev,
        valorPresentacion: numPres ? formatearConPuntos(numPres) : "",
        valorUnitario: calcUnit ? formatearConPuntos(calcUnit) : ""
      }));
      return;
    }

    // Cálculo automático al modificar las unidades por empaque
    if (name === "unidadesPorEmpaque") {
      const undsEmpaque = Number(value) || 1;
      const numUnit = limpiarPuntos(formulario.valorUnitario);
      const calcPres = Math.round(numUnit * undsEmpaque);

      setFormulario((prev) => ({
        ...prev,
        unidadesPorEmpaque: value,
        valorPresentacion: calcPres ? formatearConPuntos(calcPres) : ""
      }));
      return;
    }

    // Convierte el texto a mayúsculas por defecto si es tipo texto
    let valorFinal = type === "text" ? value.toUpperCase() : value;
    setFormulario((prev) => ({ ...prev, [name]: valorFinal }));
  };

  // Función que maneja el envío del formulario (creación o actualización)
  const manejarEnvio = (e) => {
    e.preventDefault();

    // Validación de campos obligatorios vacíos
    if (!formulario.codigo || !formulario.nombre || !formulario.marca || !formulario.ubicacion || !formulario.vencimiento) {
      setMensaje({ tipo: "error", texto: "Complete los campos obligatorios (*)." });
      return;
    }

    const empaques = Number(formulario.cantidadEmpaques);
    const undsPorEmpaque = formulario.presentacion === "UNIDAD" ? 1 : (Number(formulario.unidadesPorEmpaque) || 1);

    // Validación de cantidades mayores a cero
    if (empaques <= 0 || undsPorEmpaque <= 0) {
      setMensaje({ tipo: "error", texto: "Empaques y unidades por empaque deben ser mayores a 0." });
      return;
    }

    // Cálculo de total de unidades dependiendo de si es nuevo o edición
    let totalUnidades = empaques * undsPorEmpaque;
    if (loteAEditar) {
      const undsAnteriores = Number(loteAEditar.totalUnidades) || 0;
      const empaquesAnteriores = Number(loteAEditar.cantidadEmpaques) || Math.floor(undsAnteriores / undsPorEmpaque);
      const unidadesSueltasRestantes = undsAnteriores % undsPorEmpaque;
      
      if (empaques !== empaquesAnteriores) {
        totalUnidades = (empaques * undsPorEmpaque) + unidadesSueltasRestantes;
      } else {
        totalUnidades = undsAnteriores;
      }
    }

    // Asignación o generación automática del código de lote
    const codigoLote = formulario.lote.trim() || loteAEditar?.lote || `LOT-${Math.floor(100 + Math.random() * 900)}`;

    const valorUnitNum = limpiarPuntos(formulario.valorUnitario);
    const valorPresNum = limpiarPuntos(formulario.valorPresentacion);

    const serialLimpio = formulario.serial.trim().toUpperCase();
    const serialConPrecio = valorUnitNum > 0 ? `${serialLimpio}|P:${valorUnitNum}` : serialLimpio;

    // Objeto consolidado con los datos listos para procesar
    const datosLoteProcesado = {
      ...(loteAEditar ? { id: loteAEditar.id } : {}),
      codigo: formulario.codigo.trim().toUpperCase(),
      serial: serialConPrecio,
      nombre: formulario.nombre.trim().toUpperCase(),
      marca: formulario.marca.trim().toUpperCase(),
      categoria: formulario.categoria,
      ubicacion: formulario.ubicacion.trim().toUpperCase(),
      presentacion: formulario.presentacion,
      unidadesPorEmpaque: undsPorEmpaque,
      cantidadEmpaques: empaques,
      totalUnidades: totalUnidades,
      valorUnitario: valorUnitNum,
      valorPresentacion: valorPresNum,
      vencimiento: formulario.vencimiento,
      fechaVencimiento: formulario.vencimiento,
      stockMinimo: Number(formulario.stockMinimo) || 5,
      lote: codigoLote,
      fechaIngreso: loteAEditar?.fechaIngreso || new Date().toISOString().split("T")[0]
    };

    // Ejecuta la función externa de guardado si existe
    if (typeof onGuardar === "function") {
      onGuardar(datosLoteProcesado);
    }

    // Muestra mensaje de éxito en pantalla
    setMensaje({ tipo: "exito", texto: `Lote "${codigoLote}" guardado correctamente.` });

    // Limpia el formulario si es un registro nuevo
    if (!loteAEditar) {
      setFormulario({
        codigo: "",
        serial: "",
        nombre: "",
        marca: "",
        categoria: "ABARROTES / GRANOS",
        ubicacion: "PASILLO 1 - ESTANTE 1",
        presentacion: "CARTONES",
        unidadesPorEmpaque: "30",
        cantidadEmpaques: "",
        valorUnitario: "",
        valorPresentacion: "",
        lote: "",
        vencimiento: "",
        stockMinimo: "5"
      });
    }
  };

  // Arreglo para generar opciones dinámicas de pasillos y estantes
  const pasillosOpciones = [];
  for (let p = 1; p <= 3; p++) {
    for (let e = 1; e <= 10; e++) {
      pasillosOpciones.push(`PASILLO ${p} - ESTANTE ${e}`);
    }
  }

  // Arreglo para generar opciones dinámicas de refrigeradores
  const refrigeradoresOpciones = [];
  for (let r = 1; r <= 6; r++) {
    refrigeradoresOpciones.push(`REFRIGERADOR ${r}`);
  }

  // Bandera booleana para verificar si la presentación actual es por unidad
  const esUnidad = formulario.presentacion === "UNIDAD";

  // Estilos dinámicos para mantener la proporción exacta según si es modal o pantalla normal
  const estiloTarjetaActual = onCerrar 
    ? { ...estilos.tarjetaBase, ...estilos.tarjetaModal } 
    : { ...estilos.tarjetaBase, ...estilos.tarjetaNormal };

  // Estructura visual del formulario encapsulada en una variable JSX
  const contenido = (
    <div style={estiloTarjetaActual}>
      {/* Cabecera del formulario con título dinámico y botón de cierre opcional */}
      <div style={estilos.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "15px" }}>{loteAEditar ? "✏️" : "📥"}</span>
          <h3 style={{ margin: 0, color: "#0f172a", fontSize: "13.5px", fontWeight: "800" }}>
            {loteAEditar ? `EDITAR LOTE: ${loteAEditar.lote}` : "ENTRADA DE MERCANCÍA / NUEVO LOTE"}
          </h3>
        </div>
        {onCerrar && <button type="button" onClick={onCerrar} style={estilos.btnCerrar}>✕</button>}
      </div>

      {/* Renderizado condicional de mensajes de alerta (error o éxito) */}
      {mensaje.texto && (
        <div style={{
          ...estilos.alerta,
          backgroundColor: mensaje.tipo === "error" ? "#fee2e2" : "#dcfce7",
          color: mensaje.tipo === "error" ? "#991b1b" : "#166534"
        }}>
          {mensaje.texto}
        </div>
      )}

      {/* Formulario principal de entrada */}
      <form onSubmit={manejarEnvio}>
        <div style={estilos.gridFluido}>
          {/* Campo: Código / SKU */}
          <div>
            <label style={estilos.label}>Código / SKU *</label>
            <input type="text" name="codigo" required placeholder="EJ: HUEVOS-AAA" value={formulario.codigo} onChange={manejarCambio} style={estilos.input} />
          </div>

          {/* Campo: Serie / Serial */}
          <div>
            <label style={estilos.label}>Serie / Serial (Opcional)</label>
            <input type="text" name="serial" placeholder="EJ: SN-0000002" value={formulario.serial} onChange={manejarCambio} style={estilos.input} />
          </div>

          {/* Campo: Nombre del Producto */}
          <div>
            <label style={estilos.label}>Nombre Producto *</label>
            <input type="text" name="nombre" required placeholder="EJ: HUEVOS KIKUHIRO" value={formulario.nombre} onChange={manejarCambio} style={estilos.input} />
          </div>

          {/* Campo: Marca */}
          <div>
            <label style={estilos.label}>Marca *</label>
            <input type="text" name="marca" required placeholder="EJ: KIKUHIRO" value={formulario.marca} onChange={manejarCambio} style={estilos.input} />
          </div>

          {/* Campo: Selector de Categoría */}
          <div>
            <label style={estilos.label}>Categoría *</label>
            <select name="categoria" value={formulario.categoria} onChange={manejarCambio} style={estilos.select}>
              <option value="ABARROTES / GRANOS">ABARROTES / GRANOS</option>
              <option value="ACEITES, SALSAS Y CONDIMENTOS">ACEITES, SALSAS Y CONDIMENTOS</option>
              <option value="LÁCTEOS, MANTEQUILLAS Y HUEVOS">LÁCTEOS, MANTEQUILLAS Y HUEVOS</option>
              <option value="CARNES, POLLOS Y EMBUTIDOS">CARNES, POLLOS Y EMBUTIDOS</option>
              <option value="FRUTAS, VERDURAS Y FRUVER">FRUTAS, VERDURAS Y FRUVER</option>
              <option value="BEBIDAS Y LICORES">BEBIDAS Y LICORES</option>
              <option value="ENLATADOS Y CONSERVAS">ENLATADOS Y CONSERVAS</option>
              <option value="PANADERÍA Y GALLETAS">PANADERÍA Y GALLETAS</option>
              <option value="SNACKS Y MECATOS">SNACKS Y MECATOS</option>
              <option value="ASEO DEL HOGAR">ASEO DEL HOGAR</option>
              <option value="CUIDADO PERSONAL">CUIDADO PERSONAL</option>
              <option value="MASCOTAS">MASCOTAS</option>
            </select>
          </div>

          {/* Campo: Selector de Ubicación */}
          <div>
            <label style={estilos.label}>Ubicación en Bodega *</label>
            <select name="ubicacion" value={formulario.ubicacion} onChange={manejarCambio} style={estilos.select}>
              <optgroup label="PASILLOS (1 AL 3) Y ESTANTES (1 AL 10)">
                {pasillosOpciones.map((op) => (
                  <option key={op} value={op}>{op}</option>
                ))}
              </optgroup>
              <optgroup label="ZONA DE REFRIGERACIÓN">
                {refrigeradoresOpciones.map((op) => (
                  <option key={op} value={op}>{op}</option>
                ))}
              </optgroup>
              <optgroup label="GENERAL">
                <option value="BODEGA PRINCIPAL">BODEGA PRINCIPAL</option>
                <option value="ZONA DE RECEPCIÓN">ZONA DE RECEPCIÓN</option>
              </optgroup>
            </select>
          </div>

          {/* Campo: Presentación / Empaque */}
          <div>
            <label style={estilos.label}>Presentación / Empaque *</label>
            <select name="presentacion" value={formulario.presentacion} onChange={manejarCambio} style={estilos.select}>
              <option value="CARTONES">CARTONES</option>
              <option value="PACA">PACA</option>
              <option value="CAJA">CAJA</option>
              <option value="PAQUETE">PAQUETE</option>
              <option value="BOLSA">BOLSA</option>
              <option value="UNIDAD">UNIDAD</option>
            </select>
          </div>

          {/* Campo: Contenido (Unidades por Empaque) */}
          <div>
            <label style={estilos.label}>Contenido (Unds / Empaque) *</label>
            <input 
              type="number" 
              min="1" 
              required 
              name="unidadesPorEmpaque" 
              placeholder="1" 
              value={esUnidad ? "1" : formulario.unidadesPorEmpaque} 
              disabled={esUnidad}
              onChange={manejarCambio} 
              style={{ ...estilos.input, backgroundColor: esUnidad ? "#f1f5f9" : "#ffffff" }} 
            />
          </div>

          {/* Campo: Cantidad de Empaques */}
          <div>
            <label style={estilos.label}>{esUnidad ? "Cantidad de Unidades *" : "Cant. Empaques a Ingresar *"}</label>
            <input type="number" step="any" min="0.01" required name="cantidadEmpaques" placeholder="0" value={formulario.cantidadEmpaques} onChange={manejarCambio} style={estilos.input} />
          </div>

          {/* Campo: Valor Unitario */}
          <div>
            <label style={estilos.label}>Valor Unitario ($) *</label>
            <input type="text" required name="valorUnitario" placeholder="0" value={formulario.valorUnitario} onChange={manejarCambio} style={estilos.input} autoComplete="off" />
          </div>

          {/* Campo: Valor por Empaque */}
          <div>
            <label style={estilos.label}>Valor por Empaque ($) *</label>
            <input type="text" name="valorPresentacion" placeholder="0" value={formulario.valorPresentacion} onChange={manejarCambio} style={estilos.input} autoComplete="off" />
          </div>

          {/* Campo: Número de Lote */}
          <div>
            <label style={estilos.label}>N° Lote (Opcional)</label>
            <input type="text" name="lote" placeholder="EJ: LOT-2026" value={formulario.lote} onChange={manejarCambio} style={estilos.input} />
          </div>

          {/* Campo: Fecha de Vencimiento */}
          <div>
            <label style={estilos.label}>Fecha Vencimiento *</label>
            <input type="date" required name="vencimiento" value={formulario.vencimiento} onChange={manejarCambio} style={estilos.input} />
          </div>

          {/* Campo: Stock Mínimo */}
          <div>
            <label style={estilos.label}>Stock Mínimo (Alerta)</label>
            <input type="number" min="1" name="stockMinimo" placeholder="5" value={formulario.stockMinimo} onChange={manejarCambio} style={estilos.input} />
          </div>
        </div>

        {/* Botón de envío / guardado del formulario */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "14px" }}>
          <button type="submit" style={estilos.btnGuardar}>
            + Guardar en Inventario
          </button>
        </div>
      </form>
    </div>
  );

  // Renderizado condicional: si existe onCerrar, envuelve el contenido en un contenedor flotante (overlay)
  if (onCerrar) {
    return <div style={estilos.overlay}>{contenido}</div>;
  }

  return contenido;
}

// Objeto con todos los estilos en línea aplicados al componente
const estilos = {
  tarjetaBase: { 
    backgroundColor: "#ffffff", 
    borderRadius: "10px", 
    padding: "16px 20px", 
    marginBottom: "16px", 
    border: "1px solid #e2e8f0", 
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    boxSizing: "border-box"
  },
  tarjetaNormal: { width: "100%" }, // Idéntico en ancho al rectángulo de salidas inferior
  tarjetaModal: { width: "750px", maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto" }, // Ventana modal compacta y estable
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", borderBottom: "1px solid #f1f5f9", paddingBottom: "8px" },
  btnCerrar: { background: "transparent", border: "none", fontSize: "16px", color: "#64748b", cursor: "pointer", fontWeight: "bold" },
  gridFluido: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" },
  label: { fontSize: "11px", fontWeight: "bold", color: "#334155", marginBottom: "3px", display: "block" },
  input: { width: "100%", padding: "6px 9px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "11.5px", boxSizing: "border-box", textTransform: "uppercase", outline: "none", background: "#ffffff" },
  select: { width: "100%", padding: "6px 9px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "11.5px", boxSizing: "border-box", outline: "none", background: "#ffffff", color: "#0f172a", textTransform: "uppercase" },
  btnGuardar: { backgroundColor: "#16a34a", color: "#ffffff", border: "none", padding: "8px 18px", borderRadius: "5px", fontSize: "11.5px", fontWeight: "bold", cursor: "pointer" },
  alerta: { padding: "7px 10px", borderRadius: "5px", fontSize: "11.5px", marginBottom: "10px", fontWeight: "600" },
  overlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15, 23, 42, 0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "14px" }
};