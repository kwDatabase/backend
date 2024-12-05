var express = require('express');
var router = express.Router();
var controller = require('../controllers/category');

// Get all category
router.get('/', controller.SelectAllCategory);

// Get all category
router.get('/check/:name', controller.CheckCategoryName);

// Create a category
router.post('/', controller.CreateCategory);

// Update a category
router.put('/:id', controller.UpdateCategory);

// Delete a category
router.delete('/:id', controller.DeleteCategory);

// Routes for Product Subcategory

// Get all subcategory for a category
router.get('/:categoryId/subcategory', controller.SelectAllSubCategory);

// Create a subcategory
router.post('/:categoryId/subcategory', controller.CreateSubCategory);

// Update a subcategory
router.put('/:categoryId/subcategory/:id', controller.UpdateSubCategory);

// Delete a subcategory
router.delete('/:categoryId/subcategory/:id', controller.DeleteAllSubCategory);


module.exports = router;