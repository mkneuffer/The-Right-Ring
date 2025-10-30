

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, pass: string) => void;
    signup: (email: string, pass: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // Mock checking for a saved session in localStorage
        const savedUser = localStorage.getItem('right-ring-user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    const login = (email: string, pass: string) => {
        // This is a mock login. In a real app, you'd call an API.
        if (!email || !pass) throw new Error("Email and password are required.");
        console.log(`Logging in with ${email}`);
        const newUser: User = { id: `user_${Date.now()}`, email };
        localStorage.setItem('right-ring-user', JSON.stringify(newUser));
        setUser(newUser);
    };

    const signup = (email: string, pass: string) => {
        // This is a mock signup.
        if (!email || !pass) throw new Error("Email and password are required.");
        console.log(`Signing up with ${email}`);
        const newUser: User = { id: `user_${Date.now()}`, email };
        localStorage.setItem('right-ring-user', JSON.stringify(newUser));
        setUser(newUser);
    };

    const logout = () => {
        localStorage.removeItem('right-ring-user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout }}>
            {children}
        {/* FIX: Corrected typo in closing tag from Auth-Context.Provider to AuthContext.Provider. */}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};