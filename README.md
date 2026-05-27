#ShopNow — E-Commerce

Tienda en línea full-stack construida con **Node.js + Express + MySQL** en el backend y **HTML/CSS/JavaScript vanilla** en el frontend. Incluye panel de administrador, sistema de usuarios, cupones, devoluciones, reseñas y soporte PWA.

---

##  Características

-  Catálogo de productos con filtros por categoría, precio y rating
-  Búsqueda con autocompletado en tiempo real
-  Carrito de compras persistente
-  Lista de deseos y comparador de productos
-  Registro, login y perfil de usuario con JWT
-  Checkout completo con múltiples métodos de pago (Tarjeta, PayPal, OXXO, SPEI, Mercado Pago)
-  Sistema de cupones de descuento
-  Sistema de puntos y reseñas
-  Solicitudes de devolución
-  Notificaciones por correo (confirmación de pedido, recuperación de contraseña)
-  Calculadora de costos de envío por CP
-  Modo oscuro
-  PWA (Progressive Web App) instalable
-  Panel de administrador protegido con PIN del servidor

---

##  Tecnologías

| Área | Tecnología |
|------|-----------|
| Backend | Node.js, Express 4 |
| Base de datos | MySQL 8+ |
| Auth | JWT (jsonwebtoken) |
| Email | Nodemailer |
| Uploads | Multer |
| Seguridad | express-rate-limit, CORS |
| Frontend | HTML5, CSS3, JavaScript Vanilla |
| Íconos | Font Awesome 6 |
| Gráficas (admin) | Chart.js |

---

##  Instalación

### Requisitos previos
- Node.js 18+
- MySQL 8+
- Git

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/shopnow-ecommerce.git
cd shopnow-ecommerce
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
cp .env.example .env
```
Edita el archivo `.env` con tus datos:
- `DB_PASSWORD` → contraseña de MySQL
- `JWT_SECRET` → cadena aleatoria larga (mínimo 32 caracteres)
- `ADMIN_PIN` → código de acceso al panel admin (solo tú lo sabes)
- `EMAIL_USER` / `EMAIL_PASS` → cuenta Gmail con App Password (opcional)

### 4. Crear la base de datos
```bash
mysql -u root -p < shopnow_db.sql
```
Esto crea la base de datos `shopnow_db` con todas las tablas, datos de ejemplo y cupones iniciales.

### 5. Iniciar el servidor
```bash
# Producción
npm start

# Desarrollo (auto-recarga)
npm run dev
```

Abre tu navegador en → **http://localhost:3000**

---

## Estructura del proyecto

```
shopnow-ecommerce/
├── server.js           # Servidor Express + API REST
├── app.js              # Lógica del frontend (tienda)
├── auth.js             # Lógica de login/registro
├── checkout.js         # Lógica del checkout
├── admin.js            # Lógica del panel admin
├── profile.js          # Lógica del perfil de usuario
├── index.html          # Tienda principal
├── login.html          # Inicio de sesión
├── register.html       # Registro de usuario
├── checkout.html       # Proceso de compra
├── admin.html          # Panel de administrador
├── profile.html        # Perfil de usuario
├── forgot-password.html# Recuperación de contraseña
├── styles.css          # Estilos globales (tienda)
├── auth.css            # Estilos de auth
├── checkout.css        # Estilos del checkout
├── admin.css           # Estilos del admin
├── profile.css         # Estilos del perfil
├── manifest.json       # Configuración PWA
├── sw.js               # Service Worker (PWA)
├── shopnow_db.sql      # Schema completo de la base de datos
├── uploads/            # Imágenes subidas (ignorado por git)
├── .env.example        # Plantilla de variables de entorno
└── package.json
```

---

##  API REST

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/admin/login` | Login del administrador |
| GET | `/api/productos` | Listar productos activos |
| GET | `/api/productos/:id` | Obtener producto por ID |
| POST | `/api/productos` | Crear producto (admin) |
| PUT | `/api/productos/:id` | Actualizar producto (admin) |
| DELETE | `/api/productos/:id` | Desactivar producto (admin) |
| POST | `/api/usuarios/registro` | Registrar usuario |
| POST | `/api/usuarios/login` | Login de usuario |
| PUT | `/api/usuarios/:id/perfil` | Actualizar perfil |
| PUT | `/api/usuarios/:id/password` | Cambiar contraseña |
| GET | `/api/direcciones` | Listar direcciones |
| POST | `/api/direcciones` | Agregar dirección |
| PUT | `/api/direcciones/:id` | Editar dirección |
| DELETE | `/api/direcciones/:id` | Eliminar dirección |
| POST | `/api/pedidos` | Crear pedido |
| GET | `/api/pedidos` | Listar pedidos |
| PUT | `/api/pedidos/:id/estado` | Actualizar estado |
| POST | `/api/cupones/validar` | Validar cupón |
| GET | `/api/cupones` | Listar cupones (admin) |
| POST | `/api/cupones` | Crear cupón (admin) |
| DELETE | `/api/cupones/:id` | Eliminar cupón (admin) |
| GET | `/api/resenas` | Listar reseñas |
| POST | `/api/resenas` | Crear reseña |
| GET | `/api/devoluciones` | Listar devoluciones |
| POST | `/api/devoluciones` | Solicitar devolución |
| GET | `/api/analytics` | Dashboard analytics (admin) |
| POST | `/api/calcular-envio` | Calcular costo de envío |

---

##  Panel de Administrador

Accede en → **http://localhost:3000/admin.html**

Ingresa el PIN configurado en tu variable `ADMIN_PIN` del archivo `.env`.

El PIN **nunca** aparece en el código fuente — se valida del lado del servidor.

---

##  Configuración de Email (opcional)

Para activar los correos de confirmación de pedido y recuperación de contraseña:

1. Activa la **verificación en 2 pasos** en tu cuenta de Gmail
2. Ve a **Seguridad → Contraseñas de aplicaciones**
3. Genera una App Password y cópiala en `EMAIL_PASS` del `.env`
4. Pon tu correo en `EMAIL_USER`

---

## Cupones incluidos

| Código | Descuento |
|--------|-----------|
| `SHOPNOW10` | 10% |
| `SHOPNOW20` | 20% |
| `BIENVENIDO` | 15% |
| `VERANO25` | 25% |

---

## Licencia

MIT © 2026
