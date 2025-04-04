'use client';

import { useState, useEffect } from 'react';
import { db, storage } from '../../lib/firebase';
import {
    collection,
    getDocs,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    where,
    limit
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { FiEdit, FiTrash2, FiPlus, FiImage, FiFilter, FiSearch, FiX, FiDollarSign, FiTag, FiFileText } from 'react-icons/fi';

interface Course {
    id: string;
    title: string;
    description: string;
    price: number;
    imageUrl: string;
    category: string;
    createdAt: any;
}

export default function Courses() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: 0,
        category: 'programming',
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        // Apply filters and search
        let result = courses;

        // Filter by category
        if (filterCategory !== 'all') {
            result = result.filter(course => course.category === filterCategory);
        }

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(course =>
                course.title.toLowerCase().includes(term) ||
                course.description.toLowerCase().includes(term)
            );
        }

        setFilteredCourses(result);
    }, [courses, searchTerm, filterCategory]);

    async function fetchCourses() {
        try {
            setLoading(true);
            const coursesQuery = query(collection(db, 'courses'), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(coursesQuery);

            const coursesList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            })) as Course[];

            setCourses(coursesList);
            setFilteredCourses(coursesList);
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    }

    function openModal(course?: Course) {
        if (course) {
            setFormData({
                title: course.title,
                description: course.description,
                price: course.price,
                category: course.category,
            });
            setImagePreview(course.imageUrl);
            setEditingId(course.id);
        } else {
            setFormData({
                title: '',
                description: '',
                price: 0,
                category: 'programming',
            });
            setImagePreview(null);
            setImageFile(null);
            setEditingId(null);
        }
        setIsModalOpen(true);
    }

    function closeModal() {
        setIsModalOpen(false);
        setFormData({
            title: '',
            description: '',
            price: 0,
            category: 'programming',
        });
        setImagePreview(null);
        setImageFile(null);
        setEditingId(null);
    }

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'price' ? parseFloat(value) : value,
        }));
    }

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);

            // Create image preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }

    async function uploadImage(file: File): Promise<string> {
        const storageRef = ref(storage, `course-images/${Date.now()}-${file.name}`);
        await uploadBytes(storageRef, file);
        return getDownloadURL(storageRef);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        try {
            let imageUrl = imagePreview;

            // If there's a new image file, upload it
            if (imageFile) {
                imageUrl = await uploadImage(imageFile);
            }

            if (editingId) {
                // Update existing course
                await updateDoc(doc(db, 'courses', editingId), {
                    title: formData.title,
                    description: formData.description,
                    price: formData.price,
                    category: formData.category,
                    ...(imageUrl && { imageUrl }),
                    updatedAt: new Date(),
                });
            } else {
                // Add new course
                if (!imageUrl) {
                    alert('Please upload an image for the course');
                    return;
                }

                await addDoc(collection(db, 'courses'), {
                    title: formData.title,
                    description: formData.description,
                    price: formData.price,
                    category: formData.category,
                    imageUrl,
                    createdAt: new Date(),
                });
            }

            closeModal();
            fetchCourses();
        } catch (error) {
            console.error('Error saving course:', error);
        }
    }

    async function handleDelete(id: string, imageUrl: string) {
        if (confirm('Are you sure you want to delete this course?')) {
            try {
                // Delete the course document
                await deleteDoc(doc(db, 'courses', id));

                // Delete the image from storage if it exists
                if (imageUrl) {
                    try {
                        const imageRef = ref(storage, imageUrl);
                        await deleteObject(imageRef);
                    } catch (error) {
                        console.error('Error deleting image:', error);
                    }
                }

                fetchCourses();
            } catch (error) {
                console.error('Error deleting course:', error);
            }
        }
    }

    const getCategoryStyles = (category: string) => {
        const styles = {
            programming: 'bg-blue-100 text-blue-800',
            design: 'bg-purple-100 text-purple-800',
            business: 'bg-green-100 text-green-800',
            marketing: 'bg-orange-100 text-orange-800',
            personal: 'bg-yellow-100 text-yellow-800',
        };

        return styles[category as keyof typeof styles] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
                    <p className="mt-1 text-sm text-gray-500">Manage educational content in your platform</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="mt-4 sm:mt-0 flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    <FiPlus className="mr-2" /> Add Course
                </button>
            </div>

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
                                placeholder="Search courses..."
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                        <div className="flex items-center">
                            <FiFilter className="mr-2 text-gray-500" />
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            >
                                <option value="all">All Categories</option>
                                <option value="programming">Programming</option>
                                <option value="design">Design</option>
                                <option value="business">Business</option>
                                <option value="marketing">Marketing</option>
                                <option value="personal">Personal Development</option>
                            </select>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
                        <span className="ml-4 text-lg text-gray-600">Loading courses...</span>
                    </div>
                ) : (
                    <div className="p-6">
                        {filteredCourses.length === 0 ? (
                            <div className="text-center py-12 px-4">
                                <FiFileText className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-lg font-medium text-gray-900">
                                    {searchTerm || filterCategory !== 'all' ? 'No courses match your criteria' : 'No courses found'}
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {searchTerm || filterCategory !== 'all' ?
                                        'Try adjusting your search or filter' :
                                        'Get started by creating a new course'}
                                </p>
                                <div className="mt-6">
                                    <button
                                        onClick={() => openModal()}
                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        <FiPlus className="mr-2 -ml-1 h-5 w-5" aria-hidden="true" />
                                        New Course
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredCourses.map(course => (
                                    <div key={course.id} className="bg-white overflow-hidden rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                                        <div className="aspect-w-16 aspect-h-9 bg-gray-200 relative group">
                                            {course.imageUrl ? (
                                                <>
                                                    <img
                                                        src={course.imageUrl}
                                                        alt={course.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                                                        <div className="opacity-0 group-hover:opacity-100 transform group-hover:translate-y-0 translate-y-4 transition-all duration-300">
                                                            <button
                                                                onClick={() => openModal(course)}
                                                                className="mx-1 p-2 rounded-full bg-white text-blue-600 hover:bg-blue-600 hover:text-white transition-colors duration-200"
                                                            >
                                                                <FiEdit className="h-5 w-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(course.id, course.imageUrl)}
                                                                className="mx-1 p-2 rounded-full bg-white text-red-600 hover:bg-red-600 hover:text-white transition-colors duration-200"
                                                            >
                                                                <FiTrash2 className="h-5 w-5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex items-center justify-center h-full">
                                                    <FiImage className="text-4xl text-gray-400" />
                                                </div>
                                            )}
                                            <div className="absolute top-2 right-2">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryStyles(course.category)}`}>
                                                    {course.category}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-5">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-1">{course.title}</h3>
                                            <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                                                {course.description}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center text-green-700 font-bold">
                                                    <FiDollarSign className="mr-1" />
                                                    {course.price.toFixed(2)}
                                                </div>
                                                <button
                                                    onClick={() => openModal(course)}
                                                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                                >
                                                    Edit Course
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-xl m-4">
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingId ? 'Edit Course' : 'Add New Course'}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-500 focus:outline-none"
                            >
                                <FiX className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="title">
                                        Course Title
                                    </label>
                                    <input
                                        type="text"
                                        id="title"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">
                                        Description
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows={4}
                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="price">
                                            Price ($)
                                        </label>
                                        <div className="relative rounded-md shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FiDollarSign className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="number"
                                                id="price"
                                                name="price"
                                                value={formData.price}
                                                onChange={handleInputChange}
                                                min="0"
                                                step="0.01"
                                                className="block w-full pl-10 pr-3 py-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="category">
                                            Category
                                        </label>
                                        <div className="relative rounded-md shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FiTag className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <select
                                                id="category"
                                                name="category"
                                                value={formData.category}
                                                onChange={handleInputChange}
                                                className="block w-full pl-10 pr-10 py-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            >
                                                <option value="programming">Programming</option>
                                                <option value="design">Design</option>
                                                <option value="business">Business</option>
                                                <option value="marketing">Marketing</option>
                                                <option value="personal">Personal Development</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="image">
                                        Course Image
                                    </label>
                                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                        <div className="space-y-1 text-center">
                                            {imagePreview ? (
                                                <div>
                                                    <img
                                                        src={imagePreview}
                                                        alt="Course preview"
                                                        className="mx-auto h-48 w-auto rounded-md"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setImagePreview(null);
                                                            setImageFile(null);
                                                        }}
                                                        className="mt-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                    >
                                                        Remove Image
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <FiImage className="mx-auto h-12 w-12 text-gray-400" />
                                                    <div className="flex text-sm text-gray-600">
                                                        <label
                                                            htmlFor="image-upload"
                                                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                                                        >
                                                            <span>Upload an image</span>
                                                            <input
                                                                id="image-upload"
                                                                name="image-upload"
                                                                type="file"
                                                                className="sr-only"
                                                                accept="image/*"
                                                                onChange={handleImageChange}
                                                            />
                                                        </label>
                                                        <p className="pl-1">or drag and drop</p>
                                                    </div>
                                                    <p className="text-xs text-gray-500">
                                                        PNG, JPG, GIF up to 10MB
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    {editingId ? 'Update Course' : 'Create Course'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
} 