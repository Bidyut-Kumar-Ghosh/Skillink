'use client';

import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, DocumentData, query, orderBy, limit } from 'firebase/firestore';
import { FiUsers, FiBook, FiAward, FiTrendingUp, FiActivity, FiArrowUp, FiArrowDown, FiBarChart, FiUserPlus } from 'react-icons/fi';
import Link from 'next/link';

interface RecentActivity {
    id: string;
    type: string;
    title: string;
    user: string;
    timestamp: any;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        users: 0,
        courses: 0,
        enrollments: 0,
    });
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                // Fetch users count
                const usersSnapshot = await getDocs(collection(db, 'users'));
                const usersCount = usersSnapshot.size;

                // Fetch courses count
                const coursesSnapshot = await getDocs(collection(db, 'courses'));
                const coursesCount = coursesSnapshot.size;

                // Fetch enrollments count
                const enrollmentsSnapshot = await getDocs(collection(db, 'enrollments'));
                const enrollmentsCount = enrollmentsSnapshot.size;

                setStats({
                    users: usersCount,
                    courses: coursesCount,
                    enrollments: enrollmentsCount,
                });

                // Mock data for recent activity (replace with actual data when available)
                const mockActivity = [
                    {
                        id: '1',
                        type: 'user',
                        title: 'New user registered',
                        user: 'John Smith',
                        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
                    },
                    {
                        id: '2',
                        type: 'course',
                        title: 'New course created',
                        user: 'Alice Johnson',
                        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
                    },
                    {
                        id: '3',
                        type: 'enrollment',
                        title: 'Course enrollment',
                        user: 'Michael Brown',
                        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
                    },
                    {
                        id: '4',
                        type: 'course',
                        title: 'Course updated',
                        user: 'Sarah Wilson',
                        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
                    },
                ];

                setRecentActivity(mockActivity);
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, []);

    function formatTime(date: Date) {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 60) {
            return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
        } else if (diffHours < 24) {
            return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        } else {
            return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
        }
    }

    return (
        <div>
            <div className="mb-8 bg-gradient-to-r from-blue-700 to-indigo-800 rounded-lg shadow-lg p-6 text-white">
                <h1 className="text-3xl font-bold">Welcome to Skillink Dashboard</h1>
                <p className="mt-2 text-blue-100">Manage and monitor your educational platform</p>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
                    <span className="ml-4 text-lg text-gray-600">Loading your dashboard...</span>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                            <div className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-semibold text-blue-800 uppercase tracking-wider mb-1">
                                            Total Users
                                        </div>
                                        <div className="flex items-center">
                                            <div className="text-3xl font-bold text-blue-900">{stats.users}</div>
                                            <div className="ml-3 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center">
                                                <FiArrowUp className="mr-1" />
                                                12%
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-blue-600 rounded-lg p-3">
                                        <FiUsers className="h-8 w-8 text-white" />
                                    </div>
                                </div>
                                <div className="mt-4 text-sm text-blue-800">
                                    <div className="h-1 w-full bg-blue-200 rounded-full overflow-hidden">
                                        <div className="h-1 bg-blue-600 rounded-full" style={{ width: '70%' }}></div>
                                    </div>
                                    <div className="flex justify-between mt-1">
                                        <span>Active users: {Math.round(stats.users * 0.7)}</span>
                                        <span className="font-medium">{Math.round((stats.users * 0.7 / stats.users) * 100)}%</span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-blue-600 px-6 py-3">
                                <Link href="/admin/users" className="text-sm font-medium text-white flex items-center justify-between">
                                    <span>View all users</span>
                                    <span>→</span>
                                </Link>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-green-100 overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                            <div className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-semibold text-green-800 uppercase tracking-wider mb-1">
                                            Total Courses
                                        </div>
                                        <div className="flex items-center">
                                            <div className="text-3xl font-bold text-green-900">{stats.courses}</div>
                                            <div className="ml-3 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center">
                                                <FiArrowUp className="mr-1" />
                                                8%
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-green-600 rounded-lg p-3">
                                        <FiBook className="h-8 w-8 text-white" />
                                    </div>
                                </div>
                                <div className="mt-4 text-sm text-green-800">
                                    <div className="flex items-center justify-between mb-1">
                                        <span>Published Courses:</span>
                                        <span>{Math.round(stats.courses * 0.8)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Draft Courses:</span>
                                        <span>{Math.round(stats.courses * 0.2)}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-green-600 px-6 py-3">
                                <Link href="/admin/courses" className="text-sm font-medium text-white flex items-center justify-between">
                                    <span>Manage courses</span>
                                    <span>→</span>
                                </Link>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                            <div className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-semibold text-purple-800 uppercase tracking-wider mb-1">
                                            Enrollments
                                        </div>
                                        <div className="flex items-center">
                                            <div className="text-3xl font-bold text-purple-900">{stats.enrollments}</div>
                                            <div className="ml-3 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full flex items-center">
                                                <FiArrowUp className="mr-1" />
                                                15%
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-purple-600 rounded-lg p-3">
                                        <FiAward className="h-8 w-8 text-white" />
                                    </div>
                                </div>
                                <div className="mt-4 text-sm text-purple-800">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center">
                                            <div className="h-3 w-3 rounded-full bg-purple-500 mr-2"></div>
                                            <span>Completed</span>
                                        </div>
                                        <span>45%</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center">
                                            <div className="h-3 w-3 rounded-full bg-purple-300 mr-2"></div>
                                            <span>In Progress</span>
                                        </div>
                                        <span>55%</span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-purple-600 px-6 py-3">
                                <div className="text-sm font-medium text-white flex items-center justify-between">
                                    <span>View details</span>
                                    <span>→</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="bg-white rounded-xl shadow-md overflow-hidden col-span-2">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <FiActivity className="mr-2 text-blue-600" /> Recent Activity
                                </h3>
                                <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                                    Today
                                </div>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {recentActivity.length > 0 ? (
                                    recentActivity.map((activity) => (
                                        <div key={activity.id} className="p-4 hover:bg-blue-50 transition-colors duration-150">
                                            <div className="flex items-center">
                                                <div className={`flex-shrink-0 rounded-full p-2 
                                                              ${activity.type === 'user' ? 'bg-blue-100 text-blue-600' :
                                                        activity.type === 'course' ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'}`}
                                                >
                                                    {activity.type === 'user' ? (
                                                        <FiUserPlus className="h-5 w-5" />
                                                    ) : activity.type === 'course' ? (
                                                        <FiBook className="h-5 w-5" />
                                                    ) : (
                                                        <FiAward className="h-5 w-5" />
                                                    )}
                                                </div>
                                                <div className="ml-4 flex-1">
                                                    <div className="text-sm font-semibold text-gray-900">{activity.title}</div>
                                                    <div className="text-sm text-gray-600 flex justify-between mt-1">
                                                        <span>{activity.user}</span>
                                                        <span className="text-gray-500">{formatTime(activity.timestamp)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-8 text-center text-gray-500">
                                        No recent activity
                                    </div>
                                )}
                            </div>
                            <div className="border-t border-gray-200 px-6 py-3 bg-gray-50">
                                <span className="text-sm font-medium text-blue-600 hover:text-blue-500 cursor-pointer">View all activity</span>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-md overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <FiBarChart className="mr-2 text-blue-600" /> Platform Stats
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className="mb-6">
                                    <div className="flex justify-between mb-2">
                                        <div className="text-sm font-medium text-gray-900">Weekly Growth</div>
                                        <div className="text-sm font-semibold text-green-600">+12.5%</div>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-2 bg-green-500 rounded-full" style={{ width: '65%' }}></div>
                                    </div>
                                </div>
                                <div className="mb-6">
                                    <div className="flex justify-between mb-2">
                                        <div className="text-sm font-medium text-gray-900">Completion Rate</div>
                                        <div className="text-sm font-semibold text-blue-600">68%</div>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-2 bg-blue-500 rounded-full" style={{ width: '68%' }}></div>
                                    </div>
                                </div>
                                <div className="mb-6">
                                    <div className="flex justify-between mb-2">
                                        <div className="text-sm font-medium text-gray-900">Revenue</div>
                                        <div className="text-sm font-semibold text-purple-600">+23.4%</div>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-2 bg-purple-500 rounded-full" style={{ width: '82%' }}></div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-6">
                                    <div className="border border-gray-200 rounded-lg p-4">
                                        <div className="text-xs text-gray-500 mb-1">Active Tutors</div>
                                        <div className="text-lg font-bold text-gray-800">24</div>
                                    </div>
                                    <div className="border border-gray-200 rounded-lg p-4">
                                        <div className="text-xs text-gray-500 mb-1">Avg. Rating</div>
                                        <div className="text-lg font-bold text-gray-800">4.8/5</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
} 