const userModel = require('../models/user.model.js');
const db = require('../config/db.js');
const { userQuerys } = require('../models/user.querys.js');
const { saveImage } = require("../middlewares/upload");

/**
 * Obtiene todos los destinos disponibles en la base de datos.
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} res - Objeto de respuesta de Express.
 * @returns {Promise<void>} Lista completa de destinos.
 */
const getAllDestinos = async (req, res) => {
    try {
        const data = await userModel.getAllDestinos();
        return res.status(200).json({ ok: true, data });
    } catch (error) {
        console.error("Error al obtener todos los destinos:", error);
        return res.status(500).json({ ok: false, msg: "Error del servidor" });
    }
};

/**
 * Obtiene una lista limitada de destinos destacados activos.
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} res - Objeto de respuesta de Express.
 * @returns {Promise<void>} Lista de destinos destacados.
 */
const getDestinosDestacados = async (req, res) => {
    try {
        const { rows } = await db.query("SELECT * FROM Destinations WHERE status = 'active' LIMIT 6");
        res.json({ ok: true, data: rows });
    } catch (error) {
        console.error("Algo falla en getDestinosDestacados:", error);
        res.json({ ok: true, data: [] });
    }
};

/**
 * Busca destinos o usuarios basándose en un término de búsqueda.
 * @param {Object} req - Objeto de solicitud.
 * @param {Object} req.query - Parámetros de consulta.
 * @param {string} [req.query.value] - Término a buscar.
 * @param {string} [req.query.type] - Tipo de búsqueda ('users' o defecto destinos).
 * @param {Object} res - Objeto de respuesta.
 * @returns {Promise<void>} Resultados de la búsqueda.
 */
const buscarDestino = async (req, res) => {
    const { value, type } = req.query;
    try {
        let data = [];
        if (type === 'users') {
            const { rows } = await db.query(userQuerys.buscarUsuarios, [value || '']);
            data = rows;
        } else {
            data = await userModel.searchDestinos(value || '');
        }
        return res.status(200).json({ ok: true, data });
    } catch (error) {
        console.error("Algo falla en buscarDestino:", error);
        return res.status(500).json({ ok: false, msg: "Error al buscar" });
    }
};

/**
 * Obtiene el detalle de un destino específico y sus reseñas.
 * @param {Object} req - Objeto de solicitud.
 * @param {Object} req.params - Parámetros de ruta.
 * @param {string} req.params.id - ID del destino.
 * @param {Object} res - Objeto de respuesta.
 * @returns {Promise<void>} Objeto con detalle del destino y array de reseñas.
 */
const getDestinoDetalle = async (req, res) => {
    const { id } = req.params;
    try {
        const { rows: destino } = await db.query(userQuerys.obtenerDestinoPorId, [id]);
        
        if (destino.length === 0) {
            return res.status(404).json({ ok: false, msg: "Destino no encontrado" });
        }

        const { rows: reviews } = await db.query(userQuerys.obtenerReviewsDestino, [id]);

        res.json({ 
            ok: true, 
            data: { ...destino[0], reviews } 
        });
    } catch (error) {
        console.error("Algo falla en getDestinoDetalle:", error); 
        res.status(500).json({ ok: false, msg: error.message || "Error al obtener detalle" });
    }
};

/**
 * Permite a un usuario sugerir un nuevo destino.
 * @param {Object} req - Objeto de solicitud.
 * @param {Object} req.userToken - Token decodificado del usuario.
 * @param {Object} [req.file] - Archivo de imagen subido (opcional).
 * @param {Object} req.body - Datos del destino.
 * @param {Object} res - Objeto de respuesta.
 * @returns {Promise<void>} Confirmación de creación.
 */
const sugerirNuevoDestino = async (req, res) => {
    try {
        const userId = req.userToken.uid; 
        if (!userId) return res.status(401).json({ ok: false, msg: "Usuario no identificado" });

        if (req.file){
            const imgUrl = saveImage(req.file);
            req.body.images = [imgUrl];
        }

        const data = await userModel.sugerirDestino(req.body, userId);
        
        await userModel.addGamificationPoints(userId, 'submission');

        return res.status(201).json({ ok: true, data });
    } catch (error) {
        console.error("Algo falla en sugerirNuevoDestino:", error);
        return res.status(500).json({ ok: false, msg: "Error al insertar el destino" });
    }
};

