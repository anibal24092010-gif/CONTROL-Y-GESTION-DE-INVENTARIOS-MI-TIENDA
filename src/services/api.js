/**
 * =========================================================================
 * ARCHIVO: api.js (src/services/api.js)
 * DESCRIPCIÓN: Capa de Servicios y Conexión HTTP (Cliente API REST).
 * Centraliza todas las peticiones asíncronas (FETCH) hacia el servidor Node.js/Express
 * para realizar las operaciones CRUD sobre la base de datos MySQL.
 * =========================================================================
 */

// URL base dinámica: Si está en producción usa tu dominio de Render, si está en tu PC usa localhost:8080
const API_URL = window.location.hostname === "localhost" 
  ? "http://localhost:8080/api" 
  : "https://inventarios-mi-tienda.onrender.com/api";

// =========================================================================
// 1. SERVICIOS DE USUARIOS (CRUD Y AUTENTICACIÓN)
// =========================================================================

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

export const crearUsuarioAPI = async (usuario) => {
  try {
    const res = await fetch(`${API_URL}/usuarios`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify(usuario)
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
  }
};

export const actualizarMovimientoAPI = async (id, datos) => {
  try {
    const res = await fetch(`${API_URL}/movimientos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
    if (!res.ok) {
      throw new Error("Error al actualizar el movimiento");
    }
    return await res.json();
  } catch (error) {
    console.error(`❌ Fallo en actualizarMovimientoAPI (ID: ${id}):`, error.message);
    throw error;
  }
};