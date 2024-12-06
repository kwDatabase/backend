var express = require('express');
var router = express.Router();
var controller = require('../controllers/auth');

// 모든 권한 조회
router.get('/', controller.SelectAllAuth);

// 모든 권한 그룹 조회 
router.get('/groups', controller.SelectAllAuthGroups);

// 권한 그룹 생성
router.post('/groups', controller.CreateAuthGroup);

// 권한 그룹 수정
router.put('/groups/:id', controller.UpdateAuthGroup);

// 권한 그룹 삭제
router.delete('/groups/:id', controller.DeleteAuthGroup);

module.exports = router;
