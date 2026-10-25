import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/store";
import SharedButton from "../shared/ui/Button";
import TextField from "@mui/material/TextField";
import SharedInput from "../shared/ui/Input";
import Stack from "@mui/material/Stack";

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();

    const login = useAuthStore((state) => state.login);
    const token = useAuthStore((state) => state.token);
    const isLoading = useAuthStore((state) => state.isLoading);

    const [error, setError] = useState("");

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    if (token) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            await login(form);

            const destination = location.state?.from || "/dashboard";
            navigate(destination, { replace: true });
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <main className="auth-container">
            
            <form className="auth-form" onSubmit={handleSubmit}>
                <h1>Welcome back</h1>

                {location.state?.message && (
                    <p>{location.state.message}</p>
                )}

                {error && <p className="error">{error}</p>}
<Stack sx={{ width: "70%" }} spacing={2}>
                <SharedInput
                    label={"please enter email"}
                    error={!!error}
                    helperText={error}  
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                    fullWidth={false}
                />
                <SharedInput
                    label={"please enter password"}
                    error={!!error}
                    helperText={error}
                    id="password"
                    name="password" 
                    type="password"
                    fullWidth={false}
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    required
                />
                

                <SharedButton
                    type="submit"
                    disabled={isLoading}
                    size="small"
                >
                    {isLoading ? "Logging in..." : "Log in"}
                </SharedButton>
</Stack>
                <p>
                    New here? <Link to="/signup">Create an account</Link>
                </p>
            </form>
           
        </main>
    );
}