/**
 * Obtiene los destinos creados por un usuario específico.
 * @param {Object} req - Objeto de solicitud.
 * @param {Object} req.params - Parámetros de ruta.
 * @param {string} req.params.id - ID del usuario.
 * @param {Object} res - Objeto de respuesta.
 * @returns {Promise<void>} Lista de destinos del usuario.
 */
const getUserDestinos = async (req, res) => {
    const { id } = req.params;
    try {
        const { rows } = await db.query(userQuerys.obtenerMisDestinos, [id]);
        res.json({ ok: true, data: rows });
    } catch (error) {
        console.error("Algo falla en getUserDestinos:", error);
        res.json({ ok: true, data: [] });
    }
};

/**
 * Actualiza la información de un destino creado por el usuario.
 * @param {Object} req - Objeto de solicitud.
 * @param {Object} req.body - Nuevos datos del destino.
 * @param {Object} req.params - Parámetros de ruta (ID del destino).
 * @param {Object} res - Objeto de respuesta.
 * @returns {Promise<void>} Confirmación de actualización.
 */
const updateDestinoUsuario = async (req, res) => {
    try {
        const { rowCount } = await db.query(
            userQuerys.updateDestino, 
            [
                req.body.name,
                req.body.description,
                req.body.province,
                req.body.images,
                req.body.is_public,
                req.params.id
            ]
        );
        if (!rowCount) return res.status(404).json({ ok: false, msg: 'Destino no encontrado' });
        
        return res.status(200).json({ ok: true, msg: 'Destino actualizado' });
    } catch (error) {
        console.error('Error en updateDestinoUsuario:', error);
        return res.status(500).json({ ok: false, msg: 'Error al actualizar destino' });
    }
};

/**
 * Elimina un destino creado por el usuario autenticado.
 * @param {Object} req - Objeto de solicitud.
 * @param {Object} req.params - Parámetros de ruta (ID del destino).
 * @param {Object} req.userToken - Token del usuario (para verificar propiedad).
 * @param {Object} res - Objeto de respuesta.
 * @returns {Promise<void>} Confirmación de eliminación.
 */
const deleteUserDestino = async (req, res) => {
    const { id } = req.params;
    const userId = req.userToken.uid; 

    try {
        await db.query('DELETE FROM Destinations WHERE id = $1 AND createdby = $2', [id, userId]);
        res.json({ ok: true, msg: "Destino eliminado" });
    } catch (error) {
        console.error("Algo falla en deleteUserDestino:", error);
        res.status(500).json({ ok: false, msg: "Error al eliminar" });
    }
};

/**
 * Obtiene el perfil público de un usuario.
 * @param {Object} req - Objeto de solicitud.
 * @param {Object} req.params - Parámetros de ruta (ID usuario).
 * @param {Object} res - Objeto de respuesta.
 * @returns {Promise<void>} Datos públicos del usuario.
 */
const getUserProfile = async (req, res) => {
    const { id } = req.params;
    try {
        const { rows } = await db.query(`
            SELECT id, username, email, role, puntuaciontotal, created_at
            FROM Users 
            WHERE id = $1
        `, [id]);
        
        if (rows.length === 0) return res.status(404).json({ ok: false, msg: "Usuario no encontrado" });
        
        res.json({ ok: true, data: rows[0] });
    } catch (error) {
        console.error("Algo falla en getUserProfile:", error);
        res.status(500).json({ ok: false, msg: "Error al obtener perfil" });
    }
};

/**
 * Actualiza el perfil del usuario autenticado.
 * @param {Object} req - Objeto de solicitud.
 * @param {Object} req.userToken - Token del usuario.
 * @param {Object} req.body - Nuevos datos (username, email).
 * @param {Object} res - Objeto de respuesta.
 * @returns {Promise<void>} Datos del usuario actualizado.
 */
