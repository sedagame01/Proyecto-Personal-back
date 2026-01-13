const jwt = require("jsonwebtoken");

/**
 * Middleware para validar la autenticidad 
 * * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} req.headers - Cabeceras de la petición.
 * @param {string} [req.headers.authorization] - Token en formato 'Bearer <token>'.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función para pasar al siguiente middleware.
 * @returns {void|Object} Llama a next() si es válido, o retorna respuesta JSON 401 si falla.
 */
const validarJWT = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        return res.status(401).json({
            ok: false,
            msg: "No hay token en la petición"
        });
    }

    try {
        const token = authHeader.split(" ")[1];
        const payload = jwt.verify(token, process.env.SECRET_KEY);

        if (!payload) {
            return res.status(401).json({ ok: false, msg: "Token no válido" });
        }

        req.userToken = {
            uid: payload.uid || payload.id,
            rol: payload.rol
        };

        next();
    } catch (error) {
        return res.status(401).json({ ok: false, msg: "Token expirado o inválido" });
    }
};

module.exports = { validarJWT };