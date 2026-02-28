import React from 'react';
import { Question } from '../types';

interface InfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    info: Question['info'] | null;
}

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);


export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose, info }) => {
    if (!isOpen || !info) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="info-modal-title"
        >
            <div 
                className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg border border-gray-200 relative animate-fade-in-up"
                onClick={e => e.stopPropagation()}
            >
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Close information"
                >
                    <CloseIcon className="w-6 h-6" />
                </button>
                <h2 id="info-modal-title" className="text-3xl font-bold text-[#232429] mb-4">{info.title}</h2>
                <p className="text-gray-600 mb-6">{info.description}</p>
                
                {info.optionsInfo && info.optionsInfo.length > 0 && (
                    <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                        {info.optionsInfo.map(optInfo => (
                            <div key={optInfo.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <h4 className="font-semibold text-lg text-brand-dark">{optInfo.name}</h4>
                                <p className="text-sm text-gray-500 mt-1">{optInfo.description}</p>
                            </div>
                        ))}
                    </div>
                )}
                 <div className="mt-6 text-right">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-brand text-white font-semibold rounded-lg shadow-sm hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand focus:ring-opacity-50 transition-colors"
                    >
                        Got it
                    </button>
                </div>
            </div>
        </div>
    );
};