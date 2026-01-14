#  API de Destinos Turísticos (Backend)

Esta es la API robusta que gestiona la lógica de negocio, autenticación y almacenamiento de la plataforma de destinos turísticos. Construida con **Node.js**, **Express** y **PostgreSQL**.

## Tecnologías Utilizadas

* **Entorno de ejecución:** [Node.js](https://nodejs.org/)
* **Framework Web:** [Express v5](https://expressjs.com/)
* **Base de Datos:** [PostgreSQL](https://www.postgresql.org/) con la librería `pg`.
* **Autenticación:** [JSON Web Tokens (JWT)](https://jwt.io/) y [BcryptJS](https://github.com/dcodeIO/bcrypt.js) para el hasheo de contraseñas.
* **Gestión de Archivos:** [Multer](https://github.com/expressjs/multer) para la subida de imágenes de destinos.
* **Documentación:** [Swagger UI](https://swagger.io/) para la especificación de la API.
* **Validación:** `express-validator`.

##  Sistema de Roles y Funcionalidades

El backend diferencia claramente entre la experiencia del usuario y las herramientas de control administrativo.

###  Módulo de Usuario (Viajero)
Ubicado en `user.controllers.js` y `user.model.js`.
* **Perfil Evolutivo:** Los usuarios acumulan **puntos** y **medallas** (logros) basados en su actividad.
* **Aportaciones:** Pueden sugerir destinos. Estos se crean con estado `pending` hasta que un admin los revisa.
* **Privacidad:** Control total sobre si sus destinos son `is_public` o privados.
* **Interacción:** Sistema de reseñas (reviews) de destinos con calificación por estrellas.

###  Módulo de Administrador (Moderador)
Ubicado en `admin.controllers.js` y `admin.model.js`.
* **Panel de Moderación:** Flujo de aprobación (`approve`) o rechazo (`reject`) de destinos pendientes.
* **Gestión de Comunidad:** * Edición de perfiles de cualquier usuario.
    * Control de roles (ej. convertir a un usuario en moderador).
    * Eliminación de contenido inapropiado (destinos o reseñas).
* **Control de Temporada:** Función especial `resetSeason` que:
    1. Reinicia los contadores de envíos anuales.
    2. Recalcula la puntuación base sumando el valor de las medallas históricas.


##  Requisitos Previos

* Node.js v18 o superior.
* Instancia de PostgreSQL activa.
* Yarn o NPM.

##  Configuración e Instalación

1.  **Instalar dependencias:**
    ```bash
    npm install
    ```

2.  **Variables de Entorno:**
    Crea un archivo `.env` en la raíz de la carpeta `server/` con los siguientes campos:
    ```env
    PORT=3000
    DB_USER=tu_usuario
    DB_HOST=localhost
    DB_NAME=nombre_db
    DB_PASSWORD=tu_password
    DB_PORT=5432
    JWT_SECRET=tu_clave_secreta_super_segura
    ```

3.  **Scripts Disponibles:**
   * `npm run dev`: Inicia el servidor con recarga automática (Nodemon).
    * `npm start`: Ejecución en producción.
    * `npm run docs`: Genera documentación técnica estática con JSDoc.
    * `npm run build`: Prepara el entorno y carpetas de subida.

##  Estructura del Proyecto

```text
server/
├── public/upload/  # Almacenamiento local de imágenes subidas por Multer
├── src/
│   ├── app.js      # Punto de entrada y configuración de Express
│   ├── routes/     # Definición de rutas (auth, destinos, admin)
│   ├── controllers/# Lógica de los endpoints
│   ├── middlewares/# Validaciones de JWT y roles
│   ├── models/     # Consultas a la base de datos PostgreSQL
│   └── config/     # Configuración de base de datos y Swagger
└── jsdoc.json      # Configuración de documentación de código