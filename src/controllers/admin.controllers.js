const db = require('../config/db');
const { queries } = require('../models/admin.querys');
const userModel = require('../models/user.model');
const { sendOk, sendError } = require('../helpers/response');

/**
 * Obtiene la lista completa de usuarios registrados.
 * @param {Object} _ - Objeto de solicitud (no utilizado).
 * @param {Object} res - Objeto de respuesta de Express.
 * @returns {Promise} Responde con la lista de usuarios o un error.
 */
const getAllUsers = async (_, res) => {
    try {
        const { rows } = await db.query(queries.getAllUsers);
        sendOk(res, rows);
    } catch (error) {
        console.error('Error en getAllUsers:', error);
        sendError(res, 'Error al obtener usuarios');
    }
};

/**
 * Obtiene el perfil de un usuario específico por su ID.
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} req.params - Parámetros de la ruta.
 * @param {string|number} req.params.id - ID del usuario a buscar.
 * @param {Object} res - Objeto de respuesta de Express.
 * @returns {Promise} Responde con los datos del usuario o error 404 si no existe.
 */
const getUserById = async (req, res) => {
    try {
        const { rows } = await db.query(queries.getUserProfile, [req.params.id]);
        if (!rows.length) return sendError(res, 'Usuario no encontrado', 404);
        sendOk(res, rows[0]);
    } catch (error) {
        console.error('Error en getUserById:', error);
        sendError(res, 'Error de servidor');
    }
};

/**
 * Actualiza la información general de un usuario (username, email, rol).
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} req.params - Parámetros de la ruta.
 * @param {string|number} req.params.id - ID del usuario a actualizar.
 * @param {Object} req.body - Cuerpo de la solicitud con los nuevos datos.
 * @param {string} req.body.username - Nuevo nombre de usuario.
 * @param {string} req.body.email - Nuevo correo electrónico.
 * @param {string} req.body.role - Nuevo rol del usuario.
 * @param {Object} res - Objeto de respuesta de Express.
 * @returns {Promise} Responde con confirmación o error.
 */
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email, role } = req.body;

        const { rowCount } = await db.query(
            'UPDATE Users SET username = $1, email = $2, role = $3 WHERE id = $4',
            [username, email, role, id]
        );

        if (rowCount === 0) return sendError(res, 'Usuario no encontrado', 404);
        
        sendOk(res, null, 'Usuario actualizado');
    } catch (error) {
        console.error('Error en updateUser:', error);
        sendError(res, 'Error al actualizar usuario');
    }
};

/**
 * Cambia específicamente el rol de un usuario.
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} req.params - Parámetros de la ruta.
 * @param {string|number} req.params.id - ID del usuario.
 * @param {Object} req.body - Cuerpo de la solicitud.
 * @param {string} req.body.role - El nuevo rol a asignar.
 * @param {Object} res - Objeto de respuesta de Express.
 * @returns {Promise} Responde con el usuario actualizado o error.
 */
const changeRole = async (req, res) => {
    try {
        const { rowCount, rows } = await db.query(
            queries.changeUserRole,
            [req.body.role, req.params.id]
        );
        if (!rowCount) return sendError(res, 'Usuario no encontrado', 404);
        sendOk(res, rows[0], 'Rol actualizado');
    } catch (error) {
        console.error('Error en changeRole:', error);
        sendError(res, 'Error al actualizar rol');
    }
};

/**
 * Elimina un usuario del sistema.
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} req.params - Parámetros de la ruta.
 * @param {string|number} req.params.id - ID del usuario a eliminar.
 * @param {Object} res - Objeto de respuesta de Express.
 * @returns {Promise} Responde con confirmación o error.
 */
const deleteUser = async (req, res) => {
    try {
        const { rowCount } = await db.query(queries.deleteUser, [req.params.id]);
        if (!rowCount) return sendError(res, 'Usuario no encontrado', 404);
        sendOk(res, null, 'Usuario eliminado');
    } catch (error) {
        console.error('Error en deleteUser:', error);
        sendError(res, 'Error al eliminar usuario');
    }
};

/**
 * Obtiene la lista de todos los destinos.
 * @param {Object} _ - Objeto de solicitud (no utilizado).
 * @param {Object} res - Objeto de respuesta de Express.
 * @returns {Promise} Responde con la lista de destinos.
 */
const getAllDestinos = async (_, res) => {
    try {
        const { rows } = await db.query(queries.getAllDestinos);
        sendOk(res, rows);
    } catch (error) {
        console.error('Error en getAllDestinos:', error);
        sendError(res, 'Error al obtener destinos');
    }
};

/**
 * Obtiene los destinos que están pendientes de aprobación.
 * @param {Object} _ - Objeto de solicitud (no utilizado).
 * @param {Object} res - Objeto de respuesta de Express.
 * @returns {Promise} Responde con la lista de destinos pendientes.
 */
const getPendientes = async (_, res) => {
    try {
        const { rows } = await db.query(queries.getDestinosPendientes);
        sendOk(res, rows);
    } catch (error) {
        console.error('Error en getPendientes:', error);
        sendError(res, 'Error al obtener pendientes');
    }
};

/**
 * Aprueba un destino pendiente y asigna puntos de gamificación al creador.
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} req.params - Parámetros de la ruta.
 * @param {string|number} req.params.id - ID del destino a aprobar.
 * @param {Object} res - Objeto de respuesta de Express.
 * @returns {Promise} Responde con confirmación de aprobación.
 */
