const userModel = require('../models/user.model.js');
const db = require('../config/db.js');
const { userQuerys } = require('../models/user.querys.js');

// 1. BUSCADOR (usuarios y destinos)
const buscarDestino = async (req, res) => {
    const { value, type } = req.query;
    try {
        let data = [];
        if (type === 'users') {
            if (!userQuerys.buscarUsuarios) throw new Error("algo pasa con userQuerys.buscarUsuarios en buscarDestino");
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

// 2. CREAR REVIEW
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

// 3. SUGERIR DESTINO
const sugerirNuevoDestino = async (req, res) => {
    try {
        const userId = req.userToken.uid; 
        if (!userId) return res.status(401).json({ ok: false, msg: "Usuario no identificado" });

        const data = await userModel.sugerirDestino(req.body, userId);
        
        await userModel.addGamificationPoints(userId, 'submission');

        return res.status(201).json({ ok: true, data });
    } catch (error) {
        console.error("Algo falla en sugerirNuevoDestino:", error);
        return res.status(500).json({ ok: false, msg: "Error al insertar el destino" });
    }
};

// 4. ACTUALIZAR PERFIL
const actualizarPerfil = async (req, res) => {
    if (!req.userToken) return res.status(401).json({ ok: false, msg: "Sin autorización" });

    const userId = req.userToken.uid;
    const { username, email } = req.body;

    try {
        if (!userQuerys.actualizarPerfil) throw new Error("algo pasa con userQuerys.actualizarPerfil en actualizarPerfil");

        const { rows } = await db.query(userQuerys.actualizarPerfil, [username, email, userId]);
        res.status(200).json({ ok: true, msg: "Perfil actualizado", user: rows[0] });
    } catch (error) {
        console.error("Algo falla en actualizarPerfil:", error);
        res.status(500).json({ ok: false, msg: "Error al actualizar perfil" });
    }
};

// 5. DESTINOS DESTACADOS
const getDestinosDestacados = async (req, res) => {
    try {
        const { rows } = await db.query("SELECT * FROM Destinations WHERE status = 'active' LIMIT 6");
        res.json({ ok: true, data: rows });
    } catch (error) {
        console.error("Algo falla en getDestinosDestacados:", error);
        res.json({ ok: true, data: [] });
    }
};

// 6. TOP USUARIOS
const getTopUsuarios = async (req, res) => {
    try {
        const { rows } = await db.query("SELECT id, username, puntuaciontotal FROM Users ORDER BY puntuaciontotal DESC LIMIT 5");
        res.json({ ok: true, data: rows });
    } catch (error) {
        console.error("Algo falla en getTopUsuarios:", error);
        res.json({ ok: true, data: [] });
    }
};

// 7. PERFIL PÚBLICO
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

// 8. MIS DESTINOS
const getUserDestinos = async (req, res) => {
    const { id } = req.params;
    try {
        if (!userQuerys.obtenerMisDestinos) throw new Error("algo pasa con userQuerys.obtenerMisDestinos en getUserDestinos");

        const { rows } = await db.query(userQuerys.obtenerMisDestinos, [id]);
        res.json({ ok: true, data: rows });
    } catch (error) {
        console.error("Algo falla en getUserDestinos:", error);
        res.json({ ok: true, data: [] });
    }
};

// 9. MIS REVIEWS
const getUserReviews = async (req, res) => {
    const { id } = req.params;
    try {
        const query = userQuerys.obtenerMisReviews || `
            SELECT r.*, d.name as "targetName"
            FROM Reviews r
            LEFT JOIN Destinations d ON r."targetId" = d.id
            WHERE r."userId" = $1 AND r."targetType" = 'destination'
            ORDER BY r.created_at DESC
        `;//por si falla que ha fallado al actualizar varias veces
        const { rows } = await db.query(query, [id]);
        res.json({ ok: true, data: rows });
    } catch (error) {
        console.error("Algo falla en getUserReviews:", error);
        res.json({ ok: true, data: [] });
    }
};

// 10. ELIMINAR DESTINO
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

// 11. DETALLE DE DESTINO
const getDestinoDetalle = async (req, res) => {
    const { id } = req.params;
    try {
        if (!userQuerys.obtenerDestinoPorId) throw new Error("algo pasa con userQuerys.obtenerDestinoPorId en getDestinoDetalle");
        if (!userQuerys.obtenerReviewsDestino) throw new Error("algo pasa con userQuerys.obtenerReviewsDestino en getDestinoDetalle");

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

// 12. RESETEAR TEMPORADA
const resetearTemporada = async (req, res) => {
    try {
        if (req.userToken.rol !== 'admin')/* solo el admin resetea hacerlo luego auto */ {
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

const updateDestinoUsuario = async (req, res) => {
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

const getAllDestinos = async (req, res) => {
    try {
        const data = await userModel.getAllDestinos();
        return res.status(200).json({ ok: true, data });
    } catch (error) {
        console.error("Error al obtener todos los destinos:", error);
        return res.status(500).json({ ok: false, msg: "Error del servidor" });
    }
};

module.exports = { 
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
};