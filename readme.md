# Express + Mongoose

## Consigna
- Realizar un proyecto en Node.js que se conecte a una base de datos MongoDB llamada “class-zero” a través de mongoose.
- Crear un model de users llamador “userModel.js” que utilice una colección llamada “users”.
- Crear un router llamado “userRouter.js” que tenga su ruta principal en “/api/users”.
- Desarrollar en el router los endpoints correspondientes al CRUD pensado para trabajar con el model de forma asíncrona.
- Corroborar los resultados con Postman.

> **Estado actual del proyecto:** la base anterior se **profesionalizó** con autenticación y autorización, repos/DAOs, DTOs, mailing para reset de contraseña, manejo de roles y lógica de compra con tickets.

---

# Ecommerce – Autenticación y Autorización (Coderhouse)

Implementación de CRUD de usuarios + autenticación/autorización con **JWT**, **Passport (local + jwt)** y **bcrypt**, patrón **DAO/Repository**, **DTO** para `/current`, **reset de contraseña por email** (link expira a 1h, no permite repetir clave), roles/ownership y **lógica de compra** (tickets, stock).

## Requisitos
- Node 18+ (probado en Node 22)
- MongoDB en `mongodb://127.0.0.1:27017/class-zero`

## Configuración
1. Copiar el ejemplo de entorno y completar valores:
   ```bash
   cp .env.example .env
   ```
2. Instalar dependencias:
   ```bash
   npm i
   ```
3. Iniciar el servidor:
   ```bash
   npm start
   ```

### `.env.example`
```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/class-zero

# JWT
JWT_SECRET=CAMBIA_ESTE_VALOR  # poné un secreto largo/aleatorio
JWT_EXPIRES=1d

# App
NODE_ENV=development
BASE_URL=http://localhost:8080

# SMTP real (opcional: si no los ponés, se usa Ethereal en DEV)
# SMTP_HOST=sandbox.smtp.mailtrap.io
# SMTP_PORT=2525
# SMTP_USER=tu_usuario
# SMTP_PASS=tu_password
# MAIL_FROM="Ecommerce <no-reply@tudominio.com>"
```

> **Mailing DEV:** si faltan las variables SMTP, el sistema usa **Ethereal** automáticamente y muestra en consola un **Email Preview URL** para ver el correo.

#### Generar un `JWT_SECRET` rápido
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Arquitectura (resumen)
- **Modelos (Mongoose):** `users`, `Products`, `Carts`, `Tickets`.
  - `users` incluye `resetPasswordToken` y `resetPasswordExpires`.
- **DAO + Repository:** `src/dao/*.dao.js` y `src/repositories/*.repository.js` para desacoplar acceso a datos y lógica de negocio.
- **DTOs:** `user.dto.js` para `/api/sessions/current` (no expone datos sensibles).
- **Auth & Policies:** middleware `requireAuth` (passport-jwt) y `handlePolicies` (roles). Ownership con `isSelfOrAdmin` y `isCartOwner`.
- **Servicios:** `purchase.service.js` descuenta stock, genera **ticket** (`completed` o `partial`) y deja pendientes en el carrito.
- **Mailing:** `utils/mailer.js` (SMTP por `.env` o Ethereal en DEV).

---

## Endpoints

### Sessions
- `POST /api/sessions/register`  
  Body:
  ```json
  { "first_name": "Kike", "last_name": "Arroyo", "email": "kike@ejemplo.com", "age": 36, "password": "123456" }
  ```
  Crea usuario y **carrito** asociado.
- `POST /api/sessions/login`  
  Body:
  ```json
  { "email": "kike@ejemplo.com", "password": "123456" }
  ```
  Setea cookie `jwt` (HttpOnly) y devuelve `token`.
- `GET /api/sessions/current`  
  Requiere JWT (cookie o `Authorization: Bearer <token>`). Devuelve **DTO** sin campos sensibles.
- `POST /api/sessions/logout`  
  Limpia cookie.
- `POST /api/sessions/forgot-password`  
  Body:
  ```json
  { "email": "kike@ejemplo.com" }
  ```
  Envía link con **token** (expira en 1h).
- `POST /api/sessions/reset-password`  
  Body:
  ```json
  { "token": "<token>", "email": "kike@ejemplo.com", "newPassword": "12345678" }
  ```
  No permite repetir la contraseña anterior.

### Users (protegidos por rol/ownership)
- `GET /api/users` → **admin**
- `GET /api/users/:uid` → **admin** o **mismo usuario**
- `POST /api/users` → **admin** (el alta normal es `/sessions/register`)
- `PUT /api/users/:uid` → **admin** o **mismo usuario**  
  (si cambia `password`, se hashea en `pre('save')`).
- `DELETE /api/users/:uid` → **admin**
- `PATCH /api/users/:uid/role` → **admin** (`user | user_premium | admin`)

### Products
- `GET /api/products` → público
- `GET /api/products/:pid` → público
- `POST /api/products` → **admin**
- `PUT /api/products/:pid` → **admin**
- `DELETE /api/products/:pid` → **admin**

### Carts & Purchase
- `GET /api/carts/:cid` → **user** + **dueño del carrito**
- `POST /api/carts/:cid/products/:pid` → **user** + **dueño** (agrega producto)
- `PUT /api/carts/:cid/products/:pid` → **user** + **dueño** (cambia cantidad)
- `DELETE /api/carts/:cid/products/:pid` → **user** + **dueño** (elimina producto)
- `DELETE /api/carts/:cid` → **user** + **dueño** (vaciar)
- `POST /api/carts/:cid/purchase` → **user** + **dueño**  
  Genera **Ticket** y descuenta stock.  
  - Si todo disponible → `status: "completed"`.  
  - Si faltó stock → `status: "partial"` y deja lo pendiente en el carrito.

---

## Pruebas sugeridas (Postman)
- Login inválido → 401.  
- `/current` sin token → 401; con cookie o Bearer → 200 (DTO sin `password`).  
- Users: listar como `user` → 403; como `admin` → 200.  
- Products: crear/editar/borrar solo `admin`.  
- Carts: ownership estricta (ver/operar solo tu `:cid`).  
- Purchase: stock descuenta, tickets `completed/partial`.  
- Forgot/Reset: link expira en 1h; no permite reutilizar la misma password.

---

## Scripts
```bash
npm start   # Nodemon en src/app.js
```
