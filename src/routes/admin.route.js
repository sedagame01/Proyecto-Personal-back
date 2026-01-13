const { Router } = require('express');
const router = Router();
const { 
    getAllUsers, 
    getUserById, 
    changeRole, 
    deleteUser,
    getPendientes, 
    approveDestino,
    deleteReview,
    getCategories,
    updateDestino,
    updateUser,
    getAllDestinos,
    deleteDestino,
    rejectDestino,
} = require('../controllers/admin.controllers.js');

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Operaciones administrativas del sistema
 */

/**
 * @swagger
 * /admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: Obtener todos los usuarios
 *     description: Obtiene una lista completa de todos los usuarios registrados en el sistema (requiere rol admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Usuario'
 *       401:
 *         description: No autorizado - Token inválido o faltante
 *       403:
 *         description: Prohibido - El usuario no tiene rol de administrador
 *       500:
 *         description: Error interno del servidor
 */
router.get('/users', getAllUsers);

/**
 * @swagger
 * /admin/users/{id}:
 *   get:
 *     tags: [Admin]
 *     summary: Obtener usuario por ID
 *     description: Obtiene la información detallada de un usuario específico por su ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único del usuario
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       404:
 *         description: Usuario no encontrado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido - Permisos insuficientes
 */
router.get('/users/:id', getUserById);

/**
 * @swagger
 * /admin/users/role/{id}:
 *   put:
 *     tags: [Admin]
 *     summary: Cambiar rol de usuario
 *     description: Cambia el rol de un usuario (user/admin/moderator) - Solo para administradores
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del usuario a modificar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rol
 *             properties:
 *               rol:
 *                 type: string
 *                 enum: [user, admin, moderator]
 *                 example: "admin"
 *                 description: Nuevo rol del usuario
 *     responses:
 *       200:
 *         description: Rol actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Rol actualizado correctamente"
 *                 usuario:
 *                   $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Rol no válido o datos incorrectos
 *       404:
 *         description: Usuario no encontrado
 *       403:
 *         description: Prohibido - No tienes permisos para cambiar roles
 */
router.put('/users/role/:id', changeRole);

/**
 * @swagger
 * /admin/users/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: Eliminar usuario
 *     description: Elimina permanentemente un usuario del sistema
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del usuario a eliminar
 *     responses:
 *       204:
 *         description: Usuario eliminado exitosamente (sin contenido)
 *       404:
 *         description: Usuario no encontrado
 *       403:
 *         description: Prohibido - No puedes eliminar este usuario
 *       500:
 *         description: Error al eliminar el usuario
 */
router.delete('/users/:id', deleteUser);

/**
 * @swagger
 * /admin/users/{id}:
 *   put:
 *     tags: [Admin]
 *     summary: Actualizar información de usuario
 *     description: Actualiza la información de un usuario específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
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
 *                 example: "Nuevo Nombre"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "nuevo@email.com"
 *               fotoPerfil:
 *                 type: string
 *                 example: "https://ejemplo.com/foto.jpg"
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *       400:
 *         description: Datos de entrada inválidos
 *       404:
 *         description: Usuario no encontrado
 *       409:
 *         description: El email ya está en uso por otro usuario
 */
router.put('/users/:id', updateUser);

/**
 * @swagger
 * /admin/destinations/all:
 *   get:
 *     tags: [Admin]
 *     summary: Obtener todos los destinos
 *     description: Obtiene una lista completa de todos los destinos, independientemente de su estado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de destinos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Destino'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido - Se requiere rol de administrador
 */
router.get('/destinations/all', getAllDestinos);

/**
 * @swagger
 * /admin/categories:
 *   get:
 *     tags: [Admin]
 *     summary: Obtener todas las categorías
 *     description: Obtiene la lista de todas las categorías de destinos disponibles
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de categorías
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "1"
 *                   nombre:
 *                     type: string
 *                     example: "Playa"
 *                   descripcion:
 *                     type: string
 *                     example: "Destinos playeros"
 *       500:
 *         description: Error interno del servidor
 */
router.get('/categories', getCategories);

/**
 * @swagger
 * /admin/destinations/pending:
 *   get:
 *     tags: [Admin]
 *     summary: Obtener destinos pendientes
 *     description: Obtiene la lista de destinos que están esperando aprobación
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de destinos pendientes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Destino'
 *       204:
 *         description: No hay destinos pendientes
 *       401:
 *         description: No autorizado
 */
router.get('/destinations/pending', getPendientes);

/**
 * @swagger
 * /admin/destinations/approve/{id}:
 *   patch:
 *     tags: [Admin]
 *     summary: Aprobar destino
 *     description: Cambia el estado de un destino a "aprobado" para que sea visible públicamente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del destino a aprobar
 *     responses:
 *       200:
 *         description: Destino aprobado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Destino aprobado correctamente"
 *                 destino:
 *                   $ref: '#/components/schemas/Destino'
 *       404:
 *         description: Destino no encontrado
 *       400:
 *         description: El destino ya está aprobado
 *       403:
 *         description: Prohibido - Se requiere rol de administrador
 */
router.patch('/destinations/approve/:id', approveDestino);

/**
 * @swagger
 * /admin/destinations/reject/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: Eliminar destino (rechazar)
 *     description: Elimina permanentemente un destino rechazado del sistema
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del destino a eliminar
 *     responses:
 *       204:
 *         description: Destino eliminado exitosamente
 *       404:
 *         description: Destino no encontrado
 *       403:
 *         description: Prohibido - No se puede eliminar un destino aprobado
 */
router.delete('/destinations/reject/:id', deleteDestino);

/**
 * @swagger
 * /admin/reviews/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: Eliminar reseña
 *     description: Elimina una reseña inapropiada o que infringe las normas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la reseña a eliminar
 *     responses:
 *       204:
 *         description: Reseña eliminada exitosamente
 *       404:
 *         description: Reseña no encontrada
 *       403:
 *         description: Prohibido - Permisos insuficientes
 */
router.delete('/reviews/:id', deleteReview);

/**
 * @swagger
 * /admin/destinations/{id}:
 *   put:
 *     tags: [Admin]
 *     summary: Actualizar destino
 *     description: Actualiza la información completa de un destino específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Destino'
 *       400:
 *         description: Datos de entrada inválidos
 *       404:
 *         description: Destino no encontrado
 */
router.put('/destinations/:id', updateDestino);

/**
 * @swagger
 * /admin/destinations/reject/{id}:
 *   patch:
 *     tags: [Admin]
 *     summary: Rechazar destino
 *     description: Cambia el estado de un destino a "rechazado" sin eliminarlo
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del destino a rechazar
 *     responses:
 *       200:
 *         description: Destino rechazado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Destino rechazado"
 *                 destino:
 *                   $ref: '#/components/schemas/Destino'
 *       404:
 *         description: Destino no encontrado
 *       400:
 *         description: El destino ya está rechazado o aprobado
 */
router.patch('/destinations/reject/:id', rejectDestino);

module.exports = router;