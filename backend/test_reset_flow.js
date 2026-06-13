require('dotenv').config({ path: __dirname + '/.env' });
const authService = require('./features/auth/auth.service');

(async () => {
    try {
        const email = 'haseebuu2004@gmail.com';
        console.log("Generating token for", email);
        const rawToken = await authService.forgotPassword(email);
        console.log("Token:", rawToken);

        console.log("Attempting to reset password...");
        // Directly call the service function to see if it throws an error.
        await authService.resetPassword(rawToken, 'NewPass123!');
        console.log("Password reset successful!");

    } catch (e) {
        console.error("ERROR CAUGHT:", e);
    } finally {
        process.exit(0);
    }
})();
