/**
 * =========================================================================
 * ARCHIVO: db.js (server/db.js)
 * DESCRIPCIÓN: Módulo de configuración y conexión a la base de datos MySQL.
 * Utiliza un Connection Pool (Grupo de Conexiones) asíncrono con 'mysql2/promise'
 * adaptado para desarrollo local y producción en la nube (Render + Clever Cloud).
 * =========================================================================
 */

// Importación del driver de MySQL optimizado para sintaxis async/await
const mysql = require("mysql2/promise");

// -------------------------------------------------------------------------
// 1. CONFIGURACIÓN DEL POOL DE CONEXIONES (CONNECTION POOLING)
// -------------------------------------------------------------------------
// Utiliza process.env para leer las variables configuradas en Render.
// Si no las encuentra (porque estás programando en tu PC), usa los valores locales.
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",                 // Servidor de base de datos
  user: process.env.DB_USER || "root",                      // Usuario de acceso
  password: process.env.DB_PASSWORD || "",          // Contraseña
  database: process.env.DB_NAME || "mitienda_db",             // Nombre de la base de datos
  port: process.env.DB_PORT || 4000,                        // Puerto de conexión TCP
  ssl: { rejectUnauthorized: false },                       // Obligatorio para conexiones seguras con Clever Cloud
  waitForConnections: true,                                 // Encola peticiones si el pool está ocupado
  connectionLimit: 10,                                      // Límite máximo de conexiones simultáneas
  queueLimit: 0                                             // Sin límite de espera en cola
});

// -------------------------------------------------------------------------
// 2. VERIFICACIÓN Y PRUEBA INICIAL DEL ESTADO DE LA CONEXIÓN
// -------------------------------------------------------------------------
// Solicita una conexión de prueba al iniciar el servidor para validar credenciales.
pool.getConnection()
  .then((conn) => {
    // Si la conexión es exitosa, imprime la confirmación
    console.log("✅ Conexión exitosa a MySQL");
    
    // Libera la conexión inmediatamente para devolverla al pool
    conn.release();
  })
  .catch((err) => {
    // Si ocurre un fallo, lo muestra en consola
    console.error("❌ Error conectando a MySQL:", err.message);
  });

// -------------------------------------------------------------------------
// 3. EXPORTACIÓN DEL OBJETO POOL
// -------------------------------------------------------------------------
// Permite que el servidor ejecute consultas SQL en los endpoints de la API.
module.exports = { pool };