'use client';

import { createContext, useState, useContext, useEffect } from 'react';
import Cookies from 'js-cookie';
import { User } from '../types/auth.types';

type AuthContextType = {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (token: string, userData: User) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Load user khi refresh
    useEffect(() => {
        const token = Cookies.get('access_token');

        if (!token) {
            setLoading(false);
            return;
        }

        const fetchMe = async () => {
            try {
                const res = await fetch('/api/auth/me', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) throw new Error('Unauthorized');

                const json = await res.json();

                // LẤY user từ json.data
                setUser(json.data);
                setIsAuthenticated(true);
            } catch (error) {
                Cookies.remove('access_token');
                setUser(null);
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        fetchMe();
    }, []);

    const login = (token: string, userData: User) => {
        Cookies.set('access_token', token);
        setUser(userData);
        setIsAuthenticated(true);
        setLoading(false);
    };

    const logout = () => {
        Cookies.remove('access_token');
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                loading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
