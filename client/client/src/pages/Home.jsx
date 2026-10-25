import React from "react";
import { useNavigate } from "react-router-dom";
import ProductTab from "../testComponents/testComponent";
function Home() {
  const navigate = useNavigate();

  return (
    <>
    <div style={styles.page}>
      {/* Navbar */}
      <nav style={styles.nav}>
        <div style={styles.brand}>MyApp</div>

        <div style={styles.navRight}>
          <button style={styles.guestBtn} onClick={() => navigate("/dashboard")}>Continue as Guest</button>
          <button style={styles.loginBtn} onClick={() => navigate("/login")}>Login</button>
          <button style={styles.signupBtn} onClick={() => navigate("/signup")}>Sign Up</button>
        </div>
      </nav>

      {/* Hero */}
      <main style={styles.hero}>
        <h1 style={styles.title}>Welcome to MyApp 👋</h1>
        <p style={styles.subtitle}>
          Start instantly as a guest, or create an account to save your work.
        </p>
          <ProductTab productName={"laptop"} price={100}/>
          
      </main>
    </div>
  
    </>
  )
}

const styles = {
  page: {
    minHeight: "100vh",
    fontFamily: "system-ui, -apple-system, sans-serif",
    background: "#f7f7fb",
    color: "#111",
  },
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 32px",
    background: "#fff",
    borderBottom: "1px solid #e5e5ea",
  },
  brand: {
    fontSize: "1.25rem",
    fontWeight: 700,
    color: "#4f46e5",
  },
  navRight: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  guestBtn: {
    padding: "8px 16px",
    fontSize: "0.9rem",
    fontWeight: 500,
    color: "#4f46e5",
    background: "transparent",
    border: "1px solid #4f46e5",
    borderRadius: "8px",
    cursor: "pointer",
  },
  loginBtn: {
    padding: "8px 16px",
    fontSize: "0.9rem",
    fontWeight: 500,
    color: "#333",
    background: "transparent",
    border: "1px solid #ddd",
    borderRadius: "8px",
    cursor: "pointer",
  },
  signupBtn: {
    padding: "8px 16px",
    fontSize: "0.9rem",
    fontWeight: 500,
    color: "#fff",
    background: "#4f46e5",
    border: "1px solid #4f46e5",
    borderRadius: "8px",
    cursor: "pointer",
  },
  hero: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "100px 24px",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: 800,
    margin: "0 0 12px",
  },
  subtitle: {
    fontSize: "1rem",
    color: "#666",
    maxWidth: "480px",
    margin: 0,
    lineHeight: 1.6,
  },
}
export default Home;