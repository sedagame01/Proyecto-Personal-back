const db = require('../config/db.js');
const authQuerys = require("./auth.querys");

/**
 * Busca un usuario en la base de datos por su dirección de correo electrónico.
 * @param {string} email - El correo electrónico a buscar.
 * @returns {Promise<Object|null>} Retorna el objeto del usuario si existe, o null si no se encuentra.
 * @throws {Error} Si ocurre un error durante la consulta a la base de datos.
 */
const findOne = async (email) => {
    try {
        const { rows } = await db.query(authQuerys.findOne, [email]);
        return rows[0] || null;
    } catch (error) {
        throw error;
    }
};

/**
 * Inserta un nuevo registro de usuario en la base de datos.
 * @param {string} nombre - Nombre de usuario.
 * @param {string} email - Correo electrónico único.
 * @param {string} hashedPassword - Contraseña previamente encriptada (hash).
 * @param {string} id_rol - Identificador o nombre del rol (ej: 'user', 'admin').
 * @returns {Promise<Object>} Retorna el objeto del usuario recién creado.
 * @throws {Error} Si falla la inserción (ej: email duplicado, error de conexión).
 */
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