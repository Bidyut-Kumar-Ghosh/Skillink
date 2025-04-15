import { useState, useEffect } from "react";
import Head from "next/head";
import Layout from "../components/Layout";
import { db, storage } from "../firebase/config";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  addDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

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
    isbn: "",
    price: "",
    publishYear: "",
    publisher: "",
    status: "available",
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
    if (!formData.isbn.trim()) return "ISBN is required";
    if (formData.price === "" || formData.price < 0)
      return "Valid price is required";
    if (!formData.publishYear.trim()) return "Publication year is required";
    if (!formData.publisher.trim()) return "Publisher is required";
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

      setBookImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
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
      author: "",
      description: "",
      category: "",
      isbn: "",
      price: "",
      publishYear: "",
      publisher: "",
      status: "available",
      imageUrl: null,
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
        price: book.price?.toString() || "",
        imageUrl: book.imageUrl || null,
      });
      setImagePreview(book.imageUrl || "");
      setIsEditMode(true);
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const uploadImage = async (file) => {
    if (!file) return null;

    try {
      // Create a unique filename with timestamp and random string
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.name.split(".").pop().toLowerCase();
      const fileName = `books/${timestamp}_${randomString}.${fileExtension}`;

      // Create a reference to the file location
      const storageRef = ref(storage, fileName);

      // Upload the file
      console.log("Starting image upload...");
      const uploadResult = await uploadBytes(storageRef, file);
      console.log("Image uploaded successfully, getting download URL...");

      // Get the download URL
      const downloadURL = await getDownloadURL(uploadResult.ref);
      console.log("Download URL obtained:", downloadURL);

      return downloadURL;
    } catch (error) {
      console.error("Error in uploadImage function:", error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
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

      let imageUrl = formData.imageUrl || null;

      // Upload image if there's a new one
      if (bookImage) {
        try {
          imageUrl = await uploadImage(bookImage);
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError);
          setError("Failed to upload image. Please try again.");
          setSubmitting(false);
          return;
        }
      }

      const bookData = {
        ...formattedData,
        imageUrl: imageUrl || null, // Ensure imageUrl is never undefined
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
              ? { ...book, ...bookData, imageUrl, id: formData.id }
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

  const handleDeleteBook = async (bookId, imageUrl) => {
    if (
      window.confirm(
        "Are you sure you want to delete this book? This action cannot be undone."
      )
    ) {
      try {
        // Delete book document
        await deleteDoc(doc(db, "books", bookId));

        // Delete book image if it exists
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
            // Continue with book deletion even if image deletion fails
          }
        }

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
      book.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn?.toLowerCase().includes(searchTerm.toLowerCase())
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
                      <p className="isbn">ISBN: {book.isbn}</p>
                      <p className="category">{book.category}</p>
                      <div className="book-meta">
                        <span className="publisher">{book.publisher}</span>
                        <span className="year">{book.publishYear}</span>
                        <span className="price">
                          $
                          {typeof book.price === "number"
                            ? book.price.toFixed(2)
                            : "0.00"}
                        </span>
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
                          onClick={() =>
                            handleDeleteBook(book.id, book.imageUrl)
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
                  <label htmlFor="isbn">ISBN *</label>
                  <input
                    type="text"
                    id="isbn"
                    name="isbn"
                    value={formData.isbn}
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

                <div className="form-group">
                  <label htmlFor="publisher">Publisher *</label>
                  <input
                    type="text"
                    id="publisher"
                    name="publisher"
                    value={formData.publisher}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="publishYear">Publication Year *</label>
                  <input
                    type="text"
                    id="publishYear"
                    name="publishYear"
                    value={formData.publishYear}
                    onChange={handleInputChange}
                    placeholder="e.g. 2023"
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
                  <option value="borrowed">Borrowed</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="bookImage">Book Cover Image</label>
                <input
                  type="file"
                  id="bookImage"
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

        .status.borrowed {
          background-color: #e3f2fd;
          color: #1565c0;
        }

        .status.maintenance {
          background-color: #ffebee;
          color: #c62828;
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

        .isbn {
          color: #7f8c8d;
          font-size: 0.8rem;
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

        .book-meta {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;
          font-size: 0.85rem;
        }

        .publisher,
        .year {
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
