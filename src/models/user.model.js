const db = require('../config/db.js');
const { userQuerys } = require('./user.querys.js');

const searchDestinos = async (termino) => {
    const { rows } = await db.query(userQuerys.buscarDestinos, [termino]);
    return rows;
};

const postReview = async (userId, targetId, targetType, comment, stars) => {
    const { rows } = await db.query(userQuerys.crearReview, [userId, targetId, targetType, comment, stars]);
    return rows[0];
};

const sugerirDestino = async (datos, userId) => {
    const { name, description, province, images, is_public } = datos;
    const status = 'pending'; // Estado inicial

    // Importante: El orden de los elementos en el array debe coincidir con $1, $2, etc.
    const { rows } = await db.query(userQuerys.sugerirDestino, [
        name,         // $1
        description,  // $2
        province,     // $3
        images,       // $4
        status,       // $5
        userId,       // $6
        is_public     // $7
    ]);
    return rows[0];
};

const searchUsers = async (termino) => {
    const { rows } = await db.query(userQuerys.buscarUsuarios, [termino]);
    return rows;
};


const addGamificationPoints = async (userId, type) => {
    // Definición de reglas
    const POINTS_SUBMISSION = 10;
    const POINTS_APPROVAL = 50;
    const LIMIT_YEARLY = 10;
    const MEDAL_VALUE = 100; // Puntos que vale tener una medalla al reiniciar

    try {
        // 1. Obtener estado actual del usuario
        const { rows } = await db.query(
            'SELECT id, puntuaciontotal, submissions_count, approvals_count, medals FROM Users WHERE id = $1', 
            [userId]
        );
        const user = rows[0];
        let newPoints = user.puntuaciontotal;
        let newMedals = user.medals || [];
        let updated = false;

        // 2. Lógica para ENVÍO de destino
        if (type === 'submission') {
            if (user.submissions_count < LIMIT_YEARLY) {
                newPoints += POINTS_SUBMISSION;
                // Incrementamos contador
                await db.query('UPDATE Users SET submissions_count = submissions_count + 1 WHERE id = $1', [userId]);
                updated = true;

                // Chequear si ganó medalla (si llegó a 10 justo ahora)
                if (user.submissions_count + 1 === LIMIT_YEARLY) {
                    const medalName = `🏅 Constancia ${new Date().getFullYear()}`;
                    newMedals.push({ name: medalName, value: MEDAL_VALUE, date: new Date() });
                    updated = true;
                }
            }
        }

        // 3. Lógica para APROBACIÓN de destino
        if (type === 'approval') {
            if (user.approvals_count < LIMIT_YEARLY) {
                newPoints += POINTS_APPROVAL;
                // Incrementamos contador
                await db.query('UPDATE Users SET approvals_count = approvals_count + 1 WHERE id = $1', [userId]);
                updated = true;

                // Chequear si ganó medalla
                if (user.approvals_count + 1 === LIMIT_YEARLY) {
                    const medalName = `🌟 Calidad ${new Date().getFullYear()}`;
                    newMedals.push({ name: medalName, value: MEDAL_VALUE, date: new Date() });
                    updated = true;
                }
            }
        }

        // 4. Guardar cambios si hubo puntos nuevos o medallas
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

// Función para REINICIAR TEMPORADA (Se llama cada 6 meses)
const resetSeason = async () => {
    try {
        // 1. Obtener todos los usuarios
        const { rows: users } = await db.query('SELECT id, medals FROM Users');

        // 2. Recalcular puntos base (solo suman las medallas)
        for (const user of users) {
            let basePoints = 0;
            if (user.medals && Array.isArray(user.medals)) {
                // Sumamos el valor de todas sus medallas ganadas históricamente
                basePoints = user.medals.reduce((sum, medal) => sum + (medal.value || 0), 0);
            }

            // 3. Resetear: Puntos = base medallas, Contadores anuales = 0
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


module.exports = { searchDestinos, postReview, sugerirDestino, searchUsers,searchUsers, addGamificationPoints,
    resetSeason };