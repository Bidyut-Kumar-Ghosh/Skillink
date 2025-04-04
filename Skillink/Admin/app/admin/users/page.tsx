'use client';

import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import {
    collection,
    getDocs,
    doc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    serverTimestamp
} from 'firebase/firestore';
import { FiEdit, FiTrash2, FiPlus, FiSearch, FiFilter, FiLock, FiMail, FiUser } from 'react-icons/fi';
import { sha256 } from 'js-sha256';

interface User {
    uid: string;
    name: string;
    email: string;
    role: string;
    password?: string;
    createdAt: any;
}

export default function Users() {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'user' as string,
        password: '',
        confirmPassword: '',
    });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        // Apply filters and search
        let result = users;

        // Filter by role
        if (filterRole !== 'all') {
            result = result.filter(user => user.role === filterRole);
        }

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(user =>
                user.name.toLowerCase().includes(term) ||
                user.email.toLowerCase().includes(term)
            );
        }

        setFilteredUsers(result);
    }, [users, searchTerm, filterRole]);

    async function fetchUsers() {
        try {
            setLoading(true);
            const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(usersQuery);

            const usersList = snapshot.docs.map(doc => ({
                ...doc.data(),
                uid: doc.id,
            })) as User[];

            setUsers(usersList);
            setFilteredUsers(usersList);
        } catch (error) {
            console.error('Error fetching users:', error);
            setError('Failed to load users. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    function openModal(user?: User) {
        // Clear previous messages
        setError(null);
        setSuccessMessage(null);

        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                role: user.role || 'user',
                password: '', // Don't fill password on edit
                confirmPassword: '',
            });
            setEditingId(user.uid);
        } else {
            setFormData({
                name: '',
                email: '',
                role: 'user',
                password: '',
                confirmPassword: '',
            });
            setEditingId(null);
        }
        setIsModalOpen(true);
    }

    function closeModal() {
        setIsModalOpen(false);
        setFormData({
            name: '',
            email: '',
            role: 'user',
            password: '',
            confirmPassword: '',
        });
        setEditingId(null);
        setError(null);
        setSuccessMessage(null);
        setShowPassword(false);
        setShowConfirmPassword(false);
    }

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    }

    // Hash password using sha256
    function hashPassword(password: string): string {
        return sha256(password);
    }

    // Create new user with hashed password
    // Generate unique UID similar to Firebase Auth - match the format from main app (f6wh39rvk9Ps4w2Ggv6oS1oEypR2)
    function generateFirebaseStyleUID(): string {
        // Create a random string that looks like a Firebase Auth UID
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        // Firebase UIDs are typically 28 characters
        const length = 28;

        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        return result;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        try {
            // Basic validation - match the React Native app validation
            if (!formData.name || !formData.email || !formData.password || (!editingId && !formData.confirmPassword)) {
                setError('All fields are required');
                return;
            }

            // Additional validations when creating a new user
            if (!editingId) {
                if (formData.password !== formData.confirmPassword) {
                    setError('Passwords do not match');
                    return;
                }

                if (formData.password.length < 6) {
                    setError('Password must be at least 6 characters');
                    return;
                }
            }

            if (editingId) {
                // Update existing user
                const userData = {
                    name: formData.name,
                    email: formData.email,
                    role: formData.role,
                    // Note: we don't update password this way in a real app
                };

                await updateDoc(doc(db, 'users', editingId), userData);
                setSuccessMessage('User updated successfully');
            } else {
                // Create new user with hashed password
                // Generate unique UID similar to Firebase Auth - match the format from main app (f6wh39rvk9Ps4w2Ggv6oS1oEypR2)
                const userId = generateFirebaseStyleUID();

                const userData: User = {
                    uid: userId,
                    name: formData.name,
                    email: formData.email,
                    role: formData.role,
                    // Hash the password to match your main app
                    password: hashPassword(formData.password),
                    createdAt: serverTimestamp(),
                };

                // Store the user with the UID as the document ID (same as Firebase Auth pattern)
                await setDoc(doc(db, 'users', userId), userData);
                setSuccessMessage('User created successfully');
            }

            closeModal();
            fetchUsers();
        } catch (error) {
            console.error('Error saving user:', error);
            setError(`Error: ${(error as Error).message}`);
        }
    }

    async function handleDelete(id: string) {
        if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                await deleteDoc(doc(db, 'users', id));
                fetchUsers();
                setSuccessMessage('User deleted successfully');
            } catch (error) {
                console.error('Error deleting user:', error);
                setError(`Error deleting user: ${(error as Error).message}`);
            }
        }
    }

    const roleStyles = {
        admin: 'bg-purple-100 text-purple-800',
        teacher: 'bg-blue-100 text-blue-800',
        user: 'bg-green-100 text-green-800'
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Users</h1>
                    <p className="mt-1 text-sm text-gray-500">Manage user accounts in your platform</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="mt-4 sm:mt-0 flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    <FiPlus className="mr-2" /> Add User
                </button>
            </div>

            {/* Success or Error Messages */}
            {successMessage && (
                <div className="mb-6 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded">
                    <p>{successMessage}</p>
                </div>
            )}

            {error && (
                <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
                    <p>{error}</p>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative rounded-md">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiSearch className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search users..."
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                        <div className="flex items-center">
                            <FiFilter className="mr-2 text-gray-500" />
                            <select
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value)}
                                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            >
                                <option value="all">All Roles</option>
                                <option value="admin">Admin</option>
                                <option value="teacher">Teacher</option>
                                <option value="user">User</option>
                            </select>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                        <span className="ml-2 text-gray-600">Loading users...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Created At
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                            {searchTerm || filterRole !== 'all' ?
                                                'No users match your search criteria' :
                                                'No users found'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map(user => (
                                        <tr key={user.uid} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{user.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${roleStyles[user.role as keyof typeof roleStyles] || 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleString() : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => openModal(user)}
                                                    className="text-blue-600 hover:text-blue-900 mr-3 focus:outline-none"
                                                    aria-label="Edit user"
                                                >
                                                    <FiEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.uid)}
                                                    className="text-red-600 hover:text-red-900 focus:outline-none"
                                                    aria-label="Delete user"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg m-4">
                        <h2 className="text-xl font-bold mb-4 text-gray-900 flex items-center">
                            {editingId ? 'Edit User' : 'Create Account'}
                        </h2>

                        {error && (
                            <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
                                <p>{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiUser className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 pl-10 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-blue-300"
                                        placeholder="Full Name"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                                    Email
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiMail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 pl-10 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-blue-300"
                                        placeholder="Email"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiLock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 pl-10 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-blue-300"
                                        placeholder="Password"
                                        minLength={6}
                                        required={!editingId}
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        <FiLock className={`h-5 w-5 ${showPassword ? 'text-blue-500' : 'text-gray-400'}`} />
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Min. 6 characters</p>
                            </div>

                            {!editingId && (
                                <div className="mb-6">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FiLock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            className="shadow appearance-none border rounded w-full py-2 px-3 pl-10 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-blue-300"
                                            placeholder="Confirm Password"
                                            minLength={6}
                                            required={!editingId}
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            <FiLock className={`h-5 w-5 ${showConfirmPassword ? 'text-blue-500' : 'text-gray-400'}`} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="role">
                                    Role
                                </label>
                                <select
                                    id="role"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-blue-300"
                                >
                                    <option value="user">User</option>
                                    <option value="teacher">Teacher</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {editingId ? 'Update' : 'Sign Up'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
} 