const db = require('../config/db');
const { queries } = require('./admin.querys');

/**
 * Ejecuta la consulta para obtener todos los usuarios registrados.
 * @returns {Promise<Array<Object>>} Lista de usuarios.
 * @throws {Error} Si falla la consulta a la base de datos.
 */
const getAllUsersModel = async () => {
    try {
        const { rows } = await db.query(queries.getAllUsers);
        return rows;
    } catch (error) {
        console.error("Error en getAllUsersModel:", error);
        throw error;
    }
};

/**
 * Actualiza el rol de un usuario en la base de datos.
 * @param {string} role - El nuevo rol a asignar (ej: 'admin', 'user').
 * @param {string|number} id - El ID del usuario a modificar.
 * @returns {Promise<Object>} El objeto del usuario actualizado.
 * @throws {Error} Si falla la actualización.
 */
const changeRoleModel = async (role, id) => {
    try {
        const { rows } = await db.query(queries.changeUserRole, [role, id]);
        return rows[0];
    } catch (error) {
        console.error("Error en changeRoleModel:", error);
        throw error;
    }
};

/**
 * Obtiene la lista de destinos que están pendientes de aprobación.
 * @returns {Promise<Array<Object>>} Lista de destinos pendientes.
 * @throws {Error} Si falla la consulta.
 */
const getPendientesModel = async () => {
    try {
        const { rows } = await db.query(queries.getDestinosPendientes);
        return rows;
    } catch (error) {
        console.error("Error en getPendientesModel:", error);
        throw error;
    }
};

/**
 * Cambia el estado de un destino a aprobado/activo.
 * @param {string|number} id - El ID del destino a aprobar.
 * @returns {Promise<Object>} El destino actualizado.
 * @throws {Error} Si falla la actualización.
 */
const approveDestinoModel = async (id) => {
    try {
        const { rows } = await db.query(queries.approveDestino, [id]);
        return rows[0];
    } catch (error) {
        console.error("Error en approveDestinoModel:", error);
        throw error;
    }
};

/**
 * Cambia el estado de un destino a rechazado o lo devuelve a pendiente.
 * @param {string|number} id - El ID del destino a rechazar.
 * @returns {Promise<Object>} El destino actualizado.
 * @throws {Error} Si falla la actualización.
 */
const rejectDestinoModel = async (id) => {
    try {
        const { rows } = await db.query(queries.rejectDestino, [id]);
        return rows[0];
    } catch (error) {
        console.error("Error en rejectDestinoModel:", error);
        throw error;
    }
};

/**
 * Elimina una reseña de la base de datos.
 * @param {string|number} id - El ID de la reseña a eliminar.
 * @returns {Promise<Object>} La reseña eliminada
 * @throws {Error} Si falla la eliminación.
 */
const deleteReviewModel = async (id) => {
    try {
        const { rows } = await db.query(queries.deleteReview, [id]);
        return rows[0];
    } catch (error) {
        console.error("Error en deleteReviewModel:", error);
        throw error;
    }
};

module.exports = {
    getAllUsersModel,
    changeRoleModel,
    getPendientesModel,
    approveDestinoModel,
    rejectDestinoModel,
    deleteReviewModel
};