const db = require('../config/db');
const { queries } = require('../models/admin.querys');
const userModel = require('../models/user.model');

const { sendOk, sendError } = require('../helpers/response')

//-------------- USUARIOS...................
// obtener todos los user
const getAllUsers = async (_, res) => {
    try {
        const { rows } = await db.query(queries.getAllUsers);
        sendOk(res, rows);
    } catch (error) {
        console.error('Error en getAllUsers:', error);
        sendError(res, 'Error al obtener usuarios');
    }
};
//obtener user por id 
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
//cambiar rol user
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
//modificar daros user
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email } = req.body;

        const { rowCount } = await db.query(
            'UPDATE Users SET username = $1, email = $2 WHERE id = $3',
            [username, email, id]
        );

        if (rowCount === 0) return sendError(res, 'Usuario no encontrado', 404);
        
        sendOk(res, null, 'Usuario actualizado');
    } catch (error) {
        console.error('Error en updateUser:', error);
        sendError(res, 'Error al actualizar usuario');
    }
};
//eliminar user
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


// ---------------DESTINOS---------------
//aceptar destino
const approveDestino = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. APROBAR EL DESTINO
        const { rowCount } = await db.query(queries.approveDestino, [id]);

        if (rowCount === 0) {
            return sendError(res, 'Destino no encontrado', 404);
        }

        // 2. GAMIFICACIÓN: Buscar creador
        const { rows } = await db.query('SELECT createdby FROM Destinations WHERE id = $1', [id]);
        const creatorId = rows[0]?.createdby;

        if (creatorId) {
            // Asignar puntos y logros
            await userModel.addGamificationPoints(creatorId, 'approval');
            console.log(`[GAMIFICATION] Puntos asignados al usuario ${creatorId} por aprobación.`);
        }

        sendOk(res, null, 'Destino aprobado y puntos asignados al creador');
    } catch (error) {
        console.error('Error en approveDestino:', error); 
        sendError(res, 'Error al aprobar destino');
    }
};

// obtener todos los destinos 
const getAllDestinos = async (_, res) => {
    try {
        const { rows } = await db.query(queries.getAllDestinos);
        sendOk(res, rows);
    } catch (error) {
        console.error('Error en getAllDestinos:', error);
        sendError(res, 'Error al obtener destinos');
    }
};

// obtener los destinos pendientes 
const getPendientes = async (_, res) => {
    try {
        const { rows } = await db.query(queries.getDestinosPendientes);
        sendOk(res, rows);
    } catch (error) {
        console.error('Error en getPendientes:', error);
        sendError(res, 'Error al obtener pendientes');
    }
};
//modificar info destino 
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

//eliminar destino
const deleteDestino = async (req, res) => {
    try {
        const { id } = req.params;

        // Eliminar referencias en categorías
        await db.query('DELETE FROM DestinationCategories WHERE destination_id = $1', [id]);
        
        // CORRECCIÓN AQUÍ: Añadir comillas dobles a "targetId" y "targetType"
        await db.query('DELETE FROM Reviews WHERE "targetId" = $1 AND "targetType" = \'destination\'', [id]);

        // Borrar destino
        const { rowCount } = await db.query(queries.deleteDestino, [id]);

        if (rowCount === 0) return sendError(res, 'Destino no encontrado', 404);

        sendOk(res, null, 'Destino eliminado correctamente');

    } catch (error) {
        console.error("Error en deleteDestino:", error.message);
        sendError(res, 'Error de base de datos: ' + error.message);
    }
};


// -----------------RESEÑAS-------------------

//eliminar reseña
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

// obtener categoria
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
    changeRole,
    updateUser,
    deleteUser,
    approveDestino,
    getAllDestinos,
    getPendientes,
    deleteReview,
    deleteDestino,
    getCategories,
    updateDestino
};