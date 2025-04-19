import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { auth } from "../firebase/config";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function Layout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
        if (router.pathname !== "/login") {
          router.push("/login");
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleNavigation = (path) => {
    router.push(path);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user && router.pathname !== "/login") {
    return null;
  }

  return (
    <div className="admin-layout">
      {user && (
        <nav className="sidebar">
          <div className="sidebar-header">
            <h2>Skillink Admin</h2>
          </div>
          <ul className="nav-links">
            <li
              className={router.pathname === "/dashboard" ? "active" : ""}
              onClick={() => handleNavigation("/dashboard")}
            >
              <Link href="/dashboard" legacyBehavior>
                <a>Dashboard</a>
              </Link>
            </li>
            <li
              className={router.pathname === "/users" ? "active" : ""}
              onClick={() => handleNavigation("/users")}
            >
              <Link href="/users" legacyBehavior>
                <a>Users</a>
              </Link>
            </li>
            <li
              className={router.pathname === "/courses" ? "active" : ""}
              onClick={() => handleNavigation("/courses")}
            >
              <Link href="/courses" legacyBehavior>
                <a>Courses</a>
              </Link>
            </li>
            <li
              className={router.pathname === "/books" ? "active" : ""}
              onClick={() => handleNavigation("/books")}
            >
              <Link href="/books" legacyBehavior>
                <a>Books</a>
              </Link>
            </li>
            <li
              className={router.pathname === "/enrollments" ? "active" : ""}
              onClick={() => handleNavigation("/enrollments")}
            >
              <Link href="/enrollments" legacyBehavior>
                <a>Enrollments</a>
              </Link>
            </li>
            <li
              className={router.pathname === "/banners" ? "active" : ""}
              onClick={() => handleNavigation("/banners")}
            >
              <Link href="/banners" legacyBehavior>
                <a>App Banners</a>
              </Link>
            </li>
            <li className="logout" onClick={handleSignOut}>
              <a>Logout</a>
            </li>
          </ul>
        </nav>
      )}
      <main className="content">{children}</main>

      <style jsx>{`
        .admin-layout {
          display: flex;
          min-height: 100vh;
        }
        .sidebar {
          width: 250px;
          background-color: #2c3e50;
          color: white;
          padding: 20px 0;
        }
        .sidebar-header {
          padding: 0 20px 20px;
          border-bottom: 1px solid #34495e;
        }
        .nav-links {
          list-style: none;
          padding: 0;
          margin: 20px 0;
        }
        .nav-links li {
          padding: 10px 20px;
          cursor: pointer;
        }
        .nav-links li:hover,
        .nav-links li.active {
          background-color: #34495e;
        }
        .nav-links li a {
          color: white;
          text-decoration: none;
          display: block;
          width: 100%;
          height: 100%;
        }
        .logout {
          margin-top: 20px;
          border-top: 1px solid #34495e;
        }
        .content {
          flex: 1;
          padding: 20px;
          background-color: #f5f7fa;
        }
        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          font-size: 1.5rem;
        }
      `}</style>
    </div>
  );
}
