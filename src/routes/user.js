var express = require('express');
var router = express.Router();
const userController = require('../controllers/user');

/* GET example */
router.get('/', userController.SelectAllUser);
router.get('/:id', userController.SelectUserById)

module.exports = router;
