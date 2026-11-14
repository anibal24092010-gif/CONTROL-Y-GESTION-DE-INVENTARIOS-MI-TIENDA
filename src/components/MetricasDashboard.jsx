// =========================================================================
// IMPORTACIÓN DE LIBRERÍAS DE REACT
// =========================================================================
import React from "react";

/**
 * =========================================================================
 * COMPONENTE: MetricasDashboard.jsx
 * DESCRIPCIÓN: Panel de indicadores clave de rendimiento (KPIs) del sistema.
 * Calcula en tiempo real: volumen total de inventario, existencias físicas,
 * alertas tempranas de bajo stock y semáforo de caducidad crítica (<= 7 días).
 * =========================================================================
 */
function MetricasDashboard({ lotes = [] }) {
  
  // -----------------------------------------------------------------------
  // 1. MÉTRICA 1: TOTAL DE LOTES ACTIVOS REGISTRADOS
  // -----------------------------------------------------------------------
  // Obtiene la cantidad de registros de lotes presentes en el arreglo
  const totalLotes = Array.isArray(lotes) ? lotes.length : 0;

  // -----------------------------------------------------------------------
  // 2. MÉTRICA 2: SUMATORIA TOTAL DE UNIDADES FÍSICAS INDIVIDUALES
  // -----------------------------------------------------------------------
  // Acumula la cantidad total de unidades individuales usando reduce()
  const totalUnidades = (Array.isArray(lotes) ? lotes : []).reduce(
    (acumulador, item) => acumulador + (Number(item.totalUnidades) || 0),
    0
  );

  // -----------------------------------------------------------------------
  // 3. MÉTRICA 3: ALERTAS DE BAJO STOCK (PUNTO DE REORDEN)
  // -----------------------------------------------------------------------
  // Filtra los lotes cuya cantidad de empaques o unidades es menor o igual al stock mínimo configurado
  const lotesBajoStock = (Array.isArray(lotes) ? lotes : []).filter((l) => {
    const cantidadActual = Number(l.cantidadEmpaques) || 0;
    const minimoSeguridad = Number(l.stockMinimo) || 5;
    return cantidadActual <= minimoSeguridad;
  }).length;

  // -----------------------------------------------------------------------
  // 4. MÉTRICA 4: ALERTAS DE VENCIMIENTO CRÍTICO (CADUCIDAD <= 7 DÍAS O VENCIDOS)
  // -----------------------------------------------------------------------
  // Evalúa la fecha de caducidad respecto a la fecha actual del sistema
  const lotesPorVencer = (Array.isArray(lotes) ? lotes : []).filter((l) => {
    // Normalización de la propiedad de fecha recibida desde MySQL o API
    const fechaCaducidadStr = l.vencimiento || l.fechaVencimiento || l.fechaVence || l.fecha_vencimiento;
    
    // Si no cuenta con fecha de vencimiento válida o es perecedero sin fecha ("N/A"), se descarta
    if (!fechaCaducidadStr || fechaCaducidadStr === "N/A") return false;

    const fechaHoy = new Date(); // Fecha actual del navegador/sistema
    const fechaVence = new Date(fechaCaducidadStr); // Fecha límite de vencimiento

    // Cálculo de la diferencia temporal en días completos
    const diferenciaMilisegundos = fechaVence - fechaHoy;
    const diasRestantes = Math.ceil(diferenciaMilisegundos / (1000 * 60 * 60 * 24));

    // Considera crítico si faltan 7 días o menos, o si el producto ya está vencido (<= 7)
    return diasRestantes <= 7;
  }).length;

  // -----------------------------------------------------------------------
  // 5. RENDERIZADO VISUAL DEL DASHBOARD DE INDICADORES (KPIs)
  // -----------------------------------------------------------------------
  return (
    // Contenedor principal estructurado con CSS Grid para diseño responsivo
    <div style={estilos.grid}>
      
      {/* TARJETA KPI 1: TOTAL DE LOTES REGISTRADOS */}
      <div style={{ ...estilos.card, borderLeft: "5px solid #0284c7" }}>
        <span style={estilos.titulo}>Lotes Registrados</span>
        <h2 style={estilos.valor}>{totalLotes}</h2>
      </div>

      {/* TARJETA KPI 2: TOTAL DE UNIDADES FÍSICAS EN EXISTENCIA */}
      <div style={{ ...estilos.card, borderLeft: "5px solid #16a34a" }}>
        <span style={estilos.titulo}>Total Unidades Físicas</span>
        {/* Formateo con separadores de miles para estándar numérico */}
        <h2 style={estilos.valor}>{totalUnidades.toLocaleString()} unds</h2>
      </div>

      {/* TARJETA KPI 3: ALERTAS DE REABASTECIMIENTO / BAJO STOCK */}
      <div style={{ ...estilos.card, borderLeft: "5px solid #d97706" }}>
        <span style={estilos.titulo}>Alertas: Bajo Stock</span>
        <h2 style={{ ...estilos.valor, color: "#d97706" }}>{lotesBajoStock} lotes</h2>
      </div>

      {/* TARJETA KPI 4: ALERTAS DE VENCIMIENTO INMINENTE (<= 7 DÍAS) */}
      <div style={{ ...estilos.card, borderLeft: "5px solid #dc2626" }}>
        <span style={estilos.titulo}>Alertas: Vencimiento (&le; 7d)</span>
        <h2 style={{ ...estilos.valor, color: "#dc2626" }}>{lotesPorVencer}</h2>
      </div>

    </div>
  );
}

// -------------------------------------------------------------------------
// 6. OBJETO DE ESTILOS CSS EN JAVASCRIPT (INLINE STYLING)
// -------------------------------------------------------------------------
const estilos = {
  // Cuadrícula fluida que distribuye equitativamente las tarjetas según la resolución
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
    marginBottom: "20px"
  },
  // Contenedor de tarjeta métrica individual
  card: {
    background: "#ffffff",
    padding: "16px",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    border: "1px solid #e2e8f0"
  },
  // Título superior de cada indicador
  titulo: {
    fontSize: "11.5px",
    color: "#64748b",
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    display: "block"
  },
  // Cifra numérica destacada en alta jerarquía visual
  valor: {
    margin: "8px 0 0 0",
    fontSize: "22px",
    fontWeight: "800",
    color: "#0f172a"
  }
};

// =========================================================================
// EXPORTACIÓN POR DEFECTO DEL COMPONENTE
// =========================================================================
export default MetricasDashboard;