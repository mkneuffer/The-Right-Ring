import React, { useState, useEffect, useMemo } from 'react';
import { Diamond } from '../types';
import { getDiamonds, DiamondFilter } from '../services/diamondApi';
import { DiamondDetailModal } from './DiamondDetailModal';
import { DualRangeSlider } from './DualRangeSlider';

import { calculateDiamondPrice } from '../utils';
import { trackDiamondSelect } from '../analytics';

interface DiamondSelectorProps {
    stoneShapeId: string;
    selectedDiamondId: string | null;
    onSelectDiamond: (diamondId: string) => void;
    onNext?: () => void;
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
    const [allDiamonds, setAllDiamonds] = useState<Diamond[]>([]);
    const [filteredDiamonds, setFilteredDiamonds] = useState<Diamond[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewingDiamond, setViewingDiamond] = useState<Diamond | null>(null);
    const [diamondType, setDiamondType] = useState<'natural' | 'lab' | 'all'>('natural');

    // Filter States
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [selectedShape, setSelectedShape] = useState<string>(stoneShapeId ? stoneShapeId.charAt(0).toUpperCase() + stoneShapeId.slice(1) : 'Round');

    useEffect(() => {
        if (stoneShapeId) {
            setSelectedShape(stoneShapeId.charAt(0).toUpperCase() + stoneShapeId.slice(1));
        }
    }, [stoneShapeId]);

    const [colorRange, setColorRange] = useState<[number, number]>([0, COLORS.length - 1]);
    const [clarityRange, setClarityRange] = useState<[number, number]>([0, CLARITIES.length - 1]);
    const [cutRange, setCutRange] = useState<[number, number]>([0, 1]); // Default to EX - VG
    const [polishRange, setPolishRange] = useState<[number, number]>([0, 1]); // Default to EX - VG
    const [symmetryRange, setSymmetryRange] = useState<[number, number]>([0, 1]); // Default to EX - VG

