'use client';

import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { FiSave } from 'react-icons/fi';

interface Settings {
    siteName: string;
    contactEmail: string;
    allowRegistration: boolean;
    maintenanceMode: boolean;
    featuredCourseIds: string[];
}

export default function Settings() {
    const [settings, setSettings] = useState<Settings>({
        siteName: 'Skillink Education',
        contactEmail: 'contact@skillink.com',
        allowRegistration: true,
        maintenanceMode: false,
        featuredCourseIds: [],
    });
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        async function fetchSettings() {
            try {
                setLoading(true);
                const settingsDoc = await getDoc(doc(db, 'settings', 'general'));

                if (settingsDoc.exists()) {
                    setSettings(settingsDoc.data() as Settings);
                }
            } catch (error) {
                console.error('Error fetching settings:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchSettings();
    }, []);

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const { name, value, type } = e.target as HTMLInputElement;

        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsSaving(true);
        setSaveSuccess(false);

        try {
            await setDoc(doc(db, 'settings', 'general'), settings);
            setSaveSuccess(true);

            // Reset success message after 3 seconds
            setTimeout(() => {
                setSaveSuccess(false);
            }, 3000);
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Failed to save settings. Please try again.');
        } finally {
            setIsSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center">
                <p>Loading settings...</p>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Settings</h1>

            <div className="bg-white rounded-lg shadow-md p-6">
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="siteName">
                            Site Name
                        </label>
                        <input
                            type="text"
                            id="siteName"
                            name="siteName"
                            value={settings.siteName}
                            onChange={handleInputChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="contactEmail">
                            Contact Email
                        </label>
                        <input
                            type="email"
                            id="contactEmail"
                            name="contactEmail"
                            value={settings.contactEmail}
                            onChange={handleInputChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>

                    <div className="mb-4 flex items-center">
                        <input
                            type="checkbox"
                            id="allowRegistration"
                            name="allowRegistration"
                            checked={settings.allowRegistration}
                            onChange={handleInputChange}
                            className="mr-2"
                        />
                        <label className="text-gray-700" htmlFor="allowRegistration">
                            Allow User Registration
                        </label>
                    </div>

                    <div className="mb-6 flex items-center">
                        <input
                            type="checkbox"
                            id="maintenanceMode"
                            name="maintenanceMode"
                            checked={settings.maintenanceMode}
                            onChange={handleInputChange}
                            className="mr-2"
                        />
                        <label className="text-gray-700" htmlFor="maintenanceMode">
                            Maintenance Mode
                        </label>
                    </div>

                    <div className="flex items-center justify-end">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className={`flex items-center px-4 py-2 rounded-md ${isSaving
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                        >
                            <FiSave className="mr-2" />
                            {isSaving ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>

                    {saveSuccess && (
                        <div className="mt-4 p-2 bg-green-100 border border-green-400 text-green-700 rounded">
                            Settings saved successfully!
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
} 