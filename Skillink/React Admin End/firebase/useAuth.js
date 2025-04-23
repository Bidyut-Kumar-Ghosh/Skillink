import { useState, useEffect, createContext, useContext } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import { auth, db } from "./config";

// Create context for authentication state
const AuthContext = createContext();

// Main auth hook provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Clear any auth errors
  const clearError = () => setError(null);

  // Login function
  const login = async (email, password) => {
    clearError();
    setLoading(true);

    try {
      // Set auth persistence to LOCAL to survive page refreshes and server restarts
      await setPersistence(auth, browserLocalPersistence);

      // Sign in
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Verify admin role
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));

      if (!userDoc.exists() || userDoc.data().role !== "admin") {
        await firebaseSignOut(auth);
        throw new Error(
          "You don't have administrator privileges. If you are a student, please use the mobile app instead."
        );
      }

      return userCredential.user;
    } catch (err) {
      let message = "Login failed. Please try again.";

      // Handle specific error codes
      if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-email"
      ) {
        message = "Invalid email or password. Please check your credentials.";
      } else if (err.code === "auth/too-many-requests") {
        message = "Too many failed login attempts. Please try again later.";
      } else if (err.message) {
        message = err.message;
      }

      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      router.push("/login");
    } catch (err) {
      setError("Failed to log out. Please try again.");
      console.error("Logout error:", err);
    }
  };

  // Listen for auth state changes when the component mounts
  useEffect(() => {
    // Store the last known valid auth state in localStorage
    const persistAuthState = (user) => {
      if (user) {
        localStorage.setItem("authUser", "true");
      } else {
        localStorage.removeItem("authUser");
      }
    };

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);

      try {
        if (firebaseUser) {
          // Verify admin role on each auth state change
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

          if (userDoc.exists() && userDoc.data().role === "admin") {
            // Set user in state if they are an admin
            setUser(firebaseUser);
            persistAuthState(firebaseUser);
          } else {
            // Not an admin, sign them out
            await firebaseSignOut(auth);
            setUser(null);
            persistAuthState(null);
            if (router.pathname !== "/login") {
              router.push("/login");
            }
          }
        } else {
          // No user is signed in
          setUser(null);
          persistAuthState(null);
          if (router.pathname !== "/login") {
            router.push("/login");
          }
        }
      } catch (err) {
        console.error("Auth state error:", err);
        setUser(null);
        persistAuthState(null);
        if (router.pathname !== "/login") {
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    });

    // Redirect to login if on app restart we detect no auth
    const isAuthenticated = localStorage.getItem("authUser") === "true";
    if (!isAuthenticated && router.pathname !== "/login") {
      router.push("/login");
    }

    return () => unsubscribe();
  }, [router]);

  // Provide the auth context value to children
  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, logout, clearError }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// HOC to protect routes
export function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const { user, loading } = useAuth();
    const router = useRouter();

    // If auth is still loading, show a loading indicator
    if (loading) {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            backgroundColor: "#f5f7fa",
          }}
        >
          <div
            style={{
              width: "50px",
              height: "50px",
              border: "5px solid rgba(84, 104, 255, 0.2)",
              borderTopColor: "#5468ff",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          ></div>
        </div>
      );
    }

    // If user is not authenticated, redirect to login
    if (!user && router.pathname !== "/login") {
      router.push("/login");
      return null;
    }

    // If user is authenticated, render the component
    return <Component {...props} />;
  };
}
