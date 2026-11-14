/**
 * =========================================================================
 * ARCHIVO: index.js (server/index.js)
 * DESCRIPCIÓN: Servidor Backend y Controlador Principal de la API REST.
 * =========================================================================
 */

const express = require("express");
const cors = require("cors");
const { pool } = require("./db");

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());

const obtenerFechaColombia = () => {
  const fecha = new Date();
  fecha.setHours(fecha.getHours() - 5); 
  return fecha.toISOString().split("T")[0];
};

// =========================================================================
// MÓDULO DE USUARIOS (/api/usuarios)
// =========================================================================
app.get("/api/usuarios", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM usuarios ORDER BY id ASC");
    res.status(200).json(rows);
  } catch (error) {
    console.error("❌ Error al obtener usuarios:", error.message);
    res.status(500).json({ error: "Error interno del servidor al consultar usuarios" });
  }
});

app.post("/api/usuarios", async (req, res) => {
  try {
    const { usuario, documento, nombre, correo, telefono, direccion, edad, clave, rol } = req.body;
    const [result] = await pool.query(
      `INSERT INTO usuarios (usuario, documento, nombre, correo, telefono, direccion, edad, clave, rol)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        usuario,
        documento,
        nombre,
        correo || "No registrado",
        telefono || "No registrado",
        direccion || "No registrada",
        edad ? Number(edad) : null,
        clave,
        rol || "Usuario Consulta"
      ]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    console.error("❌ Error al registrar usuario:", error.message);
    res.status(500).json({ error: "Error al guardar el usuario en la base de datos" });
  }
});

app.put("/api/usuarios/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { usuario, documento, nombre, correo, telefono, direccion, edad, clave, rol } = req.body;
    await pool.query(
      `UPDATE usuarios SET usuario=?, documento=?, nombre=?, correo=?, telefono=?, direccion=?, edad=?, clave=?, rol=?
       WHERE id=?`,
      [
        usuario,
        documento,
        nombre,
        correo || "No registrado",
        telefono || "No registrado",
        direccion || "No registrada",
        edad ? Number(edad) : null,
        clave,
        rol,
        id
      ]
    );
    res.status(200).json({ id, ...req.body });
  } catch (error) {
    console.error(`❌ Error al actualizar usuario (ID: ${req.params.id}):`, error.message);
    res.status(500).json({ error: "Error al actualizar la información del usuario" });
  }
});

app.delete("/api/usuarios/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM usuarios WHERE id=?", [id]);
    res.status(200).json({ mensaje: "Usuario eliminado exitosamente" });
  } catch (error) {
    console.error(`❌ Error al eliminar usuario (ID: ${req.params.id}):`, error.message);
    res.status(500).json({ error: "Error al eliminar el usuario de la base de datos" });
  }
});

// =========================================================================
// MÓDULO DE LOTES / INVENTARIO (/api/lotes)
// =========================================================================
app.get("/api/lotes", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM lotes ORDER BY id DESC");
    const lotes = rows.map((l) => ({
      id: l.id,
      codigo: l.codigo || "",
      serial: l.serial || "",
      nombre: l.nombre || "Sin nombre",
      marca: l.marca || "",
      categoria: l.categoria || "",
      ubicacion: l.ubicacion || "",
      presentacion: l.presentacion || "",
      unidadesPorEmpaque: Number(l.unidades_por_empaque || l.unidadesPorEmpaque) || 1,
      cantidadEmpaques: Number(l.cantidad_empaques || l.cantidadEmpaques) || 0,
      totalUnidades: Number(l.total_unidades || l.totalUnidades) || 0,
      vencimiento: l.vencimiento || "N/A",
      fechaVencimiento: l.vencimiento || "N/A",
      stockMinimo: Number(l.stock_minimo || l.stockMinimo) || 5,
      lote: l.lote || "S/L",
      fechaIngreso: l.fecha_ingreso || "",
      unidadesVendidas: Number(l.unidades_vendidas || 0)
    }));
    res.status(200).json(lotes);
  } catch (error) {
    console.error("❌ Error al consultar lotes:", error.message);
    res.status(500).json({ error: "Error al consultar los registros de inventario" });
  }
});

app.post("/api/lotes", async (req, res) => {
  try {
    const data = req.body;
    const fIngreso = obtenerFechaColombia();
    const [result] = await pool.query(
      `INSERT INTO lotes 
       (codigo, serial, nombre, marca, categoria, ubicacion, presentacion, unidades_por_empaque, cantidad_empaques, total_unidades, vencimiento, stock_minimo, lote, fecha_ingreso, unidades_vendidas)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [
        data.codigo || "",
        data.serial || "",
        data.nombre || "Sin nombre",
        data.marca || "",
        data.categoria || "",
        data.ubicacion || "",
        data.presentacion || "",
        Number(data.unidadesPorEmpaque) || 1,
        Number(data.cantidadEmpaques) || 0,
        Number(data.totalUnidades) || 0,
        data.vencimiento || data.fechaVencimiento || "N/A",
        Number(data.stockMinimo) || 5,
        data.lote || "S/L",
        fIngreso
      ]
    );
    res.status(201).json({ id: result.insertId, ...data });
  } catch (error) {
    console.error("❌ Error al registrar lote:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/lotes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      codigo, serial, nombre, marca, categoria, ubicacion,
      presentacion, unidadesPorEmpaque, cantidadEmpaques,
      totalUnidades, vencimiento, fechaVencimiento, stockMinimo, lote, unidadesVendidas
    } = req.body;

    const fVence = vencimiento || fechaVencimiento || "N/A";

    await pool.query(
      `UPDATE lotes SET 
       codigo=?, serial=?, nombre=?, marca=?, categoria=?, ubicacion=?,
       presentacion=?, unidades_por_empaque=?, cantidad_empaques=?,
       total_unidades=?, vencimiento=?, stock_minimo=?, lote=?, unidades_vendidas=?
       WHERE id=?`,
      [
        codigo,
        serial || "",
        nombre,
        marca,
        categoria,
        ubicacion,
        presentacion,
        Number(unidadesPorEmpaque) || 1,
        Number(cantidadEmpaques) || 0,
        Number(totalUnidades) || 0,
        fVence,
        Number(stockMinimo) || 5,
        lote,
        Number(unidadesVendidas) || 0,
        id
      ]
    );
    res.status(200).json({ id, ...req.body });
  } catch (error) {
    console.error(`❌ Error al actualizar lote (ID: ${req.params.id}):`, error.message);
    res.status(500).json({ error: "Error al actualizar el lote en el inventario" });
  }
});

