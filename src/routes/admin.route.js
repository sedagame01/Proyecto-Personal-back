const { Router } = require('express');
const router = Router();
const { 
    getAllUsers, 
    getUserById, 
    changeRole, 
    deleteUser,
    getPendientes, 
    approveDestino,
    deleteReview,
    getCategories,
    updateDestino,
    updateUser,
    getAllDestinos,
    deleteDestino,
    rejectDestino,
    
} = require('../controllers/admin.controllers.js');

// RUTAS PARA LAS COSAS DF USUARIOS
router.get('/users', getAllUsers);           
router.get('/users/:id', getUserById);        
router.put('/users/role/:id', changeRole);     
router.delete('/users/:id', deleteUser); 
router.put('/users/:id', updateUser);      

// RUTAS PARA LAS COSAS RELACIONADAS CON  DESTINOS
router.get('/destinations/all', getAllDestinos);
router.get('/categories', getCategories);
router.get('/destinations/pending', getPendientes);
router.patch('/destinations/approve/:id', approveDestino); 
router.delete('/destinations/reject/:id', deleteDestino); 
router.delete('/reviews/:id', deleteReview)
router.put('/destinations/:id', updateDestino);
router.patch('/destinations/reject/:id', rejectDestino);



module.exports = router;