import React, { useState, useEffect, useRef } from 'react';
import { Question } from '../types';

const BIRTHSTONE_COLORS: Record<string, string> = {
    Garnet: '#c41e3a', Amethyst: '#9b59b6', Aquamarine: '#7fffd4',
    Diamond: '#e0e0e0', Emerald: '#50c878', Alexandrite: '#4b0082',
    Ruby: '#e0115f', Peridot: '#b5b42c', Sapphire: '#0f52ba',
    Tourmaline: '#ff69b4', Citrine: '#e4a010', Topaz: '#00688b',
    Tanzanite: '#4d5aaf',
};

const HIDDEN_STONE_IDS = ['hidden-stone-inside', 'hidden-stone-outside', 'hidden-stone-head', 'alternating-stone-type'];

interface QuestionCardProps {
    question: Question;
    selectedValue: string | string[] | null;
    onSelect: (optionId: string) => void;
    onShowInfo: (info: Question['info']) => void;
    labGrownOptionId?: string;
    engravingText?: string;
    engravingFont?: string;
    hiddenStoneConfig?: Record<string, string>;
    woodgrainVinesChoice?: string;
    baseRingVariant?: string;
    coloredStoneType?: string;
    coloredStoneVariety?: string;
    coloredStoneShapeName?: string;
    otherShapeText?: string;
    selectedStoneName?: string;
    diamondShapeIconUrl?: string;
    onChangeDiamondShape?: () => void;
}

const InfoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
    </svg>
);

const getOptionGridClass = (optionCount: number): string => {
    switch (optionCount) {
        case 5:
            return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5';
        case 4:
            return 'grid-cols-2 md:grid-cols-4';
        case 3:
            return 'grid-cols-3';
        default:
            return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4';
    }
};

