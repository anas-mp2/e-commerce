const User = require('../../model/userSchema');
const Product = require('../../model/productSchema'); // Adjust path to your Product model
const Category = require('../../model/categorySchema'); // Adjust path to your Category model
const nodemailer = require('nodemailer');
const dotenv = require('dotenv').config();
const bcrypt = require('bcrypt');

const loadLoginPage = async (req, res) => {
    try {
        if (req.session.user) {
            console.log('User already logged in, redirecting to /products');
            return res.redirect('/products');
        }
        return res.render("login", { 
            message: ""
        }); 
    } catch (error) {
        console.log("Unable to load login page:", error);
        res.status(500).send("Server error");
    }
};

const checkSession = async (req, res) => {
    try {
        if (req.session.user) {
            return res.status(200).json({ isAuthenticated: true });
        }
        return res.status(200).json({ isAuthenticated: false });
    } catch (error) {
        console.error("Error checking session:", error);
        res.status(500).json({ error: "Server error" });
    }
};

const pageNotFound = (req, res) => {
    try {
        res.render("pageNotFound");
    } catch (error) {
        res.redirect('/pageNotFound');
    }
};

const loadSignupPage = async (req, res) => {
    try {
        res.render("signup", { message: "" });
    } catch (error) {
        console.log("Unable to load signup page:", error);
        res.status(500).send("Server error");
    }
};

const backToLogin = async (req, res) => {
    try {
        res.redirect("/");
    } catch (error) {
        console.log(error);
    }
};

function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendVerificationEmail(email, otp) {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.NODEMAILER_EMAIL,
                pass: process.env.NODEMAILER_PASSWORD,
            },
        });

        const info = await transporter.sendMail({
            from: process.env.NODEMAILER_EMAIL,
            to: email,
            subject: 'Your OTP for Verification',
            text: `Your OTP is: ${otp}`,
            html: `<b>Your OTP: ${otp}</b>`,
        });

        return info.accepted && info.accepted.length > 0;
    } catch (error) {
        console.error("Error sending email", error);
        return false;
    }
}

const signup = async (req, res) => {
    const { name, email, password, cpassword } = req.body;
    
    try {
        if (password !== cpassword) {
            return res.render("signup", { message: "Passwords do not match", messageSuccess: "" });
        }

        const findUser = await User.findOne({ email });
        if (findUser) {
            return res.render("signup", { message: "User with this email already exists", messageSuccess: "" });
        }

        const otp = generateOtp();
        console.log("Generated OTP: ", otp);

        const emailSent = await sendVerificationEmail(email, otp);
        console.log("Email Sent Status: ", emailSent);

        if (!emailSent) {
            return res.render("signup", { message: "Failed to send OTP. Please try again.", messageSuccess: "" });
        }

        req.session.userOtp = otp;
        req.session.userData = { name, email, password };
        
        console.log("OTP sent:", otp);
        return res.render("verify-otp");
    } catch (error) {
        console.error("Signup error", error);
        return res.redirect('/pageNotFound');
    }
};

const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.error("Error hashing password", error);
        throw error;
    }
};

const verifyOtp = async (req, res) => {
    try {
        const { otp } = req.body;
        console.log("Entered OTP:", otp);

        if (!req.session.userData) {
            return res.status(400).json({ success: false, message: "Session expired. Please sign up again." });
        }

        if (otp === req.session.userOtp) {
            const user = req.session.userData;

            const passwordHash = await securePassword(user.password);

            const saveUserData = new User({
                name: user.name,
                email: user.email,
                password: passwordHash,
            });

            await saveUserData.save();
            req.session.user = saveUserData._id;

            res.json({ success: true, redirectUrl: "/" });
        } else {
            res.status(400).json({ success: false, message: "Invalid OTP, Please try again" });
        }
    } catch (error) {
        console.error("Error Verifying OTP", error);
        res.status(500).json({ success: false, message: "An error occurred. Please try again." });
    }
};

const resendOtp = async (req, res) => {
    try {
        if (!req.session.userData || !req.session.userData.email) {
            return res.status(400).json({ success: false, message: "Email not found in session" });
        }

        const email = req.session.userData.email;
        const otp = generateOtp();
        req.session.userOtp = otp;

        const emailSent = await sendVerificationEmail(email, otp);

        if (emailSent) {
            console.log("Resent OTP:", otp);
            return res.json({ success: true, message: "OTP resent successfully" });
        } else {
            return res.status(500).json({ success: false, message: "Failed to resend OTP, please try again" });
        }
    } catch (error) {
        console.error("Error resending OTP", error);
        return res.status(500).json({ success: false, message: "Internal Server Error. Please try again" });
    }
};

