import { useState, useEffect } from "react";
import Head from "next/head";
import Layout from "../components/Layout";
import { db } from "../firebase/config";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  orderBy,
  query,
} from "firebase/firestore";

export default function Feedback() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState(null);
  const [error, setError] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    setLoading(true);
    setError(null);
    try {
      const feedbackCollection = collection(db, "feedback");
      const feedbackQuery = query(
        feedbackCollection,
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(feedbackQuery);

      const feedbackList = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        feedbackList.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date(),
        });
      });

      setFeedback(feedbackList);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      setError("Error loading feedback: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (feedbackId, newStatus) => {
    try {
      const feedbackRef = doc(db, "feedback", feedbackId);
      await updateDoc(feedbackRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });

      // Update the local state
      setFeedback((prevFeedback) =>
        prevFeedback.map((item) =>
          item.id === feedbackId
            ? { ...item, status: newStatus, updatedAt: new Date() }
            : item
        )
      );
    } catch (error) {
      console.error("Error updating feedback status:", error);
      setError("Failed to update status: " + error.message);
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this feedback? This action cannot be undone."
      )
    ) {
      try {
        await deleteDoc(doc(db, "feedback", feedbackId));
        setFeedback(feedback.filter((item) => item.id !== feedbackId));
      } catch (error) {
        console.error("Error deleting feedback:", error);
        setError("Failed to delete feedback: " + error.message);
      }
    }
  };

  const openResponseModal = (feedbackItem) => {
    setCurrentFeedback(feedbackItem);
    setResponseText(feedbackItem.adminResponse || "");
    setIsModalOpen(true);
  };

  const handleSubmitResponse = async (e) => {
    e.preventDefault();
    if (!currentFeedback) return;

    setSubmitting(true);
    setError(null);

    try {
      const feedbackRef = doc(db, "feedback", currentFeedback.id);
      await updateDoc(feedbackRef, {
        adminResponse: responseText,
        status: "responded",
        updatedAt: serverTimestamp(),
      });

      // Update the local state
      setFeedback((prevFeedback) =>
        prevFeedback.map((item) =>
          item.id === currentFeedback.id
            ? {
                ...item,
                adminResponse: responseText,
                status: "responded",
                updatedAt: new Date(),
              }
            : item
        )
      );

      setIsModalOpen(false);
      setCurrentFeedback(null);
      setResponseText("");
    } catch (error) {
      console.error("Error saving response:", error);
      setError("Failed to save response: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter feedback based on search term and status
  const filteredFeedback = feedback.filter((item) => {
    const matchesSearch =
      item.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.userName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "new":
        return "status-new";
      case "inProgress":
        return "status-in-progress";
      case "responded":
        return "status-responded";
      case "closed":
        return "status-closed";
      default:
        return "status-new";
    }
  };

  return (
    <Layout>
      <Head>
        <title>User Feedback | Skillink Admin</title>
      </Head>

      <div className="feedback-container">
        <div className="feedback-header">
          <h1>User Feedback</h1>
          <div className="feedback-actions">
            <div className="status-filter">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="inProgress">In Progress</option>
                <option value="responded">Responded</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div className="search-box">
              <input
                type="text"
                placeholder="Search feedback..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Loading feedback...</div>
        ) : (
          <>
            {filteredFeedback.length > 0 ? (
              <div className="feedback-list">
                {filteredFeedback.map((item) => (
                  <div className="feedback-card" key={item.id}>
                    <div className="feedback-header">
                      <div className="user-info">
                        <h3>{item.userName || "Anonymous User"}</h3>
                        <p className="email">
                          {item.userEmail || "No email provided"}
                        </p>
                      </div>
                      <div className="feedback-meta">
                        <span
                          className={`status-badge ${getStatusBadgeClass(
                            item.status
                          )}`}
                        >
                          {item.status === "inProgress"
                            ? "In Progress"
                            : item.status.charAt(0).toUpperCase() +
                              item.status.slice(1)}
                        </span>
                        <span className="date">
                          {item.createdAt.toLocaleDateString()} at{" "}
                          {item.createdAt.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="feedback-content">
                      <p className="message">{item.message}</p>
                      {item.adminResponse && (
                        <div className="admin-response">
                          <h4>Admin Response:</h4>
                          <p>{item.adminResponse}</p>
                        </div>
                      )}
                    </div>
                    <div className="feedback-actions">
                      <div className="status-actions">
                        <select
                          value={item.status}
                          onChange={(e) =>
                            handleStatusChange(item.id, e.target.value)
                          }
                          className="status-select"
                        >
                          <option value="new">New</option>
                          <option value="inProgress">In Progress</option>
                          <option value="responded">Responded</option>
                          <option value="closed">Closed</option>
                        </select>
                      </div>
                      <div className="action-buttons">
                        <button
                          className="respond-btn"
                          onClick={() => openResponseModal(item)}
                        >
                          {item.adminResponse ? "Edit Response" : "Respond"}
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteFeedback(item.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-feedback">
                <p>No feedback found.</p>
              </div>
            )}
          </>
        )}

        {isModalOpen && currentFeedback && (
          <div className="modal">
            <div className="modal-content">
              <h2>Respond to Feedback</h2>
              <span className="close" onClick={() => setIsModalOpen(false)}>
                &times;
              </span>

              <div className="feedback-details">
                <h3>
                  Feedback from {currentFeedback.userName || "Anonymous User"}
                </h3>
                <p className="date">
                  Submitted on {currentFeedback.createdAt.toLocaleDateString()}
                </p>
                <div className="original-message">
                  <h4>Original Message:</h4>
                  <p>{currentFeedback.message}</p>
                </div>
              </div>

              {error && <div className="error-message">{error}</div>}

              <form onSubmit={handleSubmitResponse}>
                <div className="form-group">
                  <label htmlFor="responseText">Your Response</label>
                  <textarea
                    id="responseText"
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    rows="5"
                    required
                    placeholder="Type your response here..."
                  ></textarea>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setIsModalOpen(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="save-btn"
                    disabled={submitting}
                  >
                    {submitting ? "Saving..." : "Save Response"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .feedback-container {
          padding: 20px;
        }

        .feedback-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .feedback-header h1 {
          margin: 0;
          color: #2c3e50;
        }

        .feedback-actions {
          display: flex;
          gap: 15px;
        }

        .status-filter select,
        .search-box input {
          padding: 10px 15px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 0.9rem;
        }

        .search-box input {
          width: 250px;
        }

        .feedback-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .feedback-card {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: box-shadow 0.3s;
        }

        .feedback-card:hover {
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }

        .feedback-header {
          display: flex;
          justify-content: space-between;
          padding: 15px;
          border-bottom: 1px solid #eee;
          background-color: #f8f9fa;
        }

        .user-info h3 {
          margin: 0 0 5px 0;
          color: #2c3e50;
          font-size: 1.1rem;
        }

        .email {
          margin: 0;
          color: #7f8c8d;
          font-size: 0.9rem;
        }

        .feedback-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 5px;
        }

        .status-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .status-new {
          background-color: #e3f2fd;
          color: #1565c0;
        }

        .status-in-progress {
          background-color: #fff3e0;
          color: #e65100;
        }

        .status-responded {
          background-color: #e8f5e9;
          color: #2e7d32;
        }

        .status-closed {
          background-color: #eeeeee;
          color: #616161;
        }

        .date {
          color: #7f8c8d;
          font-size: 0.8rem;
        }

        .feedback-content {
          padding: 15px;
        }

        .message {
          margin: 0 0 15px 0;
          white-space: pre-line;
        }

        .admin-response {
          margin-top: 15px;
          padding: 15px;
          background-color: #f8f9fa;
          border-radius: 4px;
          border-left: 3px solid #5468ff;
        }

        .admin-response h4 {
          margin: 0 0 10px 0;
          color: #2c3e50;
          font-size: 0.9rem;
        }

        .admin-response p {
          margin: 0;
          white-space: pre-line;
        }

        .feedback-actions {
          display: flex;
          justify-content: space-between;
          padding: 15px;
          border-top: 1px solid #eee;
          background-color: #f8f9fa;
        }

        .status-select {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 0.9rem;
        }

        .action-buttons {
          display: flex;
          gap: 10px;
        }

        .respond-btn,
        .delete-btn {
          padding: 8px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.3s;
        }

        .respond-btn {
          background-color: #e3f2fd;
          color: #1565c0;
        }

        .respond-btn:hover {
          background-color: #bbdefb;
        }

        .delete-btn {
          background-color: #ffebee;
          color: #c62828;
        }

        .delete-btn:hover {
          background-color: #ffcdd2;
        }

        .loading {
          text-align: center;
          padding: 40px 0;
          color: #7f8c8d;
        }

        .loading::after {
          content: "";
          display: block;
          width: 40px;
          height: 40px;
          margin: 20px auto 0;
          border-radius: 50%;
          border: 3px solid rgba(84, 104, 255, 0.3);
          border-top-color: #5468ff;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .no-feedback {
          background: white;
          border-radius: 8px;
          padding: 30px;
          text-align: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .no-feedback p {
          color: #7f8c8d;
          margin: 0;
        }

        .error-message {
          background-color: #ffebee;
          color: #c62828;
          padding: 10px 15px;
          border-radius: 4px;
          margin-bottom: 20px;
        }

        /* Modal Styles */
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
          background: white;
          border-radius: 8px;
          padding: 20px;
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
        }

        .modal-content h2 {
          margin-top: 0;
          margin-bottom: 20px;
          color: #2c3e50;
        }

        .close {
          position: absolute;
          top: 15px;
          right: 20px;
          font-size: 24px;
          cursor: pointer;
          color: #7f8c8d;
        }

        .feedback-details {
          margin-bottom: 20px;
        }

        .feedback-details h3 {
          margin: 0 0 5px 0;
          color: #2c3e50;
        }

        .feedback-details .date {
          color: #7f8c8d;
          font-size: 0.9rem;
          margin-bottom: 15px;
        }

        .original-message {
          background-color: #f8f9fa;
          padding: 15px;
          border-radius: 4px;
          margin-top: 10px;
        }

        .original-message h4 {
          margin: 0 0 10px 0;
          color: #2c3e50;
          font-size: 0.9rem;
        }

        .original-message p {
          margin: 0;
          white-space: pre-line;
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          color: #2c3e50;
          font-weight: 500;
        }

        .form-group textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
          resize: vertical;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 15px;
          margin-top: 20px;
        }

        .cancel-btn,
        .save-btn {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.3s;
        }

        .cancel-btn {
          background-color: #f8f9fa;
          color: #7f8c8d;
        }

        .cancel-btn:hover {
          background-color: #e9ecef;
        }

        .save-btn {
          background-color: #5468ff;
          color: white;
        }

        .save-btn:hover {
          background-color: #4559ee;
        }

        .save-btn:disabled,
        .cancel-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .feedback-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }

          .feedback-actions {
            width: 100%;
            flex-direction: column;
          }

          .search-box input,
          .status-filter select {
            width: 100%;
          }

          .feedback-card .feedback-header {
            flex-direction: column;
            gap: 10px;
          }

          .feedback-meta {
            align-items: flex-start;
          }

          .feedback-actions {
            flex-direction: column;
            gap: 10px;
          }
        }
      `}</style>
    </Layout>
  );
}
