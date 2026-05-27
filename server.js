require('dotenv').config();
const express      = require('express');
const mysql        = require('mysql2/promise');
const path         = require('path');
const crypto       = require('crypto');
const jwt          = require('jsonwebtoken');
const rateLimit    = require('express-rate-limit');
const cors         = require('cors');
const nodemailer   = require('nodemailer');
const multer       = require('multer');
const fs           = require('fs');

const app          = express();
const JWT_SECRET   = process.env.JWT_SECRET   || 'shopnow_jwt_secret_2026';
const PORT         = parseInt(process.env.PORT || '3000');

// ── Uploads ─────────────────────────────────────────────────────
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename:    (req, file, cb) => cb(null, `prod_${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) =>
    file.mimetype.startsWith('image/') ? cb(null, true) : cb(new Error('Solo imágenes')),
});

// ── CORS ─────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || 'http://localhost:3000', credentials: true }));

// ── Rate limiting ─────────────────────────────────────────────────
const limiter     = rateLimit({ windowMs: 15*60*1000, max: 300, message: { error: 'Demasiadas solicitudes.' } });
const authLimiter = rateLimit({ windowMs: 15*60*1000, max: 20,  message: { error: 'Demasiados intentos.'   } });
app.use('/api/', limiter);
app.use('/api/usuarios/login',    authLimiter);
app.use('/api/usuarios/registro', authLimiter);

app.use(express.json());
app.use(express.static(path.join(__dirname)));
app.use('/uploads', express.static(uploadsDir));

// ── DB ────────────────────────────────────────────────────────────
const DB_CONFIG = {
  host:     process.env.DB_HOST     || 'localhost',
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'shopnow_db',
};
async function conn() { return mysql.createConnection(DB_CONFIG); }

// ── Helpers ───────────────────────────────────────────────────────
function hashPw(pw) { return crypto.createHash('sha256').update('shopnow2026_' + pw).digest('hex'); }
function genId()    { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

function verifyToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'No autenticado.' });
  try { req.user = jwt.verify(auth.slice(7), JWT_SECRET); next(); }
  catch { res.status(401).json({ error: 'Token inválido.' }); }
}

// ── Email ─────────────────────────────────────────────────────────
let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
}

async function sendOrderEmail(correo, nombre, pedidoId, items, total) {
  if (!transporter) return;
  const rows = items.map(i => `<tr><td>${i.nombre||i.name}</td><td>x${i.cantidad||i.qty}</td><td>$${((i.precio||i.price)*(i.cantidad||i.qty)).toLocaleString()}</td></tr>`).join('');
  await transporter.sendMail({
    from: `"ShopNow" <${process.env.EMAIL_USER}>`,
    to: correo,
    subject: `Confirmación de pedido ${pedidoId} — ShopNow`,
    html: `<h2>¡Gracias por tu compra, ${nombre}!</h2>
           <p>Tu pedido <strong>${pedidoId}</strong> fue recibido exitosamente.</p>
           <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse">${rows}</table>
           <p><strong>Total: $${parseFloat(total).toLocaleString()}</strong></p>
           <p>Te notificaremos cuando esté en camino.</p>`,
  });
}

// ================================================================
//  MÉTODOS DE PAGO
// ================================================================
app.get('/api/metodos-pago', async (req, res) => {
  try {
    const db = await conn();
    const [rows] = await db.execute('SELECT * FROM metodos_pago ORDER BY guardado_en DESC');
    await db.end(); res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/metodos-pago', async (req, res) => {
  const { id, tipo, red, ultimos_4, titular, vencimiento, correo, alias } = req.body;
  if (!id || !tipo) return res.status(400).json({ error: 'Faltan campos obligatorios' });
  try {
    const db = await conn();
    await db.execute(
      `INSERT INTO metodos_pago (id,tipo,red,ultimos_4,titular,vencimiento,correo,alias) VALUES (?,?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE alias=VALUES(alias), vencimiento=VALUES(vencimiento)`,
      [id,tipo,red??null,ultimos_4??null,titular??null,vencimiento??null,correo??null,alias??null]
    );
    await db.end(); res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/metodos-pago/:id', async (req, res) => {
  try {
    const db = await conn();
    await db.execute('DELETE FROM metodos_pago WHERE id=?', [req.params.id]);
    await db.end(); res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ================================================================
//  USUARIOS
// ================================================================
app.post('/api/usuarios/registro', async (req, res) => {
  const { nombre, apellido, correo, password } = req.body;
  if (!nombre || !correo || !password) return res.status(400).json({ error: 'Faltan campos obligatorios.' });
  try {
    const db = await conn();
    const [ex] = await db.execute('SELECT id FROM usuarios WHERE correo=?', [correo]);
    if (ex.length > 0) { await db.end(); return res.status(409).json({ error: 'Ya existe una cuenta con ese correo.' }); }
    const [r] = await db.execute(
      'INSERT INTO usuarios (nombre,apellido,correo,password_hash) VALUES (?,?,?,?)',
      [nombre, apellido||'', correo, hashPw(password)]
    );
    await db.end(); res.json({ ok: true, id: r.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/usuarios/login', async (req, res) => {
  const { correo, password } = req.body;
  if (!correo || !password) return res.status(400).json({ error: 'Faltan campos.' });
  try {
    const db = await conn();
    const [rows] = await db.execute(
      'SELECT id,nombre,apellido,correo,telefono FROM usuarios WHERE correo=? AND password_hash=?',
      [correo, hashPw(password)]
    );
    await db.end();
    if (!rows.length) return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
    const user  = rows[0];
    const token = jwt.sign({ id: user.id, correo: user.correo }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ ...user, token });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/usuarios/recuperar-password', authLimiter, async (req, res) => {
  const { correo } = req.body;
  if (!correo) return res.status(400).json({ error: 'Correo requerido.' });
  try {
    const db = await conn();
    const [rows] = await db.execute('SELECT id,nombre FROM usuarios WHERE correo=?', [correo]);
    await db.end();
    if (rows.length && transporter) {
      const token = jwt.sign({ id: rows[0].id, type: 'reset' }, JWT_SECRET, { expiresIn: '1h' });
      await transporter.sendMail({
        from: `"ShopNow" <${process.env.EMAIL_USER}>`,
        to: correo,
        subject: 'Recuperación de contraseña — ShopNow',
        html: `<h2>Hola ${rows[0].nombre},</h2><p>Tu código temporal de acceso es: <strong>${token.slice(-8).toUpperCase()}</strong></p><p>Expira en 1 hora.</p>`,
      }).catch(() => {});
    }
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/usuarios/:id/perfil', verifyToken, async (req, res) => {
  if (parseInt(req.params.id) !== req.user.id) return res.status(403).json({ error: 'Sin permiso.' });
  const { nombre, apellido, telefono } = req.body;
  try {
    const db = await conn();
    await db.execute('UPDATE usuarios SET nombre=?,apellido=?,telefono=? WHERE id=?',
      [nombre, apellido||'', telefono||null, req.user.id]);
    await db.end(); res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/usuarios/:id/password', verifyToken, async (req, res) => {
  if (parseInt(req.params.id) !== req.user.id) return res.status(403).json({ error: 'Sin permiso.' });
  const { passwordActual, passwordNuevo } = req.body;
  if (!passwordActual || !passwordNuevo) return res.status(400).json({ error: 'Faltan campos.' });
  try {
    const db = await conn();
    const [rows] = await db.execute('SELECT id FROM usuarios WHERE id=? AND password_hash=?',
      [req.user.id, hashPw(passwordActual)]);
    if (!rows.length) { await db.end(); return res.status(401).json({ error: 'Contraseña actual incorrecta.' }); }
    await db.execute('UPDATE usuarios SET password_hash=? WHERE id=?', [hashPw(passwordNuevo), req.user.id]);
    await db.end(); res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ================================================================
//  DIRECCIONES
// ================================================================
app.get('/api/direcciones', verifyToken, async (req, res) => {
  try {
    const db = await conn();
    const [rows] = await db.execute(
      'SELECT * FROM direcciones WHERE usuario_id=? ORDER BY es_principal DESC, creado_en DESC',
      [req.user.id]);
    await db.end(); res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/direcciones', verifyToken, async (req, res) => {
  const { alias, nombre, calle, colonia, ciudad, estado, cp, telefono, es_principal } = req.body;
  if (!nombre || !calle || !ciudad || !cp) return res.status(400).json({ error: 'Faltan campos.' });
  try {
    const db = await conn();
    if (es_principal) await db.execute('UPDATE direcciones SET es_principal=0 WHERE usuario_id=?', [req.user.id]);
    const [r] = await db.execute(
      'INSERT INTO direcciones (usuario_id,alias,nombre,calle,colonia,ciudad,estado,cp,telefono,es_principal) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [req.user.id, alias||'Casa', nombre, calle, colonia||'', ciudad, estado||'', cp, telefono||null, es_principal?1:0]
    );
    await db.end(); res.json({ ok: true, id: r.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/direcciones/:id', verifyToken, async (req, res) => {
  const { alias, nombre, calle, colonia, ciudad, estado, cp, telefono, es_principal } = req.body;
  try {
    const db = await conn();
    if (es_principal) await db.execute('UPDATE direcciones SET es_principal=0 WHERE usuario_id=?', [req.user.id]);
    await db.execute(
      'UPDATE direcciones SET alias=?,nombre=?,calle=?,colonia=?,ciudad=?,estado=?,cp=?,telefono=?,es_principal=? WHERE id=? AND usuario_id=?',
      [alias||'Casa', nombre, calle, colonia||'', ciudad, estado||'', cp, telefono||null, es_principal?1:0, req.params.id, req.user.id]
    );
    await db.end(); res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/direcciones/:id', verifyToken, async (req, res) => {
  try {
    const db = await conn();
    await db.execute('DELETE FROM direcciones WHERE id=? AND usuario_id=?', [req.params.id, req.user.id]);
    await db.end(); res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ================================================================
//  PEDIDOS
// ================================================================
app.post('/api/pedidos', async (req, res) => {
  const { usuario_id, nombre_cliente, correo_cliente, items, total, subtotal, impuestos, descuento, envio, metodo_pago, puntos_ganados } = req.body;
  if (!nombre_cliente || !items?.length || !total) return res.status(400).json({ error: 'Faltan datos.' });
  const id = 'SN-' + genId().toUpperCase();
  try {
    const db = await conn();
    await db.execute(
      'INSERT INTO pedidos (id,usuario_id,nombre_cliente,correo_cliente,total,subtotal,impuestos,descuento,envio,metodo_pago,puntos_ganados) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
      [id, usuario_id||null, nombre_cliente, correo_cliente||'', total, subtotal||total, impuestos||0, descuento||0, envio||0, metodo_pago||'card', puntos_ganados||0]
    );
    for (const item of items) {
      await db.execute(
        'INSERT INTO pedidos_items (pedido_id,producto_id,nombre,precio,cantidad,variante,img) VALUES (?,?,?,?,?,?,?)',
        [id, item.id||0, item.nombre||item.name, item.precio||item.price, item.cantidad||item.qty, item.variante||item.variant||null, item.img||null]
      );
      if (item.id) {
        await db.execute('UPDATE inventario SET stock=GREATEST(0,stock-?) WHERE producto_id=?',
          [item.cantidad||item.qty||1, item.id]);
      }
    }
    await db.end();
    sendOrderEmail(correo_cliente, nombre_cliente, id, items, total).catch(() => {});
    res.json({ ok: true, id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/pedidos', async (req, res) => {
  const { usuario_id } = req.query;
  try {
    const db = await conn();
    const [rows] = usuario_id
      ? await db.execute('SELECT * FROM pedidos WHERE usuario_id=? ORDER BY creado_en DESC', [usuario_id])
      : await db.execute('SELECT * FROM pedidos ORDER BY creado_en DESC LIMIT 200');
    for (const p of rows) {
      const [items] = await db.execute('SELECT * FROM pedidos_items WHERE pedido_id=?', [p.id]);
      p.items = items;
    }
    await db.end(); res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/pedidos/:id/estado', async (req, res) => {
  const valid = ['pendiente','confirmado','preparando','en_camino','entregado','cancelado'];
  if (!valid.includes(req.body.estado)) return res.status(400).json({ error: 'Estado inválido.' });
  try {
    const db = await conn();
    await db.execute('UPDATE pedidos SET estado=? WHERE id=?', [req.body.estado, req.params.id]);
    await db.end(); res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ================================================================
//  CUPONES
// ================================================================
app.get('/api/cupones', async (req, res) => {
  try {
    const db = await conn();
    const [rows] = await db.execute('SELECT * FROM cupones ORDER BY creado_en DESC');
    await db.end(); res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/cupones/validar', async (req, res) => {
  const { codigo } = req.body;
  if (!codigo) return res.status(400).json({ error: 'Código requerido.' });
  try {
    const db = await conn();
    const [rows] = await db.execute(
      'SELECT * FROM cupones WHERE codigo=? AND activo=1 AND (usos_max IS NULL OR usos_actuales<usos_max) AND (fecha_expira IS NULL OR fecha_expira>=CURDATE())',
      [codigo.toUpperCase()]
    );
    await db.end();
    if (!rows.length) return res.status(404).json({ error: 'Cupón inválido o expirado.' });
    const c = rows[0];
    res.json({ ok: true, codigo: c.codigo, descuento: parseFloat(c.descuento), tipo: c.tipo });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/cupones', async (req, res) => {
  const { codigo, descuento, tipo, usos_max, activo, fecha_expira } = req.body;
  if (!codigo || descuento === undefined) return res.status(400).json({ error: 'Faltan campos.' });
  try {
    const db = await conn();
    await db.execute(
      'INSERT INTO cupones (codigo,descuento,tipo,usos_max,activo,fecha_expira) VALUES (?,?,?,?,?,?)',
      [codigo.toUpperCase(), descuento, tipo||'porcentaje', usos_max||null, activo!==false?1:0, fecha_expira||null]
    );
    await db.end(); res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/cupones/:id', async (req, res) => {
  const { descuento, activo, usos_max, fecha_expira } = req.body;
  try {
    const db = await conn();
    await db.execute('UPDATE cupones SET descuento=?,activo=?,usos_max=?,fecha_expira=? WHERE id=?',
      [descuento, activo?1:0, usos_max||null, fecha_expira||null, req.params.id]);
    await db.end(); res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/cupones/:id', async (req, res) => {
  try {
    const db = await conn();
    await db.execute('DELETE FROM cupones WHERE id=?', [req.params.id]);
    await db.end(); res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ================================================================
//  DEVOLUCIONES
// ================================================================
app.post('/api/devoluciones', async (req, res) => {
  const { pedido_id, usuario_id, motivo } = req.body;
  if (!pedido_id || !motivo) return res.status(400).json({ error: 'Faltan campos.' });
  try {
    const db = await conn();
    const [r] = await db.execute('INSERT INTO devoluciones (pedido_id,usuario_id,motivo) VALUES (?,?,?)',
      [pedido_id, usuario_id||null, motivo]);
    await db.end(); res.json({ ok: true, id: r.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/devoluciones', async (req, res) => {
  const { usuario_id } = req.query;
  try {
    const db = await conn();
    const [rows] = usuario_id
      ? await db.execute('SELECT * FROM devoluciones WHERE usuario_id=? ORDER BY creado_en DESC', [usuario_id])
      : await db.execute('SELECT * FROM devoluciones ORDER BY creado_en DESC');
    await db.end(); res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/devoluciones/:id/estado', async (req, res) => {
  const valid = ['solicitada','en_revision','aprobada','rechazada','completada'];
  if (!valid.includes(req.body.estado)) return res.status(400).json({ error: 'Estado inválido.' });
  try {
    const db = await conn();
    await db.execute('UPDATE devoluciones SET estado=? WHERE id=?', [req.body.estado, req.params.id]);
    await db.end(); res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ================================================================
//  RESEÑAS
// ================================================================
app.get('/api/resenas', async (req, res) => {
  const { producto_id } = req.query;
  try {
    const db = await conn();
    const [rows] = producto_id
      ? await db.execute('SELECT * FROM resenas WHERE producto_id=? AND aprobada=1 ORDER BY creado_en DESC', [producto_id])
      : await db.execute('SELECT * FROM resenas ORDER BY creado_en DESC');
    await db.end(); res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/resenas', async (req, res) => {
  const { producto_id, usuario_id, usuario_nombre, rating, comentario } = req.body;
  if (!producto_id || !usuario_nombre || !rating || !comentario) return res.status(400).json({ error: 'Faltan campos.' });
  const id = genId();
  try {
    const db = await conn();
    await db.execute(
      'INSERT INTO resenas (id,producto_id,usuario_id,usuario_nombre,rating,comentario) VALUES (?,?,?,?,?,?)',
      [id, producto_id, usuario_id||null, usuario_nombre, rating, comentario]
    );
    await db.end(); res.json({ ok: true, id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/resenas/:id/aprobar', async (req, res) => {
  try {
    const db = await conn();
    await db.execute('UPDATE resenas SET aprobada=? WHERE id=?', [req.body.aprobada?1:0, req.params.id]);
    await db.end(); res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/resenas/:id', async (req, res) => {
  try {
    const db = await conn();
    await db.execute('DELETE FROM resenas WHERE id=?', [req.params.id]);
    await db.end(); res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ================================================================
//  ANALYTICS
// ================================================================
app.get('/api/analytics', async (req, res) => {
  try {
    const db = await conn();
    const [[{ total: pedidos, ingresos }]] = await db.execute(
      "SELECT COUNT(*) as total, COALESCE(SUM(total),0) as ingresos FROM pedidos WHERE estado!='cancelado'"
    );
    const [[{ total: usuarios }]] = await db.execute('SELECT COUNT(*) as total FROM usuarios');
    const [[{ total: productos }]] = await db.execute('SELECT COUNT(*) as total FROM productos WHERE activo=1');
    const [ventasPorDia] = await db.execute(
      "SELECT DATE(creado_en) as fecha, COUNT(*) as pedidos, SUM(total) as ingresos FROM pedidos WHERE creado_en>=DATE_SUB(NOW(),INTERVAL 30 DAY) AND estado!='cancelado' GROUP BY DATE(creado_en) ORDER BY fecha ASC"
    );
    const [topProductos] = await db.execute(
      "SELECT pi.nombre, SUM(pi.cantidad) as vendidos, SUM(pi.precio*pi.cantidad) as ingresos FROM pedidos_items pi JOIN pedidos p ON p.id=pi.pedido_id WHERE p.estado!='cancelado' GROUP BY pi.nombre ORDER BY vendidos DESC LIMIT 5"
    );
    const [pedidosPorEstado] = await db.execute('SELECT estado, COUNT(*) as total FROM pedidos GROUP BY estado');
    const [ultimosPedidos]   = await db.execute('SELECT id,nombre_cliente,total,metodo_pago,estado,creado_en FROM pedidos ORDER BY creado_en DESC LIMIT 10');
    await db.end();
    res.json({ resumen: { pedidos, ingresos, usuarios, productos }, ventasPorDia, topProductos, pedidosPorEstado, ultimosPedidos });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ================================================================
//  CALCULADORA DE ENVÍO
// ================================================================
app.post('/api/calcular-envio', (req, res) => {
  const { cp, subtotal } = req.body;
  if (!cp) return res.status(400).json({ error: 'CP requerido.' });
  const n = parseInt(cp);
  let costo = 149, dias = '5-7', zona = 'nacional';
  if (n>=1000  && n<=16999) { costo=0;   dias='1-2'; zona='CDMX';               }
  else if (n>=17000 && n<=22999) { costo=59;  dias='2-3'; zona='zona_metropolitana'; }
  else if (n>=44000 && n<=45999) { costo=99;  dias='3-4'; zona='guadalajara';        }
  else if (n>=64000 && n<=67999) { costo=99;  dias='3-4'; zona='monterrey';          }
  if (subtotal >= 1999) costo = 0;
  res.json({ ok: true, zona, costo, dias, gratis: costo === 0 });
});

// ================================================================
//  UPLOAD DE IMAGEN DE PRODUCTO
// ================================================================
app.post('/api/productos/:id/imagen', upload.single('imagen'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se recibió imagen.' });
  const url = `/uploads/${req.file.filename}`;
  try {
    const db = await conn();
    await db.execute('UPDATE productos SET imagen_url=? WHERE id=?', [url, req.params.id]);
    await db.end(); res.json({ ok: true, url });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ================================================================
//  ADMIN AUTH
// ================================================================
const ADMIN_SECRET = JWT_SECRET + '_admin';

function verifyAdmin(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'No autenticado.' });
  try {
    const decoded = jwt.verify(auth.slice(7), ADMIN_SECRET);
    if (decoded.role !== 'admin') throw new Error('No es admin');
    next();
  } catch { res.status(401).json({ error: 'Token de administrador inválido.' }); }
}

app.post('/api/admin/login', authLimiter, (req, res) => {
  const { pin } = req.body;
  if (!pin) return res.status(400).json({ error: 'PIN requerido.' });
  if (pin.toUpperCase() !== (process.env.ADMIN_PIN || 'ADMIN2026').toUpperCase())
    return res.status(401).json({ error: 'PIN incorrecto.' });
  const token = jwt.sign({ role: 'admin' }, ADMIN_SECRET, { expiresIn: '8h' });
  res.json({ ok: true, token });
});

// ================================================================
//  PRODUCTOS
// ================================================================
app.get('/api/productos', async (req, res) => {
  try {
    const db = await conn();
    const [rows] = await db.execute(`
      SELECT p.id, p.nombre, p.descripcion, p.precio, p.precio_anterior,
             p.icono_fa, p.imagen_url, p.badge, p.rating, p.resenas, p.activo,
             c.slug AS category,
             COALESCE(i.stock, 0) AS stock
      FROM productos p
      LEFT JOIN categorias c ON c.id = p.categoria_id
      LEFT JOIN inventario  i ON i.producto_id = p.id
      WHERE p.activo = 1
      ORDER BY p.id ASC
    `);
    await db.end(); res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/productos/:id', async (req, res) => {
  try {
    const db = await conn();
    const [rows] = await db.execute(`
      SELECT p.id, p.nombre, p.descripcion, p.precio, p.precio_anterior,
             p.icono_fa, p.imagen_url, p.badge, p.rating, p.resenas, p.activo,
             c.slug AS category,
             COALESCE(i.stock, 0) AS stock
      FROM productos p
      LEFT JOIN categorias c ON c.id = p.categoria_id
      LEFT JOIN inventario  i ON i.producto_id = p.id
      WHERE p.id = ?
    `, [req.params.id]);
    await db.end();
    if (!rows.length) return res.status(404).json({ error: 'Producto no encontrado.' });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/productos', verifyAdmin, async (req, res) => {
  const { nombre, descripcion, precio, precio_anterior, categoria_id, icono_fa, imagen_url, badge, stock } = req.body;
  if (!nombre || !precio || !categoria_id) return res.status(400).json({ error: 'Faltan campos obligatorios.' });
  try {
    const db = await conn();
    const [r] = await db.execute(
      'INSERT INTO productos (nombre,descripcion,precio,precio_anterior,categoria_id,icono_fa,imagen_url,badge) VALUES (?,?,?,?,?,?,?,?)',
      [nombre, descripcion||'', precio, precio_anterior||null, categoria_id, icono_fa||'fa-solid fa-box', imagen_url||null, badge||null]
    );
    await db.execute('INSERT INTO inventario (producto_id,stock) VALUES (?,?)', [r.insertId, stock||0]);
    await db.end(); res.json({ ok: true, id: r.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/productos/:id', verifyAdmin, async (req, res) => {
  const { nombre, descripcion, precio, precio_anterior, icono_fa, imagen_url, badge, activo, stock } = req.body;
  try {
    const db = await conn();
    const updates = [], vals = [];
    if (nombre          !== undefined) { updates.push('nombre=?');         vals.push(nombre); }
    if (descripcion     !== undefined) { updates.push('descripcion=?');    vals.push(descripcion); }
    if (precio          !== undefined) { updates.push('precio=?');         vals.push(precio); }
    if (precio_anterior !== undefined) { updates.push('precio_anterior=?');vals.push(precio_anterior||null); }
    if (icono_fa        !== undefined) { updates.push('icono_fa=?');       vals.push(icono_fa); }
    if (imagen_url      !== undefined) { updates.push('imagen_url=?');     vals.push(imagen_url); }
    if (badge           !== undefined) { updates.push('badge=?');          vals.push(badge||null); }
    if (activo          !== undefined) { updates.push('activo=?');         vals.push(activo?1:0); }
    if (updates.length) {
      vals.push(req.params.id);
      await db.execute(`UPDATE productos SET ${updates.join(',')} WHERE id=?`, vals);
    }
    if (stock !== undefined) {
      await db.execute(
        'INSERT INTO inventario (producto_id,stock) VALUES (?,?) ON DUPLICATE KEY UPDATE stock=?',
        [req.params.id, stock, stock]
      );
    }
    await db.end(); res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/productos/:id', verifyAdmin, async (req, res) => {
  try {
    const db = await conn();
    await db.execute('UPDATE productos SET activo=0 WHERE id=?', [req.params.id]);
    await db.end(); res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Arrancar ──────────────────────────────────────────────────────
app.listen(PORT, () => console.log(`\n✅  ShopNow corriendo en → http://localhost:${PORT}\n`));
