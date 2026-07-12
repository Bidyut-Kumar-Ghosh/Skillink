import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { confirmPasswordReset } from "firebase/auth";
import { auth } from "../firebase/config";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { oobCode, mode } = router.query;
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (router.isReady) {
      setIsReady(true);
    }
  }, [router.isReady]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!newPassword || !confirmPassword) {
      setError("Please fill in both password fields.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!oobCode || mode !== "resetPassword") {
      setError("This password reset link is invalid or has expired.");
      return;
    }

    setLoading(true);

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setMessage("Your password has been reset successfully. You can now sign in.");
      setTimeout(() => router.push("/login"), 1500);
    } catch (err) {
      let message = "Unable to reset your password. Please request a new link.";

      if (err?.code === "auth/expired-action-code") {
        message = "This reset link has expired. Please request a new one.";
      } else if (err?.code === "auth/invalid-action-code") {
        message = "This reset link is invalid. Please request a new one.";
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <Head>
        <title>Reset Password</title>
      </Head>

      <div className="card">
        <h1>Reset your password</h1>
        <p>Enter a new password for your admin account.</p>

        {!isReady ? (
          <p>Loading...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="newPassword">New password</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {error ? <div className="error">{error}</div> : null}
            {message ? <div className="success">{message}</div> : null}

            <button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update password"}
            </button>
          </form>
        )}
      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f5f7fa;
          padding: 1.5rem;
        }

        .card {
          width: 100%;
          max-width: 420px;
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        h1 {
          margin-bottom: 0.5rem;
          color: #2c3e50;
        }

        p {
          color: #6b7280;
          margin-bottom: 1rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #2c3e50;
        }

        input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 4px;
        }

        button {
          width: 100%;
          padding: 0.8rem;
          border: none;
          border-radius: 4px;
          background: #3498db;
          color: white;
          cursor: pointer;
          font-size: 1rem;
        }

        button:disabled {
          background: #95a5a6;
          cursor: not-allowed;
        }

        .error {
          background: #f8d7da;
          color: #721c24;
          padding: 0.75rem;
          border-radius: 4px;
          margin-bottom: 1rem;
        }

        .success {
          background: #d4edda;
          color: #155724;
          padding: 0.75rem;
          border-radius: 4px;
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
}
