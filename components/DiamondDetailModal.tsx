import React from 'react';
import { Diamond } from '../types';

interface DiamondDetailModalProps {
    diamond: Diamond | null;
    onClose: () => void;
    onSelect: (diamondId: string) => void;
}

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);


export const DiamondDetailModal: React.FC<DiamondDetailModalProps> = ({ diamond, onClose, onSelect }) => {
    if (!diamond) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="diamond-detail-title"
        >
            <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-2xl border border-gray-200 relative animate-fade-in-up"
                onClick={e => e.stopPropagation()}
            >
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Close diamond details"
                >
                    <CloseIcon className="w-6 h-6" />
                </button>

                <div className="p-8">
                     <h2 id="diamond-detail-title" className="text-3xl font-bold text-[#232429] mb-6 text-center">
                        {diamond.carat.toFixed(2)}-Carat {diamond.shape.charAt(0).toUpperCase() + diamond.shape.slice(1)} Diamond
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-gray-100 rounded-lg flex items-center justify-center p-4">
                             <img src={`https://picsum.photos/seed/${diamond.id}/400/400`} alt={`${diamond.shape} diamond`} className="max-w-full h-auto rounded-md" />
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-brand-dark mb-4">${diamond.price.toLocaleString()}</p>
                            <div className="space-y-3 text-gray-600">
                                <div className="flex justify-between border-b pb-2"><span>Carat Weight:</span> <span className="font-medium text-[#232429]">{diamond.carat.toFixed(2)}</span></div>
                                <div className="flex justify-between border-b pb-2"><span>Cut Grade:</span> <span className="font-medium text-[#232429]">{diamond.cut}</span></div>
                                <div className="flex justify-between border-b pb-2"><span>Color Grade:</span> <span className="font-medium text-[#232429]">{diamond.color}</span></div>
                                <div className="flex justify-between border-b pb-2"><span>Clarity Grade:</span> <span className="font-medium text-[#232429]">{diamond.clarity}</span></div>
                                <div className="flex justify-between"><span>Shape:</span> <span className="font-medium text-[#232429]">{diamond.shape.charAt(0).toUpperCase() + diamond.shape.slice(1)}</span></div>
                            </div>
                             <button
                                onClick={() => onSelect(diamond.id)}
                                className="w-full mt-8 bg-brand text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand focus:ring-opacity-75 transition-all duration-300"
                            >
                                Select this Diamond
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};