/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Gestión de perfiles de usuario y operaciones de usuarios registrados
 * 
 * components:
 *   schemas:
 *     Usuario:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del usuario
 *         nombre:
 *           type: string
 *           description: Nombre completo del usuario
 *         email:
 *           type: string
 *           format: email
 *           description: Correo electrónico
 *         fotoPerfil:
 *           type: string
 *           description: URL de la foto de perfil
 *         rol:
 *           type: string
 *           enum: [user, admin, moderator]
 *           default: user
 *         createdAt:
 *           type: string
 *           format: date-time
 * 
 *     Destino:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del destino
 *         nombre:
 *           type: string
 *           description: Nombre del destino turístico
 *         descripcion:
 *           type: string
 *           description: Descripción detallada
 *         pais:
 *           type: string
 *           description: País donde se encuentra
 *         ciudad:
 *           type: string
 *           description: Ciudad donde se encuentra
 *         categoria:
 *           type: string
 *           description: Categoría (playa, montaña, etc.)
 *         estado:
 *           type: string
 *           enum: [aprobado, pendiente, rechazado]
 *           default: pendiente
 *         temporada:
 *           type: string
 *           enum: [alta, media, baja]
 *         fotos:
 *           type: array
 *           items:
 *             type: string
 *           description: URLs de las fotos del destino
 *         usuarioId:
 *           type: integer
 *           description: ID del usuario que creó el destino
 * 
 *     Review:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         contenido:
 *           type: string
 *         calificacion:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         destinoId:
 *           type: integer
 *         usuarioId:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 */

const { Router } = require('express');
const {upload} = require("../middlewares/upload");
const { 
    buscarDestino, 
    crearReview, 
    sugerirNuevoDestino,
    actualizarPerfil,
    getDestinosDestacados,
    getTopUsuarios,
    getUserProfile,      
    getUserDestinos,   
    getUserReviews,
    deleteUserDestino,
    getDestinoDetalle,
    resetearTemporada,
    updateDestinoUsuario,
    getAllDestinos      
} = require('../controllers/user.controllers.js');

const { validarJWT } = require('../middlewares/validarToken.js'); 
const router = Router();

/**
 * @swagger
 * /user/buscar:
 *   get:
 *     tags: [Usuarios]
 *     summary: Buscar destinos
 *     description: Busca destinos turísticos por diferentes criterios (público)
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Término de búsqueda (nombre, descripción)
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: string
 *         description: Filtrar por categoría específica
 *       - in: query
 *         name: pais
 *         schema:
 *           type: string
 *         description: Filtrar por país
 *       - in: query
 *         name: ciudad
 *         schema:
 *           type: string
 *         description: Filtrar por ciudad
 *     responses:
 *       200:
 *         description: Lista de destinos encontrados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Destino'
 *       404:
 *         description: No se encontraron destinos con los criterios especificados
 */
// Ruta pública
router.get('/buscar', buscarDestino);

/**
 * @swagger
 * /user/destinos/destacados:
 *   get:
 *     tags: [Usuarios]
 *     summary: Destinos destacados
 *     description: Obtiene los destinos más populares o mejor valorados (público)
 *     responses:
 *       200:
 *         description: Lista de destinos destacados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Destino'
 */
// Rutas PÚBLICAS para el home
router.get('/destinos/destacados', getDestinosDestacados);

/**
 * @swagger
 * /user/usuarios/top:
 *   get:
 *     tags: [Usuarios]
 *     summary: Top usuarios
 *     description: Obtiene los usuarios más activos o con más contribuciones (público)
 *     responses:
 *       200:
 *         description: Lista de usuarios destacados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Usuario'
 */
router.get('/usuarios/top', getTopUsuarios);

/**
 * @swagger
 * /user/usuarios/{id}:
 *   get:
 *     tags: [Usuarios]
 *     summary: Obtener perfil de usuario
 *     description: Obtiene el perfil público de un usuario específico
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Perfil del usuario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       404:
 *         description: Usuario no encontrado
 */
// Rutas para perfil (públicas algunas)
router.get('/usuarios/:id', getUserProfile);

/**
 * @swagger
 * /user/usuarios/{id}/destinos:
 *   get:
 *     tags: [Usuarios]
 *     summary: Obtener destinos de un usuario
 *     description: Lista todos los destinos creados por un usuario específico
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Lista de destinos del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Destino'
 *       404:
 *         description: Usuario no encontrado o no tiene destinos
 */
router.get('/usuarios/:id/destinos', getUserDestinos);

/**
 * @swagger
 * /user/usuarios/{id}/reviews:
 *   get:
 *     tags: [Usuarios]
 *     summary: Obtener reseñas de un usuario
 *     description: Lista todas las reseñas escritas por un usuario específico
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Lista de reseñas del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 *       404:
 *         description: Usuario no encontrado o no tiene reseñas
 */
router.get('/usuarios/:id/reviews', getUserReviews);

