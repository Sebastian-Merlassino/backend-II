# E‑commerce backend – Entrega 1: CRUD de usuarios y autenticación JWT


## 📦 Requisitos

- **Node.js** versión ≥ 18
- **MongoDB** (Atlas o local)
- Variables de entorno (archivo `.env` en la raíz):
  - `MONGO_URI`: cadena de conexión a MongoDB (por ejemplo, `mongodb+srv://<user>:<pass>@cluster.mongodb.net` o `mongodb://localhost:27017/ecommerce`).
  - `MONGO_DB`: nombre de la base de datos (por defecto `ecommerce`).
  - `JWT_SECRET`: clave secreta utilizada para firmar los tokens (puedes establecer, por ejemplo, `secretJWT`).
  - `PORT` (opcional): puerto en el que se ejecutará el servidor (por defecto `8080`).

## 🔧 Instalación

1. **Clonar el repositorio**

   ```bash
   git clone https://github.com/Sebastian-Merlassino/backend-II.git
   cd backend-II
   ```

2. **Instalar dependencias**

   ```bash
   npm install
   ```

3. **Configurar las variables de entorno**

   Crea un archivo `.env` en la raíz del proyecto y completa al menos las siguientes variables:

   ```env
   MONGO_URI=mongodb://localhost:27017
   MONGO_DB=ecommerce
   JWT_SECRET=secretJWT
   PORT=8080
   ```

   Ajusta la URI según tu instalación de MongoDB.

## ▶️ Ejecución

Inicia el servidor con el comando:

```bash
npm start
```

En la consola se mostrará `✅ Conectado a MongoDB` si la conexión fue exitosa y luego `Start Server in Port 8080` (o el puerto configurado).

## 📚 Estructura del proyecto

- `src/app.js`: configuración principal de Express, conexión a MongoDB y registro de rutas.
- `src/models/userModel.js`: esquema de Mongoose para los usuarios, con los campos solicitados:
  - `first_name` (String)
  - `last_name` (String)
  - `email` (String, único)
  - `age` (Number)
  - `password` (String en formato hash)
  - `cart` (Id que referencia a la colección `carts`)
  - `role` (String, por defecto `'user'`)
- `src/models/cartModel.js`: esquema básico de carrito.
- `src/utils.js`: utilidades para hashear y validar contraseñas mediante **bcrypt**.
- `src/config/passport.config.js`: configuración de **Passport** con estrategia **JWT**.
- `src/routes/userRouter.js`: CRUD completo de usuarios.
- `src/routes/sessionRouter.js`: manejo de registro, login y ruta `/current` para devolver el usuario autenticado.

## 🚀 Endpoints disponibles

### Usuarios

Los endpoints de `/api/users` permiten realizar un CRUD sobre la colección de usuarios:

- **`GET /api/users`** – devuelve la lista completa de usuarios.
- **`POST /api/users`** – crea un usuario nuevo.  Campos requeridos: `first_name`, `last_name`, `age`, `email`, `password`.  Opcionalmente puede enviarse `role` y `cart`; en su ausencia se asignan los valores por defecto.  La contraseña se almacena en formato hash.
- **`PUT /api/users/:uid`** – actualiza los datos de un usuario identificado por `uid`.  Permite modificar `first_name`, `last_name`, `age`, `email`, `password` y `role`.  Si se envía un nuevo `password`, se vuelve a hashear.
- **`DELETE /api/users/:uid`** – elimina un usuario.

### Sesiones y autenticación

Los endpoints de `/api/sessions` gestionan el registro y la autenticación de usuarios mediante JWT:

- **`POST /api/sessions/register`** – registra un nuevo usuario.  Requiere `first_name`, `last_name`, `age`, `email` y `password`.  Los campos `role` y `cart` se asignan por defecto (rol `'user'` y carrito `null`).  La contraseña se hashea usando **bcrypt**.
- **`POST /api/sessions/login`** – inicia sesión.  Recibe `email` y `password`.  Si las credenciales son válidas:
  - Se genera un **JSON Web Token** con el id y el rol del usuario.
  - Se devuelve el token en la respuesta y también se guarda en una cookie HTTP‑Only llamada `token`.
- **`GET /api/sessions/current`** – devuelve los datos del usuario logueado.  Esta ruta está protegida por la estrategia JWT de Passport; requiere que el token sea válido.  Si el token no existe o es inválido, Passport responde con error 401.

## 🧪 Cómo probar la API

A continuación se describe un flujo de prueba típico usando [Postman](https://www.postman.com/) o `curl`.  Supongamos que el servidor corre en `http://localhost:8080`.

1. **Registrar un usuario**

   ```bash
   curl -X POST http://localhost:8080/api/sessions/register \
        -H "Content-Type: application/json" \
        -d '{
             "first_name": "Sebastián",
             "last_name": "Merlassino",
             "age": 30,
             "email": "user@example.com",
             "password": "1234"
           }'
   ```

   La respuesta indicará `status: success` y devolverá los datos del nuevo usuario.

2. **Iniciar sesión**

   ```bash
   curl -X POST http://localhost:8080/api/sessions/login \
        -H "Content-Type: application/json" \
        -d '{
             "email": "user@example.com",
             "password": "1234"
           }'
   ```

   La respuesta contiene un objeto `payload` con el token.  Además, la cookie `token` se establecerá en la respuesta.  Guarda este token para los siguientes pasos.

3. **Obtener el usuario actual**

   Utiliza el token recibido en el paso anterior (o deja que Postman reenvíe automáticamente la cookie `token`):

   ```bash
   curl http://localhost:8080/api/sessions/current \
        -H "Authorization: Bearer <tu_token_aquí>"
   ```

   La respuesta mostrará el objeto `user` sin incluir la contraseña.

4. **Probar rutas de CRUD de usuarios**

   - **Listar usuarios**: `curl http://localhost:8080/api/users`
   - **Crear usuario** (versión CRUD): igual que en el registro, usando `POST /api/users`.
   - **Actualizar**: `curl -X PUT http://localhost:8080/api/users/<uid> -H "Content-Type: application/json" -d '{"first_name":"NuevoNombre"}'`
   - **Eliminar**: `curl -X DELETE http://localhost:8080/api/users/<uid>`

## 📝 Notas para la corrección

- El proyecto **no incluye** la carpeta `node_modules` en el repositorio, tal como requiere la consigna.
- El modelo de usuario implementa todos los campos especificados y utiliza **bcrypt.hashSync** para almacenar contraseñas en formato hashhttps://github.com/Sebastian-Merlassino/backend-II/blob/main/src/models/userModel.js#L23-L34.
- Se ha configurado **Passport** con una estrategia **JWT** que extrae el token de la cookie `token` o de la cabecera `Authorization`https://github.com/Sebastian-Merlassino/backend-II/blob/main/src/config/passport.config.js#L16-L37.  Cuando el token es válido, `req.user` contiene el usuario; de lo contrario, se devuelve un error.
- Las rutas de sesión gestionan el **login** y devuelven un token JWT, mientras que la ruta `/api/sessions/current` valida el token y devuelve el usuario asociadohttps://github.com/Sebastian-Merlassino/backend-II/blob/main/src/routes/sessionRouter.js#L63-L70.
- Las pruebas descritas permiten verificar la correcta operación del sistema de autenticación y del CRUD de usuarios.