const db = require('../config/db.js');
const authQuerys = require("./auth.querys");

const findOne = async (email) => {
    try {
        const { rows } = await db.query(authQuerys.findOne, [email]);
        return rows[0] || null;
    } catch (error) {
        throw error;
    }
};

const anadir_usuario = async (nombre, email, hashedPassword, id_rol) => {
    try {
        const { rows } = await db.query(authQuerys.anadir_usuario, [nombre, email, hashedPassword, id_rol]);
        return rows[0];
    } catch (error) {
        throw error;
    }
};

module.exports = {
    findOne,
    anadir_usuario
};