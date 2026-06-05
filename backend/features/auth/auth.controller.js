const authService = require('./auth.service');

// ---------------------------------------------------------
// AUTHENTICATION & LOGIN FLOW
// ---------------------------------------------------------
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ success: false, message: "Email and password required" });

        const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
        const ua = req.headers['user-agent'] || '';

        const { sessionId, user } = await authService.login(email, password, ip, ua);

        res.cookie('session_token', sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 8 * 3600000
        });

        res.json({ 
            success: true,
            role: user.role,
            user: { id: user.id, email: user.email, role: user.role, forcePasswordChange: user.force_password_change } 
        });
    } catch (error) {
        if (error.message.includes("Invalid credentials") || error.message.includes("Invalid email") || error.message.includes("deactivated") || error.message.includes("Account locked")) {
            const status = error.message.includes("deactivated") || error.message.includes("Account locked") ? 403 : 401;
            return res.status(status).json({ success: false, message: error.message });
        }
        console.error("Login Route Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.logout = async (req, res) => {
    try {
        const sessionId = req.cookies?.session_token;
        await authService.logout(sessionId, req.user?.id);
        res.clearCookie('session_token');
        res.json({ success: true, message: "Logged out" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Logout error" });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, oldPassword } = req.body;
        const currPwd = currentPassword || oldPassword;
        const newPwd = newPassword;

        await authService.changePassword(req.user.id, currPwd, newPwd, req.user.force_password_change, req.cookies?.session_token);
        
        if (req.user.force_password_change) {
            const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
            const ua = req.headers['user-agent'] || '';
            const sessionId = await authService.createNewSession(req.user.id, ip, ua);
            res.cookie('session_token', sessionId, { httpOnly: true, sameSite: 'lax', maxAge: 8 * 3600000 });
        }

        res.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        if (error.message.includes("least 8 characters") || error.message.includes("required") || error.message.includes("Incorrect") || error.message.includes("Invalid")) {
            return res.status(400).json({ success: false, message: error.message });
        }
        console.error("Change Password Error:", error);
        res.status(500).json({ success: false, message: "Failed to update password" });
    }
};

exports.getSession = (req, res) => {
    const sessionUser = authService.getSession(req.user);
    res.json({ success: true, user: sessionUser });
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: "Email required" });

        res.json({ success: true, message: "If that email exists, reset instructions have been sent." });

        await authService.forgotPassword(email);
    } catch (error) {
        console.error("Forgot Password Error:", error);
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        await authService.resetPassword(token, newPassword);
        res.json({ success: true, message: "Password has been reset successfully. You can now log in." });
    } catch (error) {
        if (error.message.includes("Invalid")) {
            return res.status(400).json({ success: false, message: error.message });
        }
        console.error("Reset Password Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
