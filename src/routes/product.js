const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const upload = require('../middleware/upload'); // multer 설정

// 상품 목록 조회
router.get('/', productController.getProducts); 

// 카테고리 조회 API
router.get('/categories', productController.getCategories);

// 상품 추가
router.post('/create', upload.single('image_file'), productController.addProduct); 

// 상품 조회수 증가 API 추가
router.put('/:id/views', productController.incrementViewCount); // 새로운 엔드포인트 추가

// 상품 상세 조회 API 추가
router.get('/:id', productController.getProductById);

// 상품 수정 정보 조회 API 추가
router.get('/edit/:id', productController.getProductForEdit);

// 상품 수정
router.patch('/edit/:id', upload.single('image_file'), productController.updateProduct);

// 상품 삭제
router.delete('/edit/:id', productController.deleteProduct);

module.exports = router;