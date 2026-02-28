import React, { useCallback, useEffect, useState, useRef } from 'react';

interface DualRangeSliderProps {
    min: number;
    max: number;
    value: [number, number];
    onChange: (value: [number, number]) => void;
    step?: number;
    className?: string;
}

export const DualRangeSlider: React.FC<DualRangeSliderProps> = ({
    min,
    max,
    value,
    onChange,
    step = 1,
    className = ''
}) => {
    const [minVal, setMinVal] = useState(value[0]);
    const [maxVal, setMaxVal] = useState(value[1]);
    const minValRef = useRef(value[0]);
    const maxValRef = useRef(value[1]);
    const range = useRef<HTMLDivElement>(null);

    // Convert to percentage
    const getPercent = useCallback(
        (value: number) => Math.round(((value - min) / (max - min)) * 100),
        [min, max]
    );

    // Set width of the range to decrease from the left side
    useEffect(() => {
        const minPercent = getPercent(minVal);
        const maxPercent = getPercent(maxValRef.current);

        if (range.current) {
            range.current.style.left = `${minPercent}%`;
            range.current.style.width = `${maxPercent - minPercent}%`;
        }
    }, [minVal, getPercent]);

    // Set width of the range to decrease from the right side
    useEffect(() => {
        const minPercent = getPercent(minValRef.current);
        const maxPercent = getPercent(maxVal);

        if (range.current) {
            range.current.style.width = `${maxPercent - minPercent}%`;
        }
    }, [maxVal, getPercent]);

    useEffect(() => {
        setMinVal(value[0]);
        setMaxVal(value[1]);
        minValRef.current = value[0];
        maxValRef.current = value[1];
    }, [value]);

    return (
        <div className={`relative w-full h-6 flex items-center ${className}`}>
            <input
                type="range"
                min={min}
                max={max}
                value={minVal}
                step={step}
                onChange={(event) => {
                    const value = Math.min(Number(event.target.value), maxVal - step);
                    setMinVal(value);
                    minValRef.current = value;
                    onChange([value, maxVal]);
                }}
                className="dr-thumb dr-thumb--left pointer-events-none absolute h-0 w-full outline-none z-[1]"
                style={{ zIndex: minVal > max - 100 ? 2 : 1 }}
            />
            <input
                type="range"
                min={min}
                max={max}
                value={maxVal}
                step={step}
                onChange={(event) => {
                    const value = Math.max(Number(event.target.value), minVal + step);
                    setMaxVal(value);
                    maxValRef.current = value;
                    onChange([minVal, value]);
                }}
                className="dr-thumb dr-thumb--right pointer-events-none absolute h-0 w-full outline-none z-[2]"
            />

            <div className="relative w-full">
                <div className="absolute bg-gray-200 w-full z-[0] h-1.5 rounded-md"></div>
                <div
                    ref={range}
                    className="absolute bg-brand z-[0] h-1.5 rounded-md"
                />
            </div>

            <style>{`
                /* Webkit (Chrome, Safari, Edge) */
                .dr-thumb::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    -webkit-tap-highlight-color: transparent;
                    pointer-events: auto;
                    height: 18px;
                    width: 18px;
                    border-radius: 50%;
                    background-color: white;
                    border: 2px solid #A6D1E6; /* Brand color - Powder Blue */
                    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
                    cursor: pointer;
                    margin-top: 1px; /* Adjust for alignment */
                    accent-color: #A6D1E6;
                }

                /* Firefox */
                .dr-thumb::-moz-range-thumb {
                    pointer-events: auto;
                    height: 18px;
                    width: 18px;
                    border-radius: 50%;
                    background-color: white;
                    border: 2px solid #A6D1E6; /* Brand color - Powder Blue */
                    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
                    cursor: pointer;
                    border: none;
                }
            `}</style>
        </div>
    );
};
