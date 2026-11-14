import React, { useState } from "react";

// =========================================================================
// IMPORTACIÓN DE SERVICIOS API PARA CONECTAR EL MÓDULO CON MYSQL
// =========================================================================
import {
  crearUsuarioAPI,
  actualizarUsuarioAPI,
  eliminarUsuarioAPI
} from "../services/api";

/**
 * =========================================================================
 * COMPONENTE: GestionUsuarios.jsx
 * DESCRIPCIÓN: Módulo administrativo para la gestión de cuentas (CRUD de Usuarios),
 * asignación de roles (RBAC) y visualización de fichas técnicas en MySQL.
 * =========================================================================
 */
export default function GestionUsuarios({
  usuarios = [],          // Lista de usuarios sincronizados desde MySQL
  usuarioActivo,          // Objeto del usuario autenticado actualmente
  usuarioActual,          // Prop de respaldo de compatibilidad
  onRecargarUsuarios      // Función para refrescar la lista tras cambios en la BD
}) {
  // -----------------------------------------------------------------------
  // 1. ESTADOS DE CONTROL DE INTERFAZ Y VENTANAS MODALES
  // -----------------------------------------------------------------------
  const [panelAbierto, setPanelAbierto] = useState(true);            // Muestra/oculta la tabla de usuarios
  const [modalFormAbierto, setModalFormAbierto] = useState(false);    // Controla modal de crear/editar
  const [usuarioEditandoId, setUsuarioEditandoId] = useState(null);  // ID del usuario en edición (null = crear)
  const [usuarioVerFicha, setUsuarioVerFicha] = useState(null);      // Usuario seleccionado para ver ficha técnica

  // Estado del formulario de usuario
  const [formUsuario, setFormUsuario] = useState({
    usuario: "",
    documento: "",
    nombre: "",
    correo: "",
    telefono: "",
    direccion: "",
    edad: "",
    clave: "",
    rol: "Usuario Consulta"
  });

  // Estado para mensajes de alerta y confirmación
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });

  // -----------------------------------------------------------------------
  // 2. CONTROL DE PRIVILEGIOS Y ROLES
  // -----------------------------------------------------------------------
  const sesionActual = usuarioActivo || usuarioActual;
  const rolNormalizado = (sesionActual?.rol || "").toLowerCase();
  const esSuperAdmin = rolNormalizado === "superadmin";

  // -----------------------------------------------------------------------
  // 3. APERTURA Y CIERRE DE VENTANAS MODALES
  // -----------------------------------------------------------------------
  const abrirModalCrear = () => {
    setUsuarioEditandoId(null);
    setFormUsuario({
      usuario: "",
      documento: "",
      nombre: "",
      correo: "",
      telefono: "",
      direccion: "",
      edad: "",
      clave: "",
      rol: "Usuario Consulta"
    });
    setMensaje({ tipo: "", texto: "" });
    setModalFormAbierto(true);
  };

  const abrirModalEditar = (u) => {
    // Restricción de seguridad para administradores estándar
    if (!esSuperAdmin && (u.id === sesionActual?.id || (u.rol || "").toLowerCase() === "superadmin")) {
      alert("Operación denegada: Un Administrador no puede editar su propia cuenta ni la del SuperAdmin.");
      return;
    }

    setUsuarioEditandoId(u.id);
    setFormUsuario({
      usuario: u.usuario || "",
      documento: u.documento || "",
      nombre: u.nombre || "",
      correo: u.correo && u.correo !== "No registrado" ? u.correo : "",
      telefono: u.telefono && u.telefono !== "No registrado" ? u.telefono : "",
      direccion: u.direccion && u.direccion !== "No registrada" ? u.direccion : "",
      edad: u.edad || "",
      clave: u.clave || "",
      rol: u.rol || "Usuario Consulta"
    });
    setMensaje({ tipo: "", texto: "" });
    setModalFormAbierto(true);
  };

  const cerrarModalForm = () => {
    setModalFormAbierto(false);
    setUsuarioEditandoId(null);
    setMensaje({ tipo: "", texto: "" });
  };

  // -----------------------------------------------------------------------
  // 4. GUARDAR / ACTUALIZAR USUARIO EN MYSQL MEDIANTE API REST
  // -----------------------------------------------------------------------
  const manejarGuardar = async (e) => {
    e.preventDefault();
    const aliasLimpio = formUsuario.usuario.trim().toLowerCase();

    // Validar campos obligatorios
    if (
      !aliasLimpio ||
      !formUsuario.clave.trim() ||
      !formUsuario.nombre.trim() ||
      !formUsuario.documento.trim()
    ) {
      setMensaje({ tipo: "error", texto: "Por favor complete los campos obligatorios marcados con (*)." });
      return;
    }

    // Restricción: Solo el SuperAdmin puede asignar el rol de SuperAdmin
    if (!esSuperAdmin && formUsuario.rol.toLowerCase() === "superadmin") {
      setMensaje({ tipo: "error", texto: "Solo el SuperAdmin puede asignar el rol de Super Administrador." });
      return;
    }

    // Payload de datos normalizado para enviar a la API
    const datosEnvio = {
      usuario: aliasLimpio,
      documento: formUsuario.documento.trim(),
      nombre: formUsuario.nombre.trim(),
      correo: formUsuario.correo.trim() || "No registrado",
      telefono: formUsuario.telefono.trim() || "No registrado",
      direccion: formUsuario.direccion.trim() || "No registrada",
      edad: Number(formUsuario.edad) || null,
      clave: formUsuario.clave.trim(),
      rol: formUsuario.rol
    };

    try {
      if (usuarioEditandoId) {
        // Validación de alias duplicado en otros usuarios
        const aliasEnUso = usuarios.some(
          (u) => (u.usuario || "").toLowerCase() === aliasLimpio && u.id !== usuarioEditandoId
        );
        if (aliasEnUso) {
          setMensaje({ tipo: "error", texto: `El alias "${aliasLimpio}" ya pertenece a otro usuario registrado.` });
          return;
        }

        // Petición PUT a la API REST (MySQL)
        await actualizarUsuarioAPI(usuarioEditandoId, datosEnvio);
      } else {
        // Validación de alias único en creación
        const yaExiste = usuarios.some((u) => (u.usuario || "").toLowerCase() === aliasLimpio);
        if (yaExiste) {
          setMensaje({ tipo: "error", texto: `El nombre de usuario "${aliasLimpio}" ya existe en el sistema.` });
          return;
        }

        // Petición POST a la API REST (MySQL)
        await crearUsuarioAPI(datosEnvio);
      }

      // Sincronizar datos con MySQL en App.jsx
      if (typeof onRecargarUsuarios === "function") {
        await onRecargarUsuarios();
      }

      cerrarModalForm();
    } catch (error) {
      console.error("Error al persistir usuario en MySQL:", error);
      setMensaje({ tipo: "error", texto: "Error de comunicación con el servidor de base de datos." });
    }
  };

  // -----------------------------------------------------------------------
  // 5. ELIMINAR USUARIO EN MYSQL MEDIANTE API REST
  // -----------------------------------------------------------------------
  const eliminarUsuario = async (id, alias, rol) => {
    const rolLower = (rol || "").toLowerCase();

    if (rolLower === "superadmin") {
      alert("Operación denegada: La cuenta principal Super Administrador no puede ser eliminada.");
      return;
    }
    if (sesionActual && sesionActual.id === id) {
      alert("Operación denegada: No puedes eliminar tu propia cuenta de sesión activa.");
      return;
    }
    if (!esSuperAdmin && rolLower === "administrador") {
      alert("Operación denegada: Solo el SuperAdmin tiene permisos para eliminar a otros administradores.");
      return;
    }

    if (window.confirm(`¿Está seguro de que desea eliminar permanentemente al usuario "${alias}" de la base de datos?`)) {
      try {
        await eliminarUsuarioAPI(id);
        if (typeof onRecargarUsuarios === "function") {
          await onRecargarUsuarios();
        }
      } catch (error) {
        console.error("Error al eliminar usuario en MySQL:", error);
        alert("Error al eliminar el usuario de la base de datos.");
      }
    }
  };

  // -----------------------------------------------------------------------
  // 6. RENDERIZADO VISUAL DEL MÓDULO
  // -----------------------------------------------------------------------
  return (
    <div style={estilos.tarjeta}>
      
      {/* ENCABEZADO DEL MÓDULO */}
      <div style={estilos.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "20px" }}>{esSuperAdmin ? "👑" : "👥"}</span>
          <div>
            <strong style={{ color: "#0f172a", fontSize: "15px" }}>Gestión de Usuarios y Accesos</strong>
            <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "#64748b" }}>
              Control de roles (RBAC) y cuentas registradas en MySQL.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => setPanelAbierto(!panelAbierto)} style={estilos.btnToggle}>
            {panelAbierto ? "▲ Ocultar Panel" : `▼ Administrar Usuarios (${usuarios.length})`}
          </button>
        </div>
      </div>

      {panelAbierto && (
        <div style={{ marginTop: "16px" }}>
          
          {/* BARRA SUPERIOR DE ACCIONES */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span style={{ fontSize: "12px", color: "#475569", fontWeight: "bold" }}>
              Total de cuentas registradas: <strong>{usuarios.length}</strong>
            </span>
            <button onClick={abrirModalCrear} style={estilos.btnNuevoUsuario}>
              ➕ Registrar Nuevo Usuario
            </button>
          </div>

          {/* TABLA DE USUARIOS */}
          <div style={{ overflowX: "auto" }}>
            <table style={estilos.tabla}>
              <thead>
                <tr>
                  <th style={estilos.th}>Alias</th>
                  <th style={estilos.th}>Nombre Completo</th>
                  <th style={estilos.th}>Documento / ID</th>
                  <th style={estilos.th}>Rol</th>
                  <th style={{ ...estilos.th, textAlign: "center" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => {
                  const esPropioUsuario = sesionActual && sesionActual.id === u.id;
                  const esCuentaSuperAdmin = (u.rol || "").toLowerCase() === "superadmin";
                  const bloqueadoParaAdmin = !esSuperAdmin && (esPropioUsuario || esCuentaSuperAdmin);

                  return (
                    <tr key={u.id}>
                      <td style={estilos.td}>
                        <strong style={{ color: "#0284c7" }}>{u.usuario}</strong>
                        {esPropioUsuario && (
                          <span style={{ fontSize: "9.5px", color: "#16a34a", fontWeight: "bold", display: "block" }}>
                            (Tu sesión)
                          </span>
                        )}
                      </td>
                      <td style={estilos.td}>
                        <span
                          onClick={() => setUsuarioVerFicha(u)}
                          style={{ cursor: "pointer", fontWeight: "600", color: "#0f172a" }}
                          title="Clic para ver ficha técnica detallada"
                        >
                          {u.nombre}
                        </span>
                      </td>
                      <td style={estilos.td}>{u.documento || "Sin ID"}</td>
                      <td style={estilos.td}>
                        <span
                          style={{
                            padding: "3px 8px",
                            borderRadius: "12px",
                            fontSize: "11px",
                            fontWeight: "bold",
                            background:
                              (u.rol || "").toLowerCase() === "superadmin"
                                ? "#f3e8ff"
                                : (u.rol || "").toLowerCase() === "administrador"
                                ? "#e0f2fe"
                                : (u.rol || "").toLowerCase() === "operador bodega"
                                ? "#fef3c7"
                                : "#f1f5f9",
                            color:
                              (u.rol || "").toLowerCase() === "superadmin"
                                ? "#7e22ce"
                                : (u.rol || "").toLowerCase() === "administrador"
                                ? "#0369a1"
                                : (u.rol || "").toLowerCase() === "operador bodega"
                                ? "#b45309"
                                : "#475569"
                          }}
                        >
                          {u.rol}
                        </span>
                      </td>
                      <td style={{ ...estilos.td, textAlign: "center" }}>
                        <button
                          onClick={() => setUsuarioVerFicha(u)}
                          style={estilos.btnFicha}
                          title="Ver Ficha Técnica Completa"
                        >
                          👁️ Ficha
                        </button>
                        {bloqueadoParaAdmin ? (
                          <span
                            style={{
                              fontSize: "10px",
                              color: "#64748b",
                              background: "#f1f5f9",
                              padding: "4px 8px",
                              borderRadius: "4px",
                              fontWeight: "bold"
                            }}
                          >
                            🔒 Protegido
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() => abrirModalEditar(u)}
                              style={estilos.btnEditar}
                              title="Editar información"
                            >
                              ✏️ Editar
                            </button>
                            {(u.rol || "").toLowerCase() !== "superadmin" && (
                              <button
                                onClick={() => eliminarUsuario(u.id, u.usuario, u.rol)}
                                style={estilos.btnEliminar}
                                title="Eliminar usuario de MySQL"
                              >
                                ✕
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: FORMULARIO EMERGENTE PARA CREAR / EDITAR USUARIO EN MYSQL        */}
      {/* ========================================================================= */}
      {modalFormAbierto && (
        <div style={estilos.overlayModal} onClick={cerrarModalForm}>
          <div style={estilos.modalFormContenido} onClick={(e) => e.stopPropagation()}>
            
            {/* CABECERA DEL MODAL */}
            <div style={estilos.modalHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "22px" }}>{usuarioEditandoId ? "✏️" : "➕"}</span>
                <div>
                  <h3 style={{ margin: 0, color: "#0f172a", fontSize: "16px" }}>
                    {usuarioEditandoId ? "Editar Información del Usuario" : "Registrar Nuevo Usuario"}
                  </h3>
                  <span style={{ fontSize: "11px", color: "#64748b" }}>
                    Complete los campos para {usuarioEditandoId ? "actualizar en MySQL" : "dar de alta en la base de datos"}.
                  </span>
                </div>
              </div>
              <button onClick={cerrarModalForm} style={estilos.btnCerrarModal}>
                ✕
              </button>
            </div>

            {/* ALERTA VISUAL DE ERROR/ÉXITO */}
            {mensaje.texto && (
              <div
                style={{
                  ...estilos.alerta,
                  backgroundColor: mensaje.tipo === "error" ? "#fee2e2" : "#dcfce7",
                  color: mensaje.tipo === "error" ? "#991b1b" : "#166534"
                }}
              >
                {mensaje.texto}
              </div>
            )}

            {/* FORMULARIO */}
            <form onSubmit={manejarGuardar}>
              <div style={estilos.modalGridInputs}>
                
                <div>
                  <label style={estilos.label}>Usuario / Alias *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: jpaternina"
                    value={formUsuario.usuario}
                    onChange={(e) => setFormUsuario({ ...formUsuario, usuario: e.target.value })}
                    style={estilos.input}
                  />
                </div>

                <div>
                  <label style={estilos.label}>N° Documento / ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: 1047458921"
                    value={formUsuario.documento}
                    onChange={(e) => setFormUsuario({ ...formUsuario, documento: e.target.value })}
                    style={estilos.input}
                  />
                </div>

                <div>
                  <label style={estilos.label}>Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Jaide Paternina"
                    value={formUsuario.nombre}
                    onChange={(e) => setFormUsuario({ ...formUsuario, nombre: e.target.value })}
                    style={estilos.input}
                  />
                </div>

                <div>
                  <label style={estilos.label}>Correo Electrónico</label>
                  <input
                    type="email"
                    placeholder="usuario@mitienda.com"
                    value={formUsuario.correo}
                    onChange={(e) => setFormUsuario({ ...formUsuario, correo: e.target.value })}
                    style={estilos.input}
                  />
                </div>

                <div>
                  <label style={estilos.label}>Teléfono / Celular</label>
                  <input
                    type="tel"
                    placeholder="Ej: 3001234567"
                    value={formUsuario.telefono}
                    onChange={(e) => setFormUsuario({ ...formUsuario, telefono: e.target.value })}
                    style={estilos.input}
                  />
                </div>

                <div>
                  <label style={estilos.label}>Dirección de Residencia</label>
                  <input
                    type="text"
                    placeholder="Ej: Calle 30 # 15-20"
                    value={formUsuario.direccion}
                    onChange={(e) => setFormUsuario({ ...formUsuario, direccion: e.target.value })}
                    style={estilos.input}
                  />
                </div>

                <div>
                  <label style={estilos.label}>Edad</label>
                  <input
                    type="number"
                    min="18"
                    max="99"
                    placeholder="Ej: 28"
                    value={formUsuario.edad}
                    onChange={(e) => setFormUsuario({ ...formUsuario, edad: e.target.value })}
                    style={estilos.input}
                  />
                </div>

                <div>
                  <label style={estilos.label}>Contraseña *</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formUsuario.clave}
                    onChange={(e) => setFormUsuario({ ...formUsuario, clave: e.target.value })}
                    style={estilos.input}
                  />
                </div>

                <div style={{ gridColumn: "span 2" }}>
                  <label style={estilos.label}>Rol en el Sistema *</label>
                  <select
                    value={formUsuario.rol}
                    onChange={(e) => setFormUsuario({ ...formUsuario, rol: e.target.value })}
                    style={estilos.input}
                  >
                    {esSuperAdmin && <option value="SuperAdmin">SuperAdmin (Control Total)</option>}
                    <option value="Administrador">Administrador</option>
                    <option value="Operador Bodega">Operador Bodega</option>
                    <option value="Usuario Consulta">Usuario Consulta</option>
                  </select>
                </div>

              </div>

              {/* PIE DEL MODAL CON ACCIONES */}
              <div style={estilos.modalFooter}>
                <button type="button" onClick={cerrarModalForm} style={estilos.btnCancelarModal}>
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={usuarioEditandoId ? estilos.btnActualizarModal : estilos.btnGuardarModal}
                >
                  {usuarioEditandoId ? "💾 Guardar Cambios" : "➕ Crear Usuario"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: FICHA TÉCNICA DETALLADA (SOLO LECTURA)                           */}
      {/* ========================================================================= */}
      {usuarioVerFicha && (
        <div style={estilos.overlayModal} onClick={() => setUsuarioVerFicha(null)}>
          <div style={estilos.modalContenido} onClick={(e) => e.stopPropagation()}>
            
            <div style={estilos.modalHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "24px" }}>🪪</span>
                <div>
                  <h3 style={{ margin: 0, color: "#0f172a", fontSize: "16px" }}>Ficha Técnica de Usuario</h3>
                  <span style={{ fontSize: "11px", color: "#0284c7", fontWeight: "bold" }}>
                    @{usuarioVerFicha.usuario} — {usuarioVerFicha.rol}
                  </span>
                </div>
              </div>
              <button onClick={() => setUsuarioVerFicha(null)} style={estilos.btnCerrarModal}>
                ✕
              </button>
            </div>

            <div style={estilos.modalGrid}>
              <div style={estilos.modalItem}>
                <span style={estilos.modalLabel}>Nombre Completo:</span>
                <strong>{usuarioVerFicha.nombre}</strong>
              </div>
              <div style={estilos.modalItem}>
                <span style={estilos.modalLabel}>N° Documento / ID:</span>
                <strong>{usuarioVerFicha.documento || "No registrado"}</strong>
              </div>
              <div style={estilos.modalItem}>
                <span style={estilos.modalLabel}>Correo Electrónico:</span>
                <span>{usuarioVerFicha.correo || "No registrado"}</span>
              </div>
              <div style={estilos.modalItem}>
                <span style={estilos.modalLabel}>Teléfono / Celular:</span>
                <span>{usuarioVerFicha.telefono || "No registrado"}</span>
              </div>
              <div style={estilos.modalItem}>
                <span style={estilos.modalLabel}>Dirección de Residencia:</span>
                <span>{usuarioVerFicha.direccion || "No registrada"}</span>
              </div>
              <div style={estilos.modalItem}>
                <span style={estilos.modalLabel}>Edad:</span>
                <span>{usuarioVerFicha.edad ? `${usuarioVerFicha.edad} años` : "No registrada"}</span>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
              <button onClick={() => setUsuarioVerFicha(null)} style={estilos.btnEntendido}>
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// -------------------------------------------------------------------------
// 7. DEFINICIÓN DE ESTILOS CSS EN JAVASCRIPT
// -------------------------------------------------------------------------
const estilos = {
  tarjeta: {
    background: "#ffffff",
    borderRadius: "12px",
    padding: "16px 20px",
    marginBottom: "20px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 2px 4px rgba(0,0,0,0.03)"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  btnToggle: {
    background: "#0f172a",
    color: "#ffffff",
    border: "none",
    padding: "7px 14px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "bold",
    cursor: "pointer"
  },
  btnNuevoUsuario: {
    background: "#16a34a",
    color: "#ffffff",
    border: "none",
    padding: "7px 14px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "bold",
    cursor: "pointer"
  },
  tabla: {
    width: "100%",
    borderCollapse: "collapse"
  },
  th: {
    background: "#0f172a",
    color: "#ffffff",
    textAlign: "left",
    padding: "8px 10px",
    fontSize: "11px",
    textTransform: "uppercase"
  },
  td: {
    padding: "9px 10px",
    borderBottom: "1px solid #e2e8f0",
    fontSize: "12px"
  },
  btnFicha: {
    background: "#f1f5f9",
    color: "#334155",
    border: "1px solid #cbd5e1",
    borderRadius: "4px",
    padding: "3px 8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "11px",
    marginRight: "5px"
  },
  btnEditar: {
    background: "#e0f2fe",
    color: "#0369a1",
    border: "1px solid #bae6fd",
    borderRadius: "4px",
    padding: "3px 8px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "11px",
    marginRight: "5px"
  },
  btnEliminar: {
    background: "#fee2e2",
    color: "#ef4444",
    border: "1px solid #fca5a5",
    borderRadius: "4px",
    padding: "3px 8px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "11px"
  },
  overlayModal: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(15, 23, 42, 0.65)",
    backdropFilter: "blur(2px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px"
  },
  modalFormContenido: {
    background: "#ffffff",
    width: "100%",
    maxWidth: "560px",
    borderRadius: "14px",
    padding: "24px",
    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.25)",
    maxHeight: "90vh",
    overflowY: "auto"
  },
  modalContenido: {
    background: "#ffffff",
    width: "100%",
    maxWidth: "460px",
    borderRadius: "12px",
    padding: "20px 24px",
    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)"
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #e2e8f0",
    paddingBottom: "12px",
    marginBottom: "16px"
  },
  btnCerrarModal: {
    background: "transparent",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    color: "#64748b"
  },
  modalGridInputs: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px"
  },
  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "20px",
    borderTop: "1px solid #e2e8f0",
    paddingTop: "14px"
  },
  label: {
    fontSize: "11px",
    fontWeight: "bold",
    color: "#475569",
    display: "block",
    marginBottom: "4px"
  },
  input: {
    width: "100%",
    padding: "7.5px 10px",
    borderRadius: "6px",
    border: "1px solid #cbd5e1",
    fontSize: "12px",
    boxSizing: "border-box",
    background: "#ffffff",
    outline: "none"
  },
  btnGuardarModal: {
    background: "#16a34a",
    color: "#ffffff",
    border: "none",
    padding: "9px 18px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "bold",
    cursor: "pointer"
  },
  btnActualizarModal: {
    background: "#0284c7",
    color: "#ffffff",
    border: "none",
    padding: "9px 18px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "bold",
    cursor: "pointer"
  },
  btnCancelarModal: {
    background: "#94a3b8",
    color: "#ffffff",
    border: "none",
    padding: "9px 16px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "bold",
    cursor: "pointer"
  },
  modalGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    fontSize: "12px"
  },
  modalItem: {
    background: "#f8fafc",
    padding: "8px 10px",
    borderRadius: "6px",
    border: "1px solid #e2e8f0"
  },
  modalLabel: {
    display: "block",
    fontSize: "10px",
    color: "#64748b",
    fontWeight: "bold",
    textTransform: "uppercase"
  },
  btnEntendido: {
    background: "#0f172a",
    color: "#ffffff",
    border: "none",
    padding: "8px 18px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "bold",
    cursor: "pointer"
  },
  alerta: {
    padding: "8px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    marginBottom: "12px"
  }
};