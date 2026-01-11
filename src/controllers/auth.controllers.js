const bcrypt = require("bcryptjs");
const { findOne, anadir_usuario } = require("../models/auth.model");
const { JWTGenerator } = require("../helpers/jwt");

const createUser = async (req, res) => {
    try {
        const { nombre, email, contrasenia } = req.body;

        const existe = await findOne(email);
        if (existe) {
            return res.status(401).json({
                ok: false,
                msg: "Correo ya registrado"
            });
        }

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(contrasenia, salt);

        const savedUser = await anadir_usuario(nombre, email, hashedPassword, 'user');

        const payload = {
            uid: savedUser.id,
            rol: savedUser.role
        };

        const token = await JWTGenerator(payload);

        return res.status(200).json({
            ok: true,
            msg: "Usuario registrado",
            uid: savedUser.id,
            username: savedUser.username,
            token
        });

    } catch (error) {
        return res.status(500).json({
            ok: false,
            msg: "Error en el servidor"
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, contrasenia } = req.body;

        const usuario = await findOne(email);
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                msg: "Credenciales incorrectas"
            });
        }

        const passwordOk = bcrypt.compareSync(contrasenia, usuario.password);
        if (!passwordOk) {
            return res.status(401).json({
                ok: false,
                msg: "Credenciales incorrectas"
            });
        }

        const payload = {
            uid: usuario.id,
            rol: usuario.role
        };

        const token = await JWTGenerator(payload);

        return res.status(200).json({
            ok: true,
            msg: "Login exitoso",
            usuario: {
                id: usuario.id,
                username: usuario.username,
                email: usuario.email,
                role: usuario.role
            },
            token
        });

    } catch (error) {
        return res.status(500).json({
            ok: false,
            msg: "Error en el servidor"
        });
    }
};

const renewToken = async (req, res) => {
    const { uid, rol } = req.userToken;

    try {
        const token = await JWTGenerator({ uid, rol });

        return res.status(200).json({
            ok: true,
            uid,
            rol,
            token
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            msg: "Error al renovar token"
        });
    }
};

module.exports = {
    createUser,
    loginUser,
    renewToken
};