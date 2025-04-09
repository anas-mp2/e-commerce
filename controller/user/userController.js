const User = require('../../model/userSchema');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv').config();
const bcrypt = require('bcrypt');

function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

const forgotPasswordOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: "Please enter Email" });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "Email doesn't exist" });
        }
        
        const otp = generateOtp();
        console.log("Generated OTP:", otp);
        const otpExpires = new Date(Date.now() + 3 * 60000); // 3 minutes expiry

        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();
        
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
            text: `Your OTP Code is ${otp}. It expires in 3 minutes.`
        };

        transporter.sendMail(mailOptions, (err) => {
            if (err) {
                console.error("Error sending email:", err);
                return res.status(500).json({ success: false, message: "Error in Sending Email" });
            }
            return res.render("forgot-password-otp", { message: "", messageSuccess: "OTP sent successfully" });
        });
    } catch (error) {
        console.error("Forgot Password OTP error:", error);
        res.render("pageNotFound");
    }
};

const verifyForgotPasswordOtp = async (req, res) => {
    try {
        const { otp } = req.body;
        console.log("Received OTP:", otp);
        console.log("Stored OTP in session:", req.session.otp);

        if (!otp || otp.trim() === "") {
            return res.status(400).json({ success: false, message: "OTP is required" });
        }

        const storedOtp = req.session.otp;
        const otpExpires = req.session.otpExpires;

        if (!storedOtp || !otpExpires) {
            return res.status(400).json({ success: false, message: "OTP expired or session invalid. Please request a new one." });
        }

        if (new Date() > otpExpires) {
            return res.status(400).json({ success: false, message: "OTP has expired" });
        }

        if (String(storedOtp) !== String(otp)) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }

        return res.json({ success: true, redirectUrl: "/change-password" });
    } catch (error) {
        console.error("Verification error:", error);
        return res.status(500).json({ success: false, message: "An error occurred" });
    }
};

