const express = require("express");
const router = express.Router();

const { createUser, loginUser, renewToken } = require("../controllers/auth.controllers");
const { validarJWT } = require("../middlewares/validarToken");
const { check } = require("express-validator");
const { validateInputs } = require("../middlewares/validarInputs");

/**
 * @swagger
 * /signup:
 *   post:
 *     tags: [Autenticación]
 *     summary: Registrar nuevo usuario
 *     description: Crea una nueva cuenta de usuario en el sistema
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Juan Pérez"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "juan@example.com"
 *               contrasenia:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: "password123"
 *             required:
 *               - nombre
 *               - email
 *               - contrasenia
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 uid:
 *                   type: string
 *                 token:
 *                   type: string
 *       400:
 *         description: Error de validación en los datos
 *       500:
 *         description: Error interno del servidor
 */
router.post('/signup', [
    check("nombre").not().isEmpty().withMessage("El nombre es obligatorio"),
    check("email").isEmail().withMessage("Email no válido"),
    check("contrasenia").isLength({ min: 6 }).withMessage("Mínimo 6 caracteres"),
    validateInputs
], createUser);

/**
 * @swagger
 * /login:
 *   post:
 *     tags: [Autenticación]
 *     summary: Iniciar sesión
 *     description: Autentica un usuario y devuelve un token JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "juan@example.com"
 *               contrasenia:
 *                 type: string
 *                 format: password
 *                 example: "password123"
 *             required:
 *               - email
 *               - contrasenia
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 uid:
 *                   type: string
 *                 rol:
 *                   type: string
 *                   example: "user"
 *                 token:
 *                   type: string
 *       401:
 *         description: Credenciales incorrectas
 *       400:
 *         description: Error de validación
 */
router.post('/login', [
    check("email").isEmail(),
    check("contrasenia").not().isEmpty(),
    validateInputs
], loginUser);

/**
 * @swagger
 * /renew:
 *   get:
 *     tags: [Autenticación]
 *     summary: Renovar token JWT
 *     description: Renueva el token de autenticación usando el token actual
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token renovado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 uid:
 *                   type: string
 *                 rol:
 *                   type: string
 *                 token:
 *                   type: string
 *       401:
 *         description: Token inválido o expirado
 */
router.get('/renew', validarJWT, (req, res) => {
    res.json({
        ok: true,
        uid: req.userToken.uid,
        rol: req.userToken.rol,
        token: req.userToken.token 
    });
});

module.exports = router;