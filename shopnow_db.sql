-- ============================================================
--  ShopNow E-Commerce — Base de datos completa
--  Motor: MySQL 8+
--  Uso:   mysql -u root -p < shopnow_db.sql
-- ============================================================

DROP DATABASE IF EXISTS shopnow_db;
CREATE DATABASE shopnow_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE shopnow_db;

-- ============================================================
--  TABLA: categorias
-- ============================================================
CREATE TABLE categorias (
  id          INT            NOT NULL AUTO_INCREMENT,
  nombre      VARCHAR(60)    NOT NULL,
  slug        VARCHAR(60)    NOT NULL UNIQUE,
  icono_fa    VARCHAR(80)    NOT NULL COMMENT 'Clase Font Awesome del ícono',
  creado_en   TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- ============================================================
--  TABLA: productos
-- ============================================================
CREATE TABLE productos (
  id              INT              NOT NULL AUTO_INCREMENT,
  nombre          VARCHAR(120)     NOT NULL,
  descripcion     TEXT             NOT NULL,
  precio          DECIMAL(10,2)    NOT NULL,
  precio_anterior DECIMAL(10,2)    DEFAULT NULL COMMENT 'NULL = sin descuento',
  categoria_id    INT              NOT NULL,
  icono_fa        VARCHAR(80)      NOT NULL COMMENT 'Clase Font Awesome del ícono',
  imagen_url      VARCHAR(500)     DEFAULT NULL COMMENT 'URL de imagen Unsplash',
  badge           VARCHAR(30)      DEFAULT NULL COMMENT 'Ej: Nuevo, Oferta, Top Venta',
  rating          DECIMAL(2,1)     NOT NULL DEFAULT 0.0,
  resenas         INT              NOT NULL DEFAULT 0,
  activo          TINYINT(1)       NOT NULL DEFAULT 1,
  creado_en       TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en  TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_producto_categoria FOREIGN KEY (categoria_id)
    REFERENCES categorias(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_categoria (categoria_id),
  INDEX idx_activo    (activo),
  INDEX idx_rating    (rating)
);

-- ============================================================
--  TABLA: inventario
-- ============================================================
CREATE TABLE inventario (
  id           INT   NOT NULL AUTO_INCREMENT,
  producto_id  INT   NOT NULL UNIQUE,
  stock        INT   NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  CONSTRAINT fk_inv_producto FOREIGN KEY (producto_id)
    REFERENCES productos(id) ON DELETE CASCADE
);

-- ============================================================
--  TABLA: imagenes_producto  (preparada para fotos reales)
-- ============================================================
CREATE TABLE imagenes_producto (
  id          INT           NOT NULL AUTO_INCREMENT,
  producto_id INT           NOT NULL,
  url         VARCHAR(300)  NOT NULL,
  es_principal TINYINT(1)  NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  CONSTRAINT fk_img_producto FOREIGN KEY (producto_id)
    REFERENCES productos(id) ON DELETE CASCADE
);

-- ============================================================
--  TABLA: usuarios
-- ============================================================
CREATE TABLE usuarios (
  id            INT           NOT NULL AUTO_INCREMENT,
  nombre        VARCHAR(120)  NOT NULL,
  apellido      VARCHAR(120)  NOT NULL DEFAULT '',
  correo        VARCHAR(200)  NOT NULL UNIQUE,
  password_hash VARCHAR(64)   NOT NULL              COMMENT 'SHA-256 hex',
  creado_en     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_correo (correo)
);

-- ============================================================
--  TABLA: metodos_pago  (métodos guardados por el usuario)
-- ============================================================
CREATE TABLE metodos_pago (
  id          VARCHAR(32)   NOT NULL                  COMMENT 'ID generado en el frontend',
  tipo        VARCHAR(20)   NOT NULL                  COMMENT 'card | paypal | oxxo | mercadopago',
  red         VARCHAR(20)   DEFAULT NULL              COMMENT 'visa | mastercard | amex',
  ultimos_4   CHAR(4)       DEFAULT NULL              COMMENT 'Últimos 4 dígitos (tarjeta)',
  titular     VARCHAR(120)  DEFAULT NULL              COMMENT 'Nombre del titular (tarjeta)',
  vencimiento VARCHAR(5)    DEFAULT NULL              COMMENT 'MM/AA (tarjeta)',
  correo      VARCHAR(200)  DEFAULT NULL              COMMENT 'Correo (PayPal / OXXO / MercadoPago)',
  alias       VARCHAR(100)  DEFAULT NULL              COMMENT 'Alias personalizado',
  guardado_en TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_tipo (tipo)
);

-- ============================================================
--  DATOS: categorias
-- ============================================================
INSERT INTO categorias (nombre, slug, icono_fa) VALUES
  ('Electrónica', 'electronica', 'fa-solid fa-laptop'),
  ('Ropa',        'ropa',        'fa-solid fa-shirt'),
  ('Calzado',     'calzado',     'fa-solid fa-shoe-prints'),
  ('Hogar',       'hogar',       'fa-solid fa-house'),
  ('Deportes',    'deportes',    'fa-solid fa-futbol');

-- ============================================================
--  DATOS: productos
--  categoria_id: 1=Electrónica 2=Ropa 3=Calzado 4=Hogar 5=Deportes
-- ============================================================
INSERT INTO productos
  (nombre, descripcion, precio, precio_anterior, categoria_id, icono_fa, imagen_url, badge, rating, resenas)
VALUES
-- ELECTRÓNICA
(
  'MacBook Pro M3',
  'El laptop más potente de Apple con chip M3. Pantalla Liquid Retina XDR de 14", batería de hasta 22 horas, perfecto para desarrolladores y creativos.',
  28999.00, 34999.00, 1, 'fa-solid fa-laptop',
  'https://images.unsplash.com/photo-1498049860654-af1a5c566876?auto=format&fit=crop&w=600&q=80',
  'Nuevo', 4.9, 312
),
(
  'iPhone 16 Pro',
  'El iPhone más avanzado con cámara de 48MP, chip A18 Pro, pantalla Always-On y Dynamic Island. El smartphone definitivo del año.',
  22499.00, 25999.00, 1, 'fa-solid fa-mobile-screen',
  'https://images.unsplash.com/photo-1702289612974-dc67693a8cd4?auto=format&fit=crop&w=600&q=80',
  'Top Venta', 4.8, 587
),
(
  'Smart TV 55" 4K',
  'Televisor 4K Ultra HD con sistema operativo inteligente, HDR Dolby Vision, Dolby Atmos y conectividad Wi-Fi 6. La experiencia de cine en tu hogar.',
  12999.00, 15999.00, 1, 'fa-solid fa-tv',
  'https://images.unsplash.com/photo-1521607630287-ee2e81ad3ced?auto=format&fit=crop&w=600&q=80',
  'Oferta', 4.6, 176
),
(
  'Sony WH-1000XM5',
  'Los mejores audífonos de cancelación de ruido del mercado. 30 horas de batería, llamadas cristalinas y audio Hi-Res. Ideal para viajes y trabajo.',
  6499.00, 7999.00, 1, 'fa-solid fa-headphones',
  'https://images.unsplash.com/photo-1621208587196-0b2a7d2aeb03?auto=format&fit=crop&w=600&q=80',
  'Top Venta', 4.9, 425
),
-- ROPA
(
  'Playera Oversize',
  'Playera 100% algodón de alta calidad en corte oversize. Disponible en 12 colores, perfecta para cualquier ocasión.',
  549.00, NULL, 2, 'fa-solid fa-shirt',
  'https://images.unsplash.com/photo-1620799139507-2a76f79a2f4d?auto=format&fit=crop&w=600&q=80',
  NULL, 4.5, 98
),
(
  'Sudadera Premium',
  'Sudadera de fleece 300g con capucha ajustable, bolsillo canguro y cordones planos. Material suave, abrigador y duradero.',
  849.00, 1099.00, 2, 'fa-solid fa-vest',
  'https://images.unsplash.com/photo-1703531293255-0b16d10fe09f?auto=format&fit=crop&w=600&q=80',
  NULL, 4.6, 156
),
-- CALZADO
(
  'Nike Air Max 270',
  'Las icónicas zapatillas Nike con amortiguación Air Max de 270°. Comodidad extrema para el día a día, estilo inconfundible.',
  2499.00, 3200.00, 3, 'fa-solid fa-shoe-prints',
  'https://images.unsplash.com/photo-1562613521-6b5293e5b0ea?auto=format&fit=crop&w=600&q=80',
  'Oferta', 4.7, 234
),
(
  'Tenis Running X1',
  'Tenis diseñados para corredores de alto rendimiento. Suela de carbono, entresuela de espuma reactiva y upper de tejido transpirable.',
  1899.00, NULL, 3, 'fa-solid fa-person-running',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
  'Nuevo', 4.5, 87
),
-- HOGAR
(
  'Sofá Modular 3P',
  'Sofá modular de 3 plazas tapizado en tela de alta resistencia. Diseño escandinavo, estructura de madera maciza y cojines removibles.',
  8999.00, 11500.00, 4, 'fa-solid fa-couch',
  'https://images.unsplash.com/photo-1757416654883-c73c67b3382b?auto=format&fit=crop&w=600&q=80',
  'Oferta', 4.4, 63
),
(
  'Cafetera Espresso',
  'Cafetera espresso automática con bomba de 15 bares, vaporizador de leche integrado y pantalla OLED. Tu barista personal en casa.',
  3299.00, 4200.00, 4, 'fa-solid fa-mug-hot',
  'https://images.unsplash.com/photo-1754847307554-314a05e2ced6?auto=format&fit=crop&w=600&q=80',
  'Oferta', 4.7, 208
),
-- DEPORTES
(
  'Balón de Fútbol Pro',
  'Balón oficial de competición FIFA. Cubierta de poliuretano termosellado de 32 paneles, cámara de butilo para retención de aire perfecta.',
  899.00, 1200.00, 5, 'fa-solid fa-futbol',
  'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=600&q=80',
  NULL, 4.6, 142
),
(
  'Bicicleta MTB 29"',
  'Bicicleta de montaña con cuadro de aluminio 6061, frenos hidráulicos Shimano, 12 velocidades y horquilla de suspensión 120mm.',
  9500.00, 12000.00, 5, 'fa-solid fa-bicycle',
  'https://images.unsplash.com/photo-1506316940527-4d1c138978a0?auto=format&fit=crop&w=600&q=80',
  'Top Venta', 4.8, 94
);

-- ============================================================
--  DATOS: inventario  (stock inicial por producto)
-- ============================================================
INSERT INTO inventario (producto_id, stock) VALUES
  (1,  15),   -- MacBook Pro M3
  (2,  42),   -- iPhone 16 Pro
  (3,  60),   -- Smart TV
  (4,  88),   -- Sony WH-1000XM5
  (5, 200),   -- Playera Oversize
  (6, 150),   -- Sudadera Premium
  (7,  75),   -- Nike Air Max 270
  (8, 120),   -- Tenis Running X1
  (9,  20),   -- Sofá Modular 3P
  (10, 35),   -- Cafetera Espresso
  (11, 300),  -- Balón de Fútbol Pro
  (12, 18);   -- Bicicleta MTB 29"

-- ============================================================
--  VISTAS ÚTILES
-- ============================================================

-- Vista: productos con nombre de categoría y descuento calculado
CREATE VIEW v_productos AS
SELECT
  p.id,
  p.nombre,
  p.descripcion,
  p.precio,
  p.precio_anterior,
  CASE
    WHEN p.precio_anterior IS NOT NULL
    THEN ROUND((1 - p.precio / p.precio_anterior) * 100, 0)
    ELSE 0
  END                        AS descuento_pct,
  c.nombre                   AS categoria,
  c.slug                     AS categoria_slug,
  p.icono_fa,
  p.badge,
  p.rating,
  p.resenas,
  COALESCE(i.stock, 0)       AS stock,
  p.activo,
  p.creado_en
FROM productos p
JOIN categorias c  ON c.id = p.categoria_id
LEFT JOIN inventario i ON i.producto_id = p.id;

-- Vista: resumen de stock por categoría
CREATE VIEW v_stock_por_categoria AS
SELECT
  c.nombre        AS categoria,
  COUNT(p.id)     AS total_productos,
  SUM(i.stock)    AS stock_total,
  AVG(p.precio)   AS precio_promedio
FROM categorias c
JOIN productos  p ON p.categoria_id = c.id
LEFT JOIN inventario i ON i.producto_id = p.id
GROUP BY c.id, c.nombre;

-- ============================================================
--  NUEVAS TABLAS v2.0 — Ejecutar si ya tienes la DB creada:
--  mysql -u root shopnow_db < shopnow_db.sql   (recrea todo)
--  O ejecuta solo las secciones CREATE TABLE IF NOT EXISTS
-- ============================================================

-- Columnas extra en usuarios
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS telefono VARCHAR(20) DEFAULT NULL;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE DEFAULT NULL;

-- Direcciones de envío
CREATE TABLE IF NOT EXISTS direcciones (
  id           INT           NOT NULL AUTO_INCREMENT,
  usuario_id   INT           NOT NULL,
  alias        VARCHAR(60)   NOT NULL DEFAULT 'Casa',
  nombre       VARCHAR(120)  NOT NULL,
  calle        VARCHAR(200)  NOT NULL,
  colonia      VARCHAR(100)  NOT NULL DEFAULT '',
  ciudad       VARCHAR(100)  NOT NULL,
  estado       VARCHAR(100)  NOT NULL DEFAULT '',
  cp           VARCHAR(10)   NOT NULL,
  telefono     VARCHAR(20)   DEFAULT NULL,
  es_principal TINYINT(1)    NOT NULL DEFAULT 0,
  creado_en    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_dir_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_usuario_dir (usuario_id)
);

-- Pedidos guardados en BD
CREATE TABLE IF NOT EXISTS pedidos (
  id              VARCHAR(32)  NOT NULL,
  usuario_id      INT          DEFAULT NULL,
  nombre_cliente  VARCHAR(200) NOT NULL,
  correo_cliente  VARCHAR(200) NOT NULL DEFAULT '',
  total           DECIMAL(12,2) NOT NULL,
  subtotal        DECIMAL(12,2) NOT NULL,
  impuestos       DECIMAL(12,2) NOT NULL DEFAULT 0,
  descuento       DECIMAL(12,2) NOT NULL DEFAULT 0,
  envio           DECIMAL(12,2) NOT NULL DEFAULT 0,
  metodo_pago     VARCHAR(30)  NOT NULL DEFAULT 'card',
  estado          ENUM('pendiente','confirmado','preparando','en_camino','entregado','cancelado') NOT NULL DEFAULT 'pendiente',
  puntos_ganados  INT          NOT NULL DEFAULT 0,
  creado_en       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_ped_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX idx_usuario_ped (usuario_id),
  INDEX idx_estado_ped  (estado)
);

-- Items de cada pedido
CREATE TABLE IF NOT EXISTS pedidos_items (
  id          INT          NOT NULL AUTO_INCREMENT,
  pedido_id   VARCHAR(32)  NOT NULL,
  producto_id INT          NOT NULL DEFAULT 0,
  nombre      VARCHAR(120) NOT NULL,
  precio      DECIMAL(10,2) NOT NULL,
  cantidad    INT          NOT NULL DEFAULT 1,
  variante    VARCHAR(60)  DEFAULT NULL,
  img         VARCHAR(500) DEFAULT NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_pi_pedido FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
  INDEX idx_pedido_item (pedido_id)
);

-- Cupones de descuento
CREATE TABLE IF NOT EXISTS cupones (
  id            INT          NOT NULL AUTO_INCREMENT,
  codigo        VARCHAR(30)  NOT NULL UNIQUE,
  descuento     DECIMAL(5,4) NOT NULL COMMENT '0.10 = 10%',
  tipo          ENUM('porcentaje','fijo') NOT NULL DEFAULT 'porcentaje',
  usos_max      INT          DEFAULT NULL,
  usos_actuales INT          NOT NULL DEFAULT 0,
  activo        TINYINT(1)   NOT NULL DEFAULT 1,
  fecha_expira  DATE         DEFAULT NULL,
  creado_en     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- Devoluciones / reembolsos
CREATE TABLE IF NOT EXISTS devoluciones (
  id          INT         NOT NULL AUTO_INCREMENT,
  pedido_id   VARCHAR(32) NOT NULL,
  usuario_id  INT         DEFAULT NULL,
  motivo      TEXT        NOT NULL,
  estado      ENUM('solicitada','en_revision','aprobada','rechazada','completada') NOT NULL DEFAULT 'solicitada',
  creado_en   TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_dev_pedido  (pedido_id),
  INDEX idx_dev_usuario (usuario_id)
);

-- Reseñas en BD (sincronizadas con localStorage)
CREATE TABLE IF NOT EXISTS resenas (
  id             VARCHAR(32)  NOT NULL,
  producto_id    INT          NOT NULL,
  usuario_id     INT          DEFAULT NULL,
  usuario_nombre VARCHAR(120) NOT NULL,
  rating         TINYINT      NOT NULL,
  comentario     TEXT         NOT NULL,
  aprobada       TINYINT(1)   NOT NULL DEFAULT 1,
  creado_en      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_res_producto FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
  INDEX idx_producto_res (producto_id)
);

-- Cupones iniciales
INSERT IGNORE INTO cupones (codigo, descuento, tipo, activo) VALUES
  ('SHOPNOW10',  0.10, 'porcentaje', 1),
  ('SHOPNOW20',  0.20, 'porcentaje', 1),
  ('BIENVENIDO', 0.15, 'porcentaje', 1),
  ('VERANO25',   0.25, 'porcentaje', 1);

-- ============================================================
--  CONSULTAS DE EJEMPLO (comentadas — copiar y ejecutar)
-- ============================================================

-- Todos los productos activos con su categoría y descuento:
-- SELECT * FROM v_productos WHERE activo = 1 ORDER BY rating DESC;

-- Productos de una categoría específica:
-- SELECT * FROM v_productos WHERE categoria_slug = 'electronica';

-- Productos en oferta (con precio anterior):
-- SELECT nombre, precio, precio_anterior, descuento_pct FROM v_productos WHERE precio_anterior IS NOT NULL ORDER BY descuento_pct DESC;

-- Stock bajo (menos de 20 unidades):
-- SELECT p.nombre, i.stock FROM productos p JOIN inventario i ON i.producto_id = p.id WHERE i.stock < 20;

-- Resumen por categoría:
-- SELECT * FROM v_stock_por_categoria;

-- Agregar un producto nuevo:
-- INSERT INTO productos (nombre, descripcion, precio, precio_anterior, categoria_id, icono_fa, badge, rating, resenas)
-- VALUES ('Nombre', 'Descripción...', 999.00, NULL, 1, 'fa-solid fa-box', NULL, 0.0, 0);
-- INSERT INTO inventario (producto_id, stock) VALUES (LAST_INSERT_ID(), 50);

-- Actualizar precio de un producto:
-- UPDATE productos SET precio = 1799.00 WHERE id = 5;

-- Desactivar un producto (sin borrarlo):
-- UPDATE productos SET activo = 0 WHERE id = 3;
