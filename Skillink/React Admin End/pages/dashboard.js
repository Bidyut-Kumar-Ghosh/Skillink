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
                  <table className="books-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Author</th>
                        <th>Category</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentBooks.map((book) => (
                        <tr key={book.id}>
                          <td>{book.title || "Unknown"}</td>
                          <td>{book.author || "Unknown"}</td>
                          <td>{book.category || "Unknown"}</td>
                          <td>
                            <span
                              className={`status ${book.status || "available"}`}
                            >
                              {book.status || "Available"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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

        @media (max-width: 768px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </Layout>
  );
}