    // Price Filter State
    const [priceLimits, setPriceLimits] = useState<[number, number]>([0, 58000]);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 58000]);

    // Carat Filter State
    const [caratLimits, setCaratLimits] = useState<[number, number]>([0.5, 6.5]);
    const [caratRange, setCaratRange] = useState<[number, number]>([0.5, 6.5]);
    const [caratMinText, setCaratMinText] = useState<string>('0.50');
    const [caratMaxText, setCaratMaxText] = useState<string>('6.50');

    // Pagination
    const [visibleCount, setVisibleCount] = useState(20);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const data = await getDiamonds();
                setAllDiamonds(data);

                if (data.length > 0) {
                    // Calculate Price Limits
                    const prices = data.map(d => calculateDiamondPrice(d));
                    const minPrice = Math.min(...prices);
                    const maxPrice = 58000;
                    setPriceLimits([minPrice, maxPrice]);
                    setPriceRange([minPrice, maxPrice]);

                    // Set Carat Limits (Fixed per request)
                    setCaratLimits([0.5, 6.5]);
                    setCaratRange([0.5, 6.5]);
                }
            } catch (err) {
                setError('Failed to fetch diamonds. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (allDiamonds.length === 0) return;

        // Filter by Type
        let displayList: Diamond[] = [];
        if (diamondType === 'all') {
            displayList = allDiamonds;
        } else if (diamondType === 'natural') {
            displayList = allDiamonds.filter(d => d.Diamond_Type === 'Natural Diamond' || !d.Diamond_Type); // specific check or fallback
        } else if (diamondType === 'lab') {
            displayList = allDiamonds.filter(d => d.Diamond_Type === 'Lab Grown');
        }

        const filtered = displayList.filter(d => {
            // Shape
            if (d.Shape.toLowerCase() !== selectedShape.toLowerCase()) return false;

            // Price - Use new calculation
            const price = calculateDiamondPrice(d);
            if (price < priceRange[0] || price > priceRange[1]) return false;

            // Carat
            const weight = parseFloat(d.Weight) || 0;
            if (weight < caratRange[0] || weight > caratRange[1]) return false;

            // Color
            const colorIndex = COLORS.indexOf(d.Color);
            if (colorIndex < colorRange[0] || colorIndex > colorRange[1]) return false;

            // Clarity
            const clarityIndex = CLARITIES.indexOf(d.Clarity);
            if (clarityIndex < clarityRange[0] || clarityIndex > clarityRange[1]) return false;

            // Cut (Round only)
            if (selectedShape.toLowerCase() === 'round') {
                const cutIndex = CUT_GRADES.indexOf(d.Cut_Grade);
                if (cutIndex !== -1) {
                    if (cutIndex < cutRange[0] || cutIndex > cutRange[1]) return false;
                }
            } else {
                // Polish & Symmetry (Non-Round)
                const polishIndex = POLISH_SYMMETRY_GRADES.indexOf(d.Polish);
                if (polishIndex !== -1) {
                    if (polishIndex < polishRange[0] || polishIndex > polishRange[1]) return false;
                }

                const symIndex = POLISH_SYMMETRY_GRADES.indexOf(d.Symmetry);
                if (symIndex !== -1) {
                    if (symIndex < symmetryRange[0] || symIndex > symmetryRange[1]) return false;
                }
            }

            // Availability
            const availability = d.Availability ? d.Availability.toUpperCase() : '';
            if (availability !== 'G' && availability !== 'M') return false;

            return true;
        });

        setFilteredDiamonds(filtered);
        setVisibleCount(20); // Reset pagination
    }, [allDiamonds, selectedShape, colorRange, clarityRange, cutRange, polishRange, symmetryRange, priceRange, caratRange, diamondType]);

    // Update price limits when diamond type changes (but preserve user's range selections)
    useEffect(() => {
        if (allDiamonds.length > 0) {
            const prices = allDiamonds.map(d => calculateDiamondPrice(d));
            const minPrice = Math.min(...prices);
            setPriceLimits([minPrice, 58000]);
            setCaratLimits([0.5, 6.5]);
        }
    }, [diamondType, allDiamonds]);

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
        onSelectDiamond(diamondId);
        setViewingDiamond(null);
    };

    const loadMore = () => {
        setVisibleCount(prev => prev + 20);
    };

    if (isLoading) return <LoadingSpinner />;
    if (error) return <div className="text-center text-red-500">{error}</div>;

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
                            <h3 className={`font-bold text-sm md:text-xl md:mb-1 ${isExpertSelected ? 'text-white' : 'text-brand-dark'}`}>
                                Not sure which diamond to choose?
                            </h3>
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
                    <div className="w-full lg:w-1/4 space-y-6 lg:space-y-8 bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
                        <div className="flex justify-between items-center lg:hidden cursor-pointer" onClick={() => setIsFiltersOpen(!isFiltersOpen)}>
                            <h3 className="font-bold text-lg text-[#232429]">Filters</h3>
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

                        <div className={`space-y-8 ${isFiltersOpen ? 'block mt-4' : 'hidden lg:block'}`}>
                            <div>
                                <h4 className="font-semibold mb-4">Shape</h4>
                                <div className="grid grid-cols-3 gap-2">
                                    {['Round', 'Princess', 'Oval', 'Marquise', 'Pear', 'Emerald', 'Cushion', 'Radiant', 'Asscher', 'Heart'].map(shape => (
                                        <button
                                            key={shape}
                                            onClick={() => setSelectedShape(shape)}
                                            className={`px-2 py-2 text-xs rounded border ${selectedShape.toLowerCase() === shape.toLowerCase() ? 'bg-brand text-white border-brand' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
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

                            {selectedShape.toLowerCase() === 'round' ? (
                                <div>
                                    <h4 className="font-semibold mb-2">Cut</h4>
                                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                                        <span>{CUT_GRADES[cutRange[0]] === 'EX' ? 'Excellent' : CUT_GRADES[cutRange[0]]}</span>
                                        <span>{CUT_GRADES[cutRange[1]] === 'VG' ? 'Very Good' : CUT_GRADES[cutRange[1]]}</span>
                                    </div>
                                    <DualRangeSlider
                                        min={0}
                                        max={1} // Limit to EX - VG
                                        value={cutRange}
                                        onChange={setCutRange}
                                    />
                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                        <span>Excellent</span>
                                        <span>Very Good</span>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <h4 className="font-semibold mb-2">Polish</h4>
                                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                                            <span>{POLISH_SYMMETRY_GRADES[polishRange[0]] === 'EX' ? 'Excellent' : POLISH_SYMMETRY_GRADES[polishRange[0]]}</span>
                                            <span>{POLISH_SYMMETRY_GRADES[polishRange[1]] === 'VG' ? 'Very Good' : POLISH_SYMMETRY_GRADES[polishRange[1]]}</span>
                                        </div>
                                        <DualRangeSlider
                                            min={0}
                                            max={1}
                                            value={polishRange}
                                            onChange={setPolishRange}
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <span>Excellent</span>
                                            <span>Very Good</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-2">Symmetry</h4>
                                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                                            <span>{POLISH_SYMMETRY_GRADES[symmetryRange[0]] === 'EX' ? 'Excellent' : POLISH_SYMMETRY_GRADES[symmetryRange[0]]}</span>
                                            <span>{POLISH_SYMMETRY_GRADES[symmetryRange[1]] === 'VG' ? 'Very Good' : POLISH_SYMMETRY_GRADES[symmetryRange[1]]}</span>
                                        </div>
                                        <DualRangeSlider
                                            min={0}
                                            max={1}
                                            value={symmetryRange}
                                            onChange={setSymmetryRange}
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <span>Excellent</span>
                                            <span>Very Good</span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Results Grid */}
                    <div className="w-full lg:w-3/4">
                        <h3 className="text-xl font-semibold text-[#232429] mb-6">
                            {filteredDiamonds.length} {diamondType === 'all' ? '' : (diamondType === 'lab' ? 'Lab Grown' : 'Natural')} {selectedShape} Diamonds Found
                        </h3>

                        {filteredDiamonds.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {filteredDiamonds.slice(0, visibleCount).map(diamond => (
                                        <div
                                            key={diamond.Stock_No}
                                            onClick={() => setViewingDiamond(diamond)}
                                            className={`cursor-pointer group rounded-lg overflow-hidden border transition-all duration-300 bg-white ${selectedDiamondId === diamond.Stock_No ? 'border-brand ring-2 ring-brand' : 'border-gray-200 hover:shadow-md hover:border-brand'}`}
                                        >
                                            <div className="aspect-square bg-gray-100 relative overflow-hidden">
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
                                            <div className="p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <p className="font-bold text-lg text-[#232429]">
                                                        ${calculateDiamondPrice(diamond).toLocaleString()}
                                                    </p>
                                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{diamond.Stock_No.replace('-LAB', '')}</span>
                                                </div>
                                                <p className="text-gray-800 font-medium">{diamond.Weight} Carat {diamond.Shape}</p>
                                                <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                                                    <span>{diamond.Color} Color</span>
                                                    <span>•</span>
                                                    <span>{diamond.Clarity} Clarity</span>
                                                </div>
                                                <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400 flex justify-between">
                                                    <span>Cut: {diamond.Cut_Grade || 'N/A'}</span>
                                                    <span>Pol: {diamond.Polish}</span>
                                                    <span>Sym: {diamond.Symmetry}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {visibleCount < filteredDiamonds.length && (
                                    <div className="mt-8 text-center">
                                        <button
                                            onClick={loadMore}
                                            className="px-6 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Load More Diamonds
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
                                        setCutRange([0, 1]);
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
            />
        </>
    );
};