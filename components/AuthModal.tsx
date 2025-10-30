import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type AuthMode = 'login' | 'signup';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
    const [mode, setMode] = useState<AuthMode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, signup } = useAuth();

    if (!isOpen) return null;
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            if (mode === 'login') {
                login(email, password);
            } else {
                signup(email, password);
            }
            onClose();
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md border border-gray-200"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex border-b border-gray-200 mb-6">
                    <button 
                        onClick={() => setMode('login')}
                        className={`w-1/2 py-3 font-semibold transition-colors ${mode === 'login' ? 'text-brand-dark border-b-2 border-brand' : 'text-gray-500'}`}
                    >
                        Login
                    </button>
                    <button 
                        onClick={() => setMode('signup')}
                        className={`w-1/2 py-3 font-semibold transition-colors ${mode === 'signup' ? 'text-brand-dark border-b-2 border-brand' : 'text-gray-500'}`}
                    >
                        Sign Up
                    </button>
                </div>

                <h2 className="text-3xl font-bold text-[#232429] mb-6 text-center">
                    {mode === 'login' ? 'Welcome Back' : 'Create Your Account'}
                </h2>
                <p className="text-gray-500 text-center mb-6 text-sm">
                    {mode === 'login' ? 'Access your saved designs.' : 'Save your progress and designs.'}
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2 px-3 text-[#232429] leading-tight focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2 px-3 text-[#232429] leading-tight focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
                            required
                        />
                    </div>
                    {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
                    <button
                        type="submit"
                        className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors"
                    >
                        {mode === 'login' ? 'Login' : 'Create Account'}
                    </button>
                </form>
            </div>
        </div>
    );
};