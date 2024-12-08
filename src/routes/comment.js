const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');

// 상품에 대한 후기와 문의 가져오기
router.get('/:id/comments', commentController.getCommentsByProductId);

// 후기 추가
router.post('/:id/reviews', commentController.addReview);

// 후기 수정
router.patch('/:id/reviews/:reviewIndex', commentController.updateReview);

// 후기 삭제
router.delete('/:id/reviews/:reviewIndex', commentController.deleteReview);

// 문의 추가
router.post('/:id/inquiries', commentController.addInquiry);

// 문의 수정
router.patch('/:id/inquiries/:inquiryIndex', commentController.updateInquiry);

// 문의 삭제
router.delete('/:id/inquiries/:inquiryIndex', commentController.deleteInquiry);

module.exports = router;