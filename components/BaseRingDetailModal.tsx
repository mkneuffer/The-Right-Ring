import React, { useRef, useState, useCallback } from 'react';
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
    const videoRef = useRef<HTMLVideoElement>(null);
    const dragStartX = useRef<number | null>(null);
    const dragStartTime = useRef(0);
    const pendingX = useRef<number | null>(null);
    const rafId = useRef<number | null>(null);
    // Pixels per second of video — higher = faster scrub per pixel dragged
    const SENSITIVITY = 8;

    const flushSeek = useCallback(() => {
        rafId.current = null;
        if (pendingX.current === null || dragStartX.current === null) return;
        const vid = videoRef.current;
        if (!vid || !vid.duration) return;
        const delta = (pendingX.current - dragStartX.current) / SENSITIVITY;
        vid.currentTime = Math.max(0, Math.min(vid.duration, dragStartTime.current + delta));
        pendingX.current = null;
    }, []);

    const onVideoDragStart = useCallback((clientX: number) => {
        const vid = videoRef.current;
        if (!vid) return;
        // Keep playing — seeking on a playing video is smooth in modern browsers
        dragStartX.current = clientX;
        dragStartTime.current = vid.currentTime;
    }, []);

    const onVideoDragMove = useCallback((clientX: number) => {
        if (dragStartX.current === null) return;
        pendingX.current = clientX;
        // Throttle to one seek per animation frame
        if (rafId.current === null) {
            rafId.current = requestAnimationFrame(flushSeek);
        }
    }, [flushSeek]);

    const onVideoDragEnd = useCallback(() => {
        if (dragStartX.current === null) return;
        dragStartX.current = null;
        pendingX.current = null;
        if (rafId.current !== null) { cancelAnimationFrame(rafId.current); rafId.current = null; }
    }, []);

    const onVideoMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        onVideoDragStart(e.clientX);
        const onMove = (ev: MouseEvent) => onVideoDragMove(ev.clientX);
        const onUp   = () => { onVideoDragEnd(); window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    };

    const onVideoTouchStart = (e: React.TouchEvent) => {
        onVideoDragStart(e.touches[0].clientX);
        const onMove = (ev: TouchEvent) => onVideoDragMove(ev.touches[0].clientX);
        const onEnd  = () => { onVideoDragEnd(); window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onEnd); };
        window.addEventListener('touchmove', onMove, { passive: true });
        window.addEventListener('touchend', onEnd);
    };

    const RING_DESCRIPTORS: Record<string, string> = {
        'lotus-style':     'Three-stone with delicate pear shape side diamonds that bloom outward from the center',
        'nelson-style':    'Clean solitaire — the center stone is the entire focus',
        'martini-style':   'Solitaire with a sleek 6-prong head for a modern, tapered look',
        'tulip-style':     'Solitaire with a 4-prong tulip head for a delicate, floral feel',
        'stephens-style':  'Solitaire with a full bezel setting and tapered band for a modern edge',
        'wright-style':    'Solitaire with a hidden halo of diamonds beneath the center stone',
        'hall-style':      'Diamonds trail halfway down both sides of the band',
        'don-style':       'Graduated diamonds trail down the band, smaller at top, larger at base',
        'freeman-style':   'Classic three-stone with round brilliant side diamonds',
        'maverick-style':  'Three-stone with trillion-cut side diamonds set in prongs',
        'mcneel-style':    'Three-stone with half moon bezel side diamonds for a soft, modern look',
        'tacorie-style':   'Three-stone plus channel-set diamonds trailing down the band',
        'sloan-style':     'Three-stone with alternating stone shapes in half moon bezels',
        'melissa-style':   'Three-stone with side diamonds fully bezel-set for a smooth, modern look',
        'brett-style':     'A bold, non-symmetrical cluster of stones arranged around the center',
        'sarah-style':     'Five-stone design with two diamonds on each side of the center',
        'christine-style': 'Center stone flanked by a cluster of three diamonds on each side, in alternating metals',
    };

    const displayName = option.name;
    const subtitleDisplay = option.subtitle || '';
    // price field is now e.g. "$1,900 · setting only" or "$3,600 · includes side diamonds"
    const isSettingOnly = option.price?.includes('setting only') ?? false;
    const naturalPrice = option.price ? option.price.split(' · ')[0] : '';
    const labGrownPrice = option.labGrownPrice ?? '';


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
                                <div className="relative w-full h-full min-h-[280px] md:min-h-[420px] select-none">
                                    <video
                                        ref={videoRef}
                                        src={option.videoUrl}
                                        title={`${displayName} video`}
                                        className="w-full h-full min-h-[280px] md:min-h-[420px] border-0 object-cover"
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        controls={false}
                                        preload="auto"
                                        onCanPlay={(e) => { (e.target as HTMLVideoElement).play().catch(console.error); }}
                                    />
                                    {/* Drag-to-scrub overlay */}
                                    <div
                                        className="absolute inset-0 cursor-ew-resize"
                                        onMouseDown={onVideoMouseDown}
                                        onTouchStart={onVideoTouchStart}
                                        title="Drag left/right to scrub"
                                    />
                                    <div className="absolute bottom-2 left-0 right-0 flex justify-center pointer-events-none">
                                        <span className="bg-black/40 text-white text-[11px] px-2 py-0.5 rounded-full">← drag to scrub →</span>
                                    </div>
                                </div>
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
                                {RING_DESCRIPTORS[option.id] && <p className="text-base text-gray-500 italic mb-2">{RING_DESCRIPTORS[option.id]}</p>}
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
                                            {isSettingOnly
                                                ? `Select this base ring — setting only${naturalPrice ? ` (${naturalPrice})` : ''}`
                                                : `Select this base ring with natural side diamonds${naturalPrice ? ` (${naturalPrice})` : ''}`}
                                        </button>
                                        {labGrownPrice && (
                                            <button
                                                onClick={() => {
                                                    onSelectLabGrown(option.id);
                                                    onClose();
                                                }}
                                                className="w-full bg-white text-brand border-2 border-brand font-bold py-3 px-4 rounded-lg shadow-sm hover:bg-brand hover:text-white focus:outline-none focus:ring-2 focus:ring-brand focus:ring-opacity-75 transition-all duration-300"
                                            >
                                                Select with Lab Grown Side Diamonds ({labGrownPrice})
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
