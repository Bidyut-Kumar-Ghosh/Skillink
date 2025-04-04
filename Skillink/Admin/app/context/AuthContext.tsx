'use client';

import {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode
} from 'react';
import {
    onAuthStateChanged,
    User as FirebaseUser
} from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { UserData } from '../lib/auth';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: UserData | null;
    loading: boolean;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isTeacher: boolean;
    refreshUserData: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    isAuthenticated: false,
    isAdmin: false,
    isTeacher: false,
    refreshUserData: async () => { },
    logout: async () => { },
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const router = useRouter();
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch user data from Firestore
    const fetchUserData = async (firebaseUser: FirebaseUser): Promise<UserData | null> => {
        try {
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const userData = userDoc.data() as UserData;
                return {
                    ...userData,
                    uid: firebaseUser.uid,
                    email: firebaseUser.email || userData.email,
                    displayName: firebaseUser.displayName || userData.displayName || userData.name,
                    photoURL: firebaseUser.photoURL || userData.photoURL || '',
                    emailVerified: firebaseUser.emailVerified,
                };
            }

            return null;
        } catch (error) {
            console.error('Error fetching user data:', error);
            return null;
        }
    };

    // Refresh user data
    const refreshUserData = async () => {
        if (auth.currentUser) {
            const userData = await fetchUserData(auth.currentUser);
            if (userData) {
                setUser(userData);
            }
        }
    };

    // Logout function
    const logout = async () => {
        try {
            await auth.signOut();
            router.push('/login');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    // Set up auth state listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setLoading(true);

            if (firebaseUser) {
                try {
                    const userData = await fetchUserData(firebaseUser);
                    setUser(userData);
                } catch (error) {
                    console.error('Error in auth state change:', error);
                    setUser(null);
                }
            } else {
                setUser(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const isAuthenticated = !!user;
    const isAdmin = user?.role === 'admin';
    const isTeacher = user?.role === 'teacher';

    const value = {
        user,
        loading,
        isAuthenticated,
        isAdmin,
        isTeacher,
        refreshUserData,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
} 