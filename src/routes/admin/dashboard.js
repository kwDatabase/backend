var express = require('express');
var router = express.Router();
var controller = require('../../controllers/admin/dashboard');

router.get('/', controller.GetDashboardStats);

router.get('/user-activity', controller.GetUserActivityTrend);

router.get('/auth-groups', controller.GetAuthGroupDistribution);

router.get('/category-sales', controller.GetCategorySales);

router.get('/subcategory-products', controller.GetSubCategoryProducts);

router.get('/popular-products', controller.GetPopularProducts);

router.get('/price-distribution', controller.GetPriceDistribution);

router.get('/recent-activities', controller.GetRecentActivities);

module.exports = router;
