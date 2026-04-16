import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Diamond } from '../types';
import { getDiamondsPage, PagedFilter } from '../services/diamondApi';
import { DiamondDetailModal } from './DiamondDetailModal';
import { DualRangeSlider } from './DualRangeSlider';

import { calculateDiamondPrice } from '../utils';
import { trackDiamondSelect } from '../analytics';

interface DiamondSelectorProps {
    stoneShapeId: string;
    selectedDiamondId: string | null;
    onSelectDiamond: (diamondId: string, diamond?: Diamond | null) => void;
    onNext?: (selectedDiamondId?: string) => void;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-brand"></div>
    </div>
);

// Filter Constants
const COLORS = ['D', 'E', 'F', 'G', 'H'];
const CLARITIES = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1'];
const CUT_GRADES = ['EX', 'VG', 'G', 'F', 'P']; // Excellent, Very Good, Good, Fair, Poor
const POLISH_SYMMETRY_GRADES = ['EX', 'VG', 'G', 'F', 'P'];

export const DiamondSelector: React.FC<DiamondSelectorProps> = ({ stoneShapeId, selectedDiamondId, onSelectDiamond, onNext }) => {
    const [displayedDiamonds, setDisplayedDiamonds] = useState<Diamond[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [viewingDiamond, setViewingDiamond] = useState<Diamond | null>(null);
    const [diamondType, setDiamondType] = useState<'natural' | 'lab' | 'all'>('natural');

    // Filter States
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [showFilterBubble, setShowFilterBubble] = useState(false);
    const filterRef = useRef<HTMLDivElement>(null);

    // Show bubble on mobile when user scrolls past the filters section
    const handleScroll = useCallback(() => {
        if (window.innerWidth >= 1024) return; // lg breakpoint — desktop only uses sidebar
        if (!filterRef.current) return;
        const rect = filterRef.current.getBoundingClientRect();
        setShowFilterBubble(rect.bottom < 0);
    }, []);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);
    const [selectedShape, setSelectedShape] = useState<string>(stoneShapeId ? stoneShapeId.charAt(0).toUpperCase() + stoneShapeId.slice(1) : 'Round');

    useEffect(() => {
        if (stoneShapeId) {
            setSelectedShape(stoneShapeId.charAt(0).toUpperCase() + stoneShapeId.slice(1));
        }
    }, [stoneShapeId]);

    const [colorRange, setColorRange] = useState<[number, number]>([0, COLORS.length - 1]);
    const [clarityRange, setClarityRange] = useState<[number, number]>([0, CLARITIES.length - 1]);
    const [cutRange, setCutRange] = useState<[number, number]>([0, CUT_GRADES.length - 1]);
    const [polishRange, setPolishRange] = useState<[number, number]>([0, POLISH_SYMMETRY_GRADES.length - 1]);
    const [symmetryRange, setSymmetryRange] = useState<[number, number]>([0, POLISH_SYMMETRY_GRADES.length - 1]);

    // Price Filter State — limits hardcoded; no need to scan full dataset
    const [priceLimits] = useState<[number, number]>([0, 58000]);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 58000]);

    // Carat Filter State
    const [caratLimits] = useState<[number, number]>([0.5, 6.5]);
    const [caratRange, setCaratRange] = useState<[number, number]>([0.5, 6.5]);
    const [caratMinText, setCaratMinText] = useState<string>('0.50');
    const [caratMaxText, setCaratMaxText] = useState<string>('6.50');

    // Fetch page 1 whenever filters change (debounced 300ms to avoid hammering the server on slider drag)
    useEffect(() => {
        const filter: PagedFilter = {
            shape: selectedShape.toLowerCase(),
            type: diamondType,
            colorRange,
            clarityRange,
            cutRange,
            polishRange,
            symmetryRange,
            priceRange,
            caratRange,
        };

        let cancelled = false;
        const timer = setTimeout(async () => {
            setIsLoading(true);
            setError(null);
            try {
                const result = await getDiamondsPage(filter, 1);
                if (!cancelled) {
                    setDisplayedDiamonds(result.diamonds);
                    setTotalCount(result.total);
                    setHasMore(result.hasMore);
                    setCurrentPage(1);
                    setIsLoading(false);
                }
            } catch {
                if (!cancelled) {
                    setError('Failed to load diamonds. Please try again.');
                    setIsLoading(false);
                }
            }
        }, 300);
        return () => { cancelled = true; clearTimeout(timer); };
    }, [selectedShape, diamondType, colorRange, clarityRange, cutRange, polishRange, symmetryRange, priceRange, caratRange]);

    const handleSelectAndClose = (diamondId: string) => {
        if (viewingDiamond && viewingDiamond.Stock_No === diamondId) {
            trackDiamondSelect(
                viewingDiamond.Stock_No,
                viewingDiamond.Shape ?? '',
                String(viewingDiamond.Weight ?? ''),
                viewingDiamond.Diamond_Type ?? 'Natural Diamond',
                calculateDiamondPrice(viewingDiamond) ?? undefined
            );
        }
        onSelectDiamond(diamondId, viewingDiamond);
        setViewingDiamond(null);
    };

    const loadMore = async () => {
        if (isLoadingMore) return;
        setIsLoadingMore(true);
        const nextPage = currentPage + 1;
        const filter: PagedFilter = {
            shape: selectedShape.toLowerCase(),
            type: diamondType,
            colorRange,
            clarityRange,
            cutRange,
            polishRange,
            symmetryRange,
            priceRange,
            caratRange,
        };
        try {
            const result = await getDiamondsPage(filter, nextPage);
            setDisplayedDiamonds((prev: Diamond[]) => [...prev, ...result.diamonds]);
            setTotalCount(result.total);
            setHasMore(result.hasMore);
            setCurrentPage(nextPage);
        } finally {
            setIsLoadingMore(false);
        }
    };

    const isExpertSelected = selectedDiamondId === 'EXPERT_SELECTION';

    return (
        <>
            <div className="flex flex-col gap-6">
                {/* Options Banner Container */}
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Expert Help Banner */}
                    <div
                        onClick={() => {
                            onSelectDiamond('EXPERT_SELECTION');
                            if (onNext) setTimeout(onNext, 200); // Small delay for visual feedback
                        }}
                        className={`flex-1 border-2 rounded-xl p-3 md:p-6 flex flex-row md:flex-col items-center md:justify-center gap-3 md:gap-0 cursor-pointer transition-all shadow-md group relative overflow-hidden ${isExpertSelected
                            ? 'bg-brand text-white border-brand ring-4 ring-brand/20'
                            : 'bg-white border-brand/30 text-gray-800 hover:border-brand hover:shadow-lg'
                            }`}
                    >
                        {/* Background decoration */}
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full -translate-y-1/2 translate-x-1/2 transition-transform ${isExpertSelected ? 'bg-white/10' : ''}`} />

                        <div className="flex items-center gap-3 relative z-10 md:mb-4 shrink-0">
                            <div className={`p-2 md:p-3 rounded-full shadow-sm transition-colors shrink-0 ${isExpertSelected ? 'bg-white/20 text-white' : 'bg-brand/10 text-brand'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 md:w-8 md:h-8">
                                    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                                </svg>
                            </div>
                        </div>
                        <div className="relative z-10 flex-1 md:mb-4">
                            <div className="flex items-center gap-1.5">
                                <h3 className={`font-bold text-sm md:text-xl md:mb-1 ${isExpertSelected ? 'text-white' : 'text-brand-dark'}`}>
                                    Not sure which diamond to choose?
                                </h3>
                                <div className="relative group/tip hidden md:block" onClick={e => e.stopPropagation()}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-4 h-4 cursor-help ${isExpertSelected ? 'text-white/70' : 'text-brand/60'}`}>
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                    </svg>
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover/tip:opacity-100 pointer-events-none transition-opacity z-20 text-center">
                                        We'll hand-pick 2–3 diamond options that match your style and budget — you approve before anything is ordered.
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                                    </div>
                                </div>
                            </div>
                            <p className={`text-xs md:text-base ${isExpertSelected ? 'text-white/90' : 'text-gray-600'}`}>
                                Let our gem experts curate the perfect diamond options for you.
                            </p>
                        </div>
                        <div className="relative z-10 md:mt-auto flex justify-end shrink-0">
                            <div className={`flex items-center gap-1 md:gap-2 font-bold px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-base transition-all w-fit ${isExpertSelected
                                ? 'bg-white text-brand'
                                : 'bg-brand text-white md:opacity-0 md:group-hover:opacity-100 md:translate-x-4 md:group-hover:translate-x-0'
                                }`}>
                                {isExpertSelected ? 'Selected' : 'Select'}
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5">
                                    {isExpertSelected
                                        ? <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                        : <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                    }
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Customer Stone Banner */}
                    <div
                        onClick={() => {
                            onSelectDiamond('CUSTOMER_STONE');
                            if (onNext) setTimeout(onNext, 200);
                        }}
                        className={`flex-1 border-2 rounded-xl p-3 md:p-6 flex flex-row md:flex-col items-center md:justify-center gap-3 md:gap-0 cursor-pointer transition-all shadow-md group relative overflow-hidden ${selectedDiamondId === 'CUSTOMER_STONE'
                            ? 'bg-brand text-white border-brand ring-4 ring-brand/20'
                            : 'bg-white border-brand/30 text-gray-800 hover:border-brand hover:shadow-lg'
                            }`}
                    >
                        {/* Background decoration */}
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full -translate-y-1/2 translate-x-1/2 transition-transform ${selectedDiamondId === 'CUSTOMER_STONE' ? 'bg-white/10' : ''}`} />

                        <div className="flex items-center gap-3 relative z-10 md:mb-4 shrink-0">
                            <div className={`p-2 md:p-3 rounded-full shadow-sm transition-colors shrink-0 ${selectedDiamondId === 'CUSTOMER_STONE' ? 'bg-white/20 text-white' : 'bg-brand/10 text-brand'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 md:w-8 md:h-8">
                                    <path d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 9a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25V15a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25V9z" />
                                </svg>
                            </div>
                        </div>
                        <div className="relative z-10 flex-1 md:mb-4">
                            <h3 className={`font-bold text-sm md:text-xl md:mb-1 ${selectedDiamondId === 'CUSTOMER_STONE' ? 'text-white' : 'text-brand-dark'}`}>
                                Have your own stone?
                            </h3>
                            <p className={`text-xs md:text-base ${selectedDiamondId === 'CUSTOMER_STONE' ? 'text-white/90' : 'text-gray-600'}`}>
                                I have a stone I'd like to use for this design.
                            </p>
                            {selectedDiamondId === 'CUSTOMER_STONE' && (
                                <p className="text-xs mt-1 md:mt-2 italic text-white/75">
                                    Please note: to protect both parties, we can only work with stones that have been in your family/are already owned — we are unable to accept stones sourced elsewhere.
                                </p>
                            )}
                        </div>
                        <div className="relative z-10 md:mt-auto flex justify-end shrink-0">
                            <div className={`flex items-center gap-1 md:gap-2 font-bold px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-base transition-all w-fit ${selectedDiamondId === 'CUSTOMER_STONE'
                                ? 'bg-white text-brand'
                                : 'bg-brand text-white md:opacity-0 md:group-hover:opacity-100 md:translate-x-4 md:group-hover:translate-x-0'
                                }`}>
                                {selectedDiamondId === 'CUSTOMER_STONE' ? 'Selected' : 'Select'}
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5">
                                    {selectedDiamondId === 'CUSTOMER_STONE'
                                        ? <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                        : <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                    }
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 pb-24">
                    {/* Filters Sidebar */}
                    <div ref={filterRef} className="w-full lg:w-1/4 space-y-6 lg:space-y-8 bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
                        <div className="flex justify-between items-center lg:hidden cursor-pointer" onClick={() => setIsFiltersOpen(!isFiltersOpen)}>
                            <h3 className="font-bold text-lg text-[#232429]">Diamond Specifications</h3>
                            <button className="text-gray-500 bg-gray-100 p-2 rounded-md">
                                {isFiltersOpen ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        {isFiltersOpen && (
                            <p className="lg:hidden text-xs text-gray-400 mt-2 mb-1">Results update automatically as you adjust filters.</p>
                        )}
                        <div className={`space-y-8 ${isFiltersOpen ? 'block mt-4' : 'hidden lg:block'}`}>
                            <div>
                                <h4 className="font-semibold mb-4">Shape</h4>
                                <div className="grid grid-cols-3 gap-2">
                                    {['Round', 'Princess', 'Oval', 'Marquise', 'Pear', 'Emerald', 'Cushion', 'Radiant', 'Asscher', 'Heart'].map(shape => (
                                        <button
                                            key={shape}
                                            onClick={() => setSelectedShape(shape)}
                                            className={`px-2 py-2 text-xs rounded border ${selectedShape.toLowerCase() === shape.toLowerCase() ? 'bg-brand text-white border-brand' : 'bg-white text-gray-700 border-gray-200 ring-1 ring-gray-200 hover:border-brand hover:ring-brand'}`}
                                        >
                                            {shape}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-4">Diamond Type</h4>
                                <div className="flex bg-gray-100 p-1 rounded-lg">
                                    <button
                                        onClick={() => setDiamondType('all')}
                                        className={`flex-1 py-2 px-2 rounded-md text-sm font-medium transition-all ${diamondType === 'all'
                                            ? 'bg-white text-[#232429] shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        All
                                    </button>
                                    <button
                                        onClick={() => setDiamondType('natural')}
                                        className={`flex-1 py-2 px-2 rounded-md text-sm font-medium transition-all ${diamondType === 'natural'
                                            ? 'bg-white text-[#232429] shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        Natural
                                    </button>
                                    <button
                                        onClick={() => setDiamondType('lab')}
                                        className={`flex-1 py-2 px-2 rounded-md text-sm font-medium transition-all ${diamondType === 'lab'
                                            ? 'bg-white text-[#232429] shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        Lab
                                    </button>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2">Carat</h4>
                                <div className="flex justify-between items-center text-sm text-gray-600 mb-2 gap-2">
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        value={caratMinText}
                                        onChange={(e) => setCaratMinText(e.target.value)}
                                        onBlur={() => {
                                            const parsed = parseFloat(caratMinText);
                                            const clamped = isNaN(parsed) ? caratLimits[0] : Math.max(caratLimits[0], Math.min(parsed, caratRange[1]));
                                            setCaratRange([clamped, caratRange[1]]);
                                            setCaratMinText(clamped.toFixed(2));
                                        }}
                                        className="w-20 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand"
                                    />
                                    <span className="text-gray-400">-</span>
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        value={caratMaxText}
                                        onChange={(e) => setCaratMaxText(e.target.value)}
                                        onBlur={() => {
                                            const parsed = parseFloat(caratMaxText);
                                            const clamped = isNaN(parsed) ? caratLimits[1] : Math.min(caratLimits[1], Math.max(parsed, caratRange[0]));
                                            setCaratRange([caratRange[0], clamped]);
                                            setCaratMaxText(clamped.toFixed(2));
                                        }}
                                        className="w-20 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand"
                                    />
                                </div>
                                <DualRangeSlider
                                    min={caratLimits[0]}
                                    max={caratLimits[1]}
                                    value={caratRange}
                                    onChange={(val) => {
                                        setCaratRange(val);
                                        setCaratMinText(val[0].toFixed(2));
                                        setCaratMaxText(val[1].toFixed(2));
                                    }}
                                    step={0.01}
                                />
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2">Price</h4>
                                <div className="flex justify-between items-center text-sm text-gray-600 mb-2 gap-2">
                                    <div className="relative w-24">
                                        <span className="absolute left-2 top-1.5 text-gray-500">$</span>
                                        <input
                                            type="number"
                                            min={priceLimits[0]}
                                            max={priceRange[1]}
                                            step="100"
                                            value={priceRange[0]}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setPriceRange([val === '' ? 0 : parseInt(val), priceRange[1]]);
                                            }}
                                            onBlur={() => {
                                                setPriceRange([Math.max(priceLimits[0], Math.min(priceRange[0], priceRange[1])), priceRange[1]]);
                                            }}
                                            className="w-full pl-6 pr-1 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand"
                                        />
                                    </div>
                                    <span className="text-gray-400">-</span>
                                    <div className="relative w-24">
                                        <span className="absolute left-2 top-1.5 text-gray-500">$</span>
                                        <input
                                            type="number"
                                            min={priceRange[0]}
                                            max={priceLimits[1]}
                                            step="100"
                                            value={priceRange[1]}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setPriceRange([priceRange[0], val === '' ? 0 : parseInt(val)]);
                                            }}
                                            onBlur={() => {
                                                setPriceRange([priceRange[0], Math.min(priceLimits[1], Math.max(priceRange[1], priceRange[0]))]);
                                            }}
                                            className="w-full pl-6 pr-1 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand"
                                        />
                                    </div>
                                </div>
                                <DualRangeSlider
                                    min={priceLimits[0]}
                                    max={priceLimits[1]}
                                    value={priceRange}
                                    onChange={setPriceRange}
                                    step={100}
                                />
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2">Color</h4>
                                <div className="flex justify-between text-sm text-gray-600 mb-2">
                                    <span>{COLORS[colorRange[0]]}</span>
                                    <span>{COLORS[colorRange[1]]}</span>
                                </div>
                                <DualRangeSlider
                                    min={0}
                                    max={COLORS.length - 1}
                                    value={colorRange}
                                    onChange={setColorRange}
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    {COLORS.map(c => <span key={c}>{c}</span>)}
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2">Clarity</h4>
                                <div className="flex justify-between text-sm text-gray-600 mb-2">
                                    <span>{CLARITIES[clarityRange[0]]}</span>
                                    <span>{CLARITIES[clarityRange[1]]}</span>
                                </div>
                                <DualRangeSlider
                                    min={0}
                                    max={CLARITIES.length - 1}
                                    value={clarityRange}
                                    onChange={setClarityRange}
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    {CLARITIES.map((c, i) => i % 2 === 0 ? <span key={c}>{c}</span> : null)}
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Results Grid */}
                    <div className="w-full lg:w-3/4">
                        <h3 className="text-xl font-semibold text-[#232429] mb-6">
                            {isLoading ? 'Searching...' : `${totalCount} ${diamondType === 'all' ? '' : (diamondType === 'lab' ? 'Lab Grown' : 'Natural')} ${selectedShape} Diamonds Found`}
                        </h3>

                        {error && (
                            <div className="text-center text-red-500 py-8">{error}</div>
                        )}

                        {isLoading ? (
                            <LoadingSpinner />
                        ) : displayedDiamonds.length > 0 ? (
                            <>
                                <div key={totalCount} className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 animate-fade-in-up">
                                    {displayedDiamonds.map(diamond => (
                                        <div
                                            key={diamond.Stock_No}
                                            onClick={() => setViewingDiamond(diamond)}
                                            className={`cursor-pointer group rounded-lg overflow-hidden border transition-all duration-300 bg-white ${selectedDiamondId === diamond.Stock_No ? 'border-brand ring-2 ring-brand' : 'border-gray-200 hover:shadow-md hover:border-brand'}`}
                                        >
                                            <div className="aspect-[4/3] sm:aspect-square bg-gray-100 relative overflow-hidden">
                                                <img
                                                    src={diamond.ImageLink || '/images/diamond-placeholder.svg'}
                                                    alt={`${diamond.Shape} diamond`}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    loading="lazy"
                                                    onError={(e) => { (e.target as HTMLImageElement).src = '/images/diamond-placeholder.svg'; }}
                                                />
                                                <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                                                    <div className="bg-white/90 px-2 py-1 rounded text-xs font-bold shadow-sm">
                                                        {diamond.Lab}
                                                    </div>
                                                    {diamond.Diamond_Type === 'Lab Grown' && (
                                                        <div className="bg-black/80 text-white px-2 py-1 rounded text-xs font-bold shadow-sm">
                                                            Lab
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="p-2 sm:p-4">
                                                <div className="flex justify-between items-start mb-1 sm:mb-2">
                                                    <p className="font-bold text-sm sm:text-lg text-[#232429]">
                                                        ${calculateDiamondPrice(diamond).toLocaleString()}
                                                    </p>
                                                    <span className="text-[10px] sm:text-xs bg-gray-100 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-gray-600">{diamond.Stock_No.replace('-LAB', '')}</span>
                                                </div>
                                                <p className="text-xs sm:text-base text-gray-800 font-medium">{parseFloat(diamond.Weight).toFixed(2)} ct {diamond.Shape}</p>
                                                <div className="flex items-center space-x-1 sm:space-x-2 text-[11px] sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
                                                    <span>{diamond.Color} Color</span>
                                                    <span>•</span>
                                                    <span>{diamond.Clarity} Clarity</span>
                                                </div>
                                                <div className="mt-2 pt-2 sm:mt-3 sm:pt-3 border-t border-gray-100 text-[10px] sm:text-xs text-gray-400 flex justify-between">
                                                    <span>Cut: {diamond.Cut_Grade || 'N/A'}</span>
                                                    <span>Pol: {diamond.Polish}</span>
                                                    <span>Sym: {diamond.Symmetry}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {hasMore && (
                                    <div className="mt-8 text-center">
                                        <button
                                            onClick={loadMore}
                                            disabled={isLoadingMore}
                                            className="px-6 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                                        >
                                            {isLoadingMore ? 'Loading...' : 'Load More Diamonds'}
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                                <p className="text-gray-500 text-lg">No diamonds match your filters.</p>
                                <button
                                    onClick={() => {
                                        setColorRange([0, COLORS.length - 1]);
                                        setClarityRange([0, CLARITIES.length - 1]);
                                        setCutRange([0, CUT_GRADES.length - 1]);
                                        setPolishRange([0, POLISH_SYMMETRY_GRADES.length - 1]);
                                        setSymmetryRange([0, POLISH_SYMMETRY_GRADES.length - 1]);
                                        setPriceRange(priceLimits);
                                        setCaratRange(caratLimits);
                                    }}
                                    className="mt-4 text-brand font-semibold hover:underline"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <DiamondDetailModal
                diamond={viewingDiamond}
                onClose={() => setViewingDiamond(null)}
                onSelect={handleSelectAndClose}
                onNext={onNext}
            />

            {/* Mobile filter bubble — appears when scrolled past filters */}
            {showFilterBubble && !viewingDiamond && (
                <button
                    className="lg:hidden fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 bg-brand text-white text-sm font-semibold rounded-full shadow-lg animate-bounce-in"
                    style={{ boxShadow: '0 4px 20px rgba(74,126,184,0.45)' }}
                    onClick={() => {
                        setIsFiltersOpen(true);
                        filterRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                >
                    {/* Funnel icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 shrink-0">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591L15.75 12.75v6a.75.75 0 0 1-.45.691l-3 1.5a.75.75 0 0 1-1.05-.691V12.75L4.659 7.409A2.25 2.25 0 0 1 4 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
                    </svg>
                    Click here to change diamond specifications
                    {/* Speech bubble tail */}
                    <span style={{
                        position: 'absolute',
                        bottom: '-7px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 0,
                        height: 0,
                        borderLeft: '7px solid transparent',
                        borderRight: '7px solid transparent',
                        borderTop: '7px solid #4A7EB8',
                    }} />
                </button>
            )}
            {diamondType === 'natural' && (
                <p className="text-xs text-gray-400 text-center mt-4 px-2">
                    <strong>GIA</strong> stands for Gemological Institute of America. All of our natural diamonds are GIA certified and priced at wholesale cost.
                </p>
            )}
            {diamondType === 'lab' && (
                <p className="text-xs text-gray-400 text-center mt-4 px-2">
                    <strong>IGI</strong> stands for International Gemological Institute. All of our lab grown diamonds are IGI certified.
                </p>
            )}
        </>
    );
};