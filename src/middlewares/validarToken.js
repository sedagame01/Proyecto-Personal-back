const jwt = require("jsonwebtoken");

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