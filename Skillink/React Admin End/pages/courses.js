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
} from "firebase/firestore";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [courseImage, setCourseImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructor: "",
    category: "",
    duration: "",
    price: "",
    level: "beginner",
    status: "active",
    imageUrl: null,
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const coursesCollection = collection(db, "courses");
      const snapshot = await getDocs(coursesCollection);

      const coursesList = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        coursesList.push({
          id: doc.id,
          ...data,
          price: data.price || 0,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date(),
        });
      });

      // Sort courses by creation date (newest first)
      coursesList.sort((a, b) => b.createdAt - a.createdAt);
      setCourses(coursesList);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setError("Error loading courses: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) return "Course title is required";
    if (!formData.description.trim()) return "Course description is required";
    if (!formData.instructor.trim()) return "Instructor name is required";
    if (!formData.category.trim()) return "Category is required";
    if (!formData.duration.trim()) return "Duration is required";
    if (formData.price === "" || formData.price < 0)
      return "Valid price is required";
    return null;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file");
        return;
      }

      setCourseImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setImagePreview(base64String);
        // Store the base64 string to be saved to Firebase
        setFormData({
          ...formData,
          imageUrl: base64String,
        });
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name === "price" ? (value === "" ? "" : parseFloat(value)) : value,
    });
    setError(null);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      instructor: "",
      category: "",
      duration: "",
      price: "",
      level: "beginner",
      status: "active",
      imageUrl: null,
    });
    setCourseImage(null);
    setImagePreview("");
    setIsEditMode(false);
    setError(null);
  };

  const openModal = (course = null) => {
    if (course) {
      setFormData({
        ...course,
        price: course.price?.toString() || "",
        imageUrl: course.imageUrl || null,
      });
      setImagePreview(course.imageUrl || "");
      setIsEditMode(true);
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Convert price to a valid number format
      const formattedData = {
        ...formData,
        price: formData.price ? parseFloat(formData.price) : 0,
      };

      // The image is already stored in formData.imageUrl as a base64 string
      // No need to upload to Firebase Storage

      const courseData = {
        ...formattedData,
        updatedAt: serverTimestamp(),
      };

      // Remove any fields that shouldn't be stored in Firestore
      delete courseData.id;

      if (isEditMode) {
        // Update existing course
        const courseRef = doc(db, "courses", formData.id);
        await updateDoc(courseRef, courseData);

        setCourses(
          courses.map((course) =>
            course.id === formData.id
              ? { ...course, ...courseData, id: formData.id }
              : course
          )
        );
      } else {
        // Add new course
        courseData.createdAt = serverTimestamp();
        const docRef = await addDoc(collection(db, "courses"), courseData);

        setCourses([
          ...courses,
          { id: docRef.id, ...courseData, createdAt: new Date() },
        ]);
      }

      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving course:", error);
      setError("Failed to save course: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCourse = async (courseId, imageUrl) => {
    if (
      window.confirm(
        "Are you sure you want to delete this course? This action cannot be undone."
      )
    ) {
      try {
        // Delete course document
        await deleteDoc(doc(db, "courses", courseId));

        // Delete course image if it exists
        if (imageUrl) {
          try {
            // Extract the path from the URL
            const imagePath = imageUrl.split("/o/")[1]?.split("?")[0];
            if (imagePath) {
              const decodedPath = decodeURIComponent(imagePath);
              const imageRef = ref(storage, decodedPath);
              await deleteObject(imageRef);
              console.log("Image deleted successfully");
            }
          } catch (imageError) {
            console.error("Error deleting image:", imageError);
            // Continue with course deletion even if image deletion fails
          }
        }

        // Update state
        setCourses(courses.filter((course) => course.id !== courseId));
      } catch (error) {
        console.error("Error deleting course:", error);
        setError("Failed to delete course: " + error.message);
      }
    }
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <Head>
        <title>Course Management - Admin Panel</title>
      </Head>

      <div className="courses-container">
        <div className="header">
          <h1>Course Management</h1>
          <div className="actions">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="add-button" onClick={() => openModal()}>
              Add New Course
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Loading courses...</div>
        ) : (
          <>
            {filteredCourses.length > 0 ? (
              <div className="courses-grid">
                {filteredCourses.map((course) => (
                  <div className="course-card" key={course.id}>
                    <div className="course-image">
                      {course.imageUrl ? (
                        <img src={course.imageUrl} alt={course.title} />
                      ) : (
                        <div className="image-placeholder">No Image</div>
                      )}
                      <span className={`status ${course.status}`}>
                        {course.status}
                      </span>
                    </div>
                    <div className="course-details">
                      <h3>{course.title}</h3>
                      <p className="instructor">
                        by {course.instructor || "Unknown"}
                      </p>
                      <p className="category">{course.category}</p>
                      <div className="course-meta">
                        <span className="level">{course.level}</span>
                        <span className="duration">{course.duration}</span>
                        <span className="price">
                          $
                          {typeof course.price === "number"
                            ? course.price.toFixed(2)
                            : "0.00"}
                        </span>
                      </div>
                      <div className="card-actions">
                        <button
                          className="edit-btn"
                          onClick={() => openModal(course)}
                        >
                          Edit
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() =>
                            handleDeleteCourse(course.id, course.imageUrl)
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-results">No courses found</div>
            )}
          </>
        )}
      </div>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setIsModalOpen(false)}>
              &times;
            </span>
            <h2>{isEditMode ? "Edit Course" : "Add New Course"}</h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="title">Course Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="instructor">Instructor *</label>
                  <input
                    type="text"
                    id="instructor"
                    name="instructor"
                    value={formData.instructor}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category">Category *</label>
                  <input
                    type="text"
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  required
                ></textarea>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="duration">Duration *</label>
                  <input
                    type="text"
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="e.g. 8 weeks"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="price">Price ($) *</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="level">Level *</label>
                  <select
                    id="level"
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="all-levels">All Levels</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="status">Status *</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="courseImage">Course Image</label>
                <input
                  type="file"
                  id="courseImage"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {(imagePreview || formData.imageUrl) && (
                  <div className="image-preview">
                    <img
                      src={imagePreview || formData.imageUrl}
                      alt="Preview"
                    />
                  </div>
                )}
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
                  {submitting
                    ? "Saving..."
                    : isEditMode
                    ? "Update Course"
                    : "Save Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .courses-container {
          padding: 20px;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .actions {
          display: flex;
          gap: 10px;
        }

        .search-bar input {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          width: 250px;
        }

        .add-button {
          padding: 8px 16px;
          background-color: #3498db;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .add-button:hover {
          background-color: #2980b9;
        }

        .error-message {
          background-color: #ffebee;
          color: #c62828;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 20px;
        }

        .courses-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .course-card {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s;
        }

        .course-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }

        .course-image {
          height: 180px;
          position: relative;
          background-color: #f5f5f5;
        }

        .course-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .image-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #95a5a6;
          font-size: 1rem;
        }

        .status {
          position: absolute;
          top: 10px;
          right: 10px;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.7rem;
          text-transform: uppercase;
          font-weight: bold;
        }

        .status.active {
          background-color: #e8f5e9;
          color: #2e7d32;
        }

        .status.draft {
          background-color: #e3f2fd;
          color: #1565c0;
        }

        .status.archived {
          background-color: #ffebee;
          color: #c62828;
        }

        .course-details {
          padding: 15px;
        }

        .course-details h3 {
          margin: 0 0 8px 0;
          font-size: 1.2rem;
          color: #2c3e50;
        }

        .instructor {
          color: #7f8c8d;
          font-size: 0.9rem;
          margin-bottom: 8px;
        }

        .category {
          display: inline-block;
          background-color: #ecf0f1;
          color: #7f8c8d;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
          margin-bottom: 10px;
        }

        .course-meta {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;
          font-size: 0.85rem;
        }

        .level,
        .duration {
          color: #7f8c8d;
        }

        .price {
          font-weight: bold;
          color: #2c3e50;
        }

        .card-actions {
          display: flex;
          gap: 8px;
        }

        .card-actions button {
          flex: 1;
          padding: 6px 0;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: background-color 0.2s;
        }

        .edit-btn {
          background-color: #f1c40f;
          color: #7f8c8d;
        }

        .edit-btn:hover {
          background-color: #f39c12;
        }

        .delete-btn {
          background-color: #e74c3c;
          color: white;
        }

        .delete-btn:hover {
          background-color: #c0392b;
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
          max-width: 600px;
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

        .form-group {
          margin-bottom: 15px;
        }

        .form-row {
          display: flex;
          gap: 15px;
        }

        .form-row .form-group {
          flex: 1;
        }

        label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
          color: #2c3e50;
        }

        input,
        select,
        textarea {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 0.9rem;
        }

        input:focus,
        select:focus,
        textarea:focus {
          outline: none;
          border-color: #3498db;
        }

        .image-preview {
          margin-top: 10px;
          max-width: 100%;
          height: 150px;
        }

        .image-preview img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
        }

        .cancel-btn,
        .save-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: background-color 0.2s;
        }

        .cancel-btn {
          background-color: #95a5a6;
          color: white;
        }

        .cancel-btn:hover {
          background-color: #7f8c8d;
        }

        .save-btn {
          background-color: #2ecc71;
          color: white;
        }

        .save-btn:hover {
          background-color: #27ae60;
        }

        .cancel-btn:disabled,
        .save-btn:disabled {
          background-color: #bdc3c7;
          cursor: not-allowed;
        }
      `}</style>
    </Layout>
  );
}
