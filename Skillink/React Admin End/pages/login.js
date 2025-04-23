import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useAuth } from "../firebase/useAuth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, error, loading, clearError } = useAuth();
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    clearError();

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      // Error is handled by useAuth hook
      console.error("Login error:", err);
    }
  };

  return (
    <div className="login-container">
      <Head>
        <title>Admin Login</title>
      </Head>

      <div className="login-form">
        <h1>Skillink Admin</h1>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>

      <style jsx>{`
        .login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background-color: #f5f7fa;
        }

        .login-form {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 400px;
        }

        h1 {
          text-align: center;
          margin-bottom: 1.5rem;
          color: #2c3e50;
        }

        .error {
          background-color: #f8d7da;
          color: #721c24;
          padding: 0.75rem;
          margin-bottom: 1rem;
          border-radius: 4px;
          font-size: 0.9rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #2c3e50;
        }

        input {
          width: 100%;
          padding: 0.75rem;
          font-size: 1rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          transition: border-color 0.2s;
        }

        input:focus {
          outline: none;
          border-color: #3498db;
        }

        .login-button {
          display: block;
          width: 100%;
          padding: 0.75rem;
          background-color: #3498db;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .login-button:hover {
          background-color: #2980b9;
        }

        .login-button:disabled {
          background-color: #95a5a6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