const login = async (req, res) => {
    try {
        console.log('Received POST /login:', req.body);
        const { email, password } = req.body;

        const findUser = await User.findOne({ isAdmin: 0, email: email });
        if (!findUser) {
            return res.status(404).json({ message: "User not found" });
        }
        if (findUser.isBlocked) {
            return res.status(403).json({ message: "User is blocked by admin" });
        }

        const passwordMatch = await bcrypt.compare(password, findUser.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: "Incorrect Password" });
        }

        req.session.user = findUser._id;

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("login error", error);
        res.status(500).json({ message: "Login failed. Please try again later" });
    }
};

const forgotPasswordOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.render("forgot-password", { message: "", messageSuccess: "Please enter Email" });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.render("forgot-password", { message: "Email doesn't exist", messageSuccess: "" });
        }
        
        const otp = generateOtp();
        console.log("otp is", otp);
        const otpExpires = new Date(Date.now() + 5 * 60000);

        await User.updateOne(
            { email },
            { $set: { otp, otpExpires } }
        );
        
        req.session.otp = otp;
        req.session.otpExpires = otpExpires;
        req.session.email = email;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.NODEMAILER_EMAIL, 
                pass: process.env.NODEMAILER_PASSWORD
            }
        });
        
        const mailOptions = {
            from: process.env.NODEMAILER_EMAIL,
            to: email,
            subject: "Your OTP Code",
            text: `Your OTP Code is ${otp} , Use this to reset your Password`
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log("====", err);
                return res.render("forgot-password", { message: "Error in Sending Email", messageSuccess: "" });
            }
            res.render("forgot-password-otp", { message: "", messageSuccess: "" });
        });
    } catch (error) {
        console.log("error is", error);
        res.render("pageNotFound");
    }
};

const verifyForgotPasswordOtp = async (req, res) => {
    try {
        let { otp } = req.body;
        console.log("Received OTP (raw):", otp, "Type:", typeof otp);

        // If otp is an array (from otp[]), join it; otherwise, use as is
        otp = Array.isArray(otp) ? otp.join("") : otp;
        console.log("Processed OTP:", otp, "Type:", typeof otp);

        if (!otp || otp === ",,,,,") {
            console.log("OTP validation failed: Empty or invalid");
            return res.render("forgot-password-otp", { message: "OTP is required" });
        }

        const storedOtp = req.session.otp;
        let otpExpires = req.session.otpExpires;
        console.log("Stored OTP:", storedOtp, "Type:", typeof storedOtp);
        console.log("OTP Expires (raw):", otpExpires, "Type:", typeof otpExpires);

        if (typeof otpExpires === 'string') {
            otpExpires = new Date(otpExpires);
            console.log("Converted OTP Expires to Date:", otpExpires.toISOString());
        } else if (otpExpires && !(otpExpires instanceof Date)) {
            console.log("OTP Expires is not a valid Date, setting to null");
            otpExpires = null;
        }

        if (!storedOtp) {
            console.log("No stored OTP found in session");
            return res.render("forgot-password-otp", { message: "OTP expired, please request a new one" });
        }

        // Check if OTP has expired
        if (otpExpires && new Date() > otpExpires) {
            console.log("OTP has expired at:", new Date().toISOString());
            return res.render("forgot-password-otp", { message: "OTP has expired, please request a new one" });
        }

        // Ensure type consistency for comparison
        const normalizedStoredOtp = storedOtp.toString();
        const normalizedOtp = otp.toString();
        console.log("Normalized Stored OTP:", normalizedStoredOtp, "Type:", typeof normalizedStoredOtp);
        console.log("Normalized Received OTP:", normalizedOtp, "Type:", typeof normalizedOtp);

        if (normalizedStoredOtp !== normalizedOtp) {
            console.log("OTP mismatch: Stored", normalizedStoredOtp, "vs Received", normalizedOtp);
            return res.render("forgot-password-otp", { message: "Invalid OTP" });
        }

        console.log("OTP verified successfully");
        return res.json({ success: true, redirectUrl: "/change-password" }); // Return JSON response
    } catch (error) {
        console.log("Error in verifyForgotPasswordOtp:", error);
        res.render("pageNotFound");
    }
};

