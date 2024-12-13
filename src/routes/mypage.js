const express = require('express');
const router = express.Router();
const myPageController = require('../controllers/mypage'); 

router.post('/selling', myPageController.getSellingProducts);
router.post('/sold', myPageController.getSoldProducts);
router.post('/reviews', myPageController.getReviews);

module.exports = router;
