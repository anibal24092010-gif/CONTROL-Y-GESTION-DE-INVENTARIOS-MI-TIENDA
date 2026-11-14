/**
 * =========================================================================
 * ARCHIVO: db.js (server/db.js)
 * DESCRIPCIÓN: Módulo de configuración y conexión a la base de datos MySQL.
 * Implementa un Connection Pool (Grupo de Conexiones) asíncrono basado en
 * Promesas mediante el paquete 'mysql2/promise' para optimizar la concurrencia.
 * =========================================================================
 */

// Importación del driver de MySQL optimizado para sintaxis async/await
const mysql = require("mysql2/promise");

// -------------------------------------------------------------------------
// 1. CONFIGURACIÓN DEL POOL DE CONEXIONES (CONNECTION POOLING)
// -------------------------------------------------------------------------
// El pool administra múltiples conexiones simultáneas reutilizables,
// evitando la sobrecarga de abrir y cerrar sockets en cada consulta SQL.
const pool = mysql.createPool({
  host: "localhost",               // Servidor de base de datos local
  user: "root",                    // Usuario administrativo de MySQL
  password: "P4ssword",            // Contraseña de acceso al motor de BD
  database: "mitienda_db",         // Esquema/Base de datos del aplicativo
  port: 3306,                      // Puerto TCP estándar del servicio MySQL
  waitForConnections: true,        // Encola peticiones si todas las conexiones están ocupadas
  connectionLimit: 10,             // Límite máximo de conexiones concurrentes en el pool
  queueLimit: 0                    // Límite de peticiones en cola (0 = cola infinita sin rechazo inmediato)
});

// -------------------------------------------------------------------------
// 2. VERIFICACIÓN Y PRUEBA INICIAL DEL ESTADO DE LA CONEXIÓN
// -------------------------------------------------------------------------
// Intenta adquirir una conexión del pool al iniciar el servidor para validar
// credenciales y disponibilidad del servicio de base de datos.
pool.getConnection()
  .then((conn) => {
    // Si la conexión es exitosa, se imprime la confirmación en consola
    console.log("✅ Conexión exitosa a MySQL (mitienda_db)");
    
    // Libera la conexión de prueba inmediatamente para devolverla al pool
    conn.release();
  })
  .catch((err) => {
    // Captura fallas de autenticación, puerto bloqueado o servicio detenido
    console.error("❌ Error conectando a MySQL:", err.message);
  });

// -------------------------------------------------------------------------
// 3. EXPORTACIÓN DEL OBJETO POOL
// -------------------------------------------------------------------------
// Permite que server/index.js ejecute consultas (pool.query) en los endpoints
module.exports = { pool };