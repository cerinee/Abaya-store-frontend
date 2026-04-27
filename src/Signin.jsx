import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Signupstyle.css";

function SignIn() {
    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!form.email || !form.password) { setError("Please fill all fields"); return; }
        setLoading(true);
        try {
            const res = await fetch("https://lyrine-store.onrender.com/api/signin", { // ← fixed port
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Sign in failed");

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user)); // ← this was missing

            navigate(data.user.isAdmin ? "/admin" : "/");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-wrapper">
            <div className="signup-card">
                <h2>Welcome Back</h2>
                {error && <div className="error-box">{error}</div>}
                <form onSubmit={handleSubmit} className="signup-form">
                    <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} />
                    <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} />
                    <div className="forgot-password-container">
                        <span className="forgot-password" onClick={() => navigate("/forgot-password")}>
                            Forgot password?
                        </span>
                    </div>
                    <button type="submit" disabled={loading}>
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>
                <div className="signup-redirect">
                    Don't have an account?{" "}
                    <span className="signup-link" onClick={() => navigate("/signup")}>Sign up</span>
                </div>
            </div>
        </div>
    );
}

export default SignIn;