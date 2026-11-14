/**
 * =========================================================================
 * ARCHIVO: api.js (src/services/api.js)
 * DESCRIPCIÓN: Capa de Servicios y Conexión HTTP (Cliente API REST).
 * Centraliza todas las peticiones asíncronas (FETCH) hacia el servidor Node.js/Express
 * para realizar las operaciones CRUD sobre la base de datos MySQL.
 * =========================================================================
 */

// URL base del servidor backend (Express corriendo en el puerto 8080)
const API_URL = "http://localhost:8080/api";

// =========================================================================
// 1. SERVICIOS DE USUARIOS (CRUD Y AUTENTICACIÓN)
// =========================================================================

/**
 * Consulta la lista completa de usuarios registrados en MySQL.
 * @returns {Promise<Array>} Arreglo con los objetos de usuario.
 */
export const obtenerUsuariosAPI = async () => {
  try {
    const res = await fetch(`${API_URL}/usuarios`);
    if (!res.ok) {
      throw new Error(`Error HTTP al consultar usuarios: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error("❌ Fallo en obtenerUsuariosAPI:", error.message);
    throw error;
  }
};

/**
 * Registra un nuevo usuario en la base de datos MySQL.
 * @param {Object} usuario - Objeto con los datos del nuevo usuario (alias, documento, clave, rol, etc.).
 * @returns {Promise<Object>} Objeto del usuario insertado con su ID autoincremental generado.
 */
export const crearUsuarioAPI = async (usuario) => {
  try {
    const res = await fetch(`${API_URL}/usuarios`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify(usuario) // Serializa el objeto JavaScript a formato JSON
    });
    if (!res.ok) {
      throw new Error(`Error HTTP al crear usuario: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error("❌ Fallo en crearUsuarioAPI:", error.message);
    throw error;
  }
};

/**
 * Actualiza la información de un usuario existente por su identificador único (ID).
 * @param {number|string} id - Identificador primario del usuario en MySQL.
 * @param {Object} usuario - Objeto con los datos modificados.
 * @returns {Promise<Object>} Objeto con los datos actualizados.
 */
export const actualizarUsuarioAPI = async (id, usuario) => {
  try {
    const res = await fetch(`${API_URL}/usuarios/${id}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify(usuario)
    });
    if (!res.ok) {
      throw new Error(`Error HTTP al actualizar usuario: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error(`❌ Fallo en actualizarUsuarioAPI (ID: ${id}):`, error.message);
    throw error;
  }
};

/**
 * Elimina definitivamente un usuario de la base de datos MySQL.
 * @param {number|string} id - Identificador primario del usuario a eliminar.
 * @returns {Promise<Object>} Mensaje de confirmación del servidor.
 */
export const eliminarUsuarioAPI = async (id) => {
  try {
    const res = await fetch(`${API_URL}/usuarios/${id}`, { 
      method: "DELETE" 
    });
    if (!res.ok) {
      throw new Error(`Error HTTP al eliminar usuario: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error(`❌ Fallo en eliminarUsuarioAPI (ID: ${id}):`, error.message);
    throw error;
  }
};

// =========================================================================
// 2. SERVICIOS DE LOTES / INVENTARIO FÍSICO (CRUD DE EXISTENCIAS)
// =========================================================================

/**
 * Consulta la totalidad de lotes y productos almacenados en el inventario de MySQL.
 * @returns {Promise<Array>} Lista de lotes con existencias, empaques y fechas de vencimiento.
 */
export const obtenerLotesAPI = async () => {
  try {
    const res = await fetch(`${API_URL}/lotes`);
    if (!res.ok) {
      throw new Error(`Error HTTP al consultar inventario: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error("❌ Fallo en obtenerLotesAPI:", error.message);
    throw error;
  }
};

/**
 * Inserta un nuevo lote de mercancía en la tabla 'lotes' de MySQL.
 * @param {Object} lote - Datos del producto, cantidades calculadas, lote y fecha de vencimiento.
 * @returns {Promise<Object>} Registro del lote creado con su ID de base de datos.
 */
export const crearLoteAPI = async (lote) => {
  try {
    const res = await fetch(`${API_URL}/lotes`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify(lote)
    });
    if (!res.ok) {
      throw new Error(`Error HTTP al registrar entrada de lote: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error("❌ Fallo en crearLoteAPI:", error.message);
    throw error;
  }
};

/**
 * Modifica las existencias o parámetros técnicos de un lote en MySQL.
 * @param {number|string} id - Identificador único del lote.
 * @param {Object} lote - Datos modificados (stock restante, empaques, ubicación, etc.).
 * @returns {Promise<Object>} Registro del lote actualizado.
 */
export const actualizarLoteAPI = async (id, lote) => {
  try {
    const res = await fetch(`${API_URL}/lotes/${id}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify(lote)
    });
    if (!res.ok) {
      throw new Error(`Error HTTP al actualizar lote: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error(`❌ Fallo en actualizarLoteAPI (ID: ${id}):`, error.message);
    throw error;
  }
};

/**
 * Elimina un registro de lote permanentemente de MySQL.
 * @param {number|string} id - Identificador del lote a remover.
 * @returns {Promise<Object>} Respuesta del servidor.
 */
export const eliminarLoteAPI = async (id) => {
  try {
    const res = await fetch(`${API_URL}/lotes/${id}`, { 
      method: "DELETE" 
    });
    if (!res.ok) {
      throw new Error(`Error HTTP al eliminar lote: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error(`❌ Fallo en eliminarLoteAPI (ID: ${id}):`, error.message);
    throw error;
  }
};

// =========================================================================
// 3. SERVICIOS DE MOVIMIENTOS / AUDITORÍA (ENTRADAS Y SALIDAS)
// =========================================================================

/**
 * Consulta el historial cronológico de todas las transacciones de auditoría en MySQL.
 * @returns {Promise<Array>} Listado de movimientos (Entradas por compra y Salidas por despacho/merma).
 */
export const obtenerMovimientosAPI = async () => {
  try {
    const res = await fetch(`${API_URL}/movimientos`);
    if (!res.ok) {
      throw new Error(`Error HTTP al consultar auditoría de movimientos: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error("❌ Fallo en obtenerMovimientosAPI:", error.message);
    throw error;
  }
};

/**
 * Registra un evento de auditoría (Entrada o Salida) en la tabla 'movimientos' de MySQL.
 * @param {Object} movimiento - Detalle de la transacción (tipo, cantidadUnds, motivo, idLote, idUsuario).
 * @returns {Promise<Object>} Registro del movimiento creado con su clave foránea vinculada.
 */
export const registrarMovimientoAPI = async (movimiento) => {
  try {
    const res = await fetch(`${API_URL}/movimientos`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify(movimiento)
    });
    if (!res.ok) {
      throw new Error(`Error HTTP al registrar movimiento de auditoría: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error("❌ Fallo en registrarMovimientoAPI:", error.message);
    throw error;
  }};
  export const actualizarMovimientoAPI = async (id, datos) => {
  const response = await fetch(`http://localhost:8080/api/movimientos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  if (!response.ok) {
    throw new Error("Error al actualizar el movimiento");
  }
  return await response.json();

};