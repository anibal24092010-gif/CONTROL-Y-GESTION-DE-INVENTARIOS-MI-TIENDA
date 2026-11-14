// Importación de la librería React para permitir la creación de componentes basados en JSX
import React from "react";

// Componente funcional principal que recibe los lotes, el usuario activo y las funciones de control
export default function TablaInventario({ lotes = [], usuarioActivo, onEditar, onEliminar }) {
  
  // Normaliza el rol del usuario activo convirtiéndolo a mayúsculas y eliminando espacios en blanco innecesarios
  const rolNormalizado = (usuarioActivo?.rol || "").toUpperCase().trim();
  
  // Determina mediante una validación booleana si el usuario actual posee permisos de administrador o superadmin
  const esAdmin = rolNormalizado === "ADMINISTRADOR" || rolNormalizado === "SUPERADMIN";

  // Función auxiliar para calcular los días restantes hasta la fecha de vencimiento de un producto
  const calcularDiasVencimiento = (fechaVencimiento) => {
    // Retorna nulo si el campo de fecha no existe o tiene el valor por defecto "N/A"
    if (!fechaVencimiento || fechaVencimiento === "N/A") return null;
    
    // Obtiene la diferencia en milisegundos entre la fecha de vencimiento y el momento actual
    const diffMs = new Date(fechaVencimiento) - new Date();
    
    // Convierte los milisegundos calculados a días enteros redondeando hacia arriba
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };

  // Función auxiliar encargada de formatear cualquier valor numérico a moneda local colombiana (COP)
  const formatearDinero = (valor) => {
    // Retorna un texto de cero pesos por defecto si el valor no es válido o está vacío
    if (!valor || isNaN(valor)) return "$0";
    
    // Transforma el número al formato oficial de moneda con separadores de miles y sin decimales
    return Number(valor).toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 });
  };

  // Renderizado del componente visual que estructura la tabla de datos y su contenedor de estilos
  return (
    <div style={estilos.contenedorTarjeta}>
      <div style={estilos.barraSuperior}>
        <span>📦 Existencias en Inventario ({lotes.length} lotes registrados)</span>
        <span style={{ fontSize: "11px", color: "#64748b" }}>Desplázate verticalmente para consultar todo el catálogo</span>
      </div>

      <div style={estilos.scrollBox}>
        <table style={estilos.tabla}>
          <thead>
            <tr>
              <th style={estilos.th}>SKU / SERIAL</th>
              <th style={estilos.th}>PRODUCTO &amp; MARCA</th>
              <th style={estilos.th}>UBICACIÓN</th>
              <th style={estilos.th}>LOTE / INGRESO</th>
              <th style={estilos.th}>PRESENTACIÓN</th>
              <th style={estilos.th}>VALOR UNIT. / EMPAQUE</th>
              <th style={estilos.th}>EXISTENCIAS</th>
              <th style={estilos.th}>VENCIMIENTO</th>
              <th style={{ ...estilos.th, textAlign: "center" }}>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {/* Validación condicional: muestra un mensaje alternativo si el arreglo de lotes está vacío */}
            {lotes.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: "center", padding: "26px", color: "#64748b" }}>
                  No hay productos registrados en este momento.
                </td>
              </tr>
            ) : (
              // Mapea cada elemento del arreglo de lotes para generar las filas de la tabla de forma dinámica
              lotes.map((lote) => {
                // Calcula los días restantes para la caducidad del lote actual
                const diasRestantes = calcularDiasVencimiento(lote.vencimiento);

                // Procesa las unidades totales y los factores de empaque para el desglose de inventario
                const totalUnds = Number(lote.totalUnidades) || 0;
                const undsPorEmpaque = Number(lote.unidadesPorEmpaque) || 1;
                const empaquesEnteros = Math.floor(totalUnds / undsPorEmpaque);
                const unidadesSueltas = totalUnds % undsPorEmpaque;
                const nombrePresentacion = lote.presentacion || "PACA";

                // Extracción segura del precio unitario y del precio por empaque desde distintas estructuras de datos
                let precioUnitReal = Number(lote.valorUnitario) || Number(lote.valor_unitario) || 0;
                let precioPresReal = Number(lote.valorPresentacion) || Number(lote.valor_presentacion) || 0;

                // Bloque de respaldo para extraer el precio desde el serial si viene concatenado en formato especial
                if (!precioUnitReal && lote.serial && lote.serial.includes("|P:")) {
                  const partes = lote.serial.split("|P:");
                  precioUnitReal = Number(partes[1]) || 0;
                  precioPresReal = precioUnitReal * undsPorEmpaque;
                }

                // Limpia el código serial eliminando los metadatos adjuntos si los posee
                const serialLimpio = lote.serial ? lote.serial.split("|P:")[0] : "";

                // Retorna la estructura de la fila (tr) correspondiente a cada registro de lote
                return (
                  <tr key={lote.id}>
                    <td style={estilos.td}>
                      <strong>{lote.codigo || "S/C"}</strong>
                      {serialLimpio && <div style={{ fontSize: "10px", color: "#64748b" }}>SN: {serialLimpio}</div>}
                    </td>

                    <td style={estilos.td}>
                      <strong style={{ color: "#0f172a" }}>{lote.nombre}</strong>
                      <div style={{ fontSize: "10.5px", color: "#0284c7", fontWeight: "bold" }}>{lote.marca}</div>
                      <div style={{ fontSize: "9.5px", color: "#64748b" }}>{lote.categoria}</div>
                    </td>

                    <td style={estilos.td}>📍 {lote.ubicacion}</td>

                    <td style={estilos.td}>
                      <strong style={{ color: "#0284c7" }}>{lote.lote}</strong>
                      <div style={{ fontSize: "9.5px", color: "#64748b" }}>Entró: {lote.fechaIngreso}</div>
                    </td>

                    <td style={estilos.td}>
                      {nombrePresentacion}
                      <div style={{ fontSize: "9.5px", color: "#64748b" }}>(x{undsPorEmpaque} unds)</div>
                    </td>

                    <td style={estilos.td}>
                      <div style={{ fontWeight: "bold", color: "#16a34a" }}>Unit: {formatearDinero(precioUnitReal)}</div>
                      <div style={{ fontSize: "10px", color: "#64748b" }}>Emp: {formatearDinero(precioPresReal)}</div>
                    </td>

                    <td style={estilos.td}>
                      <div style={{ fontWeight: "bold", color: "#0f172a" }}>
                        {empaquesEnteros > 0 ? `${empaquesEnteros} ${nombrePresentacion}(S)` : ""}
                        {empaquesEnteros > 0 && unidadesSueltas > 0 ? " + " : ""}
                        {unidadesSueltas > 0 ? `${unidadesSueltas} Und(s)` : ""}
                        {empaquesEnteros === 0 && unidadesSueltas === 0 ? "Agotado" : ""}
                      </div>
                      <div style={{ fontSize: "10.5px", fontWeight: "bold", color: "#16a34a", marginTop: "2px" }}>
                        Total: {lote.totalUnidades} unds
                      </div>
                    </td>

                    <td style={estilos.td}>
                      <span style={{ fontWeight: "600", color: "#334155" }}>{lote.vencimiento || "N/A"}</span>
                      {/* Renderizado condicional de alerta si el producto está próximo a vencer */}
                      {diasRestantes !== null && diasRestantes <= 15 && diasRestantes >= 0 && (
                        <span style={estilos.badgeAlerta}>⚠️ Vence en {diasRestantes}d</span>
                      )}
                      {/* Renderizado condicional de etiqueta si el producto ya se encuentra vencido */}
                      {diasRestantes !== null && diasRestantes < 0 && (
                        <span style={estilos.badgeVencido}>❌ Vencido</span>
                      )}
                    </td>

                    <td style={{ ...estilos.td, textAlign: "center", whiteSpace: "nowrap" }}>
                      {/* Validación de privilegios: muestra los botones de gestión únicamente si el usuario es administrador */}
                      {esAdmin ? (
                        <>
                          <button onClick={() => onEditar(lote)} style={estilos.btnEditar} title="Editar producto">
                            ✏️ Editar
                          </button>
                          <button onClick={() => onEliminar(lote.id)} style={estilos.btnEliminar} title="Eliminar producto">
                            ✕
                          </button>
                        </>
                      ) : (
                        <span style={{ fontSize: "10.5px", color: "#94a3b8" }}>Solo Lectura</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Objeto que almacena los estilos en línea aplicados a cada elemento HTML del componente
const estilos = {
  contenedorTarjeta: { backgroundColor: "#ffffff", borderRadius: "10px", border: "1px solid #e2e8f0", boxShadow: "0 1px 2px rgba(0,0,0,0.03)", overflow: "hidden" },
  barraSuperior: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 14px", backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontSize: "11.5px", fontWeight: "bold", color: "#334155" },
  scrollBox: { maxHeight: "250px", overflowY: "scroll", overflowX: "auto" },
  tabla: { width: "100%", borderCollapse: "collapse" },
  th: { backgroundColor: "#0f172a", color: "#ffffff", textAlign: "left", padding: "8px 10px", fontSize: "10.5px", textTransform: "uppercase", letterSpacing: "0.5px", position: "sticky", top: 0, zIndex: 10 },
  td: { padding: "8px 10px", borderBottom: "1px solid #e2e8f0", fontSize: "11px", backgroundColor: "#ffffff" },
  badgeAlerta: { fontSize: "9.5px", fontWeight: "bold", background: "#fef3c7", color: "#b45309", padding: "2px 5px", borderRadius: "4px", display: "block", marginTop: "2px", width: "fit-content" },
  badgeVencido: { fontSize: "9.5px", fontWeight: "bold", background: "#fee2e2", color: "#dc2626", padding: "2px 5px", borderRadius: "4px", display: "block", marginTop: "2px", width: "fit-content" },
  btnEditar: { backgroundColor: "#0284c7", color: "#ffffff", border: "none", borderRadius: "4px", padding: "4px 8px", cursor: "pointer", fontSize: "10.5px", fontWeight: "bold", marginRight: "4px" },
  btnEliminar: { backgroundColor: "#ef4444", color: "#ffffff", border: "none", borderRadius: "4px", padding: "4px 8px", cursor: "pointer", fontSize: "10.5px", fontWeight: "bold" }
};