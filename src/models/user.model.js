const db = require('../config/db.js');
const { userQuerys } = require('./user.querys.js');

/**
 * Obtiene la lista completa de destinos disponibles.
 * @returns {Promise<Array<Object>>} Lista de todos los destinos.
 */
const getAllDestinos = async () => {
    const { rows } = await db.query(userQuerys.getAllDestinos);
    return rows;
};

/**
 * Realiza una búsqueda de destinos basada en un término.
 * @param {string} termino - Palabra clave para filtrar destinos.
 * @returns {Promise<Array<Object>>} Lista de destinos que coinciden.
 */
const searchDestinos = async (termino) => {
    const { rows } = await db.query(userQuerys.buscarDestinos, [termino]);
    return rows;
};

/**
 * Realiza una búsqueda de usuarios basada en un término.
 * @param {string} termino - Palabra clave (nombre o email) para buscar.
 * @returns {Promise<Array<Object>>} Lista de usuarios encontrados.
 */
const searchUsers = async (termino) => {
    const { rows } = await db.query(userQuerys.buscarUsuarios, [termino]);
    return rows;
};

/**
 * Crea una nueva reseña en la base de datos.
 * @param {string|number} userId - ID del usuario que crea la reseña.
 * @param {string|number} targetId - ID de la entidad reseñada (destino, etc.).
 * @param {string} targetType - Tipo de entidad (ej: 'destination').
 * @param {string} comment - Texto de la reseña.
 * @param {number} stars - Puntuación (1-5).
 * @returns {Promise<Object>} La reseña creada.
 */
const postReview = async (userId, targetId, targetType, comment, stars) => {
    const { rows } = await db.query(userQuerys.crearReview, [userId, targetId, targetType, comment, stars]);
    return rows[0];
};

/**
 * Registra una sugerencia de nuevo destino con estado 'pending'.
 * @param {Object} datos - Datos del destino.
 * @param {string} datos.name - Nombre del destino.
 * @param {string} datos.description - Descripción.
 * @param {string} datos.province - Provincia.
 * @param {Array<string>} datos.images - URLs de imágenes.
 * @param {boolean} datos.is_public - Visibilidad.
 * @param {string|number} userId - ID del usuario creador.
 * @returns {Promise<Object>} El destino creado.
 */
const sugerirDestino = async (datos, userId) => {
    const { name, description, province, images, is_public } = datos;
    const status = 'pending'; 

    const { rows } = await db.query(userQuerys.sugerirDestino, [
        name,         
        description,  
        province,     
        images,       
        status,       
        userId,       
        is_public     
    ]);
    return rows[0];
};

/**
 * Gestiona la lógica de puntos y medallas de gamificación.
 * Asigna puntos por envíos o aprobaciones y otorga medallas si se alcanzan los límites anuales.
 * @param {string|number} userId - ID del usuario.
 * @param {string} type - Tipo de acción ('submission' o 'approval').
 * @returns {Promise<Object>} Resultado de la operación con los nuevos puntos y medallas.
 */
const addGamificationPoints = async (userId, type) => {
    const POINTS_SUBMISSION = 10;
    const POINTS_APPROVAL = 50;
    const LIMIT_YEARLY = 10;
    const MEDAL_VALUE = 100;

    try {
        const { rows } = await db.query(
            'SELECT id, puntuaciontotal, submissions_count, approvals_count, medals FROM Users WHERE id = $1', 
            [userId]
        );
        const user = rows[0];
        let newPoints = user.puntuaciontotal;
        let newMedals = user.medals || [];
        let updated = false;

        if (type === 'submission') {
            if (user.submissions_count < LIMIT_YEARLY) {
                newPoints += POINTS_SUBMISSION;
                await db.query('UPDATE Users SET submissions_count = submissions_count + 1 WHERE id = $1', [userId]);
                updated = true;

                if (user.submissions_count + 1 === LIMIT_YEARLY) {
                    const medalName = `🏅 Constancia ${new Date().getFullYear()}`;
                    newMedals.push({ name: medalName, value: MEDAL_VALUE, date: new Date() });
                    updated = true;
                }
            }
        }

        if (type === 'approval') {
            if (user.approvals_count < LIMIT_YEARLY) {
                newPoints += POINTS_APPROVAL;
                await db.query('UPDATE Users SET approvals_count = approvals_count + 1 WHERE id = $1', [userId]);
                updated = true;

                if (user.approvals_count + 1 === LIMIT_YEARLY) {
                    const medalName = `🌟 Calidad ${new Date().getFullYear()}`;
                    newMedals.push({ name: medalName, value: MEDAL_VALUE, date: new Date() });
                    updated = true;
                }
            }
        }

        if (updated) {
            await db.query(
                'UPDATE Users SET puntuaciontotal = $1, medals = $2 WHERE id = $3',
                [newPoints, JSON.stringify(newMedals), userId]
            );
        }

        return { ok: true, newPoints, newMedals };

    } catch (error) {
        console.error("Error en gamificación:", error);
        return { ok: false };
    }
};

/**
 * Reinicia la temporada para todos los usuarios.
 * Recalcula la puntuación base sumando el valor de las medallas históricas y resetea contadores anuales.
 * @returns {Promise<Object>} Resultado del proceso.
 */
const resetSeason = async () => {
    try {
        const { rows: users } = await db.query('SELECT id, medals FROM Users');

        for (const user of users) {
            let basePoints = 0;
            if (user.medals && Array.isArray(user.medals)) {
                basePoints = user.medals.reduce((sum, medal) => sum + (medal.value || 0), 0);
            }

            await db.query(
                'UPDATE Users SET puntuaciontotal = $1, submissions_count = 0, approvals_count = 0 WHERE id = $2',
                [basePoints, user.id]
            );
        }
        return { ok: true, msg: "Temporada reiniciada correctamente" };
    } catch (error) {
        console.error(error);
        return { ok: false };
    }
};

module.exports = { 
    getAllDestinos,
    searchDestinos, 
    searchUsers,
    postReview, 
    sugerirDestino, 
    addGamificationPoints,
    resetSeason
};