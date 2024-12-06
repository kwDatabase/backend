var express = require('express');
var router = express.Router();
var controller = require('../../controllers/admin/category');

router.get('/', controller.SelectAllCategory);

router.get('/check/:name', controller.CheckCategoryName);

router.post('/', controller.CreateCategory);

router.put('/:id', controller.UpdateCategory);

router.delete('/:id', controller.DeleteCategory);

router.get('/:categoryId/subcategory', controller.SelectAllSubCategory);

router.post('/:categoryId/subcategory', controller.CreateSubCategory);

router.put('/:categoryId/subcategory/:id', controller.UpdateSubCategory);

router.delete('/:categoryId/subcategory/:id', controller.DeleteAllSubCategory);


module.exports = router;