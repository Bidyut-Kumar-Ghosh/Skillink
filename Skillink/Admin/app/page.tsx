import Image from "next/image";
import Link from 'next/link';
import { FiUsers, FiBook, FiSettings, FiBarChart2 } from 'react-icons/fi';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Skillink Admin
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
            Manage your educational platform with ease
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 mb-16">
          <Link href="/admin" className="bg-white overflow-hidden shadow rounded-lg transition-all hover:shadow-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                  <FiBarChart2 className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Dashboard</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">Overview</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <span className="font-medium text-blue-600 hover:text-blue-500">
                  Go to Dashboard
                </span>
              </div>
            </div>
          </Link>

          <Link href="/admin/users" className="bg-white overflow-hidden shadow rounded-lg transition-all hover:shadow-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <FiUsers className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Users</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">Management</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <span className="font-medium text-green-600 hover:text-green-500">
                  Manage Users
                </span>
              </div>
            </div>
          </Link>

          <Link href="/admin/courses" className="bg-white overflow-hidden shadow rounded-lg transition-all hover:shadow-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                  <FiBook className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Courses</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">Content</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <span className="font-medium text-purple-600 hover:text-purple-500">
                  Manage Courses
                </span>
              </div>
            </div>
          </Link>

          <Link href="/admin/settings" className="bg-white overflow-hidden shadow rounded-lg transition-all hover:shadow-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                  <FiSettings className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Settings</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">Configuration</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <span className="font-medium text-yellow-600 hover:text-yellow-500">
                  Adjust Settings
                </span>
              </div>
            </div>
          </Link>
        </div>

        <div className="bg-white shadow sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Welcome to Skillink Admin Panel
            </h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>
                This admin dashboard allows you to manage all aspects of your Skillink education platform.
                Add and manage users, create and update courses, and configure system settings.
              </p>
            </div>
            <div className="mt-5">
              <Link href="/admin" className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                Access Full Admin Dashboard
              </Link>
            </div>
          </div>
        </div>

        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Skillink Education. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
