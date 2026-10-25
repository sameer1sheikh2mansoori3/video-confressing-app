import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/store";
import SharedInput from "../shared/ui/Input";
import SharedButton from "../shared/ui/Button";
import AlertMessage from "../shared/ui/Alert";

export default function Signup() {
  const navigate = useNavigate();
  const signup = useAuthStore((state) => state.signup);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

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
      await signup(form);
      navigate("/login", {
        replace: true,
        state: { message: "Account created successfully. Please log in." },
      });
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <main className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>Create account</h1>

        {  
          <AlertMessage
            open={true && error}
            variant="outlined"
            severity="error"
            message={error}
            onClose={()=>setError("")}
          />
        }
            

        <label htmlFor="username">Username</label>
        <SharedInput
          id="username"
          name="username"
          value={form.username}
          onChange={handleChange}
          autoComplete="username"
          required
        />

        
        <SharedInput
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          autoComplete="email"
          required
        />

        <SharedInput
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          autoComplete="new-password"
          required
        />

        <SharedButton
          type="submit"
          disabled={isLoading}
          size="medium"
        >
          {isLoading ? "Creating account..." : "Sign up"}
        </SharedButton>

        <p>
          Already registered? <Link to="/login">Log in</Link>
        </p>
      </form>
    </main>
  );
}