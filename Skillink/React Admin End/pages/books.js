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

export default function Books() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [bookImage, setBookImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
    category: "",
    publishDate: "",
    status: "available",
    hasPrintedVersion: false,
    printedBookPrice: "",
    pdfData: null,
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const booksCollection = collection(db, "books");
      const snapshot = await getDocs(booksCollection);

      const booksList = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        booksList.push({
          id: doc.id,
          ...data,
          price: data.price || 0,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date(),
        });
      });

      // Sort books by creation date (newest first)
      booksList.sort((a, b) => b.createdAt - a.createdAt);
      setBooks(booksList);
    } catch (error) {
      console.error("Error fetching books:", error);
      setError("Error loading books: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) return "Book title is required";
    if (!formData.author.trim()) return "Author name is required";
    if (!formData.description.trim()) return "Description is required";
    if (!formData.category.trim()) return "Category is required";
    if (!formData.publishDate) return "Publication date is required";
    if (
      formData.hasPrintedVersion &&
      (formData.printedBookPrice === "" || formData.printedBookPrice < 0)
    )
      return "Valid printed book price is required";
    if (!formData.imageUrl && !bookImage) return "Book cover image is required";
    if (!formData.pdfData && !isEditMode) return "PDF file is required";
    return null;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file");
        return;
      }

      setBookImage(file);

      // Create a FileReader to read the file
      const reader = new FileReader();

      reader.onload = (e) => {
        // Create an image element to use for compression
        const img = new Image();
        img.src = e.target.result;

        img.onload = () => {
          // Create a canvas element
          const canvas = document.createElement("canvas");

          // Calculate new dimensions to match 2:3 aspect ratio (600×900)
          let width = 600;
          let height = 900;
          let sourceX = 0;
          let sourceY = 0;
          let sourceWidth = img.width;
          let sourceHeight = img.height;

          // Calculate source dimensions to crop to 2:3 aspect ratio
          if (img.width / img.height > 2 / 3) {
            // Image is wider than 2:3, crop width
            sourceWidth = img.height * (2 / 3);
            sourceX = (img.width - sourceWidth) / 2;
          } else if (img.width / img.height < 2 / 3) {
            // Image is taller than 2:3, crop height
            sourceHeight = img.width * (3 / 2);
            sourceY = (img.height - sourceHeight) / 2;
          }

          // Set canvas dimensions
          canvas.width = width;
          canvas.height = height;

          // Draw and compress the image on canvas
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(
            img,
            sourceX,
            sourceY,
            sourceWidth,
            sourceHeight,
            0,
            0,
            width,
            height
          );

          // Get compressed image as base64 string (0.8 quality - better quality for book covers)
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.8);

          // Set preview and update form data
          setImagePreview(compressedBase64);
          setFormData({
            ...formData,
            imageUrl: compressedBase64,
          });
        };
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

  const handlePdfUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (file.type !== "application/pdf") {
        setError("Please upload a PDF file");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData({
          ...formData,
          pdfData: e.target.result,
        });
      };

      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      author: "",
      description: "",
      category: "",
      publishDate: "",
      status: "available",
      imageUrl: null,
      hasPrintedVersion: false,
      printedBookPrice: "",
      pdfData: null,
    });
    setBookImage(null);
    setImagePreview("");
    setIsEditMode(false);
    setError(null);
  };

  const openModal = (book = null) => {
    if (book) {
      setFormData({
        ...book,
        imageUrl: book.imageUrl || null,
        hasPrintedVersion: book.hasPrintedVersion || false,
        printedBookPrice: book.printedBookPrice?.toString() || "",
        publishDate: book.publishDate
          ? new Date(book.publishDate).toISOString().split("T")[0]
          : "",
      });
      setImagePreview(book.imageUrl || "");
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
      // Convert price to a valid number format if applicable
      const formattedData = {
        ...formData,
        printedBookPrice:
          formData.hasPrintedVersion && formData.printedBookPrice
            ? parseFloat(formData.printedBookPrice)
            : 0,
      };

      // The image is already stored in formData.imageUrl as a base64 string
      // PDF is stored in formData.pdfData as a base64 string
      // No need to upload to Firebase Storage

      const bookData = {
        ...formattedData,
        updatedAt: serverTimestamp(),
      };

      // Remove any fields that shouldn't be stored in Firestore
      delete bookData.id;

      if (isEditMode) {
        // Update existing book
        const bookRef = doc(db, "books", formData.id);
        await updateDoc(bookRef, bookData);

        setBooks(
          books.map((book) =>
            book.id === formData.id
              ? { ...book, ...bookData, id: formData.id }
              : book
          )
        );
      } else {
        // Add new book
        bookData.createdAt = serverTimestamp();
        const docRef = await addDoc(collection(db, "books"), bookData);

        setBooks([
          ...books,
          { id: docRef.id, ...bookData, createdAt: new Date() },
        ]);
      }

      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving book:", error);
      setError("Failed to save book: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this book? This action cannot be undone."
      )
    ) {
      try {
        // Delete book document from Firestore
        await deleteDoc(doc(db, "books", bookId));

        // Update state
        setBooks(books.filter((book) => book.id !== bookId));
      } catch (error) {
        console.error("Error deleting book:", error);
        setError("Failed to delete book: " + error.message);
      }
    }
  };

  const filteredBooks = books.filter(
    (book) =>
      book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <Head>
        <title>Book Management - Admin Panel</title>
      </Head>

      <div className="books-container">
        <div className="header">
          <h1>Book Management</h1>
          <div className="actions">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search books..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="add-button" onClick={() => openModal()}>
              Add New Book
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Loading books...</div>
        ) : (
          <>
            {filteredBooks.length > 0 ? (
              <div className="books-grid">
                {filteredBooks.map((book) => (
                  <div className="book-card" key={book.id}>
                    <div className="book-image">
                      {book.imageUrl ? (
                        <img src={book.imageUrl} alt={book.title} />
                      ) : (
                        <div className="image-placeholder">No Image</div>
                      )}
                      <span className={`status ${book.status}`}>
                        {book.status}
                      </span>
                    </div>
                    <div className="book-details">
                      <h3>{book.title}</h3>
                      <p className="author">by {book.author || "Unknown"}</p>
                      <p className="category">{book.category}</p>
                      <div className="book-meta">
                        <span className="date">
                          {book.publishDate
                            ? new Date(book.publishDate).toLocaleDateString()
                            : "No date"}
                        </span>
                        {book.hasPrintedVersion && (
                          <span className="price">
                            $
                            {typeof book.printedBookPrice === "number"
                              ? book.printedBookPrice.toFixed(2)
                              : "0.00"}
                          </span>
                        )}
                      </div>
                      <div className="format-options">
                        {book.pdfData && (
                          <span className="format-badge pdf">
                            PDF Available
                          </span>
                        )}
                        {book.hasPrintedVersion && (
                          <span className="format-badge print">
                            Print: ${book.printedBookPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <div className="card-actions">
                        <button
                          className="edit-btn"
                          onClick={() => openModal(book)}
                        >
                          Edit
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteBook(book.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-results">No books found</div>
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
            <h2>{isEditMode ? "Edit Book" : "Add New Book"}</h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="title">Book Title *</label>
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
                  <label htmlFor="author">Author *</label>
                  <input
                    type="text"
                    id="author"
                    name="author"
                    value={formData.author}
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
                  <label htmlFor="publishDate">Publication Date *</label>
                  <input
                    type="date"
                    id="publishDate"
                    name="publishDate"
                    value={formData.publishDate}
                    onChange={handleInputChange}
                    required
                  />
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
                    <option value="available">Available</option>
                    <option value="outofstock">Out of Stock</option>
                  </select>
                </div>
              </div>

              <div className="form-group checkbox-group">
                <input
                  type="checkbox"
                  id="hasPrintedVersion"
                  name="hasPrintedVersion"
                  checked={formData.hasPrintedVersion}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hasPrintedVersion: e.target.checked,
                    })
                  }
                />
                <label htmlFor="hasPrintedVersion">Offer printed version</label>
              </div>

              {formData.hasPrintedVersion && (
                <div className="form-group">
                  <label htmlFor="printedBookPrice">
                    Printed Book Price ($) *
                  </label>
                  <input
                    type="number"
                    id="printedBookPrice"
                    name="printedBookPrice"
                    value={formData.printedBookPrice}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    required={formData.hasPrintedVersion}
                  />
                  <small>Price for the physical copy</small>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="bookImage">Book Cover Image *</label>
                <input
                  type="file"
                  id="bookImage"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <small className="resolution-guide">
                  For best display, upload images with a resolution of 600×900
                  pixels or higher. Recommended aspect ratio: 2:3.
                </small>
                {(imagePreview || formData.imageUrl) && (
                  <div className="image-preview">
                    <img
                      src={imagePreview || formData.imageUrl}
                      alt="Preview"
                    />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="pdfFile">Book PDF File *</label>
                <input
                  type="file"
                  id="pdfFile"
                  accept="application/pdf"
                  onChange={handlePdfUpload}
                  required={!isEditMode && !formData.pdfData}
                />
                <small className="pdf-guide">
                  PDF file is mandatory. Please upload a well-formatted PDF
                  document.
                </small>
                {isEditMode && !formData.pdfData && (
                  <small>
                    Current PDF file will be preserved unless a new one is
                    uploaded
                  </small>
                )}
                {formData.pdfData && (
                  <div className="pdf-status">
                    <span className="success-text">✓ PDF file uploaded</span>
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
                    ? "Update Book"
                    : "Save Book"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .books-container {
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

        .books-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .book-card {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s;
        }

        .book-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }

        .book-image {
          height: 180px;
          position: relative;
          background-color: #f5f5f5;
        }

        .book-image img {
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

        .status.available {
          background-color: #e8f5e9;
          color: #2e7d32;
        }

        .status.outofstock {
          background-color: #fff3e0;
          color: #e65100;
        }

        .book-details {
          padding: 15px;
        }

        .book-details h3 {
          margin: 0 0 8px 0;
          font-size: 1.2rem;
          color: #2c3e50;
        }

        .author {
          color: #7f8c8d;
          font-size: 0.9rem;
          margin-bottom: 4px;
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

        .book-meta {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;
          font-size: 0.85rem;
        }

        .date {
          color: #7f8c8d;
        }

        .price {
          font-weight: bold;
          color: #2c3e50;
        }

        .format-options {
          display: flex;
          gap: 8px;
          margin: 10px 0;
          flex-wrap: wrap;
        }

        .format-badge {
          font-size: 0.8rem;
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: 500;
        }

        .format-badge.pdf {
          background-color: #e3f2fd;
          color: #1565c0;
        }

        .format-badge.print {
          background-color: #e8f5e9;
          color: #2e7d32;
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
          width: 100%;
          height: auto;
          max-height: 200px;
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

        .checkbox-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .checkbox-group input[type="checkbox"] {
          width: auto;
          margin: 0;
        }

        .pdf-status {
          margin-top: 10px;
        }

        .success-text {
          color: #2ecc71;
          font-weight: 500;
        }

        .resolution-guide,
        .pdf-guide {
          display: block;
          margin-top: 5px;
          color: #777;
          font-size: 0.8rem;
        }
      `}</style>
    </Layout>
  );
}
