import React from 'react';

export const Header: React.FC = () => {
    return (
        <>
            <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-200">
                <div className="container mx-auto px-4">
                    <div className="flex justify-center items-center py-4">
                        <a href="https://www.therightring.com/">
                            <img src="https://framerusercontent.com/images/FHftFuIChaavuwoII685yqNf6A.png" alt="The Right Ring Logo" className="h-20 sm:h-28 md:h-32 w-auto hover:opacity-90 transition-opacity" />
                        </a>
                    </div>
                </div>
            </header>
        </>
    );
};