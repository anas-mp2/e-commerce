const express = require('express');
const router = express.Router();
const adminController = require('../controller/admin/adminController');
const categoryController = require('../controller/admin/categoryController');
const productController = require('../controller/admin/productController');
const { upload } = require('../middleware/multerConfig'); // Destructure upload
console.log('Upload from multerConfig:', upload);

// Admin Login Routes
router.get('/login', adminController.loadLogin);
router.post('/verifyLogin', adminController.verifyLogin);

// User Management Routes
router.get('/users', adminController.loadUsers);
router.post('/block-user/:id', adminController.blockUser);
router.post('/unblock-user/:id', adminController.unblockUser);
router.get('/customer-info', adminController.customerInfo);

// Category Management Routes
router.get('/categories', categoryController.listCategories);
router.post('/add-category', categoryController.addCategory);
router.post('/edit-category/:id', categoryController.editCategory);
router.post('/delete-category/:id', categoryController.deleteCategory);

// Product Management Routes
router.get('/products', productController.getProducts);
router.get('/products/add', productController.getAddProduct);
router.post('/products/add', upload.array('images', 10), productController.addProduct); // Use the destructured upload
router.get('/products/edit/:id', productController.getEditProduct);
router.post('/products/edit/:id', upload.array('images', 10), productController.editProduct); // Use the destructured upload
router.get('/products/delete/:id', productController.deleteProduct);

module.exports = router;