const resendForgotPasswordOtp = async (req, res) => {
    try {
        const email = req.session.email;
        if (!email) {
            return res.status(400).json({ success: false, message: "Session expired. Please start over." });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        const otp = generateOtp();
        console.log("New OTP:", otp);
        const newOtpExpires = new Date(Date.now() + 3 * 60000); // 3 minutes expiry

        user.otp = otp;
        user.otpExpires = newOtpExpires;
        await user.save();

        req.session.otp = otp;
        req.session.otpExpires = newOtpExpires;

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
            subject: "Your New OTP Code",
            text: `Your new OTP Code is ${otp}. It expires in 3 minutes.`
        };

        transporter.sendMail(mailOptions, (err) => {
            if (err) {
                console.error("Error sending email:", err);
                return res.status(500).json({ success: false, message: "Error sending OTP" });
            }
            console.log("Resent OTP:", otp);
            return res.json({ success: true, message: "New OTP sent successfully" });
        });
    } catch (error) {
        console.error("Error resending OTP:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const loadLoginPage = async (req, res) => {
    try {
        return res.render("login", { message: "" });
    } catch (error) {
        console.log("Unable to load login page");
        res.status(500).send("Server error");
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
        console.log("Unable to load signup page");
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

const signup = async (req, res) => {
    // Add your signup logic here if different from placeholder
    try {
        const { email, password, cpassword } = req.body;
        if (password !== cpassword) {
            return res.status(400).json({ success: false, message: "Passwords do not match" });
        }
        const findUser = await User.findOne({ email });
        if (findUser) {
            return res.status(400).json({ success: false, message: "User with this email already exists" });
        }
        const otp = generateOtp();
        console.log("Generated OTP: ", otp);

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.NODEMAILER_EMAIL, pass: process.env.NODEMAILER_PASSWORD }
        });
        const mailOptions = {
            from: process.env.NODEMAILER_EMAIL,
            to: email,
            subject: 'Your OTP for Verification',
            text: `Your OTP is: ${otp}`
        };
        transporter.sendMail(mailOptions, (err) => {
            if (err) {
                console.error("Error sending email:", err);
                return res.status(500).json({ success: false, message: "Failed to send OTP" });
            }
            req.session.userOtp = otp;
            req.session.userData = { email, password };
            return res.render("verify-otp");
        });
    } catch (error) {
        console.error("Signup error", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const verifyOtp = async (req, res) => {
    // Add your verify OTP logic here if different from placeholder
    try {
        const { otp } = req.body;
        if (!req.session.userData) {
            return res.status(400).json({ success: false, message: "Session expired. Please sign up again." });
        }
        if (otp === req.session.userOtp) {
            const user = req.session.userData;
            const passwordHash = await bcrypt.hash(user.password, 10);
            const saveUserData = new User({ email: user.email, password: passwordHash });
            await saveUserData.save();
            req.session.user = saveUserData._id;
            res.json({ success: true, redirectUrl: "/" });
        } else {
            res.status(400).json({ success: false, message: "Invalid OTP" });
        }
    } catch (error) {
        console.error("Error Verifying OTP", error);
        res.status(500).json({ success: false, message: "An error occurred" });
    }
};

const resendOtp = async (req, res) => {
    // Add your resend OTP logic here if different from placeholder
    try {
        if (!req.session.userData || !req.session.userData.email) {
            return res.status(400).json({ success: false, message: "Email not found in session" });
        }
        const email = req.session.userData.email;
        const otp = generateOtp();
        req.session.userOtp = otp;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.NODEMAILER_EMAIL, pass: process.env.NODEMAILER_PASSWORD }
        });
        const mailOptions = {
            from: process.env.NODEMAILER_EMAIL,
            to: email,
            subject: 'Your New OTP for Verification',
            text: `Your new OTP is: ${otp}`
        };
        transporter.sendMail(mailOptions, (err) => {
            if (err) {
                console.error("Error sending email:", err);
                return res.status(500).json({ success: false, message: "Failed to resend OTP" });
            }
            console.log("Resent OTP:", otp);
            return res.json({ success: true, message: "OTP resent successfully" });
        });
    } catch (error) {
        console.error("Error resending OTP", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const login = async (req, res) => {
    // Add your login logic here if different from placeholder
    try {
        const { email, password } = req.body;
        const findUser = await User.findOne({ isAdmin: 0, email: email });
        if (!findUser) {
            return res.status(400).json({ success: false, message: "User not found" });
        }
        if (findUser.isBlocked) {
            return res.status(403).json({ success: false, message: "User is blocked by admin" });
        }
        const passwordMatch = await bcrypt.compare(password, findUser.password);
        if (!passwordMatch) {
            return res.status(400).json({ success: false, message: "Incorrect Password" });
        }
        req.session.user = findUser._id;
        return res.json({ success: true, redirectUrl: "/products" });
    } catch (error) {
        console.error("Login error", error);
        return res.status(500).json({ success: false, message: "Login failed" });
    }
};

const changePassword = async (req, res) => {
    // Add your change password logic here if different from placeholder
    try {
        const { password, cpassword } = req.body;
        if (password !== cpassword) {
            return res.status(400).json({ success: false, message: "Passwords do not match" });
        }
        const email = req.session.email;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        await user.save();
        req.session.destroy();
        return res.json({ success: true, redirectUrl: "/", message: "Password changed successfully" });
    } catch (error) {
        console.error("Error changing password:", error);
        return res.status(500).json({ success: false, message: "An error occurred" });
    }
};

const loadChangePasswordPage = async (req, res) => {
    try {
        if (!req.session.email) {
            return res.redirect("/");
        }
        console.log("Rendering change-password page for email:", req.session.email);
        res.render("change-password", { message: "" });
    } catch (error) {
        console.error("Error loading change password page:", error);
        res.status(500).send("Server error");
    }
};

const logout = async (req, res) => {
    try {
        req.logout((err) => {
            if (err) {
                console.error("Logout error:", err);
                return res.status(500).json({ success: false, message: "Logout failed" });
            }
            req.session.destroy();
            return res.json({ success: true, redirectUrl: "/" });
        });
    } catch (error) {
        console.error("Error during logout:", error);
        return res.status(500).json({ success: false, message: "An error occurred during logout" });
    }
};

// Export all functions
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
    changePassword,
    loadChangePasswordPage,
    logout
};