const approveDestino = async (req, res) => {
    try {
        const { id } = req.params;

        const { rowCount } = await db.query(queries.approveDestino, [id]);

        if (rowCount === 0) {
            return sendError(res, 'Destino no encontrado', 404);
        }

        const { rows } = await db.query('SELECT createdby FROM Destinations WHERE id = $1', [id]);
        const creatorId = rows[0]?.createdby;

        if (creatorId) {
            await userModel.addGamificationPoints(creatorId, 'approval');
            console.log(`[GAMIFICATION] Puntos asignados al usuario ${creatorId} por aprobación.`);
        }

        sendOk(res, null, 'Destino aprobado y puntos asignados al creador');
    } catch (error) {
        console.error('Error en approveDestino:', error); 
        sendError(res, 'Error al aprobar destino');
    }
};

/**
 * Rechaza un destino (lo devuelve a estado pendiente o rechazado) y resta puntos al creador.
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} req.params - Parámetros de la ruta.
 * @param {string|number} req.params.id - ID del destino a rechazar.
 * @param {Object} res - Objeto de respuesta de Express.
 * @returns {Promise} Responde con confirmación de rechazo.
 */
const rejectDestino = async (req, res) => {
    try {
        const { id } = req.params;

        const { rowCount } = await db.query(queries.rejectDestino, [id]);

        if (rowCount === 0) {
            return sendError(res, 'Destino no encontrado', 404);
        }

        const { rows } = await db.query('SELECT createdby FROM Destinations WHERE id = $1', [id]);
        const creatorId = rows[0]?.createdby;

        if (creatorId) {
            await userModel.addGamificationPoints(creatorId, 'rejection');
            console.log(`[GAMIFICATION] Puntos restados al usuario ${creatorId} por rechazo.`);
        }

        sendOk(res, null, 'Destino rechazado y puntos restados al creador');
    } catch (error) {
        console.error('Error en rejectDestino:', error); 
        sendError(res, 'Error al rechazar destino');
    }
};

/**
 * Actualiza la información de un destino existente.
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} req.params - Parámetros de la ruta.
 * @param {string|number} req.params.id - ID del destino.
 * @param {Object} req.body - Cuerpo de la solicitud con los datos del destino.
 * @param {string} req.body.name - Nombre del destino.
 * @param {string} req.body.description - Descripción.
 * @param {string} req.body.province - Provincia.
 * @param {Array} req.body.images - Array de imágenes.
 * @param {boolean} req.body.is_public - Estado de visibilidad.
 * @param {Object} res - Objeto de respuesta de Express.
 * @returns {Promise} Responde con confirmación de actualización.
 */
const updateDestino = async (req, res) => {
    try {
        const { rowCount } = await db.query(
            queries.updateDestino,
            [
                req.body.name,
                req.body.description,
                req.body.province,
                req.body.images,
                req.body.is_public,
                req.params.id
            ]
        );
        if (!rowCount) return sendError(res, 'Destino no encontrado', 404);
        sendOk(res, null, 'Destino actualizado');
    } catch (error) {
        console.error('Error en updateDestino:', error);
        sendError(res, 'Error al actualizar destino');
    }
};

/**
 * Elimina un destino, incluyendo sus referencias en categorías y reseñas.
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} req.params - Parámetros de la ruta.
 * @param {string|number} req.params.id - ID del destino a eliminar.
 * @param {Object} res - Objeto de respuesta de Express.
 * @returns {Promise} Responde con confirmación de eliminación.
 */
const deleteDestino = async (req, res) => {
    try {
        const { id } = req.params;

        await db.query('DELETE FROM DestinationCategories WHERE destination_id = $1', [id]);
        
        await db.query('DELETE FROM Reviews WHERE "targetId" = $1 AND "targetType" = \'destination\'', [id]);
 
        const { rowCount } = await db.query(queries.deleteDestino, [id]);

        if (rowCount === 0) return sendError(res, 'Destino no encontrado', 404);

        sendOk(res, null, 'Destino eliminado correctamente');

    } catch (error) {
        console.error("Error en deleteDestino:", error.message);
        sendError(res, 'Error de base de datos: ' + error.message);
    }
};

/**
 * Elimina una reseña específica.
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} req.params - Parámetros de la ruta.
 * @param {string|number} req.params.id - ID de la reseña a eliminar.
 * @param {Object} res - Objeto de respuesta de Express.
 * @returns {Promise} Responde con confirmación de eliminación.
 */
const deleteReview = async (req, res) => {
    try {
        const { rowCount } = await db.query(queries.deleteReview, [req.params.id]);
        if (!rowCount) return sendError(res, 'Reseña no encontrada', 404);
        sendOk(res, null, 'Reseña eliminada');
    } catch (error) {
        console.error('Error en deleteReview:', error);
        sendError(res, 'Error al eliminar reseña');
    }
};

/**
 * Obtiene la lista de todas las categorías disponibles.
 * @param {Object} _ - Objeto de solicitud (no utilizado).
 * @param {Object} res - Objeto de respuesta de Express.
 * @returns {Promise} Responde con la lista de categorías.
 */
const getCategories = async (_, res) => {
    try {
        const { rows } = await db.query(queries.getAllCategories);
        sendOk(res, rows);
    } catch (error) {
        console.error('Error en getCategories:', error);
        sendError(res, 'Error al obtener categorias');
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    updateUser,
    changeRole,
    deleteUser,
    getAllDestinos,
    getPendientes,
    approveDestino,
    rejectDestino,
    updateDestino,
    deleteDestino,
    deleteReview,
    getCategories
};