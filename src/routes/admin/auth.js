var express = require('express');
var router = express.Router();
var controller = require('../../controllers/admin/auth');

router.get('/', controller.SelectAllAuth);

router.get('/groups', controller.SelectAllAuthGroups);

router.post('/groups', controller.CreateAuthGroup);

router.put('/groups/:id', controller.UpdateAuthGroup);

router.delete('/groups/:id', controller.DeleteAuthGroup);

module.exports = router;
