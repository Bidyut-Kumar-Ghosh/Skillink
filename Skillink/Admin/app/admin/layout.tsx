'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { FiHome, FiUsers, FiBook, FiSettings, FiMenu, FiX } from 'react-icons/fi';
import { useState } from 'react';
import '../globals.css';

interface AdminLayoutProps {
    children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Mobile header */}
            <div className="lg:hidden bg-white shadow-sm z-10">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center">
                        <button
                            type="button"
                            className="text-gray-500 hover:text-gray-900 focus:outline-none"
                            onClick={toggleSidebar}
                        >
                            {sidebarOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
                        </button>
                        <h1 className="ml-3 text-xl font-semibold text-gray-900">Skillink Admin</h1>
                    </div>
                </div>
            </div>

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } lg:translate-x-0 z-30 w-64 bg-gradient-to-b from-blue-800 to-blue-900 transition-transform duration-300 ease-in-out lg:static lg:inset-auto lg:translate-x-0`}
            >
                <div className="flex items-center justify-center h-16 px-4 bg-blue-900 border-b border-blue-800">
                    <h1 className="text-xl font-bold text-white">Skillink Admin</h1>
                </div>
                <nav className="mt-5 px-2">
                    <div className="space-y-1">
                        <Link
                            href="/admin"
                            className="group flex items-center px-4 py-3 text-white text-base font-medium rounded-md hover:bg-blue-700"
                        >
                            <FiHome className="mr-3 h-5 w-5 text-blue-300 group-hover:text-white" />
                            Dashboard
                        </Link>
                        <Link
                            href="/admin/users"
                            className="group flex items-center px-4 py-3 text-white text-base font-medium rounded-md hover:bg-blue-700"
                        >
                            <FiUsers className="mr-3 h-5 w-5 text-blue-300 group-hover:text-white" />
                            Users
                        </Link>
                        <Link
                            href="/admin/courses"
                            className="group flex items-center px-4 py-3 text-white text-base font-medium rounded-md hover:bg-blue-700"
                        >
                            <FiBook className="mr-3 h-5 w-5 text-blue-300 group-hover:text-white" />
                            Courses
                        </Link>
                        <Link
                            href="/admin/settings"
                            className="group flex items-center px-4 py-3 text-white text-base font-medium rounded-md hover:bg-blue-700"
                        >
                            <FiSettings className="mr-3 h-5 w-5 text-blue-300 group-hover:text-white" />
                            Settings
                        </Link>
                    </div>
                </nav>
                <div className="absolute bottom-0 w-full">
                    <div className="px-4 py-4 border-t border-blue-800">
                        <Link
                            href="/"
                            className="flex items-center text-sm font-medium text-blue-300 hover:text-white"
                        >
                            Back to Home
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="lg:pl-64 flex flex-col min-h-screen">
                <main className="flex-1 p-5 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
                <footer className="bg-white shadow-inner p-4 text-center text-gray-500 text-sm">
                    <p>© {new Date().getFullYear()} Skillink Education. All rights reserved.</p>
                </footer>
            </div>
        </div>
    );
} 