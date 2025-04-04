import { useState, useEffect } from "react";
import Head from "next/head";
import Layout from "../components/Layout";
import { db, auth } from "../firebase/config";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { deleteUser, getAuth } from "firebase/auth";
import styles from "../styles/dashboard.module.css";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("students"); // "students" or "admins"

  useEffect(() => {
    fetchUsers();
  }, []);

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

  const openUserDetails = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
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
                    View
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
        <div className={styles.modal}>
          <div className={styles["modal-content"]}>
            <span
              className={styles.close}
              onClick={() => setIsModalOpen(false)}
            >
              &times;
            </span>
            <h2>User Details</h2>

            <div className={styles["user-details"]}>
              <div className={styles["user-header"]}>
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
                <div>
                  <h3>{selectedUser.displayName || "No Name"}</h3>
                  <p>{selectedUser.email}</p>
                  <p>Joined: {formatDate(selectedUser.createdAt)}</p>
                  <p>
                    Role:{" "}
                    <span
                      className={`${styles.role} ${
                        styles[selectedUser.role || "user"]
                      }`}
                    >
                      {selectedUser.role || "user"}
                    </span>
                  </p>
                  <p>
                    Status:{" "}
                    <span
                      className={`${styles.status} ${
                        styles[selectedUser.status || "active"]
                      }`}
                    >
                      {selectedUser.status || "Active"}
                    </span>
                  </p>
                </div>
              </div>

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
                      {Object.keys(selectedUser.courses).map((courseId) => (
                        <li key={courseId}>{courseId}</li>
                      ))}
                    </ul>
                  </div>
                )}

              <div className={styles["detail-actions"]}>
                <button
                  className={`${styles["action-btn"]} ${styles["activate-btn"]}`}
                  onClick={() => {
                    handleUpdateUser(selectedUser.id, "active");
                    setSelectedUser({ ...selectedUser, status: "active" });
                  }}
                  disabled={selectedUser.status === "active"}
                >
                  Activate User
                </button>
                <button
                  className={`${styles["action-btn"]} ${styles["suspend-btn"]}`}
                  onClick={() => {
                    handleUpdateUser(selectedUser.id, "suspended");
                    setSelectedUser({ ...selectedUser, status: "suspended" });
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
                    setIsModalOpen(false); // Close modal after role change to refresh view
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
                    auth.currentUser && auth.currentUser.uid === selectedUser.id
                  }
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
