const db = require('../config/db'); // Importamos el Pool de tu db.js
const { queries } = require('./admin.querys'); // Importamos tus queries SQL

const getAllUsersModel = async () => {
    try {
        const { rows } = await db.query(queries.getAllUsers);
        return rows;
    } catch (error) {
        console.error("Error en getAllUsersModel:", error);
        throw error;
    }
};

const changeRoleModel = async (role, id) => {
    try {
        const { rows } = await db.query(queries.changeUserRole, [role, id]);
        return rows[0];
    } catch (error) {
        console.error("Error en changeRoleModel:", error);
        throw error;
    }
};

const getPendientesModel = async () => {
    try {
        const { rows } = await db.query(queries.getDestinosPendientes);
        return rows;
    } catch (error) {
        console.error("Error en getPendientesModel:", error);
        throw error;
    }
};

const approveDestinoModel = async (id) => {
    try {
        const { rows } = await db.query(queries.approveDestino, [id]);
        return rows[0];
    } catch (error) {
        console.error("Error en approveDestinoModel:", error);
        throw error;
    }
};

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
    deleteReviewModel
};