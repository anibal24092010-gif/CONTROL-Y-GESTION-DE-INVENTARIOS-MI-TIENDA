/**
 * =========================================================================
 * ARCHIVO: db.js (server/db.js)
 * DESCRIPCIÓN: Módulo de configuración y conexión a la base de datos MySQL.
 * Utiliza un Connection Pool (Grupo de Conexiones) asíncrono con 'mysql2/promise'
 * para soportar entornos locales (XAMPP/Workbench) y de producción (Render/Clever Cloud)
 * mediante el uso inteligente de variables de entorno.
 * =========================================================================
 */

// Importación del driver de MySQL optimizado para sintaxis async/await
const mysql = require("mysql2/promise");

// -------------------------------------------------------------------------
// 1. CONFIGURACIÓN DEL POOL DE CONEXIONES (CONNECTION POOLING)
// -------------------------------------------------------------------------
// Utiliza process.env para leer las credenciales de Render (o Clever Cloud).
// Si no encuentra ninguna variable de entorno (porque estás trabajando en tu PC),
// aplica automáticamente los valores por defecto que tienes para desarrollo local.
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",                 // Servidor (remoto en la nube o local en tu PC)
  user: process.env.DB_USER || "root",                      // Usuario de la base de datos
  password: process.env.DB_PASSWORD || "P4ssword",          // Contraseña de acceso
  database: process.env.DB_NAME || "mitienda_db",             // Nombre del esquema o base de datos
  port: process.env.DB_PORT || 3306,                        // Puerto de conexión TCP (por defecto 3306)
  waitForConnections: true,                                 // Encola peticiones si el pool está ocupado
  connectionLimit: 10,                                      // Límite máximo de conexiones simultáneas
  queueLimit: 0                                             // Sin límite estricto de espera en cola
});

// -------------------------------------------------------------------------
// 2. VERIFICACIÓN Y PRUEBA INICIAL DEL ESTADO DE LA CONEXIÓN
// -------------------------------------------------------------------------
// Al arrancar la aplicación, solicita una conexión de prueba al pool para validar
// que las credenciales son correctas y que la base de datos está accesible.
pool.getConnection()
  .then((conn) => {
    // Si la conexión se establece con éxito, imprime un mensaje de confirmación
    console.log("✅ Conexión exitosa a MySQL");
    
    // Libera la conexión inmediatamente para devolverla al pool de trabajo
    conn.release();
  })
  .catch((err) => {
    // Si ocurre un error (credenciales incorrectas, red caída, etc.), lo muestra en consola
    console.error("❌ Error conectando a MySQL:", err.message);
  });

// -------------------------------------------------------------------------
// 3. EXPORTACIÓN DEL OBJETO POOL
// -------------------------------------------------------------------------
// Permite que otros archivos de tu servidor (como server/index.js o las rutas)
// puedan importar este pool para realizar consultas SQL (ej. pool.query).
module.exports = { pool };