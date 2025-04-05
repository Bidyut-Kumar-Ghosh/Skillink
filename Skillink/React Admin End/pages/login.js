import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { auth, db } from "../firebase/config";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Head from "next/head";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check if user has admin role
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists() && userDoc.data().role === "admin") {
            router.push("/dashboard");
          } else {
            // Not an admin, sign them out
            await signOut(auth);
            setError(
              "You don't have administrator privileges. If you are a student, please use the mobile app instead. If you believe you should have admin access, please contact support."
            );
            setLoading(false);
          }
        } catch (error) {
          await signOut(auth);
          setError("Error verifying your account. Please try again.");
          setLoading(false);
        }
      } else {
        // No user is signed in
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      // Authentication successful, but don't redirect yet
      // The onAuthStateChanged listener will check admin role and redirect if appropriate

      // If we get here without errors, check if there's a user
      if (!userCredential || !userCredential.user) {
        setError("Login failed. Please try again.");
        setLoading(false);
      }
    } catch (error) {
      // Handle specific Firebase error codes
      switch (error.code) {
        case "auth/invalid-credential":
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-email":
          setError(
            "Invalid email or password. If you are a student, please use the mobile app instead. If you are an administrator, please check your credentials and try again."
          );
          break;
        case "auth/too-many-requests":
          setError(
            "Too many failed login attempts. Please try again later or reset your password."
          );
          break;
        default:
          setError(`Login failed. Please try again later.`);
      }

      setLoading(false);
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
