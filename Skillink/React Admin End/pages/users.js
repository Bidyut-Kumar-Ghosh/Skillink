import { useState, useEffect } from "react";
import Head from "next/head";
import Layout from "../components/Layout";
import { db, auth } from "../firebase/config";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { deleteUser, getAuth } from "firebase/auth";
import styles from "../styles/dashboard.module.css";
import Link from "next/link";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("students"); // "students" or "admins"
  const [userEnrollments, setUserEnrollments] = useState([]);
  const [userDetailTab, setUserDetailTab] = useState("profile");
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(false);
  const [courses, setCourses] = useState({});

  useEffect(() => {
    fetchUsers();
    // Fetch all courses for reference
    fetchAllCourses();
  }, []);

  const fetchAllCourses = async () => {
    try {
      const coursesSnapshot = await getDocs(collection(db, "courses"));
      const coursesData = {};
      coursesSnapshot.forEach((doc) => {
        coursesData[doc.id] = { id: doc.id, ...doc.data() };
      });
      setCourses(coursesData);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersCollection = collection(db, "users");
      const snapshot = await getDocs(usersCollection);

      const userList = [];
      snapshot.forEach((doc) => {
        const userData = doc.data();

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

        userList.push({
          id: doc.id,
          ...userData,
          displayName: displayName || "Unnamed User",
          createdAt: userData.createdAt?.toDate?.() || new Date(),
        });
      });

      setUsers(userList);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserEnrollments = async (userId) => {
    if (!userId) return;

    setEnrollmentsLoading(true);
    try {
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
        const courseData = courses[data.courseId] || {};

        enrollmentsList.push({
          id: doc.id,
          ...data,
          enrollmentDate: data.enrollmentDate?.toDate?.() || new Date(),
          courseName: courseData.title || "Unknown Course",
          courseCategory: courseData.category || "Unknown",
          courseImage: courseData.imageUrl || null,
        });
      });

      setUserEnrollments(enrollmentsList);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
    } finally {
      setEnrollmentsLoading(false);
    }
  };

  const handleUpdateUser = async (userId, status) => {
    try {
      const userRef = doc(db, "users", userId);

      // Update the status in Firestore
      await updateDoc(userRef, {
        status: status,
        lastUpdated: new Date(),
      });

      // Update local state
      setUsers(
        users.map((user) => (user.id === userId ? { ...user, status } : user))
      );

      alert(
        `User ${status === "active" ? "activated" : "suspended"} successfully`
      );

      // If we have the modal open with this user, update the selected user data too
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({ ...selectedUser, status: status });
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      alert(
        `Failed to ${status === "active" ? "activate" : "suspend"} user: ${
          error.message
        }`
      );
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      // Prevent removing admin role from your own account
      if (
        auth.currentUser &&
        auth.currentUser.uid === userId &&
        newRole !== "admin"
      ) {
        alert(
          "You cannot remove admin role from your own account while logged in."
        );
        return;
      }

      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { role: newRole });

      // Update local state
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );

      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({ ...selectedUser, role: newRole });
      }

      alert(`User role updated to ${newRole} successfully`);
    } catch (error) {
      console.error("Error updating user role:", error);
      alert("Failed to update user role: " + error.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      try {
        // First, check if this is the currently logged-in admin
        if (auth.currentUser && auth.currentUser.uid === userId) {
          alert("You cannot delete your own admin account while logged in.");
          return;
        }

        // Delete user document from Firestore
        await deleteDoc(doc(db, "users", userId));

        // Update local state
        setUsers(users.filter((user) => user.id !== userId));

        alert("User deleted successfully");
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Failed to delete user: " + error.message);
      }
    }
  };

  const openUserDetails = async (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
    setUserDetailTab("profile");
    // Fetch enrollments when opening user details
    await fetchUserEnrollments(user.id);
  };

  // Filter users by role and search term
  const adminUsers = users.filter(
    (user) =>
      user.role === "admin" &&
      (user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const studentUsers = users.filter(
    (user) =>
      user.role !== "admin" &&
      (user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Select which array to display based on active tab
  const displayUsers = activeTab === "admins" ? adminUsers : studentUsers;

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderUserTable = (userList) => {
    if (userList.length === 0) {
      return <div className={styles["no-results"]}>No users found</div>;
    }

    return (
      <table className={styles["users-table"]}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Joined</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {userList.map((user) => (
            <tr
              key={user.id}
              className={user.role === "admin" ? styles["admin-row"] : ""}
            >
              <td>
                <div className={styles["user-info"]}>
                  <div className={styles.avatar}>
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName} />
                    ) : (
                      <div className={styles["avatar-placeholder"]}>
                        {user.displayName?.charAt(0) ||
                          user.email?.charAt(0) ||
                          "?"}
                      </div>
                    )}
                  </div>
                  <span>{user.displayName || "No Name"}</span>
                </div>
              </td>
              <td>{user.email}</td>
              <td>
                <span
                  className={`${styles.role} ${styles[user.role || "user"]}`}
                >
                  {user.role || "user"}
                </span>
              </td>
              <td>{formatDate(user.createdAt)}</td>
              <td>
                <span
                  className={`${styles.status} ${
                    styles[user.status || "active"]
                  }`}
                >
                  {user.status || "Active"}
                </span>
              </td>
              <td>
                <div className={styles.actions}>
                  <button
                    className={`${styles["action-btn"]} ${styles["view-btn"]}`}
                    onClick={() => openUserDetails(user)}
                  >
                    View Details
                  </button>
                  <button
                    className={`${styles["action-btn"]} ${styles["activate-btn"]}`}
                    onClick={() => handleUpdateUser(user.id, "active")}
                    disabled={user.status === "active"}
                  >
                    Activate
                  </button>
                  <button
                    className={`${styles["action-btn"]} ${styles["suspend-btn"]}`}
                    onClick={() => handleUpdateUser(user.id, "suspended")}
                    disabled={user.status === "suspended"}
                  >
                    Suspend
                  </button>
                  <button
                    className={`${styles["action-btn"]} ${styles["admin-btn"]}`}
                    onClick={() =>
                      user.role !== "admin"
                        ? handleUpdateRole(user.id, "admin")
                        : handleUpdateRole(user.id, "user")
                    }
                    disabled={
                      auth.currentUser &&
                      auth.currentUser.uid === user.id &&
                      user.role === "admin"
                    }
                  >
                    {user.role !== "admin" ? "Make Admin" : "Remove Admin"}
                  </button>
                  <button
                    className={`${styles["action-btn"]} ${styles["delete-btn"]}`}
                    onClick={() => handleDeleteUser(user.id)}
                    disabled={
                      auth.currentUser && auth.currentUser.uid === user.id
                    }
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  // Render the enrollment cards for a user
  const renderEnrollments = () => {
    if (enrollmentsLoading) {
      return <div className={styles.loading}>Loading enrollments...</div>;
    }

    if (userEnrollments.length === 0) {
      return (
        <div className={styles["no-data"]}>
          This user has not enrolled in any courses.
        </div>
      );
    }

    return (
      <div className="enrollment-list">
        {userEnrollments.map((enrollment) => (
          <div key={enrollment.id} className="enrollment-card">
            <div className="enrollment-course-image">
              {enrollment.courseImage ? (
                <img src={enrollment.courseImage} alt={enrollment.courseName} />
              ) : (
                <div className="course-image-placeholder">
                  {enrollment.courseName?.charAt(0).toUpperCase() || "C"}
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
                  Amount: ${parseFloat(enrollment.amount).toFixed(2)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render the purchases table for a user
  const renderPurchases = () => {
    if (enrollmentsLoading) {
      return <div className={styles.loading}>Loading purchases...</div>;
    }

    if (userEnrollments.length === 0) {
      return (
        <div className={styles["no-data"]}>
          This user has not made any purchases.
        </div>
      );
    }

    return (
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
            {userEnrollments.map((enrollment) => (
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
                      ? enrollment.paymentStatus.charAt(0).toUpperCase() +
                        enrollment.paymentStatus.slice(1)
                      : "Pending"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <Layout>
      <Head>
        <title>User Management | Skillink Admin</title>
      </Head>

      <div className={`${styles.dashboard} ${styles["users-container"]}`}>
        <div className={styles.header}>
          <h1>User Management</h1>
          <div className={styles["search-bar"]}>
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${
              activeTab === "students" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("students")}
          >
            Students ({studentUsers.length})
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === "admins" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("admins")}
          >
            Administrators ({adminUsers.length})
          </button>
        </div>

        {loading ? (
          <div className={styles.loading}>Loading users...</div>
        ) : (
          <div className={styles["user-table-container"]}>
            <h2>{activeTab === "admins" ? "Administrators" : "Students"}</h2>
            {renderUserTable(displayUsers)}
          </div>
        )}
      </div>

      {isModalOpen && selectedUser && (
        <div className={styles.modal} style={{ maxWidth: "900px" }}>
          <div
            className={styles["modal-content"]}
            style={{ width: "100%", maxWidth: "900px" }}
          >
            <span
              className={styles.close}
              onClick={() => setIsModalOpen(false)}
            >
              &times;
            </span>
            <h2>User Details</h2>

            <div className="user-profile-card">
              <div className="user-header">
                <div className={styles["large-avatar"]}>
                  {selectedUser.photoURL ? (
                    <img
                      src={selectedUser.photoURL}
                      alt={selectedUser.displayName}
                    />
                  ) : (
                    <div
                      className={`${styles["avatar-placeholder"]} ${styles.large}`}
                    >
                      {selectedUser.displayName?.charAt(0) ||
                        selectedUser.email?.charAt(0) ||
                        "?"}
                    </div>
                  )}
                </div>
                <div className="user-info">
                  <h3>{selectedUser.displayName || "No Name"}</h3>
                  <p className="user-email">{selectedUser.email}</p>
                  <div className="user-meta">
                    <span
                      className={`user-status ${
                        selectedUser.status === "active"
                          ? "status-active"
                          : "status-inactive"
                      }`}
                    >
                      {selectedUser.status || "Unknown Status"}
                    </span>
                    <span className="user-role">
                      {selectedUser.role || "user"}
                    </span>
                    <span className="user-joined">
                      Joined: {formatDate(selectedUser.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="tabs-container">
              <div className="tabs-header">
                <button
                  className={`tab-button ${
                    userDetailTab === "profile" ? "active" : ""
                  }`}
                  onClick={() => setUserDetailTab("profile")}
                >
                  Profile
                </button>
                <button
                  className={`tab-button ${
                    userDetailTab === "enrollments" ? "active" : ""
                  }`}
                  onClick={() => setUserDetailTab("enrollments")}
                >
                  Enrollments
                </button>
                <button
                  className={`tab-button ${
                    userDetailTab === "purchases" ? "active" : ""
                  }`}
                  onClick={() => setUserDetailTab("purchases")}
                >
                  Purchases
                </button>
              </div>

              <div className="tab-content">
                {userDetailTab === "profile" && (
                  <div className="profile-tab">
                    <div className={styles["details-section"]}>
                      <h4>Profile Information</h4>
                      <p>
                        <strong>User ID:</strong> {selectedUser.id}
                      </p>
                      <p>
                        <strong>Phone:</strong>{" "}
                        {selectedUser.phoneNumber || "Not provided"}
                      </p>
                      <p>
                        <strong>Email Verified:</strong>{" "}
                        {selectedUser.emailVerified ? "Yes" : "No"}
                      </p>
                    </div>

                    {selectedUser.courses &&
                      Object.keys(selectedUser.courses).length > 0 && (
                        <div className={styles["details-section"]}>
                          <h4>Enrolled Courses</h4>
                          <ul>
                            {Object.keys(selectedUser.courses).map(
                              (courseId) => (
                                <li key={courseId}>{courseId}</li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                    <div className={styles["detail-actions"]}>
                      <button
                        className={`${styles["action-btn"]} ${styles["activate-btn"]}`}
                        onClick={() => {
                          handleUpdateUser(selectedUser.id, "active");
                          setSelectedUser({
                            ...selectedUser,
                            status: "active",
                          });
                        }}
                        disabled={selectedUser.status === "active"}
                      >
                        Activate User
                      </button>
                      <button
                        className={`${styles["action-btn"]} ${styles["suspend-btn"]}`}
                        onClick={() => {
                          handleUpdateUser(selectedUser.id, "suspended");
                          setSelectedUser({
                            ...selectedUser,
                            status: "suspended",
                          });
                        }}
                        disabled={selectedUser.status === "suspended"}
                      >
                        Suspend User
                      </button>
                      <button
                        className={`${styles["action-btn"]} ${styles["admin-btn"]}`}
                        onClick={() => {
                          if (selectedUser.role !== "admin") {
                            handleUpdateRole(selectedUser.id, "admin");
                          } else {
                            handleUpdateRole(selectedUser.id, "user");
                          }
                        }}
                        disabled={
                          selectedUser.role === "admin" &&
                          auth.currentUser &&
                          auth.currentUser.uid === selectedUser.id
                        }
                      >
                        {selectedUser.role !== "admin"
                          ? "Make Administrator"
                          : "Remove Administrator Role"}
                      </button>
                      <button
                        className={`${styles["action-btn"]} ${styles["delete-btn"]}`}
                        onClick={() => {
                          handleDeleteUser(selectedUser.id);
                          setIsModalOpen(false);
                        }}
                        disabled={
                          auth.currentUser &&
                          auth.currentUser.uid === selectedUser.id
                        }
                      >
                        Delete User
                      </button>
                    </div>
                  </div>
                )}

                {userDetailTab === "enrollments" && (
                  <div className="enrollments-tab">
                    <h3>Course Enrollments</h3>
                    {renderEnrollments()}
                  </div>
                )}

                {userDetailTab === "purchases" && (
                  <div className="purchases-tab">
                    <h3>Purchase History</h3>
                    {renderPurchases()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
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

        .user-info {
          flex: 1;
          margin-left: 20px;
        }

        .user-info h3 {
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
      `}</style>
    </Layout>
  );
}