const actualizarPerfil = async (req, res) => {
    if (!req.userToken) return res.status(401).json({ ok: false, msg: "Sin autorización" });

    const userId = req.userToken.uid;
    const { username, email } = req.body;

    try {
        const { rows } = await db.query(userQuerys.actualizarPerfil, [username, email, userId]);
        res.status(200).json({ ok: true, msg: "Perfil actualizado", user: rows[0] });
    } catch (error) {
        console.error("Algo falla en actualizarPerfil:", error);
        res.status(500).json({ ok: false, msg: "Error al actualizar perfil" });
    }
};

/**
 * Obtiene el top de usuarios basado en puntuación total.
 * @param {Object} req - Objeto de solicitud.
 * @param {Object} res - Objeto de respuesta.
 * @returns {Promise<void>} Lista de usuarios top.
 */
const getTopUsuarios = async (req, res) => {
    try {
        const { rows } = await db.query("SELECT id, username, puntuaciontotal FROM Users ORDER BY puntuaciontotal DESC LIMIT 5");
        res.json({ ok: true, data: rows });
    } catch (error) {
        console.error("Algo falla en getTopUsuarios:", error);
        res.json({ ok: true, data: [] });
    }
};

/**
 * Crea una nueva reseña para un destino.
 * @param {Object} req - Objeto de solicitud.
 * @param {Object} req.body - Datos de la reseña (targetId, comment, stars).
 * @param {Object} req.userToken - Token del usuario autor.
 * @param {Object} res - Objeto de respuesta.
 * @returns {Promise<void>} Confirmación de creación.
 */
const crearReview = async (req, res) => {
    const { targetId, targetType, comment, stars } = req.body;
    const userId = req.userToken.uid;

    try {
        const data = await userModel.postReview(userId, targetId, targetType, comment, stars);
        return res.status(201).json({ ok: true, msg: "Review creada", data });
    } catch (error) {
        console.error("Algo falla en crearReview:", error);
        return res.status(500).json({ ok: false, msg: "Error al crear review" });
    }
};

/**
 * Obtiene las reseñas escritas por un usuario específico.
 * @param {Object} req - Objeto de solicitud.
 * @param {Object} req.params - Parámetros de ruta (ID usuario).
 * @param {Object} res - Objeto de respuesta.
 * @returns {Promise<void>} Lista de reseñas del usuario.
 */
const getUserReviews = async (req, res) => {
    const { id } = req.params;
    try {
        const query = userQuerys.obtenerMisReviews || `
            SELECT r.*, d.name as "targetName"
            FROM Reviews r
            LEFT JOIN Destinations d ON r."targetId" = d.id
            WHERE r."userId" = $1 AND r."targetType" = 'destination'
            ORDER BY r.created_at DESC
        `;
        const { rows } = await db.query(query, [id]);
        res.json({ ok: true, data: rows });
    } catch (error) {
        console.error("Algo falla en getUserReviews:", error);
        res.json({ ok: true, data: [] });
    }
};

/**
 * Reinicia la temporada de gamificación (Solo Admin).
 * @param {Object} req - Objeto de solicitud.
 * @param {Object} req.userToken - Token del usuario (debe ser admin).
 * @param {Object} res - Objeto de respuesta.
 * @returns {Promise<void>} Confirmación de reinicio.
 */
const resetearTemporada = async (req, res) => {
    try {
        if (req.userToken.rol !== 'admin') {
            return res.status(403).json({ ok: false, msg: "Solo admins" });
        }

        const result = await userModel.resetSeason();
        if (result.ok) {
            res.json({ ok: true, msg: "¡Temporada reiniciada! Puntos reseteados a base de medallas." });
        } else {
            throw new Error("El modelo retornó false al intentar resetear");
        }
    } catch (error) {
        console.error("Algo falla en resetearTemporada:", error);
        res.status(500).json({ ok: false, msg: "Error al reiniciar temporada" });
    }
};

module.exports = { 
    getAllDestinos,
    getDestinosDestacados,
    buscarDestino,
    getDestinoDetalle,
    sugerirNuevoDestino,
    getUserDestinos,
    updateDestinoUsuario,
    deleteUserDestino,
    getUserProfile,
    actualizarPerfil,
    getTopUsuarios,
    crearReview,
    getUserReviews,
    resetearTemporada
};