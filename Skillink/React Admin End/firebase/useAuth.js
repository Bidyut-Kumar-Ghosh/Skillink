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
import {
  clearAdminSession,
  findAdminUserByEmailAndPassword,
  getStoredAdminSession,
  normalizeEmail,
  persistAdminSession,
} from "./session";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  const clearError = () => setError(null);

  const login = async (email, password) => {
    clearError();
    setLoading(true);

    const normalizedEmail = normalizeEmail(email);

    try {
      await setPersistence(auth, browserLocalPersistence);

      const userCredential = await signInWithEmailAndPassword(
        auth,
        normalizedEmail,
        password
      );

      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));

      if (!userDoc.exists() || userDoc.data().role !== "admin") {
        await firebaseSignOut(auth);
        clearAdminSession();
        throw new Error(
          "You don't have administrator privileges. If you are a student, please use the mobile app instead."
        );
      }

      const adminUser = {
        uid: userCredential.user.uid,
        id: userCredential.user.uid,
        email: userCredential.user.email || normalizedEmail,
        name: userDoc.data().name || "",
        role: "admin",
      };

      persistAdminSession(adminUser);
      setUser(adminUser);

      return adminUser;
    } catch (err) {
      const isCredentialError =
        err.code === "auth/invalid-credential" ||
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-email";

      if (isCredentialError) {
        const firestoreAdminUser = await findAdminUserByEmailAndPassword(
          normalizedEmail,
          password
        );

        if (firestoreAdminUser) {
          setUser(firestoreAdminUser);
          persistAdminSession(firestoreAdminUser);
          return firestoreAdminUser;
        }
      }

      let message = "Login failed. Please try again.";

      if (isCredentialError) {
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

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      clearAdminSession();
      router.push("/login");
    } catch (err) {
      setError("Failed to log out. Please try again.");
      console.error("Logout error:", err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);

      try {
        if (firebaseUser) {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

          if (userDoc.exists() && userDoc.data().role === "admin") {
            const adminUser = {
              uid: firebaseUser.uid,
              id: firebaseUser.uid,
              email: firebaseUser.email || "",
              name: userDoc.data().name || "",
              role: "admin",
            };

            setUser(adminUser);
            persistAdminSession(adminUser);
          } else {
            await firebaseSignOut(auth);
            setUser(null);
            clearAdminSession();
            if (router.pathname !== "/login") {
              router.push("/login");
            }
          }
        } else {
          const storedSession = getStoredAdminSession();

          if (storedSession) {
            setUser(storedSession);
          } else {
            setUser(null);
            clearAdminSession();
            if (router.pathname !== "/login") {
              router.push("/login");
            }
          }
        }
      } catch (err) {
        console.error("Auth state error:", err);
        setUser(null);
        clearAdminSession();
        if (router.pathname !== "/login") {
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    });

    const storedSession = getStoredAdminSession();
    if (!storedSession && router.pathname !== "/login") {
      router.push("/login");
    }

    return () => unsubscribe();
  }, [router]);

  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, logout, clearError }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const { user, loading } = useAuth();
    const router = useRouter();

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
          />
        </div>
      );
    }

    if (!user && router.pathname !== "/login") {
      router.push("/login");
      return null;
    }

    return <Component {...props} />;
  };
}