/**
 * @swagger
 * /user/destinos/detalle/{id}:
 *   get:
 *     tags: [Usuarios]
 *     summary: Obtener detalle de destino
 *     description: Obtiene información detallada de un destino específico
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del destino
 *     responses:
 *       200:
 *         description: Detalle completo del destino
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Destino'
 *       404:
 *         description: Destino no encontrado
 */
router.get('/destinos/detalle/:id', getDestinoDetalle);

/**
 * @swagger
 * /user/review:
 *   post:
 *     tags: [Usuarios]
 *     summary: Crear reseña
 *     description: Crea una nueva reseña para un destino (requiere autenticación)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - contenido
 *               - calificacion
 *               - destinoId
 *             properties:
 *               contenido:
 *                 type: string
 *                 description: Texto de la reseña
 *               calificacion:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Calificación de 1 a 5 estrellas
 *               destinoId:
 *                 type: integer
 *                 description: ID del destino que se está reseñando
 *     responses:
 *       201:
 *         description: Reseña creada exitosamente
 *       400:
 *         description: Datos inválidos o ya existe una reseña para este destino
 *       401:
 *         description: No autorizado - Token inválido o faltante
 *       404:
 *         description: Destino no encontrado
 */
// Rutas protegidas (Necesitan Token)
router.post('/review', validarJWT, crearReview);

/**
 * @swagger
 * /user/sugerir:
 *   post:
 *     tags: [Usuarios]
 *     summary: Sugerir nuevo destino
 *     description: Sugiere un nuevo destino turístico para ser aprobado por administradores
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - descripcion
 *               - pais
 *               - ciudad
 *               - categoria
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               pais:
 *                 type: string
 *               ciudad:
 *                 type: string
 *               categoria:
 *                 type: string
 *               temporada:
 *                 type: string
 *                 enum: [alta, media, baja]
 *                 description: Mejor temporada para visitar
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Imagen del destino (opcional)
 *     responses:
 *       201:
 *         description: Destino sugerido exitosamente (estado pendiente)
 *       400:
 *         description: Datos inválidos o faltantes
 *       401:
 *         description: No autorizado
 */
router.post('/sugerir', [validarJWT,upload.single('file')], sugerirNuevoDestino);

/**
 * @swagger
 * /user/profile:
 *   put:
 *     tags: [Usuarios]
 *     summary: Actualizar perfil propio
 *     description: Actualiza la información del perfil del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               fotoPerfil:
 *                 type: string
 *     responses:
 *       200:
 *         description: Perfil actualizado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       409:
 *         description: El email ya está en uso
 */
router.put('/profile', validarJWT, actualizarPerfil);

/**
 * @swagger
 * /user/usuarios/{id}:
 *   put:
 *     tags: [Usuarios]
 *     summary: Actualizar perfil de usuario
 *     description: Actualiza la información de un usuario específico (mismo usuario o admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               fotoPerfil:
 *                 type: string
 *     responses:
 *       200:
 *         description: Perfil actualizado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permisos para actualizar este perfil
 *       404:
 *         description: Usuario no encontrado
 */
router.put('/usuarios/:id', validarJWT, actualizarPerfil);

/**
 * @swagger
 * /user/destinos/{id}:
 *   delete:
 *     tags: [Usuarios]
 *     summary: Eliminar destino propio
 *     description: Elimina un destino creado por el usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del destino a eliminar
 *     responses:
 *       204:
 *         description: Destino eliminado exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No es el propietario del destino
 *       404:
 *         description: Destino no encontrado
 */
router.delete('/destinos/:id', validarJWT, deleteUserDestino);

/**
 * @swagger
 * /user/admin/reset-season:
 *   post:
 *     tags: [Usuarios]
 *     summary: Resetear temporada (Admin)
 *     description: Operación administrativa para resetear temporadas de destinos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Temporada reseteada exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Se requiere rol de administrador
 */
router.post('/admin/reset-season', validarJWT, resetearTemporada);

/**
 * @swagger
 * /user/destinations/{id}:
 *   put:
 *     tags: [Usuarios]
 *     summary: Actualizar destino (usuario)
 *     description: Actualiza un destino creado por el usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del destino a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Destino'
 *     responses:
 *       200:
 *         description: Destino actualizado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No es el propietario del destino
 *       404:
 *         description: Destino no encontrado
 */
router.put('/destinations/:id', updateDestinoUsuario);

/**
 * @swagger
 * /user/destinos:
 *   get:
 *     tags: [Usuarios]
 *     summary: Obtener todos los destinos
 *     description: Obtiene una lista de todos los destinos disponibles
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Límite de resultados
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [aprobado, pendiente, rechazado]
 *         description: Filtrar por estado
 *     responses:
 *       200:
 *         description: Lista de destinos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 destinos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Destino'
 *                 total:
 *                   type: integer
 *                 pagina:
 *                   type: integer
 *                 totalPaginas:
 *                   type: integer
 */
router.get('/destinos', getAllDestinos);

module.exports = router;