app.delete("/api/lotes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM lotes WHERE id=?", [id]);
    res.status(200).json({ mensaje: "Lote eliminado correctamente del inventario" });
  } catch (error) {
    console.error(`❌ Error al eliminar lote (ID: ${req.params.id}):`, error.message);
    res.status(500).json({ error: "Error al eliminar el lote de la base de datos" });
  }
});

// =========================================================================
// MÓDULO DE AUDITORÍA / MOVIMIENTOS (/api/movimientos)
// =========================================================================
app.get("/api/movimientos", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        m.id,
        m.tipo,
        m.fecha,
        m.cantidad_unds,
        m.motivo,
        m.id_lote,
        m.id_usuario,
        l.codigo,
        l.serial,
        l.nombre AS nombre_producto,
        l.marca,
        l.lote,
        l.vencimiento,
        l.presentacion,
        u.nombre AS usuario_nombre,
        u.usuario AS usuario_login
      FROM movimientos m
      LEFT JOIN lotes l ON m.id_lote = l.id
      LEFT JOIN usuarios u ON m.id_usuario = u.id
      ORDER BY m.id DESC
    `);

    const movs = rows.map((m) => ({
      id: m.id,
      tipo: m.tipo,
      fecha: m.fecha,
      codigo: m.codigo || "S/C",
      serial: m.serial || "",
      nombreProducto: m.nombre_producto || "Producto No Encontrado",
      marca: m.marca || "",
      lote: m.lote || "N/A",
      fechaVencimiento: m.vencimiento || "N/A",
      presentacion: m.presentacion || "",
      cantidadUnds: Number(m.cantidad_unds),
      motivo: m.motivo,
      usuario: m.usuario_nombre || m.usuario_login || `Usuario ID #${m.id_usuario || 'Sistema'}`
    }));

    res.status(200).json(movs);
  } catch (error) {
    console.error("❌ Error al consultar movimientos:", error.message);
    res.status(500).json({ error: "Error al consultar la auditoría de movimientos" });
  }
});

app.post("/api/movimientos", async (req, res) => {
  try {
    const { tipo, cantidadUnds, motivo, idLote, idUsuario } = req.body;
    if (!idLote) {
      return res.status(400).json({ error: "Se requiere el ID del lote." });
    }
    const [result] = await pool.query(
      `INSERT INTO movimientos 
       (tipo, fecha, cantidad_unds, motivo, id_lote, id_usuario)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        tipo || "ENTRADA",
        obtenerFechaColombia(),
        Number(cantidadUnds) || 0,
        motivo || "Operación regular",
        Number(idLote),
        idUsuario ? Number(idUsuario) : 1
      ]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    console.error("❌ Error al registrar movimiento:", error.message);
    res.status(500).json({ error: "Error al registrar la transacción en la base de datos" });
  }
});
app.put("/api/movimientos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { cantidadUnds, motivo } = req.body;

    await pool.query(
      `UPDATE movimientos SET cantidad_unds = ?, motivo = ? WHERE id = ?`,
      [Number(cantidadUnds) || 0, motivo || "Operación regular", id]
    );

    res.status(200).json({ id, cantidadUnds, motivo });
  } catch (error) {
    console.error(`❌ Error al actualizar movimiento (ID: ${req.params.id}):`, error.message);
    res.status(500).json({ error: "Error al actualizar el movimiento en la base de datos" });
  }
});
// =========================================================================
// INICIALIZACIÓN DEL SERVICIO
// =========================================================================
app.listen(PORT, () => {
  console.log(`🚀 Servidor API corriendo exitosamente en http://localhost:${PORT}`);
});