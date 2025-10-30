import React, { useState } from 'react';
import { AuthModal } from './AuthModal';
import { useAuth } from '../hooks/useAuth';

export const Header: React.FC = () => {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const { isAuthenticated, user, logout } = useAuth();

    return (
        <>
            <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-200">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-3">
                            <img src="https://framerusercontent.com/images/FHftFuIChaavuwoII685yqNf6A.png" alt="The Right Ring Logo" className="w-10 h-10"/>
                            <h1 className="text-3xl font-bold text-[#232429] tracking-widest">The Right Ring</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            {isAuthenticated ? (
                                <>
                                    <span className="text-gray-600 hidden sm:block">Welcome, {user?.email.split('@')[0]}</span>
                                    <button
                                        onClick={logout}
                                        className="px-4 py-2 bg-brand text-white font-semibold rounded-lg shadow-sm hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand focus:ring-opacity-50 transition-colors"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setIsAuthModalOpen(true)}
                                    className="px-4 py-2 border border-brand text-brand-dark font-semibold rounded-lg hover:bg-brand hover:text-white focus:outline-none focus:ring-2 focus:ring-brand focus:ring-opacity-50 transition-colors"
                                >
                                    Login / Sign Up
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </header>
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        </>
    );
};