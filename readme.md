# Express + Mongoose

## Consigna

    - Realizar un proyecto en Node.js que se conecte a una base de datos MongoDB llamada “class-zero” a través de mongoose.
    - Crear un model de users llamador “userModel.js” que utilice una colección llamada “users” y tenga la siguiente estructura de datos:
        - name: string, required.
        - age: number, required.
        - email: string, required, unique.
    - Crear un router llamado “userRouter.js” que tenga su ruta principal en “/api/users”.
    - Desarrollar en el router los endpoints correspondientes al CRUD pensado para trabajar con el model de forma asíncrona.
    - Corroborar los resultados con Postman.


    # Ecommerce – Autenticación y Autorización (Coderhouse)

Implementación de CRUD de usuarios + autenticación/authorization con **JWT**, **Passport** y **bcrypt**.

## Requisitos

- Node 18+ (probado en Node 22)
- MongoDB en `mongodb://127.0.0.1:27017/class-zero`

## Configuración

1. `cp .env.example .env` y completar valores.
2. `npm i`
3. `npm start`

## Endpoints

### Sessions

- `POST /api/sessions/register`  
  Body: `{ first_name, last_name, email, age, password }`
- `POST /api/sessions/login`  
  Body: `{ email, password }` → setea cookie `jwt` (HttpOnly) y devuelve `token`.
- `GET /api/sessions/current`  
  Requiere JWT (cookie o `Authorization: Bearer <token>`).
- `POST /api/sessions/logout`  
  Limpia cookie.

### Users (protegidos por rol)

- `GET /api/users` → **admin**
- `GET /api/users/:uid` → **admin** o **mismo usuario**
- `POST /api/users` → **admin** (alta normal por `/sessions/register`)
- `PUT /api/users/:uid` → **admin** o **mismo usuario**  
  (si cambia `password`, se hashea en `pre('save')`)
- `DELETE /api/users/:uid` → **admin**
- `PATCH /api/users/:uid/role` → **admin** (`user | user_premium | admin`)
