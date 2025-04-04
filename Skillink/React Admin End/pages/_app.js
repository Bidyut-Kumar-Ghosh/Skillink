import "../styles/globals.css";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Routes that don't require authentication
  const publicRoutes = ["/login"];
  const isPublicRoute = publicRoutes.includes(router.pathname);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          // User is logged in, check if they're an admin
          const userDoc = await getDoc(doc(db, "users", user.uid));

          if (userDoc.exists() && userDoc.data().role === "admin") {
            // User is an admin, allow access to protected routes
            if (router.pathname === "/login") {
              router.push("/dashboard");
            }
          } else {
            // Not an admin, redirect to login
            await auth.signOut();
            if (!isPublicRoute) {
              router.push("/login");
            }
          }
        } else if (!isPublicRoute) {
          // No user and not on a public route, redirect to login
          router.push("/login");
        }
      } catch (error) {
        console.error("Auth error:", error);
        if (!isPublicRoute) {
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router.pathname, isPublicRoute]);

  if (loading && !isPublicRoute) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
          backgroundColor: "#f8f9fa",
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
        <div
          style={{
            marginTop: "20px",
            color: "#5468ff",
            fontWeight: "500",
          }}
        >
          Loading Skillink Admin...
        </div>
      </div>
    );
  }

  return <Component {...pageProps} key={router.asPath} />;
}
