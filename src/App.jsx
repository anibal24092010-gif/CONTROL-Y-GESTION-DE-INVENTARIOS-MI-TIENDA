// Importaciones base de React
import React, { useState, useEffect, useRef } from "react";

// Componentes modulares
import Auth from "./components/Auth";
import MetricasDashboard from "./components/MetricasDashboard";
import GestionUsuarios from "./components/GestionUsuarios";
import FormularioEntrada from "./components/FormularioEntrada";
import FormularioSalida from "./components/FormularioSalida";
import TablaInventario from "./components/TablaInventario";
import ReportesExportar from "./components/ReportesExportar";
import ProductosSalida from "./components/ProductosSalida";
import { actualizarMovimientoAPI } from "./services/api";

// Servicios API MySQL
import {
  obtenerLotesAPI,
  crearLoteAPI,
  actualizarLoteAPI,
  eliminarLoteAPI,
  obtenerMovimientosAPI,
  registrarMovimientoAPI,
  obtenerUsuariosAPI
} from "./services/api";

export default function App() {
  const [usuarioActivo, setUsuarioActivo] = useState(() => {
    const sesion = localStorage.getItem("app_sesion");
    return sesion ? JSON.parse(sesion) : null;
  });

  const [vistaActiva, setVistaActiva] = useState("inicio");
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef(null);
  const seccionConsultasRef = useRef(null);
  const contenedorBusquedaRef = useRef(null);

  const [lotes, setLotes] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [notificacion, setNotificacion] = useState({ visible: false, mensaje: "", tipo: "exito" });

  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [loteAEditar, setLoteAEditar] = useState(null);

  const [busquedaTexto, setBusquedaTexto] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("TODAS");
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

  const mostrarNotificacion = (mensaje, tipo = "exito") => {
    setNotificacion({ visible: true, mensaje, tipo });
    setTimeout(() => {
      setNotificacion({ visible: false, mensaje: "", tipo: "exito" });
    }, 4000);
  };

  const cargarDatos = async (mostrarCarga = false) => {
    try {
      if (mostrarCarga) setCargando(true);
      const [lotesData, movsData, usersData] = await Promise.all([
        obtenerLotesAPI(),
        obtenerMovimientosAPI(),
        obtenerUsuariosAPI()
      ]);
      setLotes(Array.isArray(lotesData) ? lotesData : []);
      setMovimientos(Array.isArray(movsData) ? movsData : []);
      setUsuarios(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      console.error("Error al sincronizar con MySQL:", error);
    } finally {
      if (mostrarCarga) setCargando(false);
    }
  };

  useEffect(() => {
  cargarDatos(true);
}, []);

  useEffect(() => {
    const clickAfuera = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuAbierto(false);
      }
      if (contenedorBusquedaRef.current && !contenedorBusquedaRef.current.contains(e.target)) {
        setMostrarSugerencias(false);
      }
    };
    document.addEventListener("mousedown", clickAfuera);
    return () => document.removeEventListener("mousedown", clickAfuera);
  }, []);

  const irAConsultas = () => {
    setVistaActiva("inicio");
    setMenuAbierto(false);
    setTimeout(() => {
      if (seccionConsultasRef.current) {
        seccionConsultasRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        const inputBuscar = seccionConsultasRef.current.querySelector("input");
        if (inputBuscar) inputBuscar.focus();
      }
    }, 100);
  };

  const handleLogin = (usr) => {
    setUsuarioActivo(usr);
    localStorage.setItem("app_sesion", JSON.stringify(usr));
    setVistaActiva("inicio");
  };

  const handleLogout = () => {
    setUsuarioActivo(null);
    localStorage.removeItem("app_sesion");
  };

  const handleGuardarLote = async (datosLote) => {
    try {
      if (loteAEditar) {
        await actualizarLoteAPI(loteAEditar.id, datosLote);
        mostrarNotificacion(`✏️ Se actualizaron los datos de "${datosLote.nombre}".`, "info");
      } else {
      const respuestaLote = await crearLoteAPI(datosLote);
      const idLoteGenerado = respuestaLote.id || datosLote.id;

      await registrarMovimientoAPI({
        tipo: "ENTRADA",
        cantidadUnds: datosLote.totalUnidades,
        motivo: "Entrada de Mercancía / Recepción",
        idLote: idLoteGenerado,
        idUsuario: Number(usuarioActivo?.id) || 1 // <--- ASEGÚRATE DE QUE VAYA CON .id numérico o el 1 por defecto
      });
      
      mostrarNotificacion(`✅ Se ingresaron ${datosLote.totalUnidades} unds de "${datosLote.nombre}" (${datosLote.lote}).`, "exito");
    }
      setModalEditarAbierto(false);
      setLoteAEditar(null);
      await cargarDatos(false);
    } catch (error) {
      console.error("Error guardando lote:", error);
      mostrarNotificacion("❌ Error al guardar el lote en el servidor.", "error");
    }
  };
  const handleEliminarLote = async (id) => {
    if (!window.confirm("¿Está seguro de eliminar este producto del inventario?")) return;
    try {
      await eliminarLoteAPI(id);
      mostrarNotificacion("🗑️ Producto eliminado correctamente.", "aviso");
      await cargarDatos(false);
    } catch (error) {
      console.error("Error al eliminar lote:", error);
    }
  };
  const handleRegistrarSalida = async (parametroSalida) => {
    let loteId, cantidadUnds, motivo, idUsuarioMov;

    if (typeof parametroSalida === "object" && parametroSalida !== null) {
      loteId = parametroSalida.idLote;
      cantidadUnds = parametroSalida.cantidadUnds;
      motivo = parametroSalida.motivo;
      idUsuarioMov = parametroSalida.idUsuario;
    } else {
      loteId = arguments[0];
      cantidadUnds = arguments[1];
      motivo = arguments[2];
      idUsuarioMov = usuarioActivo?.id || 1;
    }

    const loteActual = lotes.find((l) => l.id === Number(loteId));
    if (!loteActual) {
      mostrarNotificacion("❌ Error: No se encontró el lote seleccionado.", "error");
      return;
    }

    const nuevasUnidades = loteActual.totalUnidades - Number(cantidadUnds);
    const nuevosEmpaques = (nuevasUnidades / (loteActual.unidadesPorEmpaque || 1)).toFixed(2);
    const nuevasVendidas = (loteActual.unidadesVendidas || 0) + Number(cantidadUnds);

    try {
      await actualizarLoteAPI(loteActual.id, {
        ...loteActual,
        totalUnidades: nuevasUnidades,
        cantidadEmpaques: nuevosEmpaques,
        unidadesVendidas: nuevasVendidas
      });

      await registrarMovimientoAPI({
        tipo: "SALIDA",
        cantidadUnds: Number(cantidadUnds),
        motivo: motivo,
        idLote: Number(loteActual.id),
        idUsuario: Number(idUsuarioMov)
      });

      mostrarNotificacion(`📤 Se descontaron ${cantidadUnds} unds de "${loteActual.nombre}" (${loteActual.lote}).`, "aviso");
      await cargarDatos(false);
    } catch (error) {
      console.error("Error al procesar la salida relacional:", error);
      mostrarNotificacion("❌ Error al procesar la salida en el servidor.", "error");
    }
  };
  const handleEditarMovimiento = async (movimientoOriginal, nuevaCantidad, nuevoMotivo) => {
    const cantOriginal = Number(movimientoOriginal.cantidadUnds);
    const cantNueva = Number(nuevaCantidad);
    const diferencia = cantNueva - cantOriginal;

    const loteRelacionado = lotes.find(
      (l) => l.lote === movimientoOriginal.lote || l.codigo === movimientoOriginal.codigo
    );

    if (loteRelacionado) {
      let nuevoTotal = loteRelacionado.totalUnidades;
      if (movimientoOriginal.tipo === "SALIDA") {
        nuevoTotal = loteRelacionado.totalUnidades - diferencia;
      } else {
        nuevoTotal = loteRelacionado.totalUnidades + diferencia;
      
    }
  
      if (nuevoTotal < 0) {
        alert("Error: El ajuste dejaría el stock en valores negativos.");
        return;
      }
      // Actualizamos el movimiento en la base de datos
    await actualizarMovimientoAPI(movimientoOriginal.id, {
      cantidadUnds: cantNueva,
      motivo: nuevoMotivo || movimientoOriginal.motivo
    });

      const nuevosEmp = (nuevoTotal / (loteRelacionado.unidadesPorEmpaque || 1)).toFixed(2);
      await actualizarLoteAPI(loteRelacionado.id, {
        ...loteRelacionado,
        totalUnidades: nuevoTotal,
        cantidadEmpaques: nuevosEmp
      });
    }

    const movsActualizados = movimientos.map((m) =>
      m.id === movimientoOriginal.id ? { ...m, cantidadUnds: cantNueva, motivo: nuevoMotivo } : m
    );
    setMovimientos(movsActualizados);
    mostrarNotificacion(`✏️ Se corrigió el registro de "${movimientoOriginal.nombreProducto}".`, "info");
    await cargarDatos(false);
  };

  if (!usuarioActivo) {
    return <Auth onLoginExitoso={handleLogin} usuarios={usuarios} />;
  }

  const rolNormalizado = (usuarioActivo.rol || "").toUpperCase().trim();
  const esAdmin = rolNormalizado === "ADMINISTRADOR" || rolNormalizado === "SUPERADMIN";
  const esSoloConsulta = rolNormalizado === "USUARIO CONSULTA" || rolNormalizado === "CONSULTA";
  const esBodega = (rolNormalizado === "OPERADOR BODEGA" || rolNormalizado === "BODEGA" || esAdmin) && !esSoloConsulta;

  const txtLimpio = busquedaTexto.trim().toUpperCase();
  const sugerencias = txtLimpio
    ? lotes.filter((l) => {
        return (
          (l.nombre && l.nombre.toUpperCase().includes(txtLimpio)) ||
          (l.codigo && l.codigo.toUpperCase().includes(txtLimpio)) ||
          (l.lote && l.lote.toUpperCase().includes(txtLimpio)) ||
          (l.marca && l.marca.toUpperCase().includes(txtLimpio))
        );
      })
    : [];

  const handleSeleccionarSugerencia = (item) => {
    setBusquedaTexto(item.nombre || item.codigo);
    setMostrarSugerencias(false);
  };

  const handleKeyDownBusqueda = (e) => {
    if (e.key === "Enter") {
      if (sugerencias.length > 0) {
        handleSeleccionarSugerencia(sugerencias[0]);
      }
      setMostrarSugerencias(false);
    }
  };

  const lotesFiltrados = lotes.filter((l) => {
    const txt = busquedaTexto.toLowerCase();
    const matchTexto =
      !txt ||
      l.nombre.toLowerCase().includes(txt) ||
      (l.codigo && l.codigo.toLowerCase().includes(txt)) ||
      (l.lote && l.lote.toLowerCase().includes(txt)) ||
      (l.marca && l.marca.toLowerCase().includes(txt));

    const catLote = (l.categoria || "").toUpperCase();
    const matchCat = filtroCategoria === "TODAS" || catLote === filtroCategoria;
    return matchTexto && matchCat;
  });

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", fontFamily: "Segoe UI, sans-serif" }}>
      
      <header style={estilos.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <img 
            src="/logo.svg" 
            alt="Logo" 
            style={{ width: "46px", height: "46px", objectFit: "contain" }} 
            onError={(e) => (e.target.style.display = "none")} 
          />
          <div>
            <h1 style={estilos.tituloLogo}>MI TIENDA <span style={{ color: "#f97316" }}>•</span></h1>
            <p style={estilos.subtituloLogo}>SISTEMA DE CONTROL &amp; GESTIÓN DE INVENTARIOS</p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }} ref={menuRef}>
          <button
            onClick={() => setVistaActiva("inicio")}
            style={{
              ...estilos.btnNav,
              backgroundColor: vistaActiva === "inicio" ? "#0284c7" : "#f1f5f9",
              color: vistaActiva === "inicio" ? "#ffffff" : "#334155"
            }}
          >
            🏠 Inicio
          </button>

          {!esSoloConsulta && (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setMenuAbierto(!menuAbierto)}
                style={{
                  ...estilos.btnNav,
                  backgroundColor: vistaActiva !== "inicio" ? "#0284c7" : "#f1f5f9",
                  color: vistaActiva !== "inicio" ? "#ffffff" : "#334155"
                }}
              >
                ☰ Módulos ▼
              </button>

              {menuAbierto && (
                <div style={estilos.dropdown}>
                  <div onClick={() => { setVistaActiva("inicio"); setMenuAbierto(false); }} style={estilos.itemDropdown}>
                    📦 Inicio / Inventario
                  </div>
                  <div onClick={irAConsultas} style={{ ...estilos.itemDropdown, color: "#0284c7", fontWeight: "bold" }}>
                    🔍 Consultas y Búsqueda
                  </div>
                  {esAdmin && (
                    <div onClick={() => { setVistaActiva("movimientos"); setMenuAbierto(false); }} style={estilos.itemDropdown}>
                      📦 Control Entradas / Salidas
                    </div>
                  )}
                  {esAdmin && (
                    <div onClick={() => { setVistaActiva("usuarios"); setMenuAbierto(false); }} style={estilos.itemDropdown}>
                      👥 Gestion de Usuario
                    </div>
                  )}
                  {esAdmin && (
                    <div onClick={() => { setVistaActiva("reportes"); setMenuAbierto(false); }} style={estilos.itemDropdown}>
                      📊 Reportes
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div style={estilos.badgeUsuario}>
            <span style={{ color: "#22c55e" }}>●</span> {usuarioActivo.nombre} | <strong>{usuarioActivo.rol}</strong>
          </div>

          <button onClick={handleLogout} style={estilos.btnLogout}>
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main style={{ padding: "14px 20px", maxWidth: "1350px", margin: "0 auto" }}>
        {cargando ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
            <h3>⏳ Sincronizando datos con MySQL...</h3>
          </div>
        ) : (
          <>
            {(vistaActiva === "inicio" || esSoloConsulta) && (
              <>
                <MetricasDashboard lotes={lotes} />

                <div style={estilos.cajaAccesos}>
                  <span style={{ fontSize: "12px", fontWeight: "bold", color: "#475569" }}>⚡ Accesos Rápidos:</span>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <button onClick={irAConsultas} style={estilos.btnAccesoConsultas}>
                      🔍 Consultar / Buscar
                    </button>
                    {esAdmin && (
                      <button onClick={() => setVistaActiva("movimientos")} style={estilos.btnAccesoSalidas}>
                        📦 Control Entradas / Salidas
                      </button>
                    )}
                    {esAdmin && (
                      <button onClick={() => setVistaActiva("usuarios")} style={estilos.btnAccesoUsuarios}>
                        👥 Gestion de Usuario
                      </button>
                    )}
                    {esAdmin && (
                      <button onClick={() => setVistaActiva("reportes")} style={estilos.btnAccesoReportes}>
                        📊 Reportes
                      </button>
                    )}
                  </div>
                </div>

               {esBodega && (
                  <>
                    <FormularioEntrada onGuardar={handleGuardarLote} />
                    <FormularioSalida 
                      lotes={lotes} 
                      onRegistrarSalida={handleRegistrarSalida} 
                      usuarioActual={usuarioActivo} 
                    />
                  </>
                )}
                <div 
                  ref={seccionConsultasRef} 
                  style={{ display: "flex", gap: "10px", marginBottom: "12px", flexWrap: "wrap", scrollMarginTop: "20px" }}
                >
                  <div style={{ position: "relative", flex: "1 1 280px" }} ref={contenedorBusquedaRef}>
                    <input
                      type="text"
                      placeholder="🔍 BUSCAR POR NOMBRE, MARCA, SKU O SERIAL..."
                      value={busquedaTexto}
                      onChange={(e) => {
                        setBusquedaTexto(e.target.value.toUpperCase());
                        setMostrarSugerencias(true);
                      }}
                      onKeyDown={handleKeyDownBusqueda}
                      onFocus={() => { if (busquedaTexto.trim()) setMostrarSugerencias(true); }}
                      style={estilos.inputBusqueda}
                      autoComplete="off"
                    />

                    {mostrarSugerencias && sugerencias.length > 0 && (
                      <div style={estilos.dropdownSugerencias}>
                        {sugerencias.slice(0, 6).map((item) => (
                          <div
                            key={item.id}
                            onClick={() => handleSeleccionarSugerencia(item)}
                            style={estilos.itemSugerencia}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f1f5f9")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ffffff")}
                          >
                            <strong style={{ color: "#0f172a", fontSize: "11px" }}>
                              {item.nombre} ({item.marca})
                            </strong>
                            <div style={{ fontSize: "10px", color: "#64748b" }}>
                              SKU: <strong>{item.codigo}</strong> | Lote: <strong style={{ color: "#0284c7" }}>{item.lote}</strong> | Stock: <strong style={{ color: "#16a34a" }}>{item.totalUnidades} unds</strong>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <select
                    value={filtroCategoria}
                    onChange={(e) => setFiltroCategoria(e.target.value)}
                    style={estilos.selectCat}
                  >
                    <option value="TODAS">TODAS LAS CATEGORÍAS</option>
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

                <TablaInventario
                  lotes={lotesFiltrados}
                  usuarioActivo={usuarioActivo}
                  onEditar={(lote) => {
                    setLoteAEditar(lote);
                    setModalEditarAbierto(true);
                  }}
                  onEliminar={handleEliminarLote}
                />
              </>
            )}

            {vistaActiva === "movimientos" && esAdmin && (
              <div>
                <button onClick={() => setVistaActiva("inicio")} style={estilos.btnVolver}>
                  ← Volver a Inicio
                </button>
                <ProductosSalida
                  movimientos={movimientos}
                  usuarioActivo={usuarioActivo}
                  onEditarMovimiento={handleEditarMovimiento}
                />
              </div>
            )}

            {vistaActiva === "usuarios" && esAdmin && (
              <div>
                <button onClick={() => setVistaActiva("inicio")} style={estilos.btnVolver}>
                  ← Volver a Inicio
                </button>
                <GestionUsuarios usuarios={usuarios} usuarioActivo={usuarioActivo} onRecargarUsuarios={() => cargarDatos(false)} />
              </div>
            )}

            {vistaActiva === "reportes" && esAdmin && (
              <div>
                <button onClick={() => setVistaActiva("inicio")} style={estilos.btnVolver}>
                  ← Volver a Inicio
                </button>
                <ReportesExportar lotes={lotesFiltrados} historialMovimientos={movimientos} />
              </div>
            )}
          </>
        )}
      </main>

      {notificacion.visible && (
        <div style={{
          ...estilos.toast,
          backgroundColor: notificacion.tipo === "exito" ? "#16a34a" : notificacion.tipo === "aviso" ? "#ea580c" : "#0284c7"
        }}>
          {notificacion.mensaje}
        </div>
      )}

      {modalEditarAbierto && loteAEditar && esAdmin && (
        <FormularioEntrada
          loteAEditar={loteAEditar}
          onGuardar={handleGuardarLote}
          onCerrar={() => {
            setModalEditarAbierto(false);
            setLoteAEditar(null);
          }}
        />
      )}
    </div>
  );
}

const estilos = {
  header: { backgroundColor: "#ffffff", padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", flexWrap: "wrap", gap: "10px" },
  tituloLogo: { margin: 0, fontSize: "21px", fontWeight: "900", color: "#0f172a", letterSpacing: "-0.5px" },
  subtituloLogo: { margin: "1px 0 0 0", fontSize: "11.5px", fontWeight: "700", color: "#0284c7", letterSpacing: "0.5px" },
  btnNav: { padding: "7px 14px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold", cursor: "pointer", border: "1px solid #cbd5e1" },
  dropdown: { position: "absolute", top: "115%", left: 0, backgroundColor: "#ffffff", borderRadius: "6px", boxShadow: "0 8px 20px rgba(0,0,0,0.12)", border: "1px solid #e2e8f0", width: "230px", zIndex: 100 },
  itemDropdown: { padding: "9px 12px", fontSize: "11.5px", cursor: "pointer", borderBottom: "1px solid #f1f5f9", color: "#0f172a" },
  badgeUsuario: { backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", fontSize: "11.5px", padding: "6px 14px", borderRadius: "16px", fontWeight: "600" },
  btnLogout: { backgroundColor: "#ef4444", color: "#ffffff", border: "none", padding: "7px 16px", borderRadius: "16px", fontSize: "11.5px", fontWeight: "bold", cursor: "pointer" },
  cajaAccesos: { backgroundColor: "#ffffff", padding: "8px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" },
  btnAccesoConsultas: { backgroundColor: "#f0f9ff", color: "#0284c7", border: "1px solid #bae6fd", padding: "6px 12px", borderRadius: "5px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" },
  btnAccesoSalidas: { backgroundColor: "#fff7ed", color: "#c2410c", border: "1px solid #fed7aa", padding: "6px 12px", borderRadius: "5px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" },
  btnAccesoUsuarios: { backgroundColor: "#f8fafc", color: "#0f172a", border: "1px solid #cbd5e1", padding: "6px 12px", borderRadius: "5px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" },
  btnAccesoReportes: { backgroundColor: "#0284c7", color: "#ffffff", border: "none", padding: "6px 12px", borderRadius: "5px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" },
  inputBusqueda: { width: "100%", padding: "7px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "11.5px", textTransform: "uppercase", outline: "none", boxSizing: "border-box" },
  dropdownSugerencias: { position: "absolute", top: "100%", left: 0, right: 0, background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "6px", marginTop: "4px", maxHeight: "170px", overflowY: "auto", zIndex: 100, boxShadow: "0 4px 14px rgba(0,0,0,0.12)" },
  itemSugerencia: { padding: "7px 10px", cursor: "pointer", borderBottom: "1px solid #f1f5f9" },
  selectCat: { flex: "0 1 220px", padding: "7px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "11.5px", background: "#ffffff", outline: "none", textTransform: "uppercase" },
  btnVolver: { backgroundColor: "#0f172a", color: "#ffffff", border: "none", padding: "7px 14px", borderRadius: "5px", fontSize: "11.5px", fontWeight: "bold", cursor: "pointer", marginBottom: "14px" },
  toast: { position: "fixed", bottom: "20px", right: "24px", color: "#ffffff", padding: "10px 18px", borderRadius: "8px", fontSize: "12px", fontWeight: "bold", boxShadow: "0 6px 16px rgba(0,0,0,0.15)", zIndex: 9999 }
};