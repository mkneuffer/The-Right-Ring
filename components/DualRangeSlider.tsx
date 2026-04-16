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
    const trackRef = useRef<HTMLDivElement>(null);
    const rangeRef = useRef<HTMLDivElement>(null);
    const dragging = useRef<'min' | 'max' | null>(null);

    // Sync external value changes
    useEffect(() => {
        setMinVal(value[0]);
        setMaxVal(value[1]);
    }, [value]);

    const getPercent = useCallback(
        (val: number) => ((val - min) / (max - min)) * 100,
        [min, max]
    );

    // Update the blue fill bar
    useEffect(() => {
        if (rangeRef.current) {
            const minPct = getPercent(minVal);
            const maxPct = getPercent(maxVal);
            rangeRef.current.style.left = `${minPct}%`;
            rangeRef.current.style.width = `${maxPct - minPct}%`;
        }
    }, [minVal, maxVal, getPercent]);

    // Convert a clientX position to a snapped value within [min, max]
    const clientXToValue = useCallback((clientX: number): number => {
        if (!trackRef.current) return min;
        const rect = trackRef.current.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const raw = min + pct * (max - min);
        const snapped = Math.round(raw / step) * step;
        return Math.min(max, Math.max(min, snapped));
    }, [min, max, step]);

    // Pointer down on a thumb — start drag
    const onThumbPointerDown = (thumb: 'min' | 'max') => (e: React.PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragging.current = thumb;
        (e.target as Element).setPointerCapture(e.pointerId);
    };

    const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        if (!dragging.current) return;
        e.preventDefault();
        const val = clientXToValue(e.clientX);
        if (dragging.current === 'min') {
            const newVal = Math.min(val, maxVal - step);
            setMinVal(newVal);
            onChange([newVal, maxVal]);
        } else {
            const newVal = Math.max(val, minVal + step);
            setMaxVal(newVal);
            onChange([minVal, newVal]);
        }
    }, [clientXToValue, minVal, maxVal, step, onChange]);

    const onPointerUp = useCallback(() => {
        dragging.current = null;
    }, []);

    // Click on the track itself (not a thumb) — jump nearest thumb
    const onTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (dragging.current) return;
        const val = clientXToValue(e.clientX);
        const distToMin = Math.abs(val - minVal);
        const distToMax = Math.abs(val - maxVal);
        if (distToMin <= distToMax) {
            const newVal = Math.min(val, maxVal - step);
            setMinVal(newVal);
            onChange([newVal, maxVal]);
        } else {
            const newVal = Math.max(val, minVal + step);
            setMaxVal(newVal);
            onChange([minVal, newVal]);
        }
    };

    const minPct = getPercent(minVal);
    const maxPct = getPercent(maxVal);

    return (
        <div
            className={`relative w-full select-none ${className}`}
            style={{ padding: '14px 0', cursor: 'pointer', touchAction: 'none' }}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
        >
            {/* Track */}
            <div
                ref={trackRef}
                className="relative w-full h-2 rounded-md bg-gray-200"
                onClick={onTrackClick}
            >
                {/* Blue fill */}
                <div ref={rangeRef} className="absolute h-full rounded-md bg-brand" />

                {/* Min thumb */}
                <div
                    className="absolute top-1/2 w-5 h-5 rounded-full bg-white border-2 shadow-md"
                    style={{
                        left: `${minPct}%`,
                        transform: 'translate(-50%, -50%)',
                        borderColor: '#4A7EB8',
                        cursor: 'grab',
                        zIndex: 2,
                        touchAction: 'none',
                    }}
                    onPointerDown={onThumbPointerDown('min')}
                    onClick={e => e.stopPropagation()}
                />

                {/* Max thumb */}
                <div
                    className="absolute top-1/2 w-5 h-5 rounded-full bg-white border-2 shadow-md"
                    style={{
                        left: `${maxPct}%`,
                        transform: 'translate(-50%, -50%)',
                        borderColor: '#4A7EB8',
                        cursor: 'grab',
                        zIndex: 2,
                        touchAction: 'none',
                    }}
                    onPointerDown={onThumbPointerDown('max')}
                    onClick={e => e.stopPropagation()}
                />
            </div>
        </div>
    );
};
