import { useState, useEffect } from "react";
import Head from "next/head";
import Layout from "../components/Layout";
import { db } from "../firebase/config";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  addDoc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";

export default function Updates() {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "notification", // Default type
    isNew: true,
  });

  // Define update types with their corresponding icons
  const updateTypes = [
    { value: "course", label: "Course", icon: "book-outline" },
    {
      value: "notification",
      label: "Notification",
      icon: "notifications-outline",
    },
    { value: "report", label: "Report", icon: "analytics-outline" },
    { value: "offer", label: "Offer", icon: "pricetag-outline" },
    { value: "material", label: "Material", icon: "document-text-outline" },
  ];

  useEffect(() => {
    fetchUpdates();
  }, []);

  const fetchUpdates = async () => {
    setLoading(true);
    setError(null);
    try {
      const updatesCollection = collection(db, "updates");
      const updatesQuery = query(
        updatesCollection,
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(updatesQuery);

      const updatesList = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        updatesList.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date(),
        });
      });

      setUpdates(updatesList);
    } catch (error) {
      console.error("Error fetching updates:", error);
      setError("Error loading updates: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) return "Update title is required";
    if (!formData.description.trim()) return "Update description is required";
    if (!formData.type) return "Update type is required";
    return null;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setError(null);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "notification",
      isNew: true,
    });
    setIsEditMode(false);
    setError(null);
  };

  const openModal = (update = null) => {
    if (update) {
      setFormData({
        ...update,
      });
      setIsEditMode(true);
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Create date object for display in the app
      const currentDate = new Date();
      let dateText = "Just now";

      if (isEditMode && formData.createdAt) {
        // For edited updates, calculate the relative time based on the original creation date
        const timeDiff = new Date() - new Date(formData.createdAt);
        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);
        const weeks = Math.floor(days / 7);

        if (weeks > 1) {
          dateText = `${weeks} weeks ago`;
        } else if (days > 1) {
          dateText = `${days} days ago`;
        } else if (hours > 1) {
          dateText = `${hours} hours ago`;
        } else {
          dateText = "Today";
        }
      }

      const updateData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        isNew: formData.isNew,
        date: dateText,
        updatedAt: serverTimestamp(),
      };

      if (!isEditMode) {
        // Add creation timestamp for new updates
        updateData.createdAt = serverTimestamp();
      }

      if (isEditMode) {
        // Update existing update
        const updateRef = doc(db, "updates", formData.id);
        await updateDoc(updateRef, updateData);
      } else {
        // Create new update
        await addDoc(collection(db, "updates"), updateData);
      }

      closeModal();
      fetchUpdates();
    } catch (error) {
      console.error("Error saving update:", error);
      setError("Error saving update: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUpdate = async (updateId) => {
    if (window.confirm("Are you sure you want to delete this update?")) {
      try {
        await deleteDoc(doc(db, "updates", updateId));
        fetchUpdates();
      } catch (error) {
        console.error("Error deleting update:", error);
        setError("Error deleting update: " + error.message);
      }
    }
  };

  // Filter updates based on search term
  const filteredUpdates = updates.filter(
    (update) =>
      update.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      update.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get icon name for a specific update type
  const getIconName = (type) => {
    const foundType = updateTypes.find((t) => t.value === type);
    return foundType ? foundType.icon : "information-circle-outline";
  };

  return (
    <Layout>
      <Head>
        <title>Updates Management | Admin Panel</title>
      </Head>

      <div className="dashboard">
        <div className="header-row">
          <h1>Updates Management</h1>
          <button className="add-button" onClick={() => openModal()}>
            Add New Update
          </button>
        </div>

        {error && <div className="error-alert">{error}</div>}

        <div className="search-container">
          <input
            type="text"
            placeholder="Search updates..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="loading">Loading updates data...</div>
        ) : filteredUpdates.length === 0 ? (
          <div className="empty-state">
            <p>No updates found</p>
          </div>
        ) : (
          <div className="data-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUpdates.map((update) => (
                  <tr key={update.id}>
                    <td>
                      <div className="update-title-cell">
                        <div className="update-title">{update.title}</div>
                        <div className="update-description">
                          {update.description.length > 70
                            ? `${update.description.substring(0, 70)}...`
                            : update.description}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="update-type">
                        <span className={`type-badge ${update.type}`}>
                          {update.type.charAt(0).toUpperCase() +
                            update.type.slice(1) || "Notification"}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`status ${
                          update.isNew ? "active" : "inactive"
                        }`}
                      >
                        {update.isNew ? "New" : "Read"}
                      </span>
                    </td>
                    <td className="date-cell">
                      {update.createdAt instanceof Date
                        ? update.createdAt.toLocaleDateString()
                        : "Unknown"}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="edit-button"
                          onClick={() => openModal(update)}
                        >
                          Edit
                        </button>
                        <button
                          className="delete-button"
                          onClick={() => handleDeleteUpdate(update.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Update Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>{isEditMode ? "Edit Update" : "Add New Update"}</h2>
              <button className="close-button" onClick={closeModal}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter update title"
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="form-textarea"
                    placeholder="Enter update description"
                    rows={4}
                  />
                </div>

                <div className="form-group">
                  <label>Update Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    {updateTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <div className="type-icon-info">
                    Icon:{" "}
                    <span className="icon-name">
                      {getIconName(formData.type)}
                    </span>
                  </div>
                </div>

                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isNew"
                      checked={formData.isNew}
                      onChange={(e) =>
                        setFormData({ ...formData, isNew: e.target.checked })
                      }
                      className="form-checkbox"
                    />
                    <span>Mark as New</span>
                  </label>
                </div>

                {error && <div className="form-error">{error}</div>}

                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={closeModal}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="submit-button"
                    disabled={submitting}
                  >
                    {submitting ? "Saving..." : isEditMode ? "Update" : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .dashboard {
          padding: 20px;
        }

        .header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        h1 {
          margin-bottom: 0;
          color: #2c3e50;
          font-size: 1.8rem;
        }

        .add-button {
          background-color: #3498db;
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 4px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .add-button:hover {
          background-color: #2980b9;
        }

        .error-alert {
          background-color: #ffebee;
          color: #c62828;
          padding: 12px 16px;
          border-radius: 4px;
          margin-bottom: 20px;
          border-left: 4px solid #ef5350;
        }

        .search-container {
          margin-bottom: 20px;
        }

        .search-input {
          width: 100%;
          max-width: 400px;
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 0.9rem;
          transition: border-color 0.3s;
        }

        .search-input:focus {
          border-color: #3498db;
          outline: none;
        }

        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 200px;
          font-size: 1.1rem;
          color: #7f8c8d;
        }

        .empty-state {
          background-color: white;
          border-radius: 8px;
          padding: 40px;
          text-align: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          color: #7f8c8d;
        }

        .data-container {
          background-color: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .data-table th {
          background-color: #f8f9fa;
          padding: 12px 16px;
          text-align: left;
          font-weight: 600;
          color: #7f8c8d;
          border-bottom: 1px solid #ecf0f1;
        }

        .data-table td {
          padding: 16px;
          border-bottom: 1px solid #ecf0f1;
          vertical-align: top;
        }

        .data-table tr:last-child td {
          border-bottom: none;
        }

        .data-table tr:hover {
          background-color: #f5f7fa;
        }

        .update-title-cell {
          max-width: 400px;
        }

        .update-title {
          font-weight: 500;
          color: #2c3e50;
          margin-bottom: 4px;
        }

        .update-description {
          font-size: 0.85rem;
          color: #7f8c8d;
          line-height: 1.4;
        }

        .update-type {
          display: flex;
          align-items: center;
        }

        .type-badge {
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .type-badge.course {
          background-color: #e3f2fd;
          color: #1565c0;
        }

        .type-badge.notification {
          background-color: #fff8e1;
          color: #ff8f00;
        }

        .type-badge.report {
          background-color: #f3e5f5;
          color: #7b1fa2;
        }

        .type-badge.offer {
          background-color: #e8f5e9;
          color: #2e7d32;
        }

        .type-badge.material {
          background-color: #fffde7;
          color: #f57f17;
        }

        .status {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .status.active {
          background-color: #e8f5e9;
          color: #2e7d32;
        }

        .status.inactive {
          background-color: #f5f5f5;
          color: #757575;
        }

        .date-cell {
          white-space: nowrap;
          color: #7f8c8d;
          font-size: 0.85rem;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
        }

        .edit-button,
        .delete-button {
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          font-size: 0.85rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .edit-button {
          background-color: #ecf0f1;
          color: #2c3e50;
        }

        .edit-button:hover {
          background-color: #d5dbdb;
        }

        .delete-button {
          background-color: #ffebee;
          color: #c62828;
        }

        .delete-button:hover {
          background-color: #ffcdd2;
        }

        /* Modal styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-container {
          width: 90%;
          max-width: 500px;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          overflow: hidden;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #ecf0f1;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 1.25rem;
          color: #2c3e50;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: #7f8c8d;
          cursor: pointer;
        }

        .modal-body {
          padding: 20px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
          color: #2c3e50;
        }

        .form-input,
        .form-textarea,
        .form-select {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 0.9rem;
          transition: border-color 0.2s;
        }

        .form-input:focus,
        .form-textarea:focus,
        .form-select:focus {
          border-color: #3498db;
          outline: none;
        }

        .type-icon-info {
          margin-top: 6px;
          font-size: 0.85rem;
          color: #7f8c8d;
        }

        .icon-name {
          font-family: monospace;
          color: #3498db;
        }

        .checkbox-group {
          margin-top: 20px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          cursor: pointer;
        }

        .form-checkbox {
          margin-right: 8px;
          width: 16px;
          height: 16px;
        }

        .form-error {
          background-color: #ffebee;
          color: #c62828;
          padding: 10px 12px;
          border-radius: 4px;
          margin-bottom: 16px;
          font-size: 0.9rem;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 24px;
        }

        .cancel-button,
        .submit-button {
          padding: 10px 16px;
          border: none;
          border-radius: 4px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .cancel-button {
          background-color: #ecf0f1;
          color: #7f8c8d;
        }

        .cancel-button:hover {
          background-color: #d5dbdb;
        }

        .submit-button {
          background-color: #3498db;
          color: white;
        }

        .submit-button:hover {
          background-color: #2980b9;
        }

        .submit-button:disabled,
        .cancel-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .header-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
            margin-bottom: 16px;
          }

          .data-table th:nth-child(4),
          .data-table td:nth-child(4) {
            display: none;
          }

          .update-title-cell {
            max-width: none;
          }
        }

        @media (max-width: 480px) {
          .data-table th:nth-child(2),
          .data-table td:nth-child(2) {
            display: none;
          }

          .action-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </Layout>
  );
}
