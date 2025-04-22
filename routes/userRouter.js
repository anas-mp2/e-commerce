const express = require('express');
const router = express.Router();
const passport = require('passport');
const userController = require('../controller/user/userController');
const userProductController = require('../controller/user/userProductController');
const productDetailsController = require('../controller/user/productDetailsController');
const cartController = require('../controller/cart/cartController');

router.get('/', userController.loadLoginPage);
router.get('/pageNotFound', userController.pageNotFound);
router.get('/signup', userController.loadSignupPage);
router.get('/user/login', userController.backToLogin);
router.get('/user/signup', userController.loadSignupPage);
router.get('/forgot-password', (req, res) => {
    res.render("forgot-password", { message: "", messageSuccess: "" });
});
router.get('/change-password', userController.loadChangePasswordPage); // New GET route

router.post('/signup', userController.signup);
router.post('/verify-otp', userController.verifyOtp);
router.post('/resend-otp', userController.resendOtp);
router.post('/login', userController.login);
router.post('/forgot-password-otp', userController.forgotPasswordOtp);
router.post('/verify-forgot-password-otp', userController.verifyForgotPasswordOtp);
router.post('/resend-forgot-password-otp', userController.resendForgotPasswordOtp);
router.post('/change-password', userController.changePassword);

router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/signup' }), (req, res) => {
    res.redirect('/products');
});

router.get('/logout', userController.logout);
router.get('/auth/google/logout', userController.logout);

router.get('/products', userController.loadProducts); // Updated to use loadProducts
router.get('/products/:id', productDetailsController.getProductDetails);
router.post('/cart/add/:id', cartController.addToCart);

router.post('/products/:id/review', productDetailsController.submitReview);

router.get('/check-session', userController.checkSession);

module.exports = router;