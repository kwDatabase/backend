var express = require('express');
var router = express.Router();
var controller = require('../controllers/dashboard');

// 대시보드 통계 데이터 조회
router.get('/', controller.GetDashboardStats);

// 사용자 활동 추이 데이터 조회
router.get('/user-activity', controller.GetUserActivityTrend);

// 권한 그룹 분포 데이터 조회 
router.get('/auth-groups', controller.GetAuthGroupDistribution);

// 카테고리별 판매 현황
router.get('/category-sales', controller.GetCategorySales);

// 서브카테고리별 상품 현황
router.get('/subcategory-products', controller.GetSubCategoryProducts);

// 인기 상품
router.get('/popular-products', controller.GetPopularProducts);

// 가격대별 분포
router.get('/price-distribution', controller.GetPriceDistribution);

// 최근 거래 활동
router.get('/recent-activities', controller.GetRecentActivities);

module.exports = router;
