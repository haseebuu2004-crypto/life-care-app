import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signInWithGoogle } from '../services/firebase';

export function Login() {
    const { login, googleLogin, user } = useAuth();
    const nav = useNavigate();

    // If already logged in, redirect to dashboard
    if (user) {
        return <Navigate to="/" replace />;
    }

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(e.target.username.value, e.target.password.value);
            nav('/');
        } catch (error) {
            alert(error.message || 'Invalid credentials');
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const firebaseUser = await signInWithGoogle();
            const idToken = await firebaseUser.getIdToken();
            await googleLogin(idToken);
            nav('/');
        } catch (error) {
            console.error("Google login error:", error);
            alert(error.message || 'Google login failed');
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
            <form onSubmit={onSubmit} className="card" style={{ width: 400 }}>
                <h2 style={{ textAlign: 'center', marginBottom: 20 }}>🥗 Life Care</h2>

                <div className="form-group">
                    <label>Username</label>
                    <input name="username" required />
                </div>

                <div className="form-group">
                    <label>Password</label>
                    <input name="password" type="password" required />
                </div>

                <button type="submit" className="btn btn-primary w-full">
                    Login
                </button>

                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="btn btn-outline w-full"
                    style={{ marginTop: 12 }}
                >
                    Continue with Google
                </button>
            </form>
        </div>
    );
}
