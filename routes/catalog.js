const express = require('express');
const router = express.Router();

// Require Controller Modules
const drill_controller = require('../controllers/drillController');
const design_controller = require('../controllers/designController');
const record_controller = require('../controllers/recordController');

/// Drill Routes ///
router.get('/', drill_controller.index);
router.get('/drill/create', drill_controller.drill_create_get); // this must come before :id
router.post('/drill/create', drill_controller.drill_create_post);
router.get('/drill/:id/delete', drill_controller.drill_delete_get);
router.post('/drill/:id/delete', drill_controller.drill_delete_post);
router.get('/drill/:id/update', drill_controller.drill_update_get);
router.post('/drill/:id/update', drill_controller.drill_update_post);
router.get('/drill/:id', drill_controller.drill_detail);
router.get('/drills', drill_controller.drill_list);

/// Design Routes ///
router.get('/design/create', design_controller.design_create_get); // this must come before :id
router.post('/design/create', design_controller.design_create_post);
router.get('/design/:id/delete', design_controller.design_delete_get);
router.post('/design/:id/delete', design_controller.design_delete_post);
router.get('/design/:id/update', design_controller.design_update_get);
router.post('/design/:id/update', design_controller.design_update_post);
router.get('/design/:id', design_controller.design_detail);
router.get('/designs', design_controller.design_list);

/// Record Routes ///
router.get('/record/create', record_controller.record_create_get); // this must come before :id
router.post('/record/create', record_controller.record_create_post);
router.get('/record/:id/delete', record_controller.record_delete_get);
router.post('/record/:id/delete', record_controller.record_delete_post);
router.get('/record/:id/update', record_controller.record_update_get);
router.post('/record/:id/update', record_controller.record_update_post);
router.get('/record/:id', record_controller.record_detail);
router.get('/records', record_controller.record_list);

module.exports = router;