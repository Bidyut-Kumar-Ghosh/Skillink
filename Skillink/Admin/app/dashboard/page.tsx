'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import {
    FiBook,
    FiBookmark,
    FiClock,
    FiAward,
    FiBookOpen,
    FiLogOut,
    FiUser,
    FiHome,
    FiMenu,
    FiX
} from 'react-icons/fi';

export default function Dashboard() {
    const { user, isAuthenticated, loading, logout } = useAuth();
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Redirect non-authenticated users to login
    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/login');
        }
    }, [loading, isAuthenticated, router]);

    if (loading) {
        return (
            <div className="flex h-screen justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null; // This prevents flashing content before redirect
    }

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/login');
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    // Mock data for the dashboard
    const enrolledCourses = [
        { id: 1, title: 'Introduction to Web Development', progress: 75, lastAccessed: '2023-04-15' },
        { id: 2, title: 'JavaScript Fundamentals', progress: 45, lastAccessed: '2023-04-12' },
        { id: 3, title: 'React for Beginners', progress: 20, lastAccessed: '2023-04-10' }
    ];

    const savedCourses = [
        { id: 4, title: 'Advanced CSS Techniques', instructor: 'Jane Smith' },
        { id: 5, title: 'TypeScript Essentials', instructor: 'John Doe' }
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar - Desktop */}
            <aside className="hidden md:flex md:flex-col md:w-64 bg-white shadow-md">
                <div className="p-4 border-b border-gray-200">
                    <h1 className="text-xl font-bold text-blue-600">Skillink</h1>
                </div>
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            {user?.photoURL ? (
                                <img
                                    src={user.photoURL}
                                    alt={user.name}
                                    className="h-10 w-10 rounded-full"
                                />
                            ) : (
                                <span className="text-blue-600 font-medium text-lg">
                                    {user?.name.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                            <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                    </div>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <a className="flex items-center px-4 py-2 text-gray-900 rounded-md bg-gray-100">
                        <FiHome className="mr-3 text-gray-500" />
                        Dashboard
                    </a>
                    <a className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100">
                        <FiBookOpen className="mr-3 text-gray-500" />
                        My Courses
                    </a>
                    <a className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100">
                        <FiBook className="mr-3 text-gray-500" />
                        Course Catalog
                    </a>
                    <a className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100">
                        <FiAward className="mr-3 text-gray-500" />
                        Certificates
                    </a>
                    <a className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100">
                        <FiUser className="mr-3 text-gray-500" />
                        Profile
                    </a>
                </nav>
                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={handleLogout}
                        className="flex items-center px-4 py-2 w-full text-gray-700 rounded-md hover:bg-gray-100"
                    >
                        <FiLogOut className="mr-3 text-gray-500" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden bg-white w-full fixed top-0 left-0 z-10 shadow-sm">
                <div className="flex items-center justify-between p-4">
                    <h1 className="text-xl font-bold text-blue-600">Skillink</h1>
                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? (
                            <FiX className="h-6 w-6 text-gray-500" />
                        ) : (
                            <FiMenu className="h-6 w-6 text-gray-500" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <nav className="px-4 pt-2 pb-4 bg-white border-b border-gray-200 space-y-1">
                        <a className="flex items-center px-4 py-2 text-gray-900 rounded-md bg-gray-100">
                            <FiHome className="mr-3 text-gray-500" />
                            Dashboard
                        </a>
                        <a className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100">
                            <FiBookOpen className="mr-3 text-gray-500" />
                            My Courses
                        </a>
                        <a className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100">
                            <FiBook className="mr-3 text-gray-500" />
                            Course Catalog
                        </a>
                        <a className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100">
                            <FiAward className="mr-3 text-gray-500" />
                            Certificates
                        </a>
                        <a className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100">
                            <FiUser className="mr-3 text-gray-500" />
                            Profile
                        </a>
                        <button
                            onClick={handleLogout}
                            className="flex items-center px-4 py-2 w-full text-left text-gray-700 rounded-md hover:bg-gray-100"
                        >
                            <FiLogOut className="mr-3 text-gray-500" />
                            Sign Out
                        </button>
                    </nav>
                )}
            </div>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 pt-4 md:pt-0">
                <div className="px-4 sm:px-6 lg:px-8 py-8 md:py-6">
                    {/* Welcome Section */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, {user?.name.split(' ')[0]}!</h1>
                        <p className="text-gray-600">Continue your learning journey where you left off.</p>
                    </div>

                    {/* Progress Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow p-6 flex flex-col justify-between">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                                    <FiBookOpen className="h-6 w-6" />
                                </div>
                                <div className="ml-4">
                                    <h2 className="text-lg font-semibold text-gray-900">Enrolled Courses</h2>
                                    <p className="text-3xl font-bold text-blue-600">{enrolledCourses.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6 flex flex-col justify-between">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-green-100 text-green-600">
                                    <FiClock className="h-6 w-6" />
                                </div>
                                <div className="ml-4">
                                    <h2 className="text-lg font-semibold text-gray-900">Hours Spent</h2>
                                    <p className="text-3xl font-bold text-green-600">12</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6 flex flex-col justify-between">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                                    <FiAward className="h-6 w-6" />
                                </div>
                                <div className="ml-4">
                                    <h2 className="text-lg font-semibold text-gray-900">Certificates</h2>
                                    <p className="text-3xl font-bold text-purple-600">1</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Continue Learning Section */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">Continue Learning</h2>
                            <a className="text-sm font-medium text-blue-600 hover:text-blue-500">View All Courses</a>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {enrolledCourses.map(course => (
                                <div key={course.id} className="bg-white rounded-lg shadow overflow-hidden">
                                    <div className="p-6">
                                        <h3 className="text-lg font-semibold mb-2 text-gray-900">{course.title}</h3>
                                        <div className="mb-4">
                                            <div className="flex items-center justify-between text-sm mb-1">
                                                <span className="text-gray-600">Progress</span>
                                                <span className="font-medium">{course.progress}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full"
                                                    style={{ width: `${course.progress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <FiClock className="mr-1" />
                                            <span>Last accessed on {course.lastAccessed}</span>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 px-6 py-3">
                                        <a className="text-blue-600 hover:text-blue-500 font-medium text-sm">
                                            Continue Learning
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Saved Courses Section */}
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">Saved for Later</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {savedCourses.map(course => (
                                <div key={course.id} className="bg-white rounded-lg shadow overflow-hidden">
                                    <div className="p-6">
                                        <h3 className="text-lg font-semibold mb-2 text-gray-900">{course.title}</h3>
                                        <p className="text-gray-600 mb-2">Instructor: {course.instructor}</p>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <FiBookmark className="mr-1" />
                                            <span>Saved for later</span>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 px-6 py-3 flex justify-between">
                                        <a className="text-blue-600 hover:text-blue-500 font-medium text-sm">
                                            Start Course
                                        </a>
                                        <button className="text-gray-500 hover:text-gray-700 text-sm">
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
} 