var express = require('express');
var router = express.Router();
const userController = require('../controllers/user');

// 모든 사용자 조회
router.get('/', userController.SelectAllUser);

// 사용자 정보 수정
router.put('/:id', userController.UpdateUser);

// 사용자 삭제
router.delete('/:id', userController.DeleteUser);

// 권한 그룹 목록 조회
router.get('/auth-groups', userController.GetAuthGroups);

// 사용자 권한 그룹 수정
router.put('/auth-group', userController.UpdateUserAuthGroup);

module.exports = router;
