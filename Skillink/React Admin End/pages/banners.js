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

export default function Banners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [bannerImage, setBannerImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    heading: "",
    subheading: "",
    description: "",
    position: 0,
    imageUrl: null,
    offerText: "",
    hasOffer: false,
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    setError(null);
    try {
      const bannersCollection = collection(db, "banners");
      const snapshot = await getDocs(bannersCollection);

      const bannersList = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        bannersList.push({
          id: doc.id,
          ...data,
          position: data.position || 0,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date(),
        });
      });

      // Sort banners by position
      bannersList.sort((a, b) => a.position - b.position);
      setBanners(bannersList);
    } catch (error) {
      console.error("Error fetching banners:", error);
      setError("Error loading banners: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) return "Banner title is required";
    if (formData.position === "" || isNaN(formData.position))
      return "Valid position is required";
    if (!formData.imageUrl && !bannerImage) return "Banner image is required";
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

      setBannerImage(file);

      // Create a FileReader to read the file
      const reader = new FileReader();

      reader.onload = (e) => {
        // Create an image element to use for compression
        const img = new Image();
        img.src = e.target.result;

        img.onload = () => {
          // Create a canvas element
          const canvas = document.createElement("canvas");

          // Calculate new dimensions (max 1200px width/height while maintaining aspect ratio)
          // Using larger dimensions for banner images to ensure quality
          let width = img.width;
          let height = img.height;
          const maxSize = 1200;

          if (width > height && width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }

          // Set canvas dimensions
          canvas.width = width;
          canvas.height = height;

          // Draw and compress the image on canvas
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          // Get compressed image as base64 string (0.8 quality - higher quality for banners)
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
        name === "position" ? (value === "" ? "" : parseInt(value)) : value,
    });
    setError(null);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      heading: "",
      subheading: "",
      description: "",
      position: banners.length,
      imageUrl: null,
      offerText: "",
      hasOffer: false,
    });
    setIsEditMode(false);
    setBannerImage(null);
    setImagePreview("");
    setError(null);
  };

  const openEditModal = (banner) => {
    setFormData({
      id: banner.id,
      title: banner.title || "",
      heading: banner.heading || "",
      subheading: banner.subheading || "",
      description: banner.description || "",
      position: banner.position || 0,
      imageUrl: banner.imageUrl || null,
      offerText: banner.offerText || "",
      hasOffer: banner.hasOffer || false,
    });
    setImagePreview(banner.imageUrl || "");
    setIsEditMode(true);
    setIsModalOpen(true);
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
      // Ensure position is an integer
      const formattedData = {
        ...formData,
        position: formData.position ? parseInt(formData.position) : 0,
      };

      const bannerData = {
        ...formattedData,
        updatedAt: serverTimestamp(),
      };

      // Remove any fields that shouldn't be stored in Firestore
      delete bannerData.id;

      if (isEditMode) {
        // Update existing banner
        const bannerRef = doc(db, "banners", formData.id);
        await updateDoc(bannerRef, bannerData);

        setBanners(
          banners.map((banner) =>
            banner.id === formData.id
              ? { ...banner, ...bannerData, id: formData.id }
              : banner
          )
        );
      } else {
        // Add new banner
        bannerData.createdAt = serverTimestamp();
        const docRef = await addDoc(collection(db, "banners"), bannerData);

        setBanners([
          ...banners,
          { id: docRef.id, ...bannerData, createdAt: new Date() },
        ]);
      }

      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving banner:", error);
      setError("Failed to save banner: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBanner = async (bannerId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this banner? This action cannot be undone."
      )
    ) {
      try {
        // Delete banner document from Firestore
        await deleteDoc(doc(db, "banners", bannerId));

        // Update state
        setBanners(banners.filter((banner) => banner.id !== bannerId));
      } catch (error) {
        console.error("Error deleting banner:", error);
        setError("Failed to delete banner: " + error.message);
      }
    }
  };

  // Filter banners based on search term
  const filteredBanners = banners.filter((banner) =>
    banner.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <Head>
        <title>Manage App Banners | Skillink Admin</title>
      </Head>

      <div className="banners-container">
        <div className="banners-header">
          <h1>App Banners</h1>
          <div className="banners-actions">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search banners..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              className="add-button"
              onClick={() => {
                resetForm();
                setFormData({
                  ...formData,
                  position: banners.length, // Set position to end of list by default
                });
                setIsModalOpen(true);
              }}
            >
              Add New Banner
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Loading banners...</div>
        ) : (
          <>
            {filteredBanners.length > 0 ? (
              <div className="banners-grid">
                {filteredBanners.map((banner) => (
                  <div className="banner-card" key={banner.id}>
                    <div className="banner-image">
                      {banner.imageUrl ? (
                        <img src={banner.imageUrl} alt={banner.title} />
                      ) : (
                        <div className="image-placeholder">No Image</div>
                      )}
                      <span className="position">{banner.position}</span>
                      {banner.hasOffer && banner.offerText && (
                        <span className="offer-badge">{banner.offerText}</span>
                      )}
                    </div>
                    <div className="banner-details">
                      <h3>{banner.title}</h3>
                      {banner.heading && (
                        <p className="heading">
                          <strong>Heading:</strong> {banner.heading}
                        </p>
                      )}
                      {banner.subheading && (
                        <p className="subheading">
                          <strong>Subheading:</strong> {banner.subheading}
                        </p>
                      )}
                      {banner.description && (
                        <p className="description">
                          <strong>Description:</strong> {banner.description}
                        </p>
                      )}
                    </div>
                    <div className="banner-actions">
                      <button
                        className="edit-btn"
                        onClick={() => openEditModal(banner)}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteBanner(banner.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-banners">
                <p>No banners found.</p>
                <button
                  className="add-button"
                  onClick={() => {
                    resetForm();
                    setIsModalOpen(true);
                  }}
                >
                  Add Your First Banner
                </button>
              </div>
            )}
          </>
        )}

        {isModalOpen && (
          <div className="modal">
            <div className="modal-content">
              <h2>{isEditMode ? "Edit Banner" : "Add New Banner"}</h2>
              <span className="close" onClick={() => setIsModalOpen(false)}>
                &times;
              </span>

              {error && <div className="error-message">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="title">Banner Title *</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="position">Position *</label>
                    <input
                      type="number"
                      id="position"
                      name="position"
                      min="0"
                      value={formData.position}
                      onChange={handleInputChange}
                      required
                    />
                    <small>Lower numbers appear first</small>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="heading">Heading</label>
                  <input
                    type="text"
                    id="heading"
                    name="heading"
                    value={formData.heading}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="subheading">Sub Heading</label>
                  <input
                    type="text"
                    id="subheading"
                    name="subheading"
                    value={formData.subheading}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                  ></textarea>
                </div>

                <div className="form-group">
                  <div className="checkbox-group">
                    <input
                      type="checkbox"
                      id="hasOffer"
                      name="hasOffer"
                      checked={formData.hasOffer}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          hasOffer: e.target.checked,
                        })
                      }
                    />
                    <label htmlFor="hasOffer">This banner has an offer</label>
                  </div>
                </div>

                {formData.hasOffer && (
                  <div className="form-group">
                    <label htmlFor="offerText">Offer Text *</label>
                    <input
                      type="text"
                      id="offerText"
                      name="offerText"
                      value={formData.offerText}
                      onChange={handleInputChange}
                      required={formData.hasOffer}
                      placeholder="e.g., 20% OFF | Limited Time Offer"
                    />
                    <small>
                      This text will be displayed as a special offer badge
                    </small>
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="bannerImage">
                    Banner Image {!isEditMode && "*"}
                  </label>
                  <input
                    type="file"
                    id="bannerImage"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <small className="resolution-guide">
                    For best display, upload images with a resolution of
                    1920×600 pixels or higher. Recommended aspect ratio: 16:5.
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
                      ? "Update Banner"
                      : "Save Banner"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .banners-container {
          padding: 20px;
        }

        .banners-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .banners-header h1 {
          margin: 0;
          color: #2c3e50;
        }

        .banners-actions {
          display: flex;
          gap: 15px;
        }

        .search-box input {
          padding: 10px 15px;
          border: 1px solid #ddd;
          border-radius: 4px;
          width: 250px;
        }

        .add-button {
          background-color: #5468ff;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.3s;
        }

        .add-button:hover {
          background-color: #4559ee;
        }

        .banners-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .banner-card {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .banner-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }

        .banner-image {
          position: relative;
          height: 180px;
          background-color: #f8f9fa;
        }

        .banner-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .image-placeholder {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: 100%;
          background-color: #f8f9fa;
          color: #7f8c8d;
        }

        .position {
          position: absolute;
          top: 10px;
          left: 10px;
          background-color: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .banner-details {
          padding: 15px;
        }

        .banner-details h3 {
          margin: 0 0 10px 0;
          color: #2c3e50;
        }

        .heading,
        .subheading,
        .description {
          margin: 0 0 10px 0;
          color: #7f8c8d;
          font-size: 0.9rem;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .banner-actions {
          display: flex;
          justify-content: flex-end;
          padding: 0 15px 15px;
          gap: 10px;
        }

        .edit-btn,
        .delete-btn {
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.3s;
        }

        .edit-btn {
          background-color: #e3f2fd;
          color: #1565c0;
        }

        .edit-btn:hover {
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

        .no-banners {
          background: white;
          border-radius: 8px;
          padding: 30px;
          text-align: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .no-banners p {
          color: #7f8c8d;
          margin-bottom: 20px;
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

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
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

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }

        .form-group small {
          display: block;
          margin-top: 5px;
          color: #7f8c8d;
          font-size: 0.8rem;
        }

        .image-preview {
          margin-top: 10px;
          max-height: 200px;
          overflow: hidden;
          border-radius: 4px;
        }

        .image-preview img {
          width: 100%;
          object-fit: cover;
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

        .checkbox-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .checkbox-group input[type="checkbox"] {
          width: auto;
          margin-right: 5px;
        }

        .offer-badge {
          position: absolute;
          top: 40px;
          left: 10px;
          background-color: #ff3366;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 500;
          z-index: 2;
        }

        .resolution-guide {
          display: block;
          margin-top: 5px;
          color: #7f8c8d;
          font-size: 0.8rem;
        }

        @media (max-width: 768px) {
          .banners-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }

          .banners-actions {
            width: 100%;
            flex-direction: column;
          }

          .search-box input {
            width: 100%;
          }

          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </Layout>
  );
}
