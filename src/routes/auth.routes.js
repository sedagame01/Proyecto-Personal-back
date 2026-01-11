const express = require("express");
const router = express.Router();

const { createUser, loginUser, renewToken } = require("../controllers/auth.controllers");
const { validarJWT } = require("../middlewares/validarToken");
const { check } = require("express-validator");
const { validateInputs } = require("../middlewares/validarInputs");

router.post('/signup', [
    check("nombre").not().isEmpty().withMessage("El nombre es obligatorio"),
    check("email").isEmail().withMessage("Email no válido"),
    check("contrasenia").isLength({ min: 6 }).withMessage("Mínimo 6 caracteres"),
    validateInputs
], createUser); 

router.post('/login', [
    check("email").isEmail(),
    check("contrasenia").not().isEmpty(),
    validateInputs
], loginUser);

router.get('/renew', validarJWT, (req, res) => {
    res.json({
        ok: true,
        uid: req.userToken.uid,
        rol: req.userToken.rol,
        token: req.userToken.token 
    });
});

module.exports = router;