const TACORIE_VARIANT_LABELS: Record<string, string> = {
    'pink-natural':    'Natural pink diamonds (as shown) - $18,500',
    'clear-natural':   'All natural clear diamonds - $4,000',
    'clear-lab-grown': 'All clear Lab Grown diamonds - $3,300',
    'pink-lab-grown':  'Lab Grown pink diamonds (as shown) - $3,500',
};

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, selectedValue, onSelect, onShowInfo, labGrownOptionId, engravingText, engravingFont, hiddenStoneConfig, woodgrainVinesChoice, baseRingVariant, coloredStoneType, coloredStoneVariety, coloredStoneShapeName, otherShapeText, selectedStoneName, diamondShapeIconUrl, onChangeDiamondShape }) => {
    const [tooltipOptionId, setTooltipOptionId] = useState<string | null>(null);
    const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null);
    const tooltipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [bandNudgeId, setBandNudgeId] = useState<string | null>(null);
    const [showDiamondShapeHint, setShowDiamondShapeHint] = useState(false);
    const [showBaseRingNudge, setShowBaseRingNudge] = useState(false);

    useEffect(() => { setShowDiamondShapeHint(false); }, [selectedValue]);
    const bandSectionRef = useRef<HTMLDivElement>(null);

    // Show nudge bubble after 30s on base ring page if no ring selected yet
    useEffect(() => {
        if (question.id !== 'baseRing') return;
        if (selectedValue) return;
        const showTimer = setTimeout(() => {
            setShowBaseRingNudge(true);
            setTimeout(() => setShowBaseRingNudge(false), 6000);
        }, 30000);
        return () => clearTimeout(showTimer);
    }, [question.id, selectedValue]);

    // Show nudge bubbles for knife-edge and european-shank when section scrolls into view
    useEffect(() => {
        const BAND_NUDGES = ['knife-edge', 'european-shank'];
        const nudgeOptions = question.options.filter(o => BAND_NUDGES.includes(o.id));
        if (!nudgeOptions.length || !bandSectionRef.current) return;
        let timers: ReturnType<typeof setTimeout>[] = [];
        const observer = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) return;
            observer.disconnect();
            nudgeOptions.forEach((o, i) => {
                const isSelected = Array.isArray(selectedValue) ? selectedValue.includes(o.id) : selectedValue === o.id;
                if (isSelected) return;
                const showTimer = setTimeout(() => {
                    setBandNudgeId(o.id);
                    const hideTimer = setTimeout(() => setBandNudgeId(prev => prev === o.id ? null : prev), 5000);
                    timers.push(hideTimer);
                }, i * 6000);
                timers.push(showTimer);
            });
        }, { threshold: 0.5 });
        observer.observe(bandSectionRef.current);
        return () => { observer.disconnect(); timers.forEach(clearTimeout); };
    }, [question.options, selectedValue]);

    return (
        <>
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-center gap-2 mb-6">
                <h3 className="text-2xl font-semibold text-[#232429] text-center">{question.text}</h3>
                {question.info && (
                    <button onClick={() => onShowInfo(question.info)} className="text-gray-400 hover:text-brand-dark transition-colors" aria-label={`More info about ${question.text}`}>
                        <InfoIcon className="w-6 h-6" />
                    </button>
                )}
            </div>

            {question.id === 'baseRing' && (
                <p className="text-center text-xs text-gray-400 mb-4 -mt-2">Tap any style to view details and select it</p>
            )}

            <div ref={bandSectionRef} className={`grid ${getOptionGridClass(question.options.length)} gap-4`}>
                {question.id === 'baseRing' ? (() => {
                    const categoryLabels: Record<string, string> = {
                        'solitaire': 'Solitaires',
                        'three-stone': 'Three Stone',
                        'diamonds-down': 'Diamonds Down the Band',
                        'halo': 'Halo',
                        'cluster': 'Cluster',
                        'channel-set': 'Step Down',
                        'five-stone': 'Five Stone',
                    };
                    // channel-set and five-stone share a row — render their split divider once
                    let sharedDividerRendered = false;
                    let lastCategory: string | undefined = undefined;
                    return question.options.map(option => {
                        const isSelected = Array.isArray(selectedValue)
                            ? selectedValue.includes(option.id)
                            : selectedValue === option.id;
                        const isSharedGroup = option.category === 'channel-set' || option.category === 'five-stone';
                        const showDivider = option.category && option.category !== lastCategory;
                        if (option.category) lastCategory = option.category;

                        let dividerEl: React.ReactNode = null;
                        if (showDivider) {
                            if (isSharedGroup && !sharedDividerRendered) {
                                sharedDividerRendered = true;
                                dividerEl = (
                                    <div className="col-span-full pt-3 pb-1">
                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Step Down</p>
                                                <hr className="border-gray-200 mt-1" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Five Stone</p>
                                                <hr className="border-gray-200 mt-1" />
                                            </div>
                                        </div>
                                    </div>
                                );
                            } else if (!isSharedGroup) {
                                dividerEl = (
                                    <div className="col-span-full pt-3 pb-1">
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{categoryLabels[option.category!]}</p>
                                        <hr className="border-gray-200 mt-1" />
                                    </div>
                                );
                            }
                        }

                        return (
                            <React.Fragment key={option.id}>
                                {dividerEl}
                                <div className="relative">
                                    <div
                                        onClick={(e) => { onSelect(option.id); (e.currentTarget as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'nearest' }); setBandNudgeId(null); setShowBaseRingNudge(false); }}
                                        className={`cursor-pointer group rounded-lg overflow-hidden transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full ${isSelected ? 'ring-2 ring-brand shadow-lg' : 'ring-1 ring-gray-200 hover:ring-brand'}`}
                                    >
                                        {option.imageUrl && (
                                            <div className="aspect-[4/3] sm:aspect-square bg-gray-100 shrink-0 overflow-hidden flex items-center justify-center">
                                                <img
                                                    src={option.imageUrl}
                                                    alt={option.name}
                                                    className={`w-full h-full object-cover transition-transform duration-300 ${option.id === 'nelson-style' ? 'scale-[1.8]' : option.id === 'don-style' ? 'scale-[1.6]' : option.id === 'brett-style' ? 'scale-[1.3]' : option.id === 'stephens-style' ? 'scale-[1.3]' : option.id === 'christine-style' ? 'scale-[1.4]' : option.id === 'lotus-style' ? 'scale-[1.5]' : ''}`}
                                                />
                                            </div>
                                        )}
                                        <div className={`p-2 sm:p-3 text-center transition-colors duration-300 flex-grow flex flex-col justify-center ${isSelected ? 'bg-brand' : 'bg-transparent group-hover:bg-black/5'}`}>
                                            <h4 className={`font-medium text-sm sm:text-base ${isSelected ? 'text-white' : 'text-[#232429]'}`}>{option.name}</h4>
                                            {option.price && (
                                                <p className={`text-xs mt-0.5 ${isSelected ? 'text-white/70' : 'text-gray-400'}`}>
                                                    {labGrownOptionId && option.id === labGrownOptionId && option.labGrownPrice
                                                        ? option.labGrownPrice + ' · includes lab grown diamonds'
                                                        : option.price}
                                                </p>
                                            )}
                                            {!isSelected && option.id !== 'build-from-scratch' && (
                                                <p className="text-[10px] text-brand/60 mt-1 group-hover:text-brand transition-colors">Tap to view details</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </React.Fragment>
                        );
                    });
                })() : question.options.map(option => {
                    const isSelected = Array.isArray(selectedValue)
                        ? selectedValue.includes(option.id)
                        : selectedValue === option.id;

                    return (
                        <div key={option.id} className="relative">
                            {option.id === 'knife-edge' && bandNudgeId === 'knife-edge' && !isSelected && (
                                <div className="absolute -top-9 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-bounce-in">
                                    <div className="bg-brand text-white text-[11px] font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                                        A sharper edge on the center of the band
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent" style={{ borderTopColor: '#4A7EB8' }} />
                                    </div>
                                </div>
                            )}
                            {option.id === 'european-shank' && bandNudgeId === 'european-shank' && !isSelected && (
                                <div className="absolute -top-9 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-bounce-in">
                                    <div className="bg-brand text-white text-[11px] font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                                        This band prevents spinning/twisting on the finger
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent" style={{ borderTopColor: '#4A7EB8' }} />
                                    </div>
                                </div>
                            )}
                        <div
                            onClick={(e) => {
                                if (option.id === 'diamond' && isSelected && onChangeDiamondShape) {
                                    setShowDiamondShapeHint(true);
                                    return;
                                }
                                onSelect(option.id);
                                (e.currentTarget as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                                setBandNudgeId(null);
                            }}
                            className={`cursor-pointer group rounded-lg overflow-hidden transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full ${isSelected ? 'ring-2 ring-brand shadow-lg' : 'ring-1 ring-gray-200 hover:ring-brand'}`}
                        >
                            {!option.imageUrl && (option.id === 'diamond' || option.id === 'colored-stone' || option.id === 'other') && (
                                <div className={`aspect-[3/2] shrink-0 flex items-center justify-center ${isSelected ? 'bg-brand/20' : 'bg-gray-50'}`}>
                                    {option.id === 'diamond' ? (
                                        (diamondShapeIconUrl && isSelected) ? (
                                            <img
                                                src={diamondShapeIconUrl}
                                                alt={coloredStoneShapeName || 'Diamond'}
                                                className="w-full h-full object-contain p-3"
                                            />
                                        ) : (
                                        <svg viewBox="0 0 200 200" className="w-14 h-14 sm:w-20 sm:h-20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="100" cy="100" r="90" stroke={isSelected ? 'white' : '#4A7EB8'} strokeWidth="3"/>
                                            {/* Table */}
                                            <polygon points="100,18 155,52 145,148 100,182 55,148 45,52" fill="none" stroke={isSelected ? 'white' : '#4A7EB8'} strokeWidth="2"/>
                                            {/* Upper girdle facets */}
                                            <line x1="100" y1="18" x2="45" y2="52" stroke={isSelected ? 'white' : '#4A7EB8'} strokeWidth="1.5"/>
                                            <line x1="100" y1="18" x2="155" y2="52" stroke={isSelected ? 'white' : '#4A7EB8'} strokeWidth="1.5"/>
                                            <line x1="45" y1="52" x2="100" y2="72" stroke={isSelected ? 'white' : '#4A7EB8'} strokeWidth="1.5"/>
                                            <line x1="155" y1="52" x2="100" y2="72" stroke={isSelected ? 'white' : '#4A7EB8'} strokeWidth="1.5"/>
                                            <line x1="45" y1="52" x2="20" y2="100" stroke={isSelected ? 'white' : '#4A7EB8'} strokeWidth="1.5"/>
                                            <line x1="155" y1="52" x2="180" y2="100" stroke={isSelected ? 'white' : '#4A7EB8'} strokeWidth="1.5"/>
                                            <line x1="20" y1="100" x2="100" y2="72" stroke={isSelected ? 'white' : '#4A7EB8'} strokeWidth="1.5"/>
                                            <line x1="180" y1="100" x2="100" y2="72" stroke={isSelected ? 'white' : '#4A7EB8'} strokeWidth="1.5"/>
                                            {/* Lower girdle facets */}
                                            <line x1="45" y1="148" x2="100" y2="128" stroke={isSelected ? 'white' : '#4A7EB8'} strokeWidth="1.5"/>
                                            <line x1="155" y1="148" x2="100" y2="128" stroke={isSelected ? 'white' : '#4A7EB8'} strokeWidth="1.5"/>
                                            <line x1="20" y1="100" x2="100" y2="128" stroke={isSelected ? 'white' : '#4A7EB8'} strokeWidth="1.5"/>
                                            <line x1="180" y1="100" x2="100" y2="128" stroke={isSelected ? 'white' : '#4A7EB8'} strokeWidth="1.5"/>
                                            <line x1="45" y1="148" x2="20" y2="100" stroke={isSelected ? 'white' : '#4A7EB8'} strokeWidth="1.5"/>
                                            <line x1="155" y1="148" x2="180" y2="100" stroke={isSelected ? 'white' : '#4A7EB8'} strokeWidth="1.5"/>
                                            <line x1="100" y1="182" x2="45" y2="148" stroke={isSelected ? 'white' : '#4A7EB8'} strokeWidth="1.5"/>
                                            <line x1="100" y1="182" x2="155" y2="148" stroke={isSelected ? 'white' : '#4A7EB8'} strokeWidth="1.5"/>
                                            {/* Star facets */}
                                            <line x1="100" y1="72" x2="100" y2="128" stroke={isSelected ? 'white' : '#4A7EB8'} strokeWidth="1" opacity="0.6"/>
                                            <line x1="20" y1="100" x2="45" y2="52" stroke={isSelected ? 'white' : '#4A7EB8'} strokeWidth="1" opacity="0.6"/>
                                            <line x1="180" y1="100" x2="155" y2="52" stroke={isSelected ? 'white' : '#4A7EB8'} strokeWidth="1" opacity="0.6"/>
                                            <line x1="20" y1="100" x2="45" y2="148" stroke={isSelected ? 'white' : '#4A7EB8'} strokeWidth="1" opacity="0.6"/>
                                            <line x1="180" y1="100" x2="155" y2="148" stroke={isSelected ? 'white' : '#4A7EB8'} strokeWidth="1" opacity="0.6"/>
                                        </svg>
                                        )
                                    ) : option.id === 'colored-stone' ? (
                                        <svg viewBox="0 0 64 64" className="w-12 h-12 sm:w-16 sm:h-16" xmlns="http://www.w3.org/2000/svg">
                                            {/* Color wheel — 12 segments, donut shape, matching reference image */}
                                            {[
                                                { color: '#5BB8D4' }, // teal-cyan
                                                { color: '#4AADE0' }, // sky blue
                                                { color: '#3A8FCC' }, // medium blue
                                                { color: '#2E75B8' }, // blue
                                                { color: '#2458A0' }, // medium-dark blue
                                                { color: '#1A3E88' }, // dark navy
                                                { color: '#1E3A6E' }, // deep navy
                                                { color: '#263D82' }, // indigo-navy
                                                { color: '#3050A0' }, // slate blue
                                                { color: '#4169B8' }, // cornflower
                                                { color: '#5080C8' }, // periwinkle
                                                { color: '#66A0D8' }, // light blue
                                            ].map(({ color }, i) => {
                                                const total = 12;
                                                const angle = (2 * Math.PI) / total;
                                                const startAngle = i * angle - Math.PI / 2;
                                                const endAngle = startAngle + angle - 0.04;
                                                const cx = 32, cy = 32, r1 = 13, r2 = 29;
                                                const x1 = cx + r2 * Math.cos(startAngle);
                                                const y1 = cy + r2 * Math.sin(startAngle);
                                                const x2 = cx + r2 * Math.cos(endAngle);
                                                const y2 = cy + r2 * Math.sin(endAngle);
                                                const x3 = cx + r1 * Math.cos(endAngle);
                                                const y3 = cy + r1 * Math.sin(endAngle);
                                                const x4 = cx + r1 * Math.cos(startAngle);
                                                const y4 = cy + r1 * Math.sin(startAngle);
                                                return (
                                                    <path
                                                        key={i}
                                                        d={`M ${x1} ${y1} A ${r2} ${r2} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${r1} ${r1} 0 0 0 ${x4} ${y4} Z`}
                                                        fill={isSelected ? `${color}cc` : color}
                                                        stroke={isSelected ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.5)'}
                                                        strokeWidth="0.5"
                                                    />
                                                );
                                            })}
                                            <circle cx="32" cy="32" r="29" fill="none" stroke={isSelected ? 'rgba(255,255,255,0.6)' : '#1A3E88'} strokeWidth="1.5"/>
                                            <circle cx="32" cy="32" r="13" fill={isSelected ? 'rgba(255,255,255,0.15)' : 'white'}/>
                                        </svg>
                                    ) : (
                                        <svg viewBox="0 0 64 64" className="w-12 h-12 sm:w-16 sm:h-16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <polygon points="32,6 52,22 44,54 20,54 12,22" fill={isSelected ? '#ffffff33' : '#D0E8F4'} stroke={isSelected ? 'white' : '#4A7EB8'} strokeWidth="2.5" strokeLinejoin="round"/>
                                            <polygon points="32,6 52,22 32,30 12,22" fill={isSelected ? '#ffffff55' : '#A0CBE8'} stroke={isSelected ? 'white' : '#4A7EB8'} strokeWidth="1.5" strokeLinejoin="round"/>
                                            <text x="32" y="47" textAnchor="middle" fontSize="16" fontWeight="bold" fill={isSelected ? 'white' : '#4A7EB8'} fontFamily="serif">?</text>
                                        </svg>
                                    )}
                                </div>
                            )}
                            {option.imageUrl && (
                                <div className="aspect-[4/3] sm:aspect-square bg-gray-100 shrink-0 overflow-hidden flex items-center justify-center">
                                    {option.id === 'european-shank' ? (
                                        <picture className="w-full h-full">
                                            <source media="(max-width: 639px)" srcSet="/images/Bands/european shank new.jpg" />
                                            <img
                                                src={option.imageUrl}
                                                alt={option.name}
                                                className="w-full h-full object-contain transition-transform duration-300"
                                            />
                                        </picture>
                                    ) : (
                                        <img
                                            src={option.imageUrl}
                                            alt={option.name}
                                            className={`w-full h-full object-cover transition-transform duration-300 ${option.id === 'yellow-gold' ? 'object-contain scale-[1.0]' : option.id === 'rose-gold' ? 'object-contain scale-[1.0]' : option.id === 'platinum' ? 'object-contain scale-[1.0]' : option.id === 'yellow-gold-platinum-head' ? 'scale-[1.8]' : option.id === 'nelson-style' ? 'scale-[1.8]' : option.id === 'don-style' ? 'scale-[1.6]' : option.id === 'brett-style' ? 'scale-[1.3]' : option.id === 'stephens-style' ? 'scale-[1.3]' : option.id === 'shared-prongs' ? 'scale-[1.4]' : option.id === 'full-bezel-yellow' ? 'scale-[1.4]' : option.id === 'alternating-stone-type' ? 'scale-[1.4]' : option.id === 'full-bezel-platinum' ? 'object-contain object-center' : option.id === 'half-moon-bezel-platinum' ? 'object-contain object-center' : option.id === 'half-moon-bezel-side-diamond' ? 'object-center' : option.id === 'christine-style' ? 'scale-[1.4]' : option.id === 'lotus-style' ? 'scale-[1.5]' : ''}`}
                                        />
                                    )}
                                </div>
                            )}
                            <div className={`p-2 sm:p-3 text-center transition-colors duration-300 flex-grow flex flex-col justify-center ${(!option.imageUrl && option.id !== 'diamond' && option.id !== 'colored-stone' && option.id !== 'other') ? 'min-h-[3.5rem] sm:min-h-[4.5rem] py-3 sm:py-4' : ''} ${isSelected ? 'bg-brand' : (option.imageUrl || option.id === 'diamond' || option.id === 'colored-stone' || option.id === 'other') ? 'bg-transparent group-hover:bg-black/5' : 'bg-white group-hover:bg-gray-50'}`}>
                                <h4 className={`font-medium text-sm sm:text-base ${isSelected ? 'text-white' : 'text-[#232429]'}`}>{
                                    (() => {
                                        const raw = labGrownOptionId && option.id === labGrownOptionId && option.labGrownPrice
                                            ? option.name.replace(/\$[\d,]+/, option.labGrownPrice).replace(/with side natural diamonds/i, 'with lab grown side diamonds')
                                            : option.name;
                                        const match = question.id === 'baseRing' && raw.match(/^(.*?)(\s*-\s*[($].*)$/);
                                        if (match) return <>{match[1]}<strong>{match[2]}</strong></>;
                                        return raw;
                                    })()
                                }</h4>
                                {option.id === 'diamond' && coloredStoneShapeName && (
                                    <p className={`text-[10px] sm:text-xs mt-0.5 ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>
                                        {coloredStoneShapeName} Diamond
                                    </p>
                                )}
                                {option.id === 'colored-stone' && coloredStoneType && (
                                    <p className={`text-[10px] sm:text-xs mt-0.5 ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>
                                        {[coloredStoneShapeName, coloredStoneVariety ? `${coloredStoneVariety} ${coloredStoneType}` : coloredStoneType].filter(Boolean).join(' ')}
                                    </p>
                                )}
                                {option.subtitle && !(option.id === 'colored-stone' && isSelected && coloredStoneType) && (
                                    <div className="relative flex items-center justify-center gap-1 mt-0.5 sm:mt-1">
                                        <p className={`text-[10px] sm:text-xs ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>{option.subtitle}</p>
                                        {option.subtitle.toLowerCase().includes('cost will be estimated') && (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (tooltipOptionId === option.id) {
                                                        setTooltipOptionId(null);
                                                        setTooltipPos(null);
                                                        if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
                                                    } else {
                                                        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                                        setTooltipPos({ top: rect.top, left: rect.left + rect.width / 2 });
                                                        setTooltipOptionId(option.id);
                                                        if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
                                                        tooltipTimerRef.current = setTimeout(() => {
                                                            setTooltipOptionId(null);
                                                            setTooltipPos(null);
                                                        }, 5000);
                                                    }
                                                }}
                                                className={`w-4 h-4 flex items-center justify-center shrink-0 ${isSelected ? 'text-blue-200' : 'text-gray-400 hover:text-brand'}`}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                )}
                                {option.id === 'written-engraving' && isSelected && engravingText && (
                                    <p className={`mt-1 ${isSelected ? 'text-white' : 'text-gray-700'} ${['French Script MT', 'Edwardian Script ITC'].includes(engravingFont || '') ? 'text-base sm:text-lg' : 'text-xs sm:text-sm'}`} style={{ fontFamily: engravingFont || 'Arial' }}>
                                        {engravingText}
                                    </p>
                                )}
                                {HIDDEN_STONE_IDS.includes(option.id) && isSelected && hiddenStoneConfig?.[`hiddenStoneType_${option.id}`] && (
                                    <div className="flex items-center justify-center gap-1.5 mt-1">
                                        {hiddenStoneConfig[`hiddenStoneType_${option.id}`] === 'colored-stone' && (
                                            <span className="inline-block w-3 h-3 rounded-full shrink-0 border border-white border-opacity-50" style={{ backgroundColor: BIRTHSTONE_COLORS[hiddenStoneConfig[`hiddenStoneColor_${option.id}`]] || '#ccc' }} />
                                        )}
                                        <p className="text-xs text-white">
                                            {option.id === 'alternating-stone-type'
                                                ? `Diamond and ${hiddenStoneConfig[`hiddenStoneColor_${option.id}`]}`
                                                : hiddenStoneConfig[`hiddenStoneType_${option.id}`] === 'diamond' ? 'Diamond' : hiddenStoneConfig[`hiddenStoneColor_${option.id}`]}
                                        </p>
                                    </div>
                                )}
                                {option.id === 'woodgrain-vines' && isSelected && woodgrainVinesChoice && (
                                    <p className="text-xs text-white mt-1">
                                        {woodgrainVinesChoice === 'woodgrain' ? 'Woodgrain ($500)' : woodgrainVinesChoice === 'vines' ? 'Vines ($300)' : 'Both ($800)'}
                                    </p>
                                )}
                                {option.id === 'tacorie-style' && isSelected && baseRingVariant && TACORIE_VARIANT_LABELS[baseRingVariant] && (
                                    <p className="text-xs text-white mt-1">{TACORIE_VARIANT_LABELS[baseRingVariant]}</p>
                                )}
                                {option.id === 'other' && isSelected && otherShapeText && (
                                    <p className="text-xs text-white mt-1">{otherShapeText}</p>
                                )}
                                {selectedStoneName && isSelected && question.id === 'baseRing' && (
                                    <p className="text-xs text-blue-100 mt-1">Stone Shape: {selectedStoneName}</p>
                                )}
                            </div>
                        </div>
                        </div>
                    );
                })}
            </div>
        </div>
        {showDiamondShapeHint && onChangeDiamondShape && (
            <p className="text-center text-sm text-gray-500 mt-3">
                If you want to change your diamond shape,{' '}
                <button
                    className="text-brand underline font-medium"
                    onClick={() => { setShowDiamondShapeHint(false); onChangeDiamondShape(); }}
                >
                    click here
                </button>
            </p>
        )}
        {showBaseRingNudge && (
            <div className="fixed bottom-24 sm:bottom-8 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none animate-bounce-in">
                <div className="bg-brand text-white text-sm font-medium px-4 py-2.5 rounded-xl whitespace-nowrap shadow-xl">
                    👆 Tap any ring to view its details
                </div>
            </div>
        )}
        {tooltipOptionId && tooltipPos && (
            <div
                className="fixed z-[9999] w-56 bg-brand text-white text-[11px] rounded-lg shadow-xl px-3 py-2 text-left leading-relaxed pointer-events-none"
                style={{ top: tooltipPos.top - 8, left: tooltipPos.left, transform: 'translate(-50%, -100%)' }}
            >
                {tooltipOptionId === 'alternating-stone-type'
                    ? 'Price depends on the size of the alternating stones chosen.'
                    : tooltipOptionId === 'full-bezel-yellow' || tooltipOptionId === 'full-bezel-platinum'
                        ? 'Price depends on the metal weight of the bezel setting.'
                        : 'Price depends on details like stone size and complexity. Your jewelry professional will provide an estimate before any work begins.'}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent" style={{ borderTopColor: '#4A7EB8' }} />
            </div>
        )}
        </>
    );
};