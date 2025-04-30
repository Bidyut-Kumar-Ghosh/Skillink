import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState, useRef, useCallback } from "react";
import { auth } from "../firebase/config";
import { onAuthStateChanged, signOut } from "firebase/auth";

// Auto-logout after 2 hours of inactivity (in milliseconds)
const INACTIVITY_TIMEOUT = 2 * 60 * 60 * 1000;

export default function Layout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(INACTIVITY_TIMEOUT);
  const router = useRouter();
  const timerRef = useRef(null);
  const activityTimerRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  // Format time remaining in HH:MM:SS format
  const formatTimeRemaining = useCallback(() => {
    const hours = Math.floor(timeRemaining / (60 * 60 * 1000));
    const minutes = Math.floor(
      (timeRemaining % (60 * 60 * 1000)) / (60 * 1000)
    );
    const seconds = Math.floor((timeRemaining % (60 * 1000)) / 1000);

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }, [timeRemaining]);

  // Reset the auto-logout timer when there's activity
  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    setTimeRemaining(INACTIVITY_TIMEOUT);
  }, []);

  // Handle user activity
  const handleUserActivity = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  // Auto-logout after inactivity
  useEffect(() => {
    if (!user) return;

    // Update remaining time every second
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      const remaining = Math.max(0, INACTIVITY_TIMEOUT - elapsed);

      setTimeRemaining(remaining);

      // Log out if time expires
      if (remaining === 0) {
        signOut(auth);
        router.push("/login");
        clearInterval(timerRef.current);
      }
    }, 1000);

    // Track user activity
    const activityEvents = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];

    activityEvents.forEach((event) => {
      window.addEventListener(event, handleUserActivity);
    });

    return () => {
      clearInterval(timerRef.current);
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [user, handleUserActivity, router]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        // Reset the timer when user logs in
        resetTimer();
      } else {
        setUser(null);
        if (router.pathname !== "/login") {
          router.push("/login");
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, resetTimer]);

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

          <div className="session-timer">
            <div className="timer-label">Auto-logout in:</div>
            <div
              className={`timer-value ${
                timeRemaining < 10 * 60 * 1000
                  ? "danger"
                  : timeRemaining < 30 * 60 * 1000
                  ? "warning"
                  : ""
              }`}
            >
              {formatTimeRemaining()}
            </div>
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
                <a>Banners</a>
              </Link>
            </li>
            <li
              className={router.pathname === "/feedback" ? "active" : ""}
              onClick={() => handleNavigation("/feedback")}
            >
              <Link href="/feedback" legacyBehavior>
                <a>Feedback</a>
              </Link>
            </li>
            <li
              className={router.pathname === "/updates" ? "active" : ""}
              onClick={() => handleNavigation("/updates")}
            >
              <Link href="/updates" legacyBehavior>
                <a>Updates</a>
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
          display: flex;
          flex-direction: column;
        }
        .sidebar-header {
          padding: 0 20px 20px;
          border-bottom: 1px solid #34495e;
        }
        .session-timer {
          padding: 15px 20px;
          background-color: #34495e;
          border-bottom: 1px solid #2c3e50;
          text-align: center;
        }
        .timer-label {
          font-size: 0.8rem;
          color: #95a5a6;
          margin-bottom: 5px;
        }
        .timer-value {
          font-size: 1rem;
          font-weight: 600;
          color: #ecf0f1;
          font-family: monospace;
        }
        .timer-value.warning {
          color: #f39c12;
        }
        .timer-value.danger {
          color: #e74c3c;
        }
        .nav-links {
          list-style: none;
          padding: 0;
          margin: 20px 0;
          flex: 1;
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
