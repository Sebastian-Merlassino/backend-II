# Proyecto Backend II - Entrega Final


Este repositorio implementa un **backend de ecommerce** usando **Node.js**, **Express** y **MongoDB**.  
La entrega final refactoriza la arquitectura e incorpora un sistema completo de usuarios, productos, carritos, tickets y recuperación de contraseña.  

## Estructura general

- `src/models/` – Modelos de Mongoose (`userModel`, `productModel`, `cartModel`, `ticketModel`).  
- `src/dao/` – Clases DAO (Data Access Object) que encapsulan el acceso a la base de datos.  
- `src/repositories/` – Repositorios que utilizan los DAOs para separar la lógica de datos de la lógica de negocio.  
- `src/dtos/` – Data Transfer Objects para filtrar información sensible (por ejemplo, `currentUser.dto.js`).  
- `src/config/` – Configuraciones de Passport JWT y Nodemailer.  
- `src/middlewares/` – Middleware de autorización por roles.  
- `src/routes/` – Rutas agrupadas por recursos: usuarios (`userRouter`), sesiones (`sessionRouter`), productos (`productsRouter`), carritos (`cartsRouter`) y recuperación de contraseña (`passwordRouter`).
- `src/app.js` – Configuración principal del servidor Express.

## Variables de entorno (`.env`)

Cree un archivo `.env` en la raíz con las siguientes variables:

```
PORT=8080
MONGO_URI=mongodb+srv://<usuario>:<contraseña>@<cluster>/<dbname>?retryWrites=true&w=majority
MONGO_DB=ecommerce
JWT_SECRET=superSecretJWT
RESET_SECRET=superSecretReset
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=tu_correo@gmail.com
MAIL_PASS=tu_app_password
MAIL_FROM="Ecommerce Backend <tu_correo@gmail.com>"
APP_URL=http://localhost:8080
```

**Importante**: reemplace las credenciales según su configuración.  

## Instalación y ejecución

1. Clone el repositorio y entre al directorio:
   ```bash
   git clone https://github.com/Sebastian-Merlassino/backend-II.git
   cd backend-II
   ```
2. Instale las dependencias:
   ```bash
   npm install
   ```
3. Cree el archivo `.env` y configure sus variables.
4. Levante el servidor en desarrollo:
   ```bash
   npm start
   ```
   Verá en consola `✅ Conectado a MongoDB` y `Start Server in Port 8080`.

## Endpoints principales

Las rutas se montan bajo `/api`. Se autenticará a los usuarios con JWT y se autorizará según el rol (`user` o `admin`).

### Autenticación y usuario actual

- **POST /api/sessions/register** – Registra un usuario (por defecto con rol `user`).
- **POST /api/sessions/login** – Inicia sesión; devuelve un `token` JWT y lo guarda en cookie.
- **GET /api/sessions/current** – Devuelve la información del usuario autenticado en formato DTO (sin contraseña).

### Recuperación de contraseña

- **POST /api/password/forgot** – Envía un correo al usuario con un enlace para restablecer la contraseña. El enlace caduca en 1 hora.
- **POST /api/password/reset** – Cambia la contraseña. Recibe `token` y `password` en el body.  
  El token se valida y se impide usar la misma contraseña que la actual.

### Usuarios (CRUD)

- **GET /api/users** – Lista todos los usuarios.  
- **POST /api/users** – Crea un usuario (contraseña hasheada con bcrypt).  
- **PUT /api/users/:uid** – Actualiza un usuario.  
- **DELETE /api/users/:uid** – Elimina un usuario.

### Productos

- **GET /api/products** – Lista todos los productos.  
- **GET /api/products/:pid** – Obtiene un producto por ID.
- **POST /api/products** – Crea un producto (**solo rol admin**).
- **PUT /api/products/:pid** – Actualiza un producto (**solo rol admin**).
- **DELETE /api/products/:pid** – Elimina un producto (**solo rol admin**).

### Carritos y compras

- **POST /api/carts** – Crea un carrito.
- **POST /api/carts/:cid/product/:pid** – Agrega un producto al carrito (**rol user**).  `body` acepta `quantity` (opcional, default 1).
- **POST /api/carts/:cid/purchase** – Realiza la compra del carrito (**rol user**).  
  Verifica stock de cada producto, descuenta stock, genera un ticket y devuelve productos agotados.

