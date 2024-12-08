var express = require('express');
var router = express.Router();
const userController = require('../../controllers/admin/user');

router.get('/', userController.SelectAllUser);

router.put('/:id', userController.UpdateUser);

router.delete('/:id', userController.DeleteUser);

router.get('/auth-groups', userController.GetAuthGroups);

router.put('/auth-group', userController.UpdateUserAuthGroup);

module.exports = router;
