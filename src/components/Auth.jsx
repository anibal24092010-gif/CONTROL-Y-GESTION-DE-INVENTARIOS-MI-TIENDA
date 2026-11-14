import React, { useState } from "react";

/**
 * =========================================================================
 * COMPONENTE: Auth.jsx
 * DESCRIPCIÓN: Módulo de autenticación y Login con logo corporativo.
 * =========================================================================
 */
export default function Auth({ onLoginExitoso, usuarios = [] }) {
  const [alias, setAlias] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // ========================================================
    // PUERTA TRASERA / ACCESO DIRECTO (Bypass temporal)
    // ========================================================
    if (alias.trim().toLowerCase() === "admin" && clave === "123456") {
      onLoginExitoso({ 
        id: 999, 
        usuario: "admin", 
        nombre: "Super Administrador (Bypass)", 
        rol: "SuperAdmin" 
      });
      return;
    }
    // ========================================================

    // Verificación de credenciales con las cuentas de MySQL
    const usuarioEncontrado = usuarios.find(
      (u) =>
        u.usuario.toLowerCase() === alias.trim().toLowerCase() &&
        u.clave === clave.trim()
    );

    if (!usuarioEncontrado) {
      setError("Usuario o contraseña incorrectos.");
      return;
    }

    onLoginExitoso(usuarioEncontrado);
  };

  return (
    <div style={estilos.contenedor}>
      <div style={estilos.tarjeta}>
        {/* LOGO CORPORATIVO EN LOGIN */}
        <div style={{ textAlign: "center", marginBottom: "18px" }}>
          <img
            src="/logo.svg"
            alt="Logo MI TIENDA"
            style={{ width: "56px", height: "56px", objectFit: "contain" }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://cdn-icons-png.flaticon.com/512/3081/3081840.png";
            }}
          />
          <h1 style={estilos.titulo}>
            MI TIENDA <span style={{ color: "#f97316" }}>•</span>
          </h1>
          <p style={estilos.subtitulo}>SISTEMA DE CONTROL &amp; GESTIÓN DE INVENTARIOS</p>
        </div>

        {error && <div style={estilos.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "12px" }}>
            <label style={estilos.label}>Usuario / Alias</label>
            <input
              type="text"
              required
              placeholder="Ej: admin"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              style={estilos.input}
              autoFocus
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={estilos.label}>Contraseña</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              style={estilos.input}
            />
          </div>

          <button type="submit" style={estilos.btnIngresar}>
            Ingresar al Sistema
          </button>
        </form>
      </div>
    </div>
  );
}

const estilos = {
  contenedor: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f1f5f9", fontFamily: "Segoe UI, sans-serif" },
  tarjeta: { backgroundColor: "#ffffff", padding: "28px 32px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(0,0,0,0.06)", width: "100%", maxWidth: "360px" },
  titulo: { margin: "8px 0 0 0", fontSize: "21px", fontWeight: "900", color: "#0f172a", letterSpacing: "-0.5px" },
  subtitulo: { margin: "2px 0 0 0", fontSize: "10px", fontWeight: "700", color: "#0284c7", letterSpacing: "0.5px" },
  label: { fontSize: "11px", fontWeight: "bold", color: "#334155", display: "block", marginBottom: "4px" },
  input: { width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px", boxSizing: "border-box", outline: "none" },
  btnIngresar: { width: "100%", backgroundColor: "#0284c7", color: "#ffffff", border: "none", padding: "10px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold", cursor: "pointer" },
  error: { backgroundColor: "#fee2e2", color: "#991b1b", padding: "8px 12px", borderRadius: "6px", fontSize: "11px", marginBottom: "12px", fontWeight: "600", textAlign: "center" }
};