### Tickets

Los tickets se generan automáticamente durante la compra y se almacenan en la colección `tickets`.

## Cómo probar la aplicación

### 1. Registrar y loguear usuarios

1. **Registrar un usuario:**
   ```bash
   POST /api/sessions/register
   Content-Type: application/json

   {
     "first_name": "Ana",
     "last_name": "Gómez",
     "age": 30,
     "email": "ana@example.com",
     "password": "secreto"
   }
   ```
2. **Login:**
   ```bash
   POST /api/sessions/login
   Content-Type: application/json

   {
     "email": "ana@example.com",
     "password": "secreto"
   }
   ```
   El servidor devolverá `{ token: <jwt> }` y además guardará la cookie `token` en la respuesta.  
   Puede usar ese JWT para autenticar llamadas protegidas (por cookie o header `Authorization: Bearer <token>`).
3. **Ver usuario actual:**
   ```bash
   GET /api/sessions/current
   Cookie: token=<jwt>
   ```
   Devuelve un JSON con los campos no sensibles (`first_name`, `last_name`, `email`, `role`, `cart`).

### 2. Registrar un administrador

Cree un usuario con email `adminCoder@coder.com` y asignarle rol `admin` manualmente en la base de datos o agregando `role: "admin"` al body del registro.  
Con este usuario podrá crear, actualizar y eliminar productos.

### 3. Crear y gestionar productos

Estando logueado como **admin**:

1. **Crear producto:**
   ```bash
   POST /api/products
   Cookie: token=<jwt-de-admin>
   Content-Type: application/json

   {
     "title": "Remera",
     "description": "Remera algodon",
     "price": 5000,
     "stock": 10,
     "category": "indumentaria"
   }
   ```
2. **Listar productos:** `GET /api/products`
3. **Actualizar producto:**
   ```bash
   PUT /api/products/<productId>
   Cookie: token=<jwt-de-admin>
   Content-Type: application/json

   { "price": 5500, "stock": 8 }
   ```
4. **Eliminar producto:** `DELETE /api/products/<productId>` (solo admin)

### 4. Crear carrito y comprar

Estando logueado como **usuario**:

1. **Crear carrito:** `POST /api/carts`
2. **Agregar producto al carrito:**
   ```bash
   POST /api/carts/<cartId>/product/<productId>
   Cookie: token=<jwt-de-user>
   Content-Type: application/json

   { "quantity": 2 }
   ```
3. **Realizar compra:**
   ```bash
   POST /api/carts/<cartId>/purchase
   Cookie: token=<jwt-de-user>
   ```
   Respuesta:
   - `ticket`: ticket generado (con código, monto y comprador).
   - `outOfStock`: array de productos que no pudieron comprarse por falta de stock.

### 5. Recuperar contraseña

1. **Solicitar reset:**
   ```bash
   POST /api/password/forgot
   Content-Type: application/json

   { "email": "ana@example.com" }
   ```
   Se envía un correo al usuario con un enlace de restablecimiento que contiene un `token`.  **Para pruebas sin enviar correo real**, revise la consola donde se loguea el enlace generado.
2. **Restablecer contraseña:**
   ```bash
   POST /api/password/reset
   Content-Type: application/json

   {
     "token": "<token-del-mail>",
     "password": "nueva_clave"
   }
   ```
   La contraseña nueva no puede ser igual a la anterior y el token expira en 1 hora.

## Notas

- **Roles y autorización:** El middleware `authorizeRoles` se aplica en las rutas sensibles.  
  Las rutas de productos requieren rol `admin`.  Las rutas para agregar al carrito y comprar requieren rol `user`.  Otros roles obtendrán error 403.
- **DTO:** La ruta `/api/sessions/current` usa `CurrentUserDTO` para evitar exponer la contraseña u otros campos sensibles.
- **Patrón Repository:** La lógica de acceso a datos se encapsula en los DAOs; los servicios y rutas usan los repositorios para realizar operaciones.
- **Recuperación de contraseña:** Se implementa con JWT firmado y expiración de 1 hora.  No se permite reutilizar la contraseña anterior.
- **Lógica de compra:** Verifica stock, descuenta existencias, genera ticket y reporta productos sin stock en la respuesta.

---
