import { useState, useEffect } from "react";
import Head from "next/head";
import Layout from "../components/Layout";
import { db } from "../firebase/config";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  getDoc,
} from "firebase/firestore";

export default function Enrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState({});
  const [courses, setCourses] = useState({});
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all users for reference
      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersData = {};
      usersSnapshot.forEach((doc) => {
        usersData[doc.id] = { id: doc.id, ...doc.data() };
      });
      setUsers(usersData);

      // Fetch all courses for reference
      const coursesSnapshot = await getDocs(collection(db, "courses"));
      const coursesData = {};
      coursesSnapshot.forEach((doc) => {
        coursesData[doc.id] = { id: doc.id, ...doc.data() };
      });
      setCourses(coursesData);

      // Fetch enrollments
      const enrollmentsQuery = query(
        collection(db, "enrollments"),
        orderBy("enrollmentDate", "desc")
      );
      const enrollmentsSnapshot = await getDocs(enrollmentsQuery);

      const enrollmentsList = [];
      enrollmentsSnapshot.forEach((doc) => {
        const data = doc.data();
        enrollmentsList.push({
          id: doc.id,
          ...data,
          enrollmentDate: data.enrollmentDate?.toDate?.() || new Date(),
          // Add user and course info
          studentName: data.userId
            ? usersData[data.userId]?.displayName || "Unknown"
            : "Unknown",
          courseName: data.courseId
            ? coursesData[data.courseId]?.title || "Unknown"
            : "Unknown",
        });
      });

      setEnrollments(enrollmentsList);
    } catch (error) {
      console.error("Error fetching enrollments data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (enrollmentId, newStatus) => {
    try {
      const enrollmentRef = doc(db, "enrollments", enrollmentId);
      await updateDoc(enrollmentRef, { status: newStatus });

      // Update local state
      setEnrollments(
        enrollments.map((enrollment) =>
          enrollment.id === enrollmentId
            ? { ...enrollment, status: newStatus }
            : enrollment
        )
      );

      if (selectedEnrollment && selectedEnrollment.id === enrollmentId) {
        setSelectedEnrollment({ ...selectedEnrollment, status: newStatus });
      }

      alert("Enrollment status updated successfully");
    } catch (error) {
      console.error("Error updating enrollment status:", error);
      alert("Failed to update enrollment status");
    }
  };

  const handleDeleteEnrollment = async (enrollmentId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this enrollment? This action cannot be undone."
      )
    ) {
      try {
        await deleteDoc(doc(db, "enrollments", enrollmentId));
        setEnrollments(
          enrollments.filter((enrollment) => enrollment.id !== enrollmentId)
        );
        if (isModalOpen && selectedEnrollment.id === enrollmentId) {
          setIsModalOpen(false);
        }
        alert("Enrollment deleted successfully");
      } catch (error) {
        console.error("Error deleting enrollment:", error);
        alert("Failed to delete enrollment");
      }
    }
  };

  const viewEnrollmentDetails = async (enrollment) => {
    try {
      // Fetch the most up-to-date enrollment data
      const enrollmentDoc = await getDoc(doc(db, "enrollments", enrollment.id));
      if (enrollmentDoc.exists()) {
        const data = enrollmentDoc.data();
        setSelectedEnrollment({
          ...data,
          id: enrollment.id,
          enrollmentDate: data.enrollmentDate?.toDate() || new Date(),
          studentName: enrollment.studentName,
          courseName: enrollment.courseName,
          user: users[data.userId] || null,
          course: courses[data.courseId] || null,
        });
        setIsModalOpen(true);
      } else {
        alert("Enrollment not found");
      }
    } catch (error) {
      console.error("Error fetching enrollment details:", error);
    }
  };

  const filteredEnrollments = enrollments.filter(
    (enrollment) =>
      enrollment.studentName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      enrollment.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (enrollment.status &&
        enrollment.status.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (date) => {
    return date
      ? new Date(date).toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "N/A";
  };

  return (
    <Layout>
      <Head>
        <title>Enrollment Management - Admin Panel</title>
      </Head>

      <div className="enrollments-container">
        <div className="header">
          <h1>Enrollment Management</h1>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search enrollments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading enrollments...</div>
        ) : (
          <>
            {filteredEnrollments.length > 0 ? (
              <table className="enrollments-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Course</th>
                    <th>Enrollment Date</th>
                    <th>Status</th>
                    <th>Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEnrollments.map((enrollment) => (
                    <tr key={enrollment.id}>
                      <td>{enrollment.studentName}</td>
                      <td>{enrollment.courseName}</td>
                      <td>{enrollment.enrollmentDate.toLocaleDateString()}</td>
                      <td>
                        <span
                          className={`status ${enrollment.status || "active"}`}
                        >
                          {enrollment.status || "Active"}
                        </span>
                      </td>
                      <td>${enrollment.amount?.toFixed(2) || "0.00"}</td>
                      <td>
                        <div className="actions">
                          <button
                            className="view-btn"
                            onClick={() => viewEnrollmentDetails(enrollment)}
                          >
                            View
                          </button>
                          <button
                            className="active-btn"
                            onClick={() =>
                              handleStatusChange(enrollment.id, "active")
                            }
                            disabled={enrollment.status === "active"}
                          >
                            Activate
                          </button>
                          <button
                            className="suspend-btn"
                            onClick={() =>
                              handleStatusChange(enrollment.id, "suspended")
                            }
                            disabled={enrollment.status === "suspended"}
                          >
                            Suspend
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() =>
                              handleDeleteEnrollment(enrollment.id)
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
            ) : (
              <div className="no-results">No enrollments found</div>
            )}
          </>
        )}
      </div>

      {isModalOpen && selectedEnrollment && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setIsModalOpen(false)}>
              &times;
            </span>
            <h2>Enrollment Details</h2>

            <div className="enrollment-details">
              <div className="detail-section">
                <h3>Basic Information</h3>
                <p>
                  <strong>Student:</strong> {selectedEnrollment.studentName}
                </p>
                <p>
                  <strong>Course:</strong> {selectedEnrollment.courseName}
                </p>
                <p>
                  <strong>Enrollment Date:</strong>{" "}
                  {formatDate(selectedEnrollment.enrollmentDate)}
                </p>
                <p>
                  <strong>Amount Paid:</strong> $
                  {selectedEnrollment.amount?.toFixed(2) || "0.00"}
                </p>
                <p>
                  <strong>Status:</strong>
                  <span
                    className={`status ${
                      selectedEnrollment.status || "active"
                    }`}
                  >
                    {selectedEnrollment.status || "Active"}
                  </span>
                </p>
              </div>

              {selectedEnrollment.user && (
                <div className="detail-section">
                  <h3>Student Information</h3>
                  <p>
                    <strong>Name:</strong>{" "}
                    {selectedEnrollment.user.displayName || "N/A"}
                  </p>
                  <p>
                    <strong>Email:</strong>{" "}
                    {selectedEnrollment.user.email || "N/A"}
                  </p>
                  <p>
                    <strong>Phone:</strong>{" "}
                    {selectedEnrollment.user.phoneNumber || "N/A"}
                  </p>
                </div>
              )}

              {selectedEnrollment.course && (
                <div className="detail-section">
                  <h3>Course Information</h3>
                  <p>
                    <strong>Title:</strong>{" "}
                    {selectedEnrollment.course.title || "N/A"}
                  </p>
                  <p>
                    <strong>Instructor:</strong>{" "}
                    {selectedEnrollment.course.instructor || "N/A"}
                  </p>
                  <p>
                    <strong>Category:</strong>{" "}
                    {selectedEnrollment.course.category || "N/A"}
                  </p>
                  <p>
                    <strong>Duration:</strong>{" "}
                    {selectedEnrollment.course.duration || "N/A"}
                  </p>
                </div>
              )}

              {selectedEnrollment.paymentInfo && (
                <div className="detail-section">
                  <h3>Payment Information</h3>
                  <p>
                    <strong>Payment ID:</strong>{" "}
                    {selectedEnrollment.paymentInfo.paymentId || "N/A"}
                  </p>
                  <p>
                    <strong>Method:</strong>{" "}
                    {selectedEnrollment.paymentInfo.method || "N/A"}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    {selectedEnrollment.paymentInfo.status || "N/A"}
                  </p>
                  <p>
                    <strong>Transaction Date:</strong>{" "}
                    {formatDate(selectedEnrollment.paymentInfo.transactionDate)}
                  </p>
                </div>
              )}

              <div className="detail-actions">
                <button
                  className="active-btn"
                  onClick={() =>
                    handleStatusChange(selectedEnrollment.id, "active")
                  }
                  disabled={selectedEnrollment.status === "active"}
                >
                  Activate Enrollment
                </button>
                <button
                  className="complete-btn"
                  onClick={() =>
                    handleStatusChange(selectedEnrollment.id, "completed")
                  }
                  disabled={selectedEnrollment.status === "completed"}
                >
                  Mark as Completed
                </button>
                <button
                  className="suspend-btn"
                  onClick={() =>
                    handleStatusChange(selectedEnrollment.id, "suspended")
                  }
                  disabled={selectedEnrollment.status === "suspended"}
                >
                  Suspend Enrollment
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteEnrollment(selectedEnrollment.id)}
                >
                  Delete Enrollment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .enrollments-container {
          padding: 20px;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .search-bar input {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          width: 250px;
        }

        .enrollments-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .enrollments-table th,
        .enrollments-table td {
          padding: 12px 15px;
          text-align: left;
          border-bottom: 1px solid #ecf0f1;
        }

        .enrollments-table th {
          background-color: #f8f9fa;
          font-weight: 600;
          color: #7f8c8d;
        }

        .status {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.85rem;
          text-transform: capitalize;
          margin-left: 5px;
        }

        .status.active {
          background-color: #e8f5e9;
          color: #2e7d32;
        }

        .status.completed {
          background-color: #e3f2fd;
          color: #1565c0;
        }

        .status.suspended {
          background-color: #ffebee;
          color: #c62828;
        }

        .status.pending {
          background-color: #fff8e1;
          color: #f57f17;
        }

        .actions {
          display: flex;
          gap: 5px;
          flex-wrap: wrap;
        }

        .actions button {
          padding: 5px 8px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.8rem;
          margin-bottom: 4px;
        }

        .actions button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .view-btn {
          background-color: #ecf0f1;
          color: #2c3e50;
        }

        .active-btn {
          background-color: #e8f5e9;
          color: #2e7d32;
        }

        .complete-btn {
          background-color: #e3f2fd;
          color: #1565c0;
        }

        .suspend-btn {
          background-color: #fff8e1;
          color: #f57f17;
        }

        .delete-btn {
          background-color: #ffebee;
          color: #c62828;
        }

        .loading,
        .no-results {
          padding: 40px;
          text-align: center;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          color: #7f8c8d;
        }

        .modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          max-width: 700px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
        }

        .close {
          position: absolute;
          top: 10px;
          right: 15px;
          font-size: 24px;
          cursor: pointer;
          color: #7f8c8d;
        }

        .enrollment-details h2 {
          margin-top: 0;
          color: #2c3e50;
        }

        .detail-section {
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 1px solid #ecf0f1;
        }

        .detail-section h3 {
          margin-top: 0;
          color: #2c3e50;
          font-size: 1.1rem;
        }

        .detail-section p {
          margin: 8px 0;
          line-height: 1.4;
        }

        .detail-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 20px;
        }

        .detail-actions button {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          flex-grow: 1;
          font-size: 0.9rem;
        }

        .detail-actions button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </Layout>
  );
}
