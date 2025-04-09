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
router.post('/signup', userController.signup);
router.post("/verify-otp", userController.verifyOtp);
router.post("/resend-otp", userController.resendOtp);
router.post('/login', userController.login);
router.post('/verify-forgot-password-otp', userController.verifyForgotPasswordOtp);
router.post('/resend-forgot-password-otp', userController.resendForgotPasswordOtp);
router.post('/change-password', userController.changePassword);
router.get('/change-password', userController.loadChangePasswordPage); // Added

router.get('/forgot-password', (req, res) => {
    res.render("forgot-password", { message: "", messageSuccess: "" });
});

router.post('/forgot-password-otp', userController.forgotPasswordOtp);

router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/signup' }), (req, res) => {
    res.json("hello all");
});

router.get('/auth/google/logout', userController.logout);

// Product routes
router.get('/products', userProductController.getShopProducts);
router.get('/products/:id', productDetailsController.getProductDetails);
router.post('/cart/add/:id', cartController.addToCart);
router.post('/products/:id/review', productDetailsController.submitReview);

module.exports = router;