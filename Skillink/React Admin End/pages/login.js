import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { sendPasswordResetEmail } from "firebase/auth";
import { useAuth } from "../firebase/useAuth";
import { auth } from "../firebase/config";
import { normalizeEmail } from "../firebase/session";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const { login, error, loading, clearError } = useAuth();
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    clearError();

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  const getActionCodeSettings = () => {
    if (typeof window === "undefined") {
      return {
        url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000/login",
        handleCodeInApp: false,
      };
    }

    return {
      url: `${window.location.origin}/login`,
      handleCodeInApp: false,
    };
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setResetError("");
    setResetMessage("");
    setResetLoading(true);

    try {
      const normalizedEmail = normalizeEmail(resetEmail);

      if (!normalizedEmail) {
        setResetError("Please enter your email address.");
        setResetLoading(false);
        return;
      }

      await sendPasswordResetEmail(
        auth,
        normalizedEmail,
        getActionCodeSettings()
      );
      setResetMessage(
        "Password reset link sent. Please check your inbox for the next steps."
      );
      setResetEmail("");
    } catch (err) {
      let message = "Unable to send the password reset email. Please try again.";

      if (err?.code === "auth/user-not-found") {
        message = "No account was found for that email address.";
      } else if (err?.code === "auth/invalid-email") {
        message = "Please enter a valid email address.";
      } else if (err?.code === "auth/too-many-requests") {
        message = "Too many requests have been made. Please try again later.";
      }

      setResetError(message);
      console.error("Reset password error:", err);
    } finally {
      setResetLoading(false);
    }
  };

  const openResetForm = () => {
    clearError();
    setResetError("");
    setResetMessage("");
    setResetEmail(email);
    setShowResetForm(true);
  };

  const backToLogin = () => {
    setResetError("");
    setResetMessage("");
    setShowResetForm(false);
  };

  return (
    <div className="login-container">
      <Head>
        <title>Admin Login</title>
      </Head>

      <div className="login-form">
        <h1>Skillink Admin</h1>

        {error && <div className="error">{error}</div>}

        {showResetForm ? (
          <form onSubmit={handlePasswordReset}>
            <div className="form-group">
              <label htmlFor="resetEmail">Email</label>
              <input
                type="email"
                id="resetEmail"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="Enter your registered email"
                required
              />
            </div>

            {resetError && <div className="error">{resetError}</div>}
            {resetMessage && <div className="success">{resetMessage}</div>}

            <button type="submit" className="login-button" disabled={resetLoading}>
              {resetLoading ? "Sending..." : "Send reset link"}
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={backToLogin}
            >
              Back to login
            </button>
          </form>
        ) : (
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

            <button
              type="button"
              className="secondary-button"
              onClick={openResetForm}
            >
              Forgot password?
            </button>
          </form>
        )}
      </div>

      <style jsx>{`
        .login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background-color: #f5f7fa;
          padding: 1.5rem;
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

        .success {
          background-color: #d4edda;
          color: #155724;
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

        .login-button,
        .secondary-button {
          display: block;
          width: 100%;
          padding: 0.75rem;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
          transition: background-color 0.2s;
          margin-top: 0.5rem;
        }

        .login-button {
          background-color: #3498db;
          color: white;
        }

        .login-button:hover {
          background-color: #2980b9;
        }

        .login-button:disabled {
          background-color: #95a5a6;
          cursor: not-allowed;
        }

        .secondary-button {
          background-color: transparent;
          color: #3498db;
          border: 1px solid #3498db;
        }

        .secondary-button:hover {
          background-color: #eef7fd;
        }
      `}</style>
    </div>
  );
}
