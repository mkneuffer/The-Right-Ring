import React from 'react';
import { Diamond } from '../types';

import { calculateDiamondPrice } from '../utils';

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

    const price = calculateDiamondPrice(diamond);
    const weight = parseFloat(diamond.Weight) || 0;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start md:items-center p-4 overflow-y-auto"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="diamond-detail-title"
        >
            <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-2xl border border-gray-200 relative animate-fade-in-up my-8 md:my-auto"
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Close diamond details"
                >
                    <CloseIcon className="w-6 h-6" />
                </button>

                <div className="p-4 md:p-8">
                    <h2 id="diamond-detail-title" className="text-2xl md:text-3xl font-bold text-[#232429] mb-4 md:mb-6 text-center">
                        {weight.toFixed(2)}-Carat {diamond.Shape} Diamond
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        <div className="bg-gray-100 rounded-lg flex items-center justify-center p-0 overflow-hidden min-h-[200px] md:min-h-[300px] h-full">
                            {diamond.VideoLink ? (
                                <iframe
                                    src={diamond.VideoLink}
                                    title={`${diamond.Shape} diamond video`}
                                    className="w-full h-full min-h-[200px] md:min-h-[300px] border-0"
                                    allowFullScreen
                                />
                            ) : (
                                <img
                                    src={diamond.ImageLink || `https://via.placeholder.com/400x400?text=${diamond.Shape}`}
                                    alt={`${diamond.Shape} diamond`}
                                    className="max-w-full h-auto max-h-[400px] object-contain rounded-md p-4"
                                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400?text=No+Image'; }}
                                />
                            )}
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-brand-dark mb-4">${price.toLocaleString()}</p>
                            <div className="space-y-3 text-gray-600">
                                <div className="flex justify-between border-b pb-2"><span>Carat Weight:</span> <span className="font-medium text-[#232429]">{weight.toFixed(2)}</span></div>
                                <div className="flex justify-between border-b pb-2"><span>Cut Grade:</span> <span className="font-medium text-[#232429]">{diamond.Cut_Grade || 'N/A'}</span></div>
                                <div className="flex justify-between border-b pb-2"><span>Color Grade:</span> <span className="font-medium text-[#232429]">{diamond.Color}</span></div>
                                <div className="flex justify-between border-b pb-2"><span>Clarity Grade:</span> <span className="font-medium text-[#232429]">{diamond.Clarity}</span></div>
                                <div className="flex justify-between"><span>Shape:</span> <span className="font-medium text-[#232429]">{diamond.Shape}</span></div>
                            </div>

                            {diamond.CertificateLink && (
                                <a
                                    href={diamond.CertificateLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full text-center mt-6 bg-white text-brand border-2 border-brand font-bold py-2.5 px-4 rounded-lg shadow-sm hover:bg-brand/5 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-opacity-75 transition-all duration-300"
                                >
                                    View Certificate
                                </a>
                            )}

                            <button
                                onClick={() => onSelect(diamond.Stock_No)}
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