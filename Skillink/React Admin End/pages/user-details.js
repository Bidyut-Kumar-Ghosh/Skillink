import { useState, useEffect } from "react";
import Head from "next/head";
import Layout from "../components/Layout";
import { db } from "../firebase/config";
import { useRouter } from "next/router";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";

export default function UserDetails() {
  const router = useRouter();
  const { userId } = router.query;

  const [user, setUser] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("enrollments");
  const [courses, setCourses] = useState({});

  useEffect(() => {
    // Only fetch data when userId is available
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const fetchUserData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch user details
      const userDoc = await getDoc(doc(db, "users", userId));
      if (!userDoc.exists()) {
        setError("User not found");
        setLoading(false);
        return;
      }

      const userData = userDoc.data();
      // Handle different name fields that might exist in the user document
      let displayName =
        userData.displayName ||
        userData.fullName ||
        userData.name ||
        (userData.firstName && userData.lastName
          ? `${userData.firstName} ${userData.lastName}`
          : null);

      // If no name found but has email, create a name from the email
      if (!displayName && userData.email) {
        displayName = userData.email.split("@")[0];
        // Convert to title case (capitalize first letter of each word)
        displayName = displayName
          .replace(/[._-]/g, " ") // Replace dots, underscores, and hyphens with spaces
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      }

      setUser({
        id: userDoc.id,
        ...userData,
        displayName: displayName || "Unnamed User",
        createdAt: userData.createdAt?.toDate?.() || new Date(),
      });

      // Fetch all courses for reference
      const coursesSnapshot = await getDocs(collection(db, "courses"));
      const coursesData = {};
      coursesSnapshot.forEach((doc) => {
        coursesData[doc.id] = { id: doc.id, ...doc.data() };
      });
      setCourses(coursesData);

      // Fetch user enrollments
      const enrollmentsQuery = query(
        collection(db, "enrollments"),
        where("userId", "==", userId),
        orderBy("enrollmentDate", "desc")
      );
      const enrollmentsSnapshot = await getDocs(enrollmentsQuery);

      const enrollmentsList = [];
      enrollmentsSnapshot.forEach((doc) => {
        const data = doc.data();
        const courseData = coursesData[data.courseId] || {};

        enrollmentsList.push({
          id: doc.id,
          ...data,
          enrollmentDate: data.enrollmentDate?.toDate?.() || new Date(),
          courseName: courseData.title || "Unknown Course",
          courseCategory: courseData.category || "Unknown",
          courseImage: courseData.imageUrl || null,
        });
      });

      setEnrollments(enrollmentsList);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("Error fetching user data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleBackClick = () => {
    router.push("/users");
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading">Loading user data...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={handleBackClick} className="back-button">
            Return to Users
          </button>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="error-container">
          <h2>User Not Found</h2>
          <p>The requested user could not be found.</p>
          <button onClick={handleBackClick} className="back-button">
            Return to Users
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>{user.displayName} - User Details | Admin Panel</title>
      </Head>

      <div className="user-details-container">
        <div className="header-row">
          <button onClick={handleBackClick} className="back-button">
            &larr; Back to Users
          </button>
          <h1>User Details</h1>
        </div>

        <div className="user-profile-card">
          <div className="user-header">
            <div className="user-avatar">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName} />
              ) : (
                <div className="avatar-placeholder">
                  {user.displayName?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
            </div>
            <div className="user-info">
              <h2>{user.displayName}</h2>
              <p className="user-email">{user.email}</p>
              <div className="user-meta">
                <span
                  className={`user-status ${
                    user.status === "active"
                      ? "status-active"
                      : "status-inactive"
                  }`}
                >
                  {user.status || "Unknown Status"}
                </span>
                <span className="user-role">{user.role || "user"}</span>
                <span className="user-joined">
                  Joined: {formatDate(user.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="tabs-container">
          <div className="tabs-header">
            <button
              className={`tab-button ${
                activeTab === "enrollments" ? "active" : ""
              }`}
              onClick={() => setActiveTab("enrollments")}
            >
              Enrollments
            </button>
            <button
              className={`tab-button ${
                activeTab === "purchases" ? "active" : ""
              }`}
              onClick={() => setActiveTab("purchases")}
            >
              Purchases
            </button>
          </div>

          <div className="tab-content">
            {activeTab === "enrollments" && (
              <div className="enrollments-tab">
                <h3>Course Enrollments</h3>
                {enrollments.length === 0 ? (
                  <div className="no-data">
                    This user has not enrolled in any courses.
                  </div>
                ) : (
                  <div className="enrollment-list">
                    {enrollments.map((enrollment) => (
                      <div key={enrollment.id} className="enrollment-card">
                        <div className="enrollment-course-image">
                          {enrollment.courseImage ? (
                            <img
                              src={enrollment.courseImage}
                              alt={enrollment.courseName}
                            />
                          ) : (
                            <div className="course-image-placeholder">
                              {enrollment.courseName?.charAt(0).toUpperCase() ||
                                "C"}
                            </div>
                          )}
                        </div>
                        <div className="enrollment-details">
                          <h4>{enrollment.courseName}</h4>
                          <div className="enrollment-meta">
                            <span className="enrollment-category">
                              {enrollment.courseCategory}
                            </span>
                            <span className="enrollment-date">
                              Enrolled: {formatDate(enrollment.enrollmentDate)}
                            </span>
                          </div>
                          <div className="enrollment-status">
                            <span
                              className={`status-badge ${
                                enrollment.status === "completed"
                                  ? "status-completed"
                                  : enrollment.status === "active"
                                  ? "status-active"
                                  : enrollment.status === "cancelled"
                                  ? "status-cancelled"
                                  : "status-pending"
                              }`}
                            >
                              {enrollment.status
                                ? enrollment.status.charAt(0).toUpperCase() +
                                  enrollment.status.slice(1)
                                : "Pending"}
                            </span>
                          </div>
                          {enrollment.amount && (
                            <div className="enrollment-amount">
                              Amount: $
                              {parseFloat(enrollment.amount).toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "purchases" && (
              <div className="purchases-tab">
                <h3>Purchase History</h3>
                {enrollments.length === 0 ? (
                  <div className="no-data">
                    This user has not made any purchases.
                  </div>
                ) : (
                  <div className="purchases-table-container">
                    <table className="purchases-table">
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th>Date</th>
                          <th>Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {enrollments.map((enrollment) => (
                          <tr key={enrollment.id}>
                            <td>{enrollment.courseName}</td>
                            <td>{formatDate(enrollment.enrollmentDate)}</td>
                            <td>
                              $
                              {enrollment.amount
                                ? parseFloat(enrollment.amount).toFixed(2)
                                : "0.00"}
                            </td>
                            <td>
                              <span
                                className={`status-badge ${
                                  enrollment.paymentStatus === "completed"
                                    ? "status-completed"
                                    : enrollment.paymentStatus === "refunded"
                                    ? "status-cancelled"
                                    : enrollment.paymentStatus === "failed"
                                    ? "status-failed"
                                    : "status-pending"
                                }`}
                              >
                                {enrollment.paymentStatus
                                  ? enrollment.paymentStatus
                                      .charAt(0)
                                      .toUpperCase() +
                                    enrollment.paymentStatus.slice(1)
                                  : "Pending"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .user-details-container {
          padding: 20px;
        }

        .header-row {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
        }

        .back-button {
          background-color: #ecf0f1;
          color: #2c3e50;
          border: none;
          border-radius: 4px;
          padding: 8px 16px;
          margin-right: 20px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: background-color 0.2s;
        }

        .back-button:hover {
          background-color: #d5dbdb;
        }

        h1 {
          margin: 0;
          color: #2c3e50;
          font-size: 1.8rem;
        }

        .user-profile-card {
          background-color: white;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .user-header {
          display: flex;
          align-items: center;
        }

        .user-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          overflow: hidden;
          margin-right: 20px;
          background-color: #3498db;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .user-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-placeholder {
          font-size: 2rem;
          color: white;
          font-weight: bold;
        }

        .user-info {
          flex: 1;
        }

        .user-info h2 {
          margin: 0 0 5px 0;
          color: #2c3e50;
          font-size: 1.5rem;
        }

        .user-email {
          margin: 0 0 10px 0;
          color: #7f8c8d;
          font-size: 1rem;
        }

        .user-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .user-status,
        .user-role {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .status-active {
          background-color: #e8f5e9;
          color: #2e7d32;
        }

        .status-inactive {
          background-color: #ffebee;
          color: #c62828;
        }

        .user-role {
          background-color: #e3f2fd;
          color: #1565c0;
          text-transform: capitalize;
        }

        .user-joined {
          color: #7f8c8d;
          font-size: 0.85rem;
        }

        .tabs-container {
          background-color: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .tabs-header {
          display: flex;
          border-bottom: 1px solid #ecf0f1;
        }

        .tab-button {
          padding: 15px 20px;
          background: none;
          border: none;
          font-size: 1rem;
          color: #7f8c8d;
          cursor: pointer;
          transition: all 0.2s;
        }

        .tab-button.active {
          color: #3498db;
          border-bottom: 2px solid #3498db;
          font-weight: 500;
        }

        .tab-button:hover {
          background-color: #f8f9fa;
        }

        .tab-content {
          padding: 20px;
        }

        h3 {
          margin-top: 0;
          margin-bottom: 20px;
          color: #2c3e50;
          font-size: 1.25rem;
        }

        .no-data {
          padding: 30px;
          text-align: center;
          color: #7f8c8d;
          background-color: #f8f9fa;
          border-radius: 4px;
        }

        .enrollment-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .enrollment-card {
          display: flex;
          background-color: #f8f9fa;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .enrollment-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .enrollment-course-image {
          width: 100px;
          height: 100px;
          flex-shrink: 0;
          background-color: #dfe6e9;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .enrollment-course-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .course-image-placeholder {
          font-size: 2.5rem;
          font-weight: bold;
          color: #b2bec3;
        }

        .enrollment-details {
          flex: 1;
          padding: 12px;
          display: flex;
          flex-direction: column;
        }

        .enrollment-details h4 {
          margin: 0 0 8px 0;
          font-size: 1rem;
          color: #2c3e50;
        }

        .enrollment-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 8px;
        }

        .enrollment-category {
          background-color: #edf2f7;
          color: #4a5568;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 0.75rem;
        }

        .enrollment-date,
        .enrollment-amount {
          font-size: 0.85rem;
          color: #7f8c8d;
        }

        .enrollment-status {
          margin-top: auto;
        }

        .status-badge {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .status-completed {
          background-color: #e3f2fd;
          color: #1565c0;
        }

        .status-active {
          background-color: #e8f5e9;
          color: #2e7d32;
        }

        .status-cancelled,
        .status-failed {
          background-color: #ffebee;
          color: #c62828;
        }

        .status-pending {
          background-color: #fff8e1;
          color: #ff8f00;
        }

        .purchases-table-container {
          overflow-x: auto;
        }

        .purchases-table {
          width: 100%;
          border-collapse: collapse;
        }

        .purchases-table th,
        .purchases-table td {
          padding: 12px 15px;
          text-align: left;
          border-bottom: 1px solid #ecf0f1;
        }

        .purchases-table th {
          background-color: #f8f9fa;
          font-weight: 600;
          color: #7f8c8d;
        }

        .purchases-table tr:hover {
          background-color: #f8f9fa;
        }

        .loading,
        .error-container {
          padding: 50px;
          text-align: center;
          color: #7f8c8d;
        }

        .error-container h2 {
          color: #e74c3c;
          margin-bottom: 10px;
        }

        .error-container p {
          margin-bottom: 20px;
        }

        @media (max-width: 768px) {
          .enrollment-list {
            grid-template-columns: 1fr;
          }

          .user-header {
            flex-direction: column;
            text-align: center;
          }

          .user-avatar {
            margin-right: 0;
            margin-bottom: 15px;
          }

          .header-row {
            flex-direction: column;
            align-items: flex-start;
          }

          .back-button {
            margin-bottom: 10px;
          }
        }
      `}</style>
    </Layout>
  );
}
