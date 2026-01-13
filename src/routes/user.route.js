const { Router } = require('express');
const { 
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
} = require('../controllers/user.controllers.js');

const { validarJWT } = require('../middlewares/validarToken.js'); 
const router = Router();

// Ruta pública
router.get('/buscar', buscarDestino);

// Rutas PÚBLICAS para el home
router.get('/destinos/destacados', getDestinosDestacados);
router.get('/usuarios/top', getTopUsuarios);

// Rutas para perfil (públicas algunas)
router.get('/usuarios/:id', getUserProfile);
router.get('/usuarios/:id/destinos', getUserDestinos);
router.get('/usuarios/:id/reviews', getUserReviews);
router.get('/destinos/detalle/:id', getDestinoDetalle);

// Rutas protegidas (Necesitan Token)
router.post('/review', validarJWT, crearReview); 
router.post('/sugerir', validarJWT, sugerirNuevoDestino);
router.put('/profile', validarJWT, actualizarPerfil);
router.put('/usuarios/:id', validarJWT, actualizarPerfil);
router.delete('/destinos/:id', validarJWT, deleteUserDestino); 
router.post('/admin/reset-season', validarJWT, resetearTemporada);
router.put('/destinations/:id', updateDestinoUsuario);
router.get('/destinos', getAllDestinos);


module.exports = router;