const authService = require('./auth.service');

// ---------------------------------------------------------
// AUTHENTICATION & LOGIN FLOW
// ---------------------------------------------------------
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ success: false, message: "Email and password required" });

        const rawIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
        const ip = rawIp.split(',')[0].trim();
        const ua = req.headers['user-agent'] || '';

        const { sessionId, user } = await authService.login(email, password, ip, ua);

        const isProd = process.env.NODE_ENV === 'production';
        res.cookie('session_token', sessionId, {
            httpOnly: true,
            secure: isProd, // Required for SameSite=None, but breaks JMeter on localhost HTTP
            sameSite: isProd ? 'none' : 'lax', // Required for cross-domain in prod
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
        const { currentPassword, newPassword, oldPassword, logoutOtherDevices } = req.body;
        const currPwd = currentPassword || oldPassword;
        const newPwd = newPassword;

        await authService.changePassword(req.user.id, currPwd, newPwd, req.user.force_password_change, req.cookies?.session_token);
        
        if (logoutOtherDevices) {
            const rawIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
            const ip = rawIp.split(',')[0].trim();
            const ua = req.headers['user-agent'] || '';
            const sessionId = await authService.createNewSession(req.user.id, ip, ua);
            res.cookie('session_token', sessionId, { httpOnly: true, secure: true, sameSite: 'none', maxAge: 8 * 3600000 });
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

        const token = await authService.forgotPassword(email);

        if (!token) {
            return res.status(404).json({ success: false, message: "This email is not registered in our system." });
        }

        res.json({ success: true, message: "Password reset link has been successfully sent to your registered email." });
    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({ success: false, message: "Failed to process password reset request." });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            return res.status(400).json({ success: false, message: "Token and new password are required." });
        }
        await authService.resetPassword(token, newPassword);
        res.json({ success: true, message: "Password has been reset successfully. You can now log in." });
    } catch (error) {
        // Surface specific, user-safe errors from the service layer
        const msg = error.message || '';
        if (msg.includes("invalid") || msg.includes("expired") || msg.includes("already been used") || msg.includes("at least 8 characters")) {
            return res.status(400).json({ success: false, message: msg });
        }
        // Never expose internal details to the client
        console.error("Reset Password Error:", error);
        res.status(500).json({ success: false, message: "An unexpected error occurred. Please try again." });
    }
};

exports.getSession = async (req, res) => {
    try {
        // If authenticateToken passes, req.user is set
        res.json({
            success: true,
            user: {
                id: req.user.id,
                email: req.user.email,
                username: req.user.username || req.user.email.split('@')[0],
                role: req.user.role,
                force_password_change: req.user.force_password_change
            }
        });
    } catch (error) {
        console.error("Get Session Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.getActiveSessions = async (req, res) => {
    try {
        const sessions = await authService.getActiveSessions(req.user.id, req.cookies?.session_token);
        res.json({ success: true, sessions });
    } catch (error) {
        console.error("Get Active Sessions Error:", error);
        res.status(500).json({ success: false, message: "Failed to retrieve sessions" });
    }
};

exports.revokeSession = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ success: false, message: "Session ID required" });
        
        await authService.revokeSession(req.user.id, id);
        res.json({ success: true, message: "Session revoked successfully" });
    } catch (error) {
        console.error("Revoke Session Error:", error);
        res.status(500).json({ success: false, message: "Failed to revoke session" });
    }
};
