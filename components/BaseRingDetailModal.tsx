import React from 'react';
import { Option, Question } from '../types';

interface BaseRingDetailModalProps {
    option: Option;
    fullDescription?: string;
    onClose: () => void;
    onSelect: (optionId: string, variant?: string) => void;
    onSelectLabGrown: (optionId: string, variant?: string) => void;
}

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);

const TACORIE_VARIANTS = [
    { key: 'pink-natural',    label: 'Select this base ring with natural pink diamonds (as shown)',    price: '$18,500', isLabGrown: false },
    { key: 'clear-natural',   label: 'Select this base ring with all natural clear diamonds',          price: '$4,000',  isLabGrown: false },
    { key: 'clear-lab-grown', label: 'Select this base ring with all clear Lab Grown diamonds',        price: '$3,300',  isLabGrown: true  },
    { key: 'pink-lab-grown',  label: 'Select this base ring with Lab Grown pink diamonds (as shown)',  price: '$3,500',  isLabGrown: true  },
];

export const BaseRingDetailModal: React.FC<BaseRingDetailModalProps> = ({ option, fullDescription, onClose, onSelect, onSelectLabGrown }) => {
    const isTacorie = option.id === 'tacorie-style';

    // Extract price from name if it exists (e.g., "Style Name - Solitaire - $1,900 (settings only)")
    const nameMatch = option.name.match(/^(.*?)\s*-\s*(.*?)\s*-\s*(\$.*)$/);
    let displayName = option.name;
    let subtitleDisplay = option.subtitle || '';
    let priceDisplay = '';

    if (nameMatch) {
        displayName = nameMatch[1];
        subtitleDisplay = nameMatch[2];
        priceDisplay = nameMatch[3];
    } else {
        // fallback matching if the structure is different
        const parts = option.name.split(' - ');
        if (parts.length > 0) displayName = parts[0];
        if (parts.length > 1) subtitleDisplay = parts[1];
        if (parts.length > 2) priceDisplay = parts.slice(2).join(' - ');
    }


    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex justify-center items-start md:items-center p-4 overflow-y-auto"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="basering-detail-title"
        >
            <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-3xl border border-gray-200 relative animate-fade-in-up my-8 md:my-auto"
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
                    aria-label="Close base ring details"
                >
                    <CloseIcon className="w-6 h-6" />
                </button>

                <div className="p-4 md:p-8">
                    <h2 id="basering-detail-title" className="text-2xl md:text-3xl font-bold text-[#232429] mb-4 md:mb-6 text-center">
                        {displayName}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        <div className="bg-gray-100 rounded-lg flex items-center justify-center p-0 overflow-hidden min-h-[280px] md:min-h-[420px] h-full relative">
                            {option.videoUrl ? (
                                <video
                                    src={option.videoUrl}
                                    title={`${displayName} video`}
                                    className="w-full h-full min-h-[280px] md:min-h-[420px] border-0 object-cover"
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    controls={false}
                                    preload="auto"
                                    onCanPlay={(e) => {
                                        // Attempt to play explicitly as a fallback
                                        const video = e.target as HTMLVideoElement;
                                        video.play().catch(console.error);
                                    }}
                                />
                            ) : (
                                <img
                                    src={option.imageUrl || `https://via.placeholder.com/400x400?text=${displayName}`}
                                    alt={`${displayName}`}
                                    className="max-w-full h-auto max-h-[400px] object-cover"
                                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400?text=No+Image'; }}
                                />
                            )}
                        </div>
                        <div className="flex flex-col h-full justify-between">
                            <div>
                                {priceDisplay && <p className="text-2xl font-bold text-brand-dark mb-2">{priceDisplay}</p>}
                                {subtitleDisplay && <p className="text-lg font-medium text-gray-600 mb-4 pb-4 border-b">{subtitleDisplay}</p>}

                                {fullDescription && (
                                    <div className="space-y-3 text-gray-700 leading-relaxed text-sm md:text-base">
                                        <p>{fullDescription}</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 flex flex-col gap-3">
                                {isTacorie ? (
                                    <>
                                        {TACORIE_VARIANTS.map((v, i) => (
                                            <button
                                                key={v.key}
                                                onClick={() => {
                                                    if (v.isLabGrown) {
                                                        onSelectLabGrown(option.id, v.key);
                                                    } else {
                                                        onSelect(option.id, v.key);
                                                    }
                                                    onClose();
                                                }}
                                                className={`w-full font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:ring-opacity-75 transition-all duration-300 ${i === 0 ? 'bg-brand text-white shadow-md hover:bg-brand-dark' : 'bg-white text-brand border-2 border-brand shadow-sm hover:bg-brand hover:text-white'}`}
                                            >
                                                {v.label} ({v.price})
                                            </button>
                                        ))}
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => {
                                                onSelect(option.id);
                                                onClose();
                                            }}
                                            className="w-full bg-brand text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand focus:ring-opacity-75 transition-all duration-300"
                                        >
                                            Select this base ring
                                        </button>
                                        {option.labGrownPrice && (
                                            <button
                                                onClick={() => {
                                                    onSelectLabGrown(option.id);
                                                    onClose();
                                                }}
                                                className="w-full bg-white text-brand border-2 border-brand font-bold py-3 px-4 rounded-lg shadow-sm hover:bg-brand hover:text-white focus:outline-none focus:ring-2 focus:ring-brand focus:ring-opacity-75 transition-all duration-300"
                                            >
                                                Select with Lab Grown Side Diamonds ({option.labGrownPrice})
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
