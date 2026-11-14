import React from "react";

/**
 * =========================================================================
 * COMPONENTE: FiltrosBusqueda.jsx
 * DESCRIPCIÓN: Panel de filtrado multicriterio en tiempo real para el
 * inventario (búsqueda por texto, categoría, ubicación y semáforo de vencimiento).
 * =========================================================================
 */
export default function FiltrosBusqueda({
  // Props de búsqueda por texto (soporta ambas nomenclaturas para compatibilidad)
  busqueda,
  setBusqueda,
  filtroTexto,
  setFiltroTexto,

  // Props de filtro por categoría
  filtroCategoria,
  setFiltroCategoria,

  // Props opcionales de filtro por ubicación física y control de caducidad
  filtroUbicacion,
  setFiltroUbicacion,
  filtroVencimiento,
  setFiltroVencimiento
}) {
  // -----------------------------------------------------------------------
  // 1. NORMALIZACIÓN DE VALORES Y CONTROLADORES DE EVENTO
  // -----------------------------------------------------------------------
  // Determina el valor actual del texto de búsqueda
  const valorTexto = filtroTexto !== undefined ? filtroTexto : busqueda || "";
  
  // Asigna la función que actualiza el texto en el estado global de App.jsx
  const fnCambioTexto = setFiltroTexto || setBusqueda || (() => {});

  // -----------------------------------------------------------------------
  // 2. RENDERIZADO DEL PANEL DE FILTROS
  // -----------------------------------------------------------------------
  return (
    <div style={estilos.contenedor}>
      <div style={estilos.grid}>
        
        {/* FILTRO 1: CAMPO DE BÚSQUEDA POR TEXTO (SKU, SERIAL, NOMBRE, MARCA O LOTE) */}
        <div style={estilos.columnaTexto}>
          <label style={estilos.label}>🔍 Buscar en Inventario:</label>
          <input
            type="text"
            placeholder="Buscar por SKU, Serial, Nombre, Marca o Lote..."
            value={valorTexto}
            onChange={(e) => fnCambioTexto(e.target.value)}
            style={estilos.inputBusqueda}
          />
        </div>

        {/* FILTRO 2: SELECTOR DE CATEGORÍA DE PRODUCTOS */}
        <div style={estilos.columnaSelect}>
          <label style={estilos.label}>📂 Filtrar por Categoría:</label>
          <select
            value={filtroCategoria || "TODAS"}
            onChange={(e) => setFiltroCategoria && setFiltroCategoria(e.target.value)}
            style={estilos.select}
          >
            <option value="TODAS">Todas las Categorías</option>
            <option value="Todos">Todas las Categorías (Todos)</option>
            <option value="Abarrotes / Granos">Abarrotes / Granos</option>
            <option value="Aceites, Salsas y Condimentos">Aceites, Salsas y Condimentos</option>
            <option value="Lácteos, Mantequillas y Huevos">Lácteos, Mantequillas y Huevos</option>
            <option value="Carnes, Pollos y Embutidos">Carnes, Pollos y Embutidos</option>
            <option value="Frutas, Verduras y Fruver">Frutas, Verduras y Fruver</option>
            <option value="Bebidas y Licores">Bebidas y Licores</option>
            <option value="Enlatados y Conservas">Enlatados y Conservas</option>
            <option value="Panadería y Galletas">Panadería y Galletas</option>
            <option value="Snacks y Mecatos">Snacks y Mecatos</option>
            <option value="Aseo del Hogar">Aseo del Hogar</option>
            <option value="Cuidado Personal">Cuidado Personal</option>
            <option value="Mascotas">Mascotas</option>
          </select>
        </div>

        {/* FILTRO 3: SELECTOR DE UBICACIÓN EN BODEGA (CONDICIONAL SI SE ENVÍA LA PROP) */}
        {setFiltroUbicacion && (
          <div style={estilos.columnaSelectPequena}>
            <label style={estilos.label}>📍 Ubicación / Estante:</label>
            <select
              value={filtroUbicacion || "TODAS"}
              onChange={(e) => setFiltroUbicacion(e.target.value)}
              style={estilos.select}
            >
              <option value="TODAS">Todas las Bodegas</option>
              <option value="Estante A1">Estante A1</option>
              <option value="Estante A2">Estante A2</option>
              <option value="Estante B1">Estante B1</option>
              <option value="Estante B2">Estante B2</option>
              <option value="Nevera / Refrigeración">Nevera / Refrigeración</option>
              <option value="Pasillo Central">Pasillo Central</option>
              <option value="Bodega Principal">Bodega Principal</option>
            </select>
          </div>
        )}

        {/* FILTRO 4: SEMÁFORO DE VENCIMIENTO (CONDICIONAL SI SE ENVÍA LA PROP) */}
        {setFiltroVencimiento && (
          <div style={estilos.columnaSelectPequena}>
            <label style={estilos.label}>⏳ Estado de Vencimiento:</label>
            <select
              value={filtroVencimiento || "TODOS"}
              onChange={(e) => setFiltroVencimiento(e.target.value)}
              style={estilos.select}
            >
              <option value="TODOS">Todos los Estados</option>
              <option value="OPTIMO">🟢 Óptimo (&gt; 30 días)</option>
              <option value="ALERTA_30">🟡 Alerta (&le; 30 días)</option>
              <option value="CRITICO_7">🔴 Crítico (&le; 7 días)</option>
              <option value="VENCIDO">❌ Vencidos</option>
            </select>
          </div>
        )}

      </div>
    </div>
  );
}

// -------------------------------------------------------------------------
// 3. DEFINICIÓN DE ESTILOS VISUALES (CSS IN JS)
// -------------------------------------------------------------------------
const estilos = {
  // Contenedor principal del bloque de filtros
  contenedor: {
    background: "#ffffff",
    borderRadius: "12px",
    padding: "14px 18px",
    marginBottom: "16px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 2px 4px rgba(0,0,0,0.03)",
    flex: "1 1 100%"
  },
  // Distribución flexible para acomodar los campos en línea
  grid: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    flexWrap: "wrap"
  },
  // Columna flexible que prioriza el campo de texto
  columnaTexto: {
    flex: "1 1 260px"
  },
  // Columna para selector de categoría con tamaño equilibrado
  columnaSelect: {
    flex: "1 1 220px"
  },
  // Columna para selectores compactos (ubicación y semáforo)
  columnaSelectPequena: {
    flex: "1 1 180px"
  },
  // Etiquetas de los campos
  label: {
    fontSize: "11px",
    fontWeight: "bold",
    color: "#475569",
    display: "block",
    marginBottom: "4px"
  },
  // Caja de texto de búsqueda
  inputBusqueda: {
    width: "100%",
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #cbd5e1",
    fontSize: "12px",
    boxSizing: "border-box",
    outline: "none"
  },
  // Menús desplegables (select)
  select: {
    width: "100%",
    padding: "8px 10px",
    borderRadius: "6px",
    border: "1px solid #cbd5e1",
    fontSize: "12px",
    fontWeight: "600",
    color: "#0f172a",
    background: "#f8fafc",
    boxSizing: "border-box",
    outline: "none",
    cursor: "pointer"
  }
};