const resendForgotPasswordOtp = async (req, res) => {
    try {
        console.log("Attempting to resend OTP...");
        const email = req.session.email;
        console.log("Session email:", email);
        const user = await User.findOne({ email });

        if (!user) {
            console.log("User not found for email:", email);
            return res.status(400).json({ success: false, message: "Email not found" });
        }

        const otp = generateOtp();
        console.log("Generated OTP:", otp);
        console.log("Resend OTP function reached with OTP:", otp);
        const otpExpires = new Date(Date.now() + 5 * 60000);

        await User.updateOne(
            { email },
            { $set: { otp, otpExpires: otpExpires.toISOString() } }
        );
        
        req.session.otp = otp;
        req.session.otpExpires = otpExpires;
        console.log("Session OTP updated to:", req.session.otp, "Expires:", req.session.otpExpires.toISOString());

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.NODEMAILER_EMAIL,
                pass: process.env.NODEMAILER_PASSWORD
            }
        });
        
        const mailOptions = {
            from: process.env.NODEMAILER_EMAIL,
            to: email,
            subject: "Your OTP Code",
            text: `Your OTP Code is ${otp}, Use this to reset your Password`
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log("Email sending error:", err);
                return res.status(500).json({ success: false, message: "Error in sending email" });
            }
            console.log("Email sent successfully:", info.response);
            res.json({ success: true, message: "OTP resent successfully" });
        });
    } catch (error) {
        console.log("Error in resendForgotPasswordOtp:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const loadChangePasswordPage = async (req, res) => {
    try {
        console.log('Session:', req.session);
        if (!req.session.email) {
            console.log("No email in session, redirecting to forgot-password");
            return res.redirect("/forgot-password");
        }
        console.log('Rendering change-password.ejs with email:', req.session.email);
        res.render("change-password", { message: "", messageSuccess: "" });
    } catch (error) {
        console.log("Error loading change password page:", error);
        res.render("pageNotFound");
    }
};

const changePassword = async (req, res) => {
    try {
        console.log('Received POST /change-password:', req.body);
        const { password, cpassword } = req.body;
        if (password !== cpassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }
        const email = req.session.email;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Update only the password field
        const updateResult = await User.updateOne(
            { email },
            { $set: { password: hashedPassword } }
        );

        if (updateResult.matchedCount === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        req.session.destroy(); 
        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error changing password:", error);
        res.status(500).json({ message: "An error occurred. Try again." });
    }
};

const googleAuth = (req, res, next) => {
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
};

const googleAuthCallback = (req, res, next) => {
    passport.authenticate('google', {
        successRedirect: '/products',
        failureRedirect: '/signup',
    })(req, res, next);
};

const logout = async (req, res) => {
    try {
        req.logout((err) => {
            if (err) {
                console.error("Passport logout error:", err);
            }
            req.session.destroy((err) => {
                if (err) {
                    console.error("Session destroy error:", err);
                    return res.status(500).send("Logout failed");
                }
                console.log('User logged out, redirecting to /');
                res.redirect('/');
            });
        });
    } catch (error) {
        console.error("Error during logout:", error);
        res.status(500).send("An error occurred during logout");
    }
};

const itemsPerPage = 9; // Example: 9 products per page
const loadProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const search = req.query.search || '';
        const category = req.query.category || '';
        const minPrice = req.query.minPrice || '';
        const maxPrice = req.query.maxPrice || '';
        const brand = req.query.brand || '';
        const sort = req.query.sort || '';

        // Build query
        let query = {};
        if (search) query.name = { $regex: search, $options: 'i' };
        if (category) query.category = category;
        if (minPrice) query.price = { $gte: parseFloat(minPrice) };
        if (maxPrice) query.price = { ...query.price, $lte: parseFloat(maxPrice) };
        if (brand) query.brand = brand;

        // Sorting logic
        let sortOption = {};
        if (sort === 'price-low-to-high') sortOption.price = 1;
        else if (sort === 'price-high-to-low') sortOption.price = -1;
        else if (sort === 'a-z') sortOption.name = 1;
        else if (sort === 'z-a') sortOption.name = -1;
        else if (sort === 'new-arrivals') sortOption.createdAt = -1;

        // Get total products
        const totalProducts = await Product.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / itemsPerPage);

        // Get paginated products
        const products = await Product.find(query)
            .sort(sortOption)
            .skip((page - 1) * itemsPerPage)
            .limit(itemsPerPage);

        // Get categories and brands for filters
        const categories = await Category.find();
        const brands = await Product.distinct('brand');

        res.render('shop', {
            products,
            categories,
            brands,
            search,
            category,
            minPrice,
            maxPrice,
            brand,
            sort,
            currentPage: page,
            totalPages,
            error: null
        });
    } catch (error) {
        console.error('Error loading products:', error);
        res.render('shop', { error: 'Unable to load products', products: [], categories: [], brands: [], search: '', category: '', minPrice: '', maxPrice: '', brand: '', sort: '', currentPage: 1, totalPages: 1 });
    }
};

module.exports = {
    loadLoginPage,
    pageNotFound,
    loadSignupPage,
    backToLogin,
    signup,
    verifyOtp,
    resendOtp,
    login,
    forgotPasswordOtp,
    verifyForgotPasswordOtp,
    resendForgotPasswordOtp,
    loadChangePasswordPage,
    changePassword,
    googleAuth,
    googleAuthCallback,
    logout,
    checkSession,
    loadProducts
};