import { useState, useEffect } from "react";
import Head from "next/head";
import Layout from "../components/Layout";
import { db } from "../firebase/config";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  where,
} from "firebase/firestore";

export default function Dashboard() {
  const [stats, setStats] = useState({
    students: 0,
    courses: 0,
    books: 0,
    enrollments: 0,
    revenue: 0,
    banners: 0,
  });
  const [recentEnrollments, setRecentEnrollments] = useState([]);
  const [recentBooks, setRecentBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch students (non-admin users)
        const usersRef = collection(db, "users");

        // Count all users
        const allUsersSnap = await getDocs(usersRef);

        // Filter out admin users to get only students
        let studentCount = 0;
        allUsersSnap.forEach((doc) => {
          const userData = doc.data();
          if (userData.role !== "admin") {
            studentCount++;
          }
        });

        // Fetch other collection counts
        const coursesSnap = await getDocs(collection(db, "courses"));
        const booksSnap = await getDocs(collection(db, "books"));
        const enrollmentsSnap = await getDocs(collection(db, "enrollments"));
        const bannersSnap = await getDocs(collection(db, "banners"));

        // Calculate total revenue
        let totalRevenue = 0;
        enrollmentsSnap.forEach((doc) => {
          const enrollmentData = doc.data();
          if (enrollmentData.amount) {
            totalRevenue += parseFloat(enrollmentData.amount);
          }
        });

        setStats({
          students: studentCount,
          courses: coursesSnap.size,
          books: booksSnap.size,
          enrollments: enrollmentsSnap.size,
          revenue: totalRevenue.toFixed(2),
          banners: bannersSnap.size,
        });

        // Fetch recent enrollments
        const recentEnrollmentsQuery = query(
          collection(db, "enrollments"),
          orderBy("enrollmentDate", "desc"),
          limit(5)
        );

        const recentEnrollmentsSnap = await getDocs(recentEnrollmentsQuery);
        const recentEnrollmentsList = [];

        recentEnrollmentsSnap.forEach((doc) => {
          recentEnrollmentsList.push({
            id: doc.id,
            ...doc.data(),
            enrollmentDate: doc.data().enrollmentDate?.toDate?.() || new Date(),
          });
        });

        setRecentEnrollments(recentEnrollmentsList);

        // Fetch recent books
        const recentBooksQuery = query(
          collection(db, "books"),
          orderBy("createdAt", "desc"),
          limit(5)
        );

        const recentBooksSnap = await getDocs(recentBooksQuery);
        const recentBooksList = [];

        recentBooksSnap.forEach((doc) => {
          recentBooksList.push({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || new Date(),
          });
        });

        setRecentBooks(recentBooksList);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Layout>
      <Head>
        <title>Skillink Admin Dashboard</title>
      </Head>

      <div className="dashboard">
        <h1>Dashboard</h1>

        {loading ? (
          <div className="loading">Loading dashboard data...</div>
        ) : (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Students</h3>
                <p className="stat-value">{stats.students}</p>
              </div>
              <div className="stat-card">
                <h3>Courses</h3>
                <p className="stat-value">{stats.courses}</p>
              </div>
              <div className="stat-card">
                <h3>Books</h3>
                <p className="stat-value">{stats.books}</p>
              </div>
              <div className="stat-card">
                <h3>Enrollments</h3>
                <p className="stat-value">{stats.enrollments}</p>
              </div>
              <div className="stat-card">
                <h3>Revenue</h3>
                <p className="stat-value">${stats.revenue}</p>
              </div>
              <div className="stat-card">
                <h3>App Banners</h3>
                <p className="stat-value">{stats.banners}</p>
                <a href="/banners" className="manage-link">
                  Manage
                </a>
              </div>
            </div>

            <div className="dashboard-grid">
              <div className="recent-enrollments">
                <h2>Recent Enrollments</h2>

                {recentEnrollments.length > 0 ? (
                  <table className="enrollments-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Student</th>
                        <th>Course</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentEnrollments.map((enrollment) => (
                        <tr key={enrollment.id}>
                          <td>{enrollment.id.substring(0, 8)}...</td>
                          <td>{enrollment.studentName || "Unknown"}</td>
                          <td>{enrollment.courseName || "Unknown"}</td>
                          <td>
                            {enrollment.enrollmentDate.toLocaleDateString()}
                          </td>
                          <td>
                            <span
                              className={`status ${
                                enrollment.status || "active"
                              }`}
                            >
                              {enrollment.status || "Active"}
                            </span>
                          </td>
                          <td>${enrollment.amount || "0.00"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="no-data">No recent enrollments found</p>
                )}
              </div>

              <div className="recent-books">
                <h2>Recent Books</h2>

                {recentBooks.length > 0 ? (
                  <div className="books-grid-display">
                    {recentBooks.map((book) => (
                      <div className="book-card-mini" key={book.id}>
                        <div className="book-cover">
                          {book.imageUrl ? (
                            <img src={book.imageUrl} alt={book.title} />
                          ) : (
                            <div className="cover-placeholder">
                              <span>{book.title?.charAt(0) || "B"}</span>
                            </div>
                          )}
                          <span
                            className={`book-status ${
                              book.status || "available"
                            }`}
                          >
                            {book.status === "outofstock"
                              ? "Out of Stock"
                              : book.status || "Available"}
                          </span>
                        </div>
                        <div className="book-info">
                          <h3 className="book-title">
                            {book.title || "Unknown"}
                          </h3>
                          <p className="book-author">
                            by {book.author || "Unknown"}
                          </p>
                          {book.publishDate && (
                            <p className="book-date">
                              {new Date(book.publishDate).toLocaleDateString()}
                            </p>
                          )}
                          {book.category && (
                            <span className="book-category">
                              {book.category}
                            </span>
                          )}
                          <div className="book-formats">
                            {book.pdfData && (
                              <span className="format pdf">PDF</span>
                            )}
                            {book.hasPrintedVersion && (
                              <span className="format print">Print</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">No recent books found</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .dashboard {
          padding: 20px;
        }

        h1 {
          margin-bottom: 24px;
          color: #2c3e50;
        }

        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 300px;
          font-size: 1.2rem;
          color: #7f8c8d;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          position: relative;
        }

        .stat-card h3 {
          margin: 0 0 10px 0;
          color: #7f8c8d;
          font-size: 0.9rem;
          text-transform: uppercase;
        }

        .stat-value {
          margin: 0;
          font-size: 2rem;
          font-weight: bold;
          color: #2c3e50;
        }

        .manage-link {
          position: absolute;
          right: 15px;
          bottom: 15px;
          font-size: 0.8rem;
          padding: 4px 8px;
          background-color: #e3f2fd;
          color: #1565c0;
          text-decoration: none;
          border-radius: 4px;
          transition: background-color 0.2s;
        }

        .manage-link:hover {
          background-color: #bbdefb;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .recent-enrollments,
        .recent-books {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .recent-enrollments h2,
        .recent-books h2 {
          margin-top: 0;
          margin-bottom: 20px;
          color: #2c3e50;
        }

        .enrollments-table,
        .books-table {
          width: 100%;
          border-collapse: collapse;
        }

        .enrollments-table th,
        .enrollments-table td,
        .books-table th,
        .books-table td {
          padding: 12px 15px;
          text-align: left;
          border-bottom: 1px solid #ecf0f1;
        }

        .enrollments-table th,
        .books-table th {
          background-color: #f8f9fa;
          font-weight: 600;
          color: #7f8c8d;
        }

        .status {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .status.active,
        .status.available {
          background-color: #e8f5e9;
          color: #2e7d32;
        }

        .status.completed {
          background-color: #e3f2fd;
          color: #1565c0;
        }

        .status.cancelled,
        .status.borrowed {
          background-color: #ffebee;
          color: #c62828;
        }

        .status.pending {
          background-color: #fff8e1;
          color: #ff8f00;
        }

        .no-data {
          color: #7f8c8d;
          text-align: center;
          padding: 20px;
        }

        .books-grid-display {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 15px;
        }

        .book-card-mini {
          display: flex;
          flex-direction: column;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .book-card-mini:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
        }

        .book-cover {
          position: relative;
          height: 130px;
          background: #f8f9fa;
          overflow: hidden;
        }

        .book-cover img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .cover-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .cover-placeholder span {
          font-size: 2.5rem;
          font-weight: bold;
        }

        .book-status {
          position: absolute;
          top: 8px;
          right: 8px;
          font-size: 0.65rem;
          padding: 3px 6px;
          border-radius: 4px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .book-status.available {
          background-color: rgba(46, 125, 50, 0.9);
          color: white;
        }

        .book-status.outofstock {
          background-color: rgba(230, 81, 0, 0.9);
          color: white;
        }

        .book-info {
          padding: 12px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .book-title {
          margin: 0 0 4px 0;
          font-size: 0.95rem;
          font-weight: 600;
          color: #2c3e50;
          line-height: 1.3;
          /* Limit to 2 lines and add ellipsis */
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .book-author {
          margin: 0 0 4px 0;
          font-size: 0.8rem;
          color: #7f8c8d;
          /* Limit to 1 line and add ellipsis */
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .book-date {
          margin: 0 0 6px 0;
          font-size: 0.75rem;
          color: #95a5a6;
        }

        .book-category {
          display: inline-block;
          background-color: #f1f9f1;
          color: #2c3e50;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.7rem;
          margin-top: auto;
        }

        .book-formats {
          display: flex;
          gap: 6px;
          margin-top: 8px;
        }

        .format {
          font-size: 0.7rem;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 500;
        }

        .format.pdf {
          background-color: #e3f2fd;
          color: #1565c0;
        }

        .format.print {
          background-color: #e8f5e9;
          color: #2e7d32;
        }

        @media (max-width: 768px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }

          .stats-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          }

          .books-grid-display {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          }

          .book-cover {
            height: 120px;
          }
        }

        @media (max-width: 480px) {
          .books-grid-display {
            grid-template-columns: repeat(2, 1fr);
          }

          .stat-card {
            padding: 15px;
          }

          .stat-value {
            font-size: 1.6rem;
          }

          .book-cover {
            height: 100px;
          }
        }
      `}</style>
    </Layout>
  );
}
