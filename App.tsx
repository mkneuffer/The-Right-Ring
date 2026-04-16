import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ProgressBar } from './components/ProgressBar';
import { QuestionCard } from './components/QuestionCard';
import { DiamondSelector } from './components/DiamondSelector';
import { Summary } from './components/Summary';
import { InfoModal } from './components/InfoModal';
import { BaseRingDetailModal } from './components/BaseRingDetailModal';
import { FORM_STEPS, QUESTIONS, BUDGET_OPTIONS } from './constants';
import { RingConfiguration, Question, Option, Diamond } from './types';
import { useCookie } from './hooks/useCookie';
import {
    trackStepView, trackStepAdvance, trackStepBack,
    trackOptionSelect, trackModalOpen, trackSummaryView,
} from './analytics';

// Renders a round brilliant-cut diamond SVG swatch (wide crown, flat table, pointed culet)
const GemSwatch: React.FC<{ color: string; gradient?: string; size?: number; borderColor?: string }> = ({ color, gradient, size = 36, borderColor = '#d1d5db' }) => {
    const uid = `gem-${color.replace(/[^a-zA-Z0-9]/g, '')}-${size}`;
    const hex = color.replace('#', '').padEnd(6, '0');
    const r = parseInt(hex.substring(0,2), 16);
    const g = parseInt(hex.substring(2,4), 16);
    const b = parseInt(hex.substring(4,6), 16);
    const lighten = (amt: number) => `rgb(${Math.min(255,r+amt)},${Math.min(255,g+amt)},${Math.min(255,b+amt)})`;
    const darken  = (amt: number) => `rgb(${Math.max(0,r-amt)},${Math.max(0,g-amt)},${Math.max(0,b-amt)})`;

    // For gradient stones, extract the two colors
    const gradColors = gradient ? gradient.match(/#[0-9a-fA-F]{6}/g) : null;
    const col1 = gradColors?.[0] || color;
    const col2 = gradColors?.[1] || color;

    // Scale factor — all coords designed in a 100×80 viewBox (wider than tall)
    const W = 100, H = 80;

    // Key points (matching the brilliant-cut outline in the reference image)
    // Table: flat top edge
    const tl = { x: 30, y: 8 };
    const tr = { x: 70, y: 8 };
    // Girdle (widest): left & right extremes
    const gl = { x: 2,  y: 38 };
    const gr = { x: 98, y: 38 };
    // Culet: bottom point
    const cu = { x: 50, y: 78 };
    // Crown shoulder corners (where outer edge meets table level)
    const sl = { x: 14, y: 8 };
    const sr = { x: 86, y: 8 };
    // Mid-crown points (between shoulder and girdle)
    const ml = { x: 5,  y: 22 };
    const mr = { x: 95, y: 22 };
    // Lower girdle helpers for pavilion facets
    const pl = { x: 18, y: 55 };
    const pr = { x: 82, y: 55 };
    // Inner table-to-girdle lines
    const itl = { x: 24, y: 38 };
    const itr = { x: 76, y: 38 };

    const pts = (arr: {x:number;y:number}[]) => arr.map(p => `${p.x},${p.y}`).join(' ');

    // Outer silhouette (crown + pavilion)
    const outline = [sl, tl, tr, sr, mr, gr, pr, cu, pl, gl, ml, sl];

    return (
        <svg width={size} height={size * H / W} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', flexShrink: 0, filter: `drop-shadow(0 1px 2px rgba(0,0,0,0.25))` }}>
            <defs>
                {gradient && gradColors ? (
                    <linearGradient id={`${uid}-grad`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="50%" stopColor={col1} />
                        <stop offset="50%" stopColor={col2} />
                    </linearGradient>
                ) : null}
                <radialGradient id={`${uid}-shine`} cx="42%" cy="30%" r="55%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.65)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </radialGradient>
                <clipPath id={`${uid}-clip`}>
                    <polygon points={pts(outline)} />
                </clipPath>
            </defs>

            {/* Base fill */}
            <polygon points={pts(outline)} fill={gradient && gradColors ? `url(#${uid}-grad)` : color} stroke={borderColor} strokeWidth="1.5" strokeLinejoin="round" />

            {/* Facet lines clipped to outline */}
            <g clipPath={`url(#${uid}-clip)`}>
                {/* Table facet (flat top) */}
                <polygon points={pts([tl, tr, itr, itl])} fill={lighten(60)} opacity="0.5" />
                {/* Left crown facet */}
                <polygon points={pts([sl, tl, itl, gl])} fill={lighten(35)} opacity="0.4" />
                {/* Right crown facet */}
                <polygon points={pts([tr, sr, gr, itr])} fill={darken(15)} opacity="0.35" />
                {/* Far-left crown */}
                <polygon points={pts([ml, gl, itl, sl])} fill={lighten(20)} opacity="0.3" />
                {/* Far-right crown */}
                <polygon points={pts([sr, mr, gr, itr])} fill={darken(25)} opacity="0.3" />
                {/* Left pavilion */}
                <polygon points={pts([gl, itl, cu])} fill={darken(35)} opacity="0.35" />
                {/* Right pavilion */}
                <polygon points={pts([itr, gr, cu])} fill={lighten(15)} opacity="0.3" />
                {/* Center pavilion */}
                <polygon points={pts([itl, itr, cu])} fill={darken(20)} opacity="0.25" />
                {/* Left lower pavilion */}
                <polygon points={pts([gl, pl, cu])} fill={darken(45)} opacity="0.3" />
                {/* Right lower pavilion */}
                <polygon points={pts([pr, gr, cu])} fill={lighten(10)} opacity="0.25" />
                {/* Shine overlay */}
                <polygon points={pts(outline)} fill={`url(#${uid}-shine)`} />
            </g>

            {/* Facet stroke lines for the line-art look */}
            <g clipPath={`url(#${uid}-clip)`} fill="none" stroke={darken(60)} strokeWidth="0.6" opacity="0.5" strokeLinejoin="round">
                <line x1={tl.x} y1={tl.y} x2={itl.x} y2={itl.y} />
                <line x1={tr.x} y1={tr.y} x2={itr.x} y2={itr.y} />
                <line x1={sl.x} y1={sl.y} x2={itl.x} y2={itl.y} />
                <line x1={sr.x} y1={sr.y} x2={itr.x} y2={itr.y} />
                <line x1={ml.x} y1={ml.y} x2={itl.x} y2={itl.y} />
                <line x1={mr.x} y1={mr.y} x2={itr.x} y2={itr.y} />
                <line x1={itl.x} y1={itl.y} x2={cu.x} y2={cu.y} />
                <line x1={itr.x} y1={itr.y} x2={cu.x} y2={cu.y} />
                <line x1={gl.x} y1={gl.y} x2={cu.x} y2={cu.y} />
                <line x1={gr.x} y1={gr.y} x2={cu.x} y2={cu.y} />
                <line x1={pl.x} y1={pl.y} x2={cu.x} y2={cu.y} />
                <line x1={pr.x} y1={pr.y} x2={cu.x} y2={cu.y} />
                <line x1={itl.x} y1={itl.y} x2={itr.x} y2={itr.y} />
                <line x1={tl.x} y1={tl.y} x2={tr.x} y2={tr.y} />
            </g>
        </svg>
    );
};

const RingBuilder: React.FC = () => {
    const [currentStep, setCurrentStep] = useCookie('ringBuilder_currentStep', 0);
    const [ringConfiguration, setRingConfiguration] = useCookie<RingConfiguration>('ringBuilder_configuration', {});
    const [infoContent, setInfoContent] = useState<Question['info'] | null>(null);
    const [baseRingModalOption, setBaseRingModalOption] = useState<Option | null>(null);
    const [engravingModalOpen, setEngravingModalOpen] = useState(false);
    const [engravingText, setEngravingText] = useState('');
    const [engravingFont, setEngravingFont] = useState('Arial');
    const [hiddenStoneModalOptionId, setHiddenStoneModalOptionId] = useState<string | null>(null);
    const [hiddenStoneType, setHiddenStoneType] = useState<'diamond' | 'colored-stone' | ''>('');
    const [hiddenStoneColor, setHiddenStoneColor] = useState('Garnet');
    const [woodgrainVinesModalOpen, setWoodgrainVinesModalOpen] = useState(false);
    const [woodgrainVinesChoice, setWoodgrainVinesChoice] = useState<'woodgrain' | 'vines' | 'both' | ''>('');
    const [coloredStoneModalOpen, setColoredStoneModalOpen] = useState(false);
    const [coloredStoneType, setColoredStoneType] = useState('');
    const [coloredStoneVariety, setColoredStoneVariety] = useState('');
    const [pendingOverlay, setPendingOverlay] = useState<string | null>(null);
    const [stoneShapeModalOpen, setStoneShapeModalOpen] = useState(false);
    const [stoneShapeModalSelection, setStoneShapeModalSelection] = useState<string | null>(null);
    const stoneShapeFromHint = useRef(false);
    const [buildFromScratchPhotoModalOpen, setBuildFromScratchPhotoModalOpen] = useState(false);
    const [buildFromScratchFiles, setBuildFromScratchFiles] = useState<File[]>([]);
    const [bfsIsDragging, setBfsIsDragging] = useState(false);
    const [otherShapeModalOpen, setOtherShapeModalOpen] = useState(false);
    const [otherShapeText, setOtherShapeText] = useState('');
    const [selectedDiamondObj, setSelectedDiamondObj] = useState<Diamond | null>(null);

    const COLORED_STONES: { name: string; color: string; gradient?: string; varieties: { name: string; color: string; gradient?: string }[] }[] = [
        { name: 'Ruby',        color: '#e0115f', varieties: [
            { name: 'Light Pink',    color: '#f892b0' },
            { name: 'Medium Red',    color: '#e0115f' },
            { name: 'Pigeon Blood',  color: '#9B0000' },
        ]},
        { name: 'Sapphire',    color: '#0f52ba', varieties: [
            { name: 'Royal Blue',      color: '#0a2d8f' },
            { name: 'Deep Blue',       color: '#003580' },
            { name: 'Medium Blue',     color: '#1560bd' },
            { name: 'Light Blue',      color: '#6fa8dc' },
            { name: 'Cornflower Blue', color: '#6495ed' },
            { name: 'Montana',         color: '#4a7b9d' },
            { name: 'Pink',            color: '#f4a7b9' },
            { name: 'Yellow',          color: '#ffd700' },
            { name: 'Padparadscha',    color: '#f5855a', gradient: 'linear-gradient(135deg, #f57c00 50%, #f48fb1 50%)' },
            { name: 'Green',           color: '#4a7c59' },
            { name: 'Purple',          color: '#7b2d8b' },
            { name: 'Orange',          color: '#f57c00' },
        ]},
        { name: 'Emerald',     color: '#50c878', varieties: [] },
        { name: 'Garnet',      color: '#8B0000', varieties: [
            { name: 'Pyrope',      color: '#8B0000' },
            { name: 'Rhodolite',   color: '#C2485A' },
            { name: 'Spessartine', color: '#D2542E' },
            { name: 'Tsavorite',   color: '#138808' },
            { name: 'Demantoid',   color: '#50C878' },
        ]},
        { name: 'Tanzanite',   color: '#4d5aaf', varieties: [] },
        { name: 'Aquamarine',  color: '#7BC8E8', varieties: [] },
        { name: 'Amethyst',    color: '#9b59b6', varieties: [] },
        { name: 'Tourmaline',  color: '#ff69b4', varieties: [
            { name: 'Pink (Rubellite)',        color: '#e75480' },
            { name: 'Blue',                    color: '#4169e1' },
            { name: 'Blue-Green (Indicolite)', color: '#0d98ba' },
            { name: 'Green',                   color: '#50c878' },
            { name: 'Watermelon',              color: '#fc6c85' },
            { name: 'Purple',                  color: '#8b008b' },
            { name: 'Canary Yellow',           color: '#ffd700' },
        ]},
        { name: 'Topaz',       color: '#e68a2e', varieties: [
            { name: 'Imperial',   color: '#e68a2e' },
            { name: 'London Blue', color: '#00688b' },
            { name: 'Blue',        color: '#87ceeb' },
        ]},
        { name: 'Citrine',     color: '#e4a010', varieties: [] },
        { name: 'Alexandrite', color: '#4b0082', gradient: 'linear-gradient(135deg, #2e8b57 50%, #7b2d8b 50%)', varieties: [
            { name: 'Blue-Green (Daylight)',       color: '#2e8b57', gradient: 'linear-gradient(135deg, #1a7a4a 50%, #4169e1 50%)' },
            { name: 'Purple-Red (Incandescent)',   color: '#7b2d8b', gradient: 'linear-gradient(135deg, #7b2d8b 50%, #c0392b 50%)' },
        ]},
        { name: 'Peridot',     color: '#b5b42c', varieties: [] },
        { name: 'Zircon',      color: '#5BA4C7', varieties: [] },
    ];

    const HIDDEN_STONE_IDS = ['hidden-stone-inside', 'hidden-stone-outside', 'hidden-stone-head', 'alternating-stone-type'];

    useEffect(() => {
        if (window.location.search.includes('reset')) {
            setCurrentStep(0);
            setRingConfiguration({});
            window.history.replaceState(null, '', '/');
        } else {
            const params = new URLSearchParams(window.location.search);
            const encoded = params.get('design');
            if (encoded) {
                try {
                    const config = JSON.parse(atob(encoded));
                    setRingConfiguration(config);
                    setCurrentStep(FORM_STEPS.length);
                } catch {}
                window.history.replaceState(null, '', '/');
            }
        }
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);
        const isSummary = currentStep >= FORM_STEPS.length;
        const title = isSummary ? 'Your Custom Ring' : FORM_STEPS[currentStep]?.title ?? '';
        trackStepView(currentStep, title);
        if (isSummary) { trackSummaryView(); if (typeof window !== 'undefined' && (window as any).fbq) (window as any).fbq('track', 'ViewContent'); }
    }, [currentStep]);

    useEffect(() => {
        if (!pendingOverlay) return;
        setPendingOverlay(null);
        if (pendingOverlay === 'written-engraving') {
            setEngravingText((ringConfiguration['engravingText'] as string) || '');
            setEngravingFont((ringConfiguration['engravingFont'] as string) || 'Arial');
            setEngravingModalOpen(true);
        } else if (pendingOverlay === 'woodgrain-vines') {
            setWoodgrainVinesChoice((ringConfiguration['woodgrainVinesChoice'] as 'woodgrain' | 'vines' | 'both' | '') || '');
            setWoodgrainVinesModalOpen(true);
        } else if (HIDDEN_STONE_IDS.includes(pendingOverlay)) {
            setHiddenStoneType((ringConfiguration[`hiddenStoneType_${pendingOverlay}`] as 'diamond' | 'colored-stone' | '') || '');
            setHiddenStoneColor((ringConfiguration[`hiddenStoneColor_${pendingOverlay}`] as string) || 'Garnet');
            setHiddenStoneModalOptionId(pendingOverlay);
        } else if (pendingOverlay === 'stoneShape') {
            if (ringConfiguration['stoneOption'] === 'diamond') stoneShapeFromHint.current = true;
            setStoneShapeModalOpen(true);
        } else if (pendingOverlay === 'otherShape') {
            setOtherShapeText((ringConfiguration['otherShapeText'] as string) || '');
            setOtherShapeModalOpen(true);
        } else if (pendingOverlay === 'coloredStone') {
            setColoredStoneType((ringConfiguration['coloredStoneType'] as string) || '');
            setColoredStoneVariety((ringConfiguration['coloredStoneVariety'] as string) || '');
            setColoredStoneModalOpen(true);
        } else if (pendingOverlay === 'budget') {
            setCurrentStep(FORM_STEPS.length);
            setBudgetOverlayExpanded(true);
            setShowBudgetOverlay(true);
        }
    }, [pendingOverlay]);

    const updateSelection = (questionId: string, optionId: string | null) => {
        const question = QUESTIONS.find(q => q.id === questionId);
        const isMultiSelect = question?.multiSelect;

        setRingConfiguration(prev => {
            if (isMultiSelect && optionId) {
                const currentSelection = prev[questionId];
                const currentArray = Array.isArray(currentSelection) ? currentSelection : (currentSelection ? [currentSelection as string] : []);

                if (currentArray.includes(optionId)) {
                    const newArray = currentArray.filter(id => id !== optionId);
                    return {
                        ...prev,
                        [questionId]: newArray.length > 0 ? newArray : null
                    };
                } else {
                    return {
                        ...prev,
                        [questionId]: [...currentArray, optionId]
                    };
                }
            }

            return {
                ...prev,
                [questionId]: optionId
            };
        });
    };

    const handleOptionSelect = (questionId: string, optionId: string) => {
        if (questionId === 'baseRing' && optionId !== 'build-from-scratch') {
            const question = QUESTIONS.find(q => q.id === questionId);
            const option = question?.options.find(o => o.id === optionId);
            if (option) {
                setBaseRingModalOption(option);
            }
            return;
        }

        if (questionId === 'baseRing' && optionId === 'build-from-scratch') {
            setRingConfiguration(prev => ({ ...prev, baseRing: 'build-from-scratch', baseRingLabGrown: null, baseRingVariant: null }));
            const existing = ringConfiguration['stoneShape'];
            const existingArr = Array.isArray(existing) ? existing : (existing ? [existing as string] : []);
            setStoneShapeModalSelection(existingArr.find(s => s !== 'colored-stone') ?? null);
            setStoneShapeModalOpen(true);
            return;
        }

        if (questionId === 'band') {
            setRingConfiguration(prev => {
                const current = prev['band'];
                const currentArray = Array.isArray(current) ? current : (current ? [current as string] : []);

                if (optionId === 'twist') {
                    // Twist is always solo — remove european-shank if present
                    return { ...prev, band: currentArray.includes('twist') ? null : ['twist'] };
                }

                if (optionId === 'european-shank') {
                    // Cannot combine with twist
                    if (currentArray.includes('twist')) return prev;
                    if (currentArray.includes('european-shank')) {
                        const next = currentArray.filter(id => id !== 'european-shank');
                        return { ...prev, band: next.length > 0 ? next : null };
                    }
                    return { ...prev, band: [...currentArray, 'european-shank'] };
                }

                // Any other band: keep european-shank if present, replace other band
                const hasEuropean = currentArray.includes('european-shank');
                if (currentArray.includes(optionId)) {
                    const next = currentArray.filter(id => id !== optionId);
                    return { ...prev, band: next.length > 0 ? next : null };
                }
                return { ...prev, band: hasEuropean ? ['european-shank', optionId] : [optionId] };
            });
            return;
        }

        if (questionId === 'features' && optionId === 'written-engraving') {
            const current = ringConfiguration['features'];
            const currentArray = Array.isArray(current) ? current : (current ? [current as string] : []);
            if (currentArray.includes('written-engraving')) {
                // Already selected — reopen modal (user can X to deselect)
                setEngravingText((ringConfiguration['engravingText'] as string) || '');
                setEngravingFont((ringConfiguration['engravingFont'] as string) || 'Arial');
                setEngravingModalOpen(true);
            } else {
                updateSelection(questionId, optionId);
                setEngravingText('');
                setEngravingFont('Arial');
                trackModalOpen('engraving', 'written-engraving');
                setEngravingModalOpen(true);
            }
            return;
        }

        if (questionId === 'features' && HIDDEN_STONE_IDS.includes(optionId)) {
            const current = ringConfiguration['features'];
            const currentArray = Array.isArray(current) ? current : (current ? [current as string] : []);
            if (currentArray.includes(optionId)) {
                // Already selected — reopen modal (user can X to deselect)
                setHiddenStoneType((ringConfiguration[`hiddenStoneType_${optionId}`] as 'diamond' | 'colored-stone' | '') || '');
                setHiddenStoneColor((ringConfiguration[`hiddenStoneColor_${optionId}`] as string) || 'Garnet');
                trackModalOpen('hidden_stone', optionId);
                setHiddenStoneModalOptionId(optionId);
            } else {
                updateSelection(questionId, optionId);
                setHiddenStoneType('');
                setHiddenStoneColor('Garnet');
                trackModalOpen('hidden_stone', optionId);
                setHiddenStoneModalOptionId(optionId);
            }
            return;
        }

        const BEZEL_GROUP = ['half-moon-bezel-gold', 'half-moon-bezel-platinum', 'full-bezel-yellow', 'full-bezel-platinum'];
        if (questionId === 'features' && BEZEL_GROUP.includes(optionId)) {
            setRingConfiguration(prev => {
                const current = prev['features'];
                const currentArray = Array.isArray(current) ? current : (current ? [current as string] : []);
                if (currentArray.includes(optionId)) {
                    // Deselect
                    const next = currentArray.filter(id => id !== optionId);
                    return { ...prev, features: next.length > 0 ? next : null };
                }
                // Remove any other bezel from the group, then add this one
                const withoutOtherBezels = currentArray.filter(id => !BEZEL_GROUP.includes(id));
                return { ...prev, features: [...withoutOtherBezels, optionId] };
            });
            return;
        }

        if (questionId === 'stoneShape' && (optionId === 'diamond' || optionId === 'colored-stone' || optionId === 'other')) {
            // stoneShape (from step 1) is NEVER touched here — it always holds the user's chosen diamond shape
            const currentOption = ringConfiguration['stoneOption'] as string | undefined;
            if (optionId === 'diamond') {
                setRingConfiguration(prev => ({ ...prev, stoneOption: currentOption === 'diamond' ? null : 'diamond' }));
                return;
            }
            if (optionId === 'colored-stone') {
                if (currentOption === 'colored-stone') {
                    // Already selected — reopen modal pre-filled
                    setColoredStoneType((ringConfiguration['coloredStoneType'] as string) || '');
                    setColoredStoneVariety((ringConfiguration['coloredStoneVariety'] as string) || '');
                    trackModalOpen('colored_stone', 'colored-stone');
                    setColoredStoneModalOpen(true);
                } else {
                    setRingConfiguration(prev => ({ ...prev, stoneOption: 'colored-stone' }));
                    setColoredStoneType('');
                    setColoredStoneVariety('');
                    trackModalOpen('colored_stone', 'colored-stone');
                    setColoredStoneModalOpen(true);
                }
                return;
            }
            if (optionId === 'other') {
                if (currentOption === 'other') {
                    setRingConfiguration(prev => ({ ...prev, stoneOption: null, otherShapeText: null }));
                } else {
                    setRingConfiguration(prev => ({ ...prev, stoneOption: 'other' }));
                    setOtherShapeText((ringConfiguration['otherShapeText'] as string) || '');
                    setOtherShapeModalOpen(true);
                }
                return;
            }
        }

        if (questionId === 'features' && optionId === 'woodgrain-vines') {
            const current = ringConfiguration['features'];
            const currentArray = Array.isArray(current) ? current : (current ? [current as string] : []);
            if (currentArray.includes('woodgrain-vines')) {
                // Already selected — reopen modal
                setWoodgrainVinesChoice((ringConfiguration['woodgrainVinesChoice'] as 'woodgrain' | 'vines' | 'both' | '') || '');
                trackModalOpen('woodgrain_vines', 'woodgrain-vines');
                setWoodgrainVinesModalOpen(true);
            } else {
                updateSelection(questionId, optionId);
                setWoodgrainVinesChoice('');
                trackModalOpen('woodgrain_vines', 'woodgrain-vines');
                setWoodgrainVinesModalOpen(true);
            }
            return;
        }

        const _q = QUESTIONS.find(q => q.id === questionId);
        const _o = _q?.options.find(o => o.id === optionId);
        trackOptionSelect(questionId, optionId, _o?.name ?? optionId);
        updateSelection(questionId, optionId);
    };

    const handleNext = (selectedDiamondOverride?: string) => {
        // Diamond step (3) → going to summary: ask budget if needed
        // Use override when called immediately after selection (state may not have flushed yet)
        const effectiveDiamond = selectedDiamondOverride ?? ringConfiguration['diamond'];
        const isExpertOrNoSelection = !effectiveDiamond || effectiveDiamond === 'EXPERT_SELECTION';
        const hasColoredStone = ringConfiguration['stoneOption'] === 'colored-stone';
        const budgetNeeded = hasColoredStone || isExpertOrNoSelection;
        if (currentStep === FORM_STEPS.length - 1 && budgetNeeded) {
            setShowBudgetOverlay(true);
            return;
        }
        if (currentStep < FORM_STEPS.length) {
            trackStepAdvance(currentStep, FORM_STEPS[currentStep]?.title ?? '');
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            const title = currentStep < FORM_STEPS.length
                ? FORM_STEPS[currentStep]?.title ?? ''
                : 'Your Custom Ring';
            trackStepBack(currentStep, title);
            setCurrentStep(currentStep - 1);
        }
    };

    const restart = () => {
        setRingConfiguration({});
        setCurrentStep(0);
    }

    const isNextDisabled = useMemo(() => {
        if (!FORM_STEPS[currentStep]) return true;

        const { requiredQuestions } = FORM_STEPS[currentStep];
        const stoneShapeVal = ringConfiguration['stoneShape'];
        const stoneShapeArr = Array.isArray(stoneShapeVal) ? stoneShapeVal : (stoneShapeVal ? [stoneShapeVal as string] : []);
        const stoneOption = ringConfiguration['stoneOption'] as string | undefined;
        const hasColoredStone = stoneOption === 'colored-stone' || stoneShapeArr.includes('colored-stone');
        const hasDiamondShape = stoneOption === 'diamond' && stoneShapeArr.some(s => s !== 'colored-stone' && s !== 'other');
        // Skip diamond step if colored stone or other was chosen in step 2
        const skipDiamond = stoneOption === 'colored-stone' || stoneOption === 'other' || (!stoneOption && hasColoredStone && !hasDiamondShape);
        return requiredQuestions.some(qId => {
            if (qId === 'diamond' && skipDiamond) return false;
            // stoneShape required: satisfied if stoneOption is set (step 2 choice made)
            if (qId === 'stoneShape' && stoneOption) return false;
            return !ringConfiguration[qId];
        });
    }, [currentStep, ringConfiguration]);

    const prevNextDisabled = useRef(true);
    const [nextPulseKey, setNextPulseKey] = useState(0);
    useEffect(() => {
        if (prevNextDisabled.current && !isNextDisabled) {
            setNextPulseKey(k => k + 1);
        }
        prevNextDisabled.current = isNextDisabled;
    }, [isNextDisabled]);

    const hasColoredStoneSelected = useMemo(() => {
        return ringConfiguration['stoneOption'] === 'colored-stone';
    }, [ringConfiguration]);

    const needsBudget = useMemo(() => {
        const hasColoredStone = ringConfiguration['stoneOption'] === 'colored-stone';
        const diamond = ringConfiguration['diamond'];
        const isExpertOrNoSelection = !diamond || diamond === 'EXPERT_SELECTION';
        if (hasColoredStone) return true;
        if (isExpertOrNoSelection) return true;
        return false;
    }, [ringConfiguration]);

    const [showBudgetOverlay, setShowBudgetOverlay] = useState(false);
    const [budgetOverlayExpanded, setBudgetOverlayExpanded] = useState(false);

    const isFormComplete = useMemo(() => {
        const stoneOpt = ringConfiguration['stoneOption'] as string | undefined;
        const skipDiamond = stoneOpt === 'colored-stone' || stoneOpt === 'other';
        return FORM_STEPS.every(step =>
            step.requiredQuestions.every(qId => {
                if (qId === 'diamond' && skipDiamond) return true;
                if (qId === 'stoneShape' && stoneOpt) return true;
                return !!ringConfiguration[qId];
            })
        );
    }, [ringConfiguration]);

    const SHAPE_LABELS: Record<string, string> = { round: 'Round', princess: 'Princess', oval: 'Oval', marquise: 'Marquise', pear: 'Pear', cushion: 'Cushion', emerald: 'Emerald', radiant: 'Radiant', asscher: 'Asscher', other: 'Other Shape' };
    const SHAPE_ICON_URLS: Record<string, string> = {
        round:    '/images/icons for dia 2/round.png',
        oval:     '/images/icons for dia 2/oval.png',
        princess: '/images/icons for dia 2/princess.jpg',
        cushion:  '/images/icons for dia 2/cushion.jpg',
        emerald:  '/images/icons for dia 2/emerald.png',
        marquise: '/images/icons for dia 2/marquise centered.png',
        pear:     '/images/icons for dia 2/pear.png',
        radiant:  '/images/icons for dia 2/radiant.jpg',
        asscher:  '/images/icons for dia 2/asscher.png',
    };
    const diamondShapeVal = ringConfiguration['stoneShape'];
    const diamondShapeArr = Array.isArray(diamondShapeVal) ? diamondShapeVal : (diamondShapeVal ? [diamondShapeVal as string] : []);
    const primaryDiamondShapeId = diamondShapeArr.find((s: string) => s !== 'colored-stone' && s !== 'diamond');
    const selectedStoneName = primaryDiamondShapeId ? SHAPE_LABELS[primaryDiamondShapeId] : undefined;
    const diamondShapeIconUrl = primaryDiamondShapeId ? SHAPE_ICON_URLS[primaryDiamondShapeId] : undefined;
    // Hidden stones only available in Round or Oval — fall back to Round for all other shapes
    const hiddenDiamondShape = (primaryDiamondShapeId === 'round' || primaryDiamondShapeId === 'oval')
        ? selectedStoneName
        : 'Round';

    const renderStepContent = () => {
        if (currentStep >= FORM_STEPS.length) {
            return <Summary configuration={ringConfiguration} selectedDiamondObj={selectedDiamondObj} initialFiles={buildFromScratchFiles} onRestart={restart} onEditStep={(stepIndex, overlay) => { setCurrentStep(stepIndex); if (overlay) setPendingOverlay(overlay); }} />;
        }

        const stepInfo = FORM_STEPS[currentStep];
        const questionIds = stepInfo.questionIds;

        if (stepInfo.component === 'DiamondSelector') {
            return <DiamondSelector
                stoneShapeId={(() => { const v = ringConfiguration['stoneShape']; const arr = Array.isArray(v) ? v : (v ? [v as string] : []); return arr.find(s => s !== 'colored-stone' && s !== 'diamond') ?? ''; })()}
                selectedDiamondId={ringConfiguration['diamond'] ?? null}
                onSelectDiamond={(diamondId, diamond) => { updateSelection('diamond', diamondId); setSelectedDiamondObj(diamond ?? null); }}
                onNext={handleNext}
            />;
        }

        return (
            <div className="space-y-12">
                {(() => {
                    // selectedStoneName is hoisted to component level above renderStepContent
                    return questionIds.map(qId => {
                    const question = QUESTIONS.find(q => q.id === qId);
                    if (!question) return null;
                    const questionToRender = question.id === 'stoneShape'
                        ? { ...question, options: question.options.filter((o: { id: string }) => o.id === 'diamond' || o.id === 'colored-stone' || o.id === 'other') }
                        : question;
                    // For step 2 Stone Options: use stoneOption to drive which card is highlighted
                    const stoneShapeSelectedValue = question.id === 'stoneShape' ? (() => {
                        const opt = ringConfiguration['stoneOption'] as string | undefined;
                        if (!opt) return [];
                        return [opt]; // 'diamond' | 'colored-stone' | 'other'
                    })() : null;
                    return (
                        <div key={question.id}>
                            {question.id === 'features' && (
                                <p className="text-center text-gray-500 text-sm mb-6">Each selection will override base ring specifications. Leaving this page blank will keep your base ring as is.</p>
                            )}
                            <QuestionCard
                                question={questionToRender}
                                selectedValue={stoneShapeSelectedValue ?? (ringConfiguration[question.id] ?? null)}
                                onSelect={(optionId) => handleOptionSelect(question.id, optionId)}
                                onShowInfo={(info) => setInfoContent(info)}
                                labGrownOptionId={question.id === 'baseRing' && ringConfiguration['baseRingLabGrown'] === 'true' ? (ringConfiguration['baseRing'] as string) : undefined}
                                baseRingVariant={question.id === 'baseRing' ? (ringConfiguration['baseRingVariant'] as string) : undefined}
                                engravingText={question.id === 'features' ? (ringConfiguration['engravingText'] as string) : undefined}
                                engravingFont={question.id === 'features' ? (ringConfiguration['engravingFont'] as string) : undefined}
                                hiddenStoneConfig={question.id === 'features' ? (ringConfiguration as Record<string, string>) : undefined}
                                woodgrainVinesChoice={question.id === 'features' ? (ringConfiguration['woodgrainVinesChoice'] as string) : undefined}
                                coloredStoneType={question.id === 'stoneShape' ? (ringConfiguration['coloredStoneType'] as string) : undefined}
                                coloredStoneVariety={question.id === 'stoneShape' ? (ringConfiguration['coloredStoneVariety'] as string) : undefined}
                                coloredStoneShapeName={question.id === 'stoneShape' ? selectedStoneName : undefined}
                                otherShapeText={question.id === 'stoneShape' ? (ringConfiguration['otherShapeText'] as string) : undefined}
                                selectedStoneName={question.id === 'baseRing' ? selectedStoneName : undefined}
                                diamondShapeIconUrl={question.id === 'stoneShape' ? diamondShapeIconUrl : undefined}
                                onChangeDiamondShape={question.id === 'stoneShape' ? () => { stoneShapeFromHint.current = true; setStoneShapeModalOpen(true); } : undefined}
                            />
                            {question.id === 'band' && (
                                <p className="text-center text-gray-400 text-sm mt-6">Your jewelry professional will suggest the band's roundedness based on the shape of stone in your ring.</p>
                            )}
                            {question.id === 'features' && (
                                <p className="text-center text-gray-400 text-xs mt-6 px-4">
                                    <strong>(Costs will be estimated):</strong> The exact price depends on details like metal weight, stone size, and/or complexity. Your jewelry professional will provide an estimate before any work begins.
                                </p>
                            )}
                        </div>
                    );
                    });
                })()}
            </div>
        );
    };

    return (
        <div className="bg-[#F7F7F7] min-h-screen text-[#232429]">
            <Header />
            <main className="container mx-auto px-4 py-8 md:py-16">
                <div className="max-w-5xl mx-auto">
                    <ProgressBar currentStep={currentStep} totalSteps={FORM_STEPS.length} onStepClick={(step) => setCurrentStep(step)} />
                    {currentStep === 0 && (
                        <div className="mt-8 md:mt-10 mb-6 bg-white border border-[#c7e6f2] rounded-xl px-4 sm:px-6 py-4 sm:py-5 flex flex-row items-start sm:items-center gap-3 sm:gap-4 shadow-sm">
                            <div className="text-2xl sm:text-3xl shrink-0 mt-0.5 sm:mt-0">💍</div>
                            <div>
                                <p className="font-bold text-[#232429] text-base mb-1">Complete the ring builder and receive:</p>
                                <div className="flex flex-col sm:flex-row gap-3 mt-2">
                                    <div className="flex items-start gap-2 text-sm text-gray-600">
                                        <span className="text-brand font-bold mt-0.5">✦</span>
                                        <span>A <strong>free price estimate</strong> for your custom ring based on your selections</span>
                                    </div>
                                    <div className="hidden sm:block text-gray-300 self-center">|</div>
                                    <div className="flex items-start gap-2 text-sm text-gray-600">
                                        <span className="text-brand font-bold mt-0.5">✦</span>
                                        <span>A <strong>personalized design review</strong> from our jewelry team</span>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400 mt-3">Takes 5–10 minutes to complete. We are here to help, don't hesitate to reach out with any questions.</p>
                            </div>
                        </div>
                    )}
                    <div className="mt-0 md:mt-4">
                        <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-center text-[#232429] mb-2 tracking-wide">
                            {currentStep < FORM_STEPS.length ? FORM_STEPS[currentStep].title : 'Your Custom Ring'}
                        </h2>
                        {(currentStep >= FORM_STEPS.length || FORM_STEPS[currentStep].description) && (
                            <p className="text-gray-500 text-center mb-10">
                                {currentStep < FORM_STEPS.length ? FORM_STEPS[currentStep].description : 'Review your masterpiece.'}
                            </p>
                        )}
                        {renderStepContent()}
                    </div>
                </div>
            </main>

            <footer className={`sticky bottom-0 left-0 right-0 bg-white border-t-2 border-brand/30 shadow-[0_-4px_24px_rgba(127,179,201,0.18)] z-50${currentStep >= FORM_STEPS.length ? ' hidden sm:block' : ''}`} style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
                <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 max-w-5xl">
                    <div className="flex justify-center items-center gap-3">
                        <button
                            onClick={handleBack}
                            disabled={currentStep === 0}
                            className="px-4 sm:px-6 py-2.5 sm:py-3 bg-transparent border border-gray-300 text-gray-500 font-bold rounded-lg hover:border-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 text-sm sm:text-base"
                        >
                            Back
                        </button>
                        {currentStep < FORM_STEPS.length && FORM_STEPS[currentStep]?.component === 'DiamondSelector' && hasColoredStoneSelected && (
                            <button
                                onClick={handleNext}
                                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-white border-2 border-brand text-brand font-bold rounded-lg hover:bg-brand/5 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-opacity-50 transition-all duration-300 text-sm sm:text-base"
                            >
                                Skip
                            </button>
                        )}
                        {currentStep < FORM_STEPS.length ? (
                            <>
                                <button
                                    key={nextPulseKey}
                                    onClick={handleNext}
                                    disabled={isNextDisabled}
                                    className={`px-8 sm:px-10 py-2.5 sm:py-3 bg-brand text-white font-bold rounded-lg shadow-md hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand focus:ring-opacity-75 disabled:bg-brand-light disabled:text-brand/60 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 text-sm sm:text-base${!isNextDisabled && !isFormComplete ? ' animate-next-pulse' : ''}`}
                                >
                                    Next →
                                </button>
                                {isFormComplete && (
                                    <button
                                        onClick={() => setCurrentStep(FORM_STEPS.length)}
                                        className="px-8 sm:px-10 py-2.5 sm:py-3 bg-green-500 text-white font-bold rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 transition-all duration-300 transform hover:scale-105 text-sm sm:text-base animate-finish-pulse"
                                    >
                                        Finish ✦
                                    </button>
                                )}
                            </>
                        ) : (
                            <div className="px-8 sm:px-10 py-2.5 sm:py-3 invisible text-sm sm:text-base">Next →</div>
                        )}
                    </div>
                </div>
            </footer>
            <InfoModal
                isOpen={!!infoContent}
                onClose={() => setInfoContent(null)}
                info={infoContent}
            />
            {engravingModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex justify-center items-start md:items-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-fade-in-up relative my-8 md:my-auto">
                        <button
                            onClick={() => {
                                setRingConfiguration(prev => {
                                    const current = prev['features'];
                                    const currentArray = Array.isArray(current) ? current : (current ? [current as string] : []);
                                    const newArray = currentArray.filter(id => id !== 'written-engraving');
                                    return { ...prev, features: newArray.length > 0 ? newArray : null, engravingText: null, engravingFont: null };
                                });
                                setEngravingModalOpen(false);
                            }}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label="Close and deselect"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <h3 className="text-xl font-bold text-[#232429] mb-1">Engraving Options</h3>
                        <p className="text-sm text-gray-500 mb-5">You can always update this later in the Additional Information field on the Summary Review page or when in contact with your jewelry professional.</p>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Engraving Text</label>
                            <input
                                type="text"
                                value={engravingText}
                                onChange={(e) => setEngravingText(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand"
                                placeholder="e.g. Forever & Always"
                                style={{ fontFamily: engravingFont }}
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Font</label>
                            <select
                                value={engravingFont}
                                onChange={(e) => setEngravingFont(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand bg-white"
                            >
                                {[
                                    { value: 'Arial', label: 'Arial' },
                                    { value: 'Georgia', label: 'Georgia' },
                                    { value: 'Times New Roman', label: 'Times New Roman' },
                                    { value: 'Great Vibes', label: 'French Script' },
                                    { value: 'Pinyon Script', label: 'Edwardian Script' },
                                ].map(font => (
                                    <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                                        {font.label}
                                    </option>
                                ))}
                            </select>
                            {engravingFont && (
                                <p className="mt-2 text-xl text-gray-600 pl-1" style={{ fontFamily: engravingFont }}>
                                    Preview: {engravingText || 'Forever & Always'}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => {
                                    if (engravingText) {
                                        setRingConfiguration(prev => ({
                                            ...prev,
                                            engravingText: engravingText,
                                            engravingFont: engravingFont,
                                        }));
                                    }
                                    setEngravingModalOpen(false);
                                }}
                                className="w-full py-2.5 bg-brand text-white font-bold rounded-lg hover:bg-brand-dark transition-colors"
                            >
                                Save Engraving Options
                            </button>
                            <button
                                onClick={() => {
                                    setRingConfiguration(prev => ({ ...prev, engravingText: null, engravingFont: null }));
                                    setEngravingModalOpen(false);
                                }}
                                className="w-full py-2 text-gray-500 text-sm font-medium hover:text-gray-700 transition-colors"
                            >
                                Decide on engraving options later
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {hiddenStoneModalOptionId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex justify-center items-start md:items-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-fade-in-up relative my-8 md:my-auto">
                        <button
                            onClick={() => {
                                setRingConfiguration(prev => {
                                    const current = prev['features'];
                                    const currentArray = Array.isArray(current) ? current : (current ? [current as string] : []);
                                    const newArray = currentArray.filter(id => id !== hiddenStoneModalOptionId);
                                    const next = { ...prev, features: newArray.length > 0 ? newArray : null };
                                    delete next[`hiddenStoneType_${hiddenStoneModalOptionId}`];
                                    delete next[`hiddenStoneColor_${hiddenStoneModalOptionId}`];
                                    return next;
                                });
                                setHiddenStoneModalOptionId(null);
                            }}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label="Close and deselect"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <h3 className="text-xl font-bold text-[#232429] mb-1">{hiddenStoneModalOptionId === 'alternating-stone-type' ? 'Alternating Stone Type' : 'Hidden Stone Options'}</h3>
                        <p className="text-sm text-gray-500 mb-5">{hiddenStoneModalOptionId === 'alternating-stone-type' ? 'Choose the stone type for your alternating stones. You can always update this later in the Additional Information field on the Summary Review page.' : 'You can always update this later in the Additional Information field on the Summary Review page or when in contact with your jewelry professional.'}</p>

                        {hiddenStoneModalOptionId === 'alternating-stone-type' ? (
                            <div className="mb-5">
                                <p className="block text-sm font-medium text-gray-700 mb-3">Alternating Stones</p>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 py-2.5 rounded-lg font-semibold border-2 bg-brand text-white border-brand text-center text-sm">
                                        Diamond
                                    </div>
                                    <span className="text-sm font-medium text-gray-500 shrink-0">and</span>
                                    <div className="flex-1 flex items-center gap-2 border-2 border-gray-200 rounded-lg px-2 py-1.5">
                                        <span className="inline-block w-3 h-3 rounded-full shrink-0 border border-gray-300" style={{ backgroundColor: {
                                            Garnet: '#c41e3a', Amethyst: '#9b59b6', Aquamarine: '#7fffd4',
                                            Diamond: '#e0e0e0', Emerald: '#50c878', Alexandrite: '#4b0082',
                                            Ruby: '#e0115f', Peridot: '#b5b42c', Sapphire: '#0f52ba',
                                            Tourmaline: '#ff69b4', Citrine: '#e4a010', Topaz: '#00688b',
                                            Tanzanite: '#4d5aaf'
                                        }[hiddenStoneColor] || '#ccc' }} />
                                        <select
                                            value={hiddenStoneColor}
                                            onChange={(e) => setHiddenStoneColor(e.target.value)}
                                            className="flex-1 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-brand bg-white min-w-0"
                                        >
                                            {[
                                                { name: 'Garnet' }, { name: 'Amethyst' }, { name: 'Aquamarine' },
                                                { name: 'Emerald' }, { name: 'Alexandrite' }, { name: 'Ruby' },
                                                { name: 'Peridot' }, { name: 'Sapphire' }, { name: 'Tourmaline' },
                                                { name: 'Citrine' }, { name: 'Topaz' }, { name: 'Tanzanite' },
                                            ].map(stone => (
                                                <option key={stone.name} value={stone.name}>{stone.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="mb-5">
                                    <p className="block text-sm font-medium text-gray-700 mb-2">Stone Type</p>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setHiddenStoneType('diamond')}
                                            className={`flex-1 py-2.5 px-3 rounded-lg font-semibold border-2 transition-colors flex flex-col items-center justify-center gap-0.5 ${hiddenStoneType === 'diamond' ? 'bg-brand text-white border-brand' : 'bg-white text-gray-700 border-gray-200 ring-1 ring-gray-200 hover:border-brand hover:ring-brand'}`}
                                        >
                                            <span>Diamond</span>
                                        </button>
                                        <button
                                            onClick={() => setHiddenStoneType('colored-stone')}
                                            className={`flex-1 py-2.5 rounded-lg font-semibold border-2 transition-colors ${hiddenStoneType === 'colored-stone' ? 'bg-brand text-white border-brand' : 'bg-white text-gray-700 border-gray-200 ring-1 ring-gray-200 hover:border-brand hover:ring-brand'}`}
                                        >
                                            Colored Stone
                                        </button>
                                    </div>
                                </div>

                                {hiddenStoneType === 'colored-stone' && (
                                    <div className="mb-5">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">By Birthstone</label>
                                        <div className="flex items-center gap-2">
                                            <span className="inline-block w-4 h-4 rounded-full shrink-0 border border-gray-300" style={{ backgroundColor: {
                                                Garnet: '#c41e3a', Amethyst: '#9b59b6', Aquamarine: '#7fffd4',
                                                Diamond: '#e0e0e0', Emerald: '#50c878', Alexandrite: '#4b0082',
                                                Ruby: '#e0115f', Peridot: '#b5b42c', Sapphire: '#0f52ba',
                                                Tourmaline: '#ff69b4', Citrine: '#e4a010', Topaz: '#00688b',
                                                Tanzanite: '#4d5aaf'
                                            }[hiddenStoneColor] || '#ccc' }} />
                                            <select
                                                value={hiddenStoneColor}
                                                onChange={(e) => setHiddenStoneColor(e.target.value)}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand bg-white"
                                            >
                                                {[
                                                    { name: 'Garnet', color: '#c41e3a' },
                                                    { name: 'Amethyst', color: '#9b59b6' },
                                                    { name: 'Aquamarine', color: '#7fffd4' },
                                                    { name: 'Diamond', color: '#e0e0e0' },
                                                    { name: 'Emerald', color: '#50c878' },
                                                    { name: 'Alexandrite', color: '#4b0082' },
                                                    { name: 'Ruby', color: '#e0115f' },
                                                    { name: 'Peridot', color: '#b5b42c' },
                                                    { name: 'Sapphire', color: '#0f52ba' },
                                                    { name: 'Tourmaline', color: '#ff69b4' },
                                                    { name: 'Citrine', color: '#e4a010' },
                                                    { name: 'Topaz', color: '#ffd700' },
                                                    { name: 'Tanzanite', color: '#4d5aaf' },
                                                ].map(stone => (
                                                    <option key={stone.name} value={stone.name}>{stone.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => {
                                    if (hiddenStoneModalOptionId === 'alternating-stone-type') {
                                        setRingConfiguration(prev => ({
                                            ...prev,
                                            [`hiddenStoneType_${hiddenStoneModalOptionId}`]: 'colored-stone',
                                            [`hiddenStoneColor_${hiddenStoneModalOptionId}`]: hiddenStoneColor,
                                        }));
                                    } else if (hiddenStoneType) {
                                        setRingConfiguration(prev => ({
                                            ...prev,
                                            [`hiddenStoneType_${hiddenStoneModalOptionId}`]: hiddenStoneType,
                                            [`hiddenStoneColor_${hiddenStoneModalOptionId}`]: hiddenStoneType === 'colored-stone' ? hiddenStoneColor : '',
                                            [`hiddenStoneDiamondShape_${hiddenStoneModalOptionId}`]: hiddenStoneType === 'diamond' ? 'Round' : '',
                                        }));
                                    }
                                    setHiddenStoneModalOptionId(null);
                                }}
                                className="w-full py-2.5 bg-brand text-white font-bold rounded-lg hover:bg-brand-dark transition-colors"
                            >
                                {hiddenStoneModalOptionId === 'alternating-stone-type' ? `Save: Diamond and ${hiddenStoneColor} Alternating Stones` : 'Save Hidden Stone Options'}
                            </button>
                            <button
                                onClick={() => {
                                    setRingConfiguration(prev => {
                                        const next = { ...prev };
                                        delete next[`hiddenStoneType_${hiddenStoneModalOptionId}`];
                                        delete next[`hiddenStoneColor_${hiddenStoneModalOptionId}`];
                                        return next;
                                    });
                                    setHiddenStoneModalOptionId(null);
                                }}
                                className="w-full py-2 text-gray-500 text-sm font-medium hover:text-gray-700 transition-colors"
                            >
                                {hiddenStoneModalOptionId === 'alternating-stone-type' ? 'Decide on alternating stone later' : 'Decide on hidden stone options later'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {woodgrainVinesModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex justify-center items-start md:items-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-fade-in-up relative my-8 md:my-auto">
                        <button
                            onClick={() => {
                                setRingConfiguration(prev => {
                                    const current = prev['features'];
                                    const currentArray = Array.isArray(current) ? current : (current ? [current as string] : []);
                                    const newArray = currentArray.filter(id => id !== 'woodgrain-vines');
                                    return { ...prev, features: newArray.length > 0 ? newArray : null, woodgrainVinesChoice: null };
                                });
                                setWoodgrainVinesModalOpen(false);
                            }}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label="Close and deselect"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <h3 className="text-xl font-bold text-[#232429] mb-1">Woodgrain and Vines Options</h3>
                        <p className="text-sm text-gray-500 mb-5">You can always update this later in the Additional Information field on the Summary Review page or when in contact with your jewelry professional.</p>

                        <div className="mb-5">
                            <p className="block text-sm font-medium text-gray-700 mb-2">Select Option</p>
                            <div className="flex gap-2">
                                {([
                                    { value: 'woodgrain', label: 'Woodgrain', price: '$500' },
                                    { value: 'vines', label: 'Vines', price: '$300' },
                                    { value: 'both', label: 'Both', price: '$800' },
                                ] as const).map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setWoodgrainVinesChoice(opt.value)}
                                        className={`flex-1 py-2.5 rounded-lg font-semibold border-2 transition-colors text-sm ${woodgrainVinesChoice === opt.value ? 'bg-brand text-white border-brand' : 'bg-white text-gray-700 border-gray-200 ring-1 ring-gray-200 hover:border-brand hover:ring-brand'}`}
                                    >
                                        {opt.label}<br /><span className="font-normal text-xs">{opt.price}</span>
                                    </button>
                                ))}
                            </div>
                            {(woodgrainVinesChoice === 'woodgrain' || woodgrainVinesChoice === 'both') && (
                                <p className="mt-3 text-sm text-gray-600 bg-gray-50 rounded-lg p-3 border border-gray-200">
                                    <strong>Woodgrain</strong> is a pattern engraved on the band of the ring itself, resembling the natural grain of wood.
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => {
                                    if (woodgrainVinesChoice) {
                                        setRingConfiguration(prev => ({ ...prev, woodgrainVinesChoice }));
                                    }
                                    setWoodgrainVinesModalOpen(false);
                                }}
                                className="w-full py-2.5 bg-brand text-white font-bold rounded-lg hover:bg-brand-dark transition-colors"
                            >
                                Save Options
                            </button>
                            <button
                                onClick={() => {
                                    setRingConfiguration(prev => ({ ...prev, woodgrainVinesChoice: null }));
                                    setWoodgrainVinesModalOpen(false);
                                }}
                                className="w-full py-2 text-gray-500 text-sm font-medium hover:text-gray-700 transition-colors"
                            >
                                Decide on woodgrain and vines options later
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {coloredStoneModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex justify-center items-start md:items-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 animate-fade-in-up relative my-8 md:my-auto">
                        <button
                            onClick={() => {
                                setRingConfiguration(prev => {
                                    const current = prev['stoneShape'];
                                    const arr = Array.isArray(current) ? current : (current ? [current as string] : []);
                                    const next = arr.filter(s => s !== 'colored-stone');
                                    return { ...prev, stoneShape: next.length > 0 ? next : null, coloredStoneType: null, coloredStoneVariety: null };
                                });
                                setColoredStoneModalOpen(false);
                            }}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label="Close and deselect"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <h3 className="text-xl font-bold text-[#232429] mb-1">Choose Your Colored Stone</h3>
                        <p className="text-sm text-gray-500 mb-5">Select a stone type below, then choose a specific variety if applicable.</p>

                        {/* Stone type grid */}
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 mb-5">
                            {COLORED_STONES.map(stone => (
                                <button
                                    key={stone.name}
                                    onClick={() => {
                                        setColoredStoneType(stone.name);
                                        setColoredStoneVariety('');
                                    }}
                                    className={`flex flex-col items-center gap-1 p-1.5 rounded-lg transition-all ${coloredStoneType === stone.name ? 'ring-2 ring-brand bg-brand-light' : 'hover:bg-gray-50'}`}
                                >
                                    <GemSwatch color={stone.color} gradient={stone.gradient} size={36} borderColor={coloredStoneType === stone.name ? '#A6D1E6' : '#d1d5db'} />
                                    <span className="text-[10px] text-center text-gray-700 leading-tight">{stone.name}</span>
                                </button>
                            ))}
                        </div>

                        {/* Sub-variety picker */}
                        {(() => {
                            const selected = COLORED_STONES.find(s => s.name === coloredStoneType);
                            if (!selected || selected.varieties.length === 0) return null;
                            return (
                                <div className="mb-5">
                                    <p className="text-sm font-medium text-gray-700 mb-2">{coloredStoneType} Varieties</p>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                        {selected.varieties.map(v => (
                                            <button
                                                key={v.name}
                                                onClick={() => setColoredStoneVariety(v.name)}
                                                className={`flex flex-col items-center gap-1 p-1.5 rounded-lg transition-all ${coloredStoneVariety === v.name ? 'ring-2 ring-brand bg-brand-light' : 'hover:bg-gray-50'}`}
                                            >
                                                <GemSwatch color={v.color} gradient={v.gradient} size={32} borderColor={coloredStoneVariety === v.name ? '#A6D1E6' : '#d1d5db'} />
                                                <span className="text-[9px] text-center text-gray-700 leading-tight">{v.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Color preview */}
                        {coloredStoneType && (() => {
                            const stone = COLORED_STONES.find(s => s.name === coloredStoneType);
                            if (!stone) return null;
                            const v = coloredStoneVariety ? stone.varieties.find(x => x.name === coloredStoneVariety) : null;
                            return (
                                <div className="flex flex-col items-center mb-5">
                                    <GemSwatch color={v?.color || stone.color} gradient={v?.gradient || stone.gradient} size={64} borderColor="#A6D1E6" />
                                    <p className="text-sm text-gray-600 mt-2">
                                        {coloredStoneVariety || coloredStoneType}
                                    </p>
                                </div>
                            );
                        })()}

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => {
                                    if (coloredStoneType) {
                                        setRingConfiguration(prev => ({ ...prev, coloredStoneType, coloredStoneVariety: coloredStoneVariety || null }));
                                    }
                                    setColoredStoneModalOpen(false);
                                }}
                                disabled={!coloredStoneType}
                                className="w-full py-2.5 bg-brand text-white font-bold rounded-lg hover:bg-brand-dark transition-colors disabled:bg-brand-light disabled:cursor-not-allowed"
                            >
                                Save Stone Selection
                            </button>
                            <button
                                onClick={() => setColoredStoneModalOpen(false)}
                                className="w-full py-2 text-gray-500 text-sm font-medium hover:text-gray-700 transition-colors"
                            >
                                Decide on stone options later
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {stoneShapeModalOpen && (() => {
                const SHAPE_OPTIONS = [
                    { id: 'round',    name: 'Round',    imageUrl: '/images/icons for dia 2/round.png'            },
                    { id: 'princess', name: 'Princess', imageUrl: '/images/icons for dia 2/princess.jpg'         },
                    { id: 'oval',     name: 'Oval',     imageUrl: '/images/icons for dia 2/oval.png'             },
                    { id: 'marquise', name: 'Marquise', imageUrl: '/images/icons for dia 2/marquise centered.png'},
                    { id: 'pear',     name: 'Pear',     imageUrl: '/images/icons for dia 2/pear.png'             },
                    { id: 'cushion',  name: 'Cushion',  imageUrl: '/images/icons for dia 2/cushion.jpg'          },
                    { id: 'emerald',  name: 'Emerald',  imageUrl: '/images/icons for dia 2/emerald.png'          },
                    { id: 'radiant',  name: 'Radiant',  imageUrl: '/images/icons for dia 2/radiant.jpg'          },
                    { id: 'asscher',  name: 'Asscher',  imageUrl: '/images/icons for dia 2/asscher.png'          },
                ];
                const confirmShape = () => {
                    const fromHint = stoneShapeFromHint.current;
                    stoneShapeFromHint.current = false;
                    setRingConfiguration(prev => {
                        const next: string[] = stoneShapeModalSelection ? [stoneShapeModalSelection] : [];
                        if (fromHint && next.length > 0) next.unshift('diamond');
                        return { ...prev, stoneShape: next.length > 0 ? next : null, ...(fromHint ? {} : { stoneOption: null }) };
                    });
                    setStoneShapeModalOpen(false);
                    if (!fromHint && ringConfiguration['baseRing'] === 'build-from-scratch') {
                        setBuildFromScratchPhotoModalOpen(true);
                    }
                };
                const selectedShapeName = SHAPE_OPTIONS.find(s => s.id === stoneShapeModalSelection)?.name;
                const baseRingOption = QUESTIONS.find(q => q.id === 'baseRing')?.options.find((o: { id: string; name: string }) => o.id === ringConfiguration['baseRing']);
                const baseRingShortName = baseRingOption?.name?.split(/\s*[-–]\s*/)[0]?.trim();
                const vowelStart = selectedShapeName && /^[AEIOUaeiou]/.test(selectedShapeName);
                const continueLabel = selectedShapeName && baseRingShortName
                    ? `Select ${vowelStart ? 'an' : 'a'} ${selectedShapeName} with ${baseRingShortName} Base Ring`
                    : 'Continue';
                return (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex justify-center items-start md:items-center p-4 overflow-y-auto">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 animate-fade-in-up relative my-8 md:my-auto">
                            <h3 className="text-xl font-bold text-center text-[#232429] mb-2">Choose Your Stone Shape</h3>
                            <p className="text-sm text-gray-500 text-center mb-5">
                                Any diamond shape can be set into this ring — the style you chose works beautifully with all of them. Select your preferred shape, or decide later. You can also add a colored stone on the next step.
                            </p>
                            <div className="grid grid-cols-4 gap-2 mb-6">
                                {SHAPE_OPTIONS.map(shape => {
                                    const isSelected = stoneShapeModalSelection === shape.id;
                                    return (
                                        <div
                                            key={shape.id}
                                            onClick={() => setStoneShapeModalSelection(isSelected ? null : shape.id)}
                                            className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${isSelected ? 'border-brand shadow-md' : 'border-gray-200 ring-1 ring-gray-200 hover:border-brand'}`}
                                        >
                                            <div className="aspect-square bg-gray-100 overflow-hidden">
                                                <img src={shape.imageUrl} alt={shape.name} className="w-full h-full object-contain" />
                                            </div>
                                            <div className={`text-center py-1.5 text-xs font-medium ${isSelected ? 'bg-brand text-white' : 'bg-transparent text-gray-700'}`}>
                                                {shape.name}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <button
                                onClick={confirmShape}
                                className="w-full py-2.5 bg-brand text-white font-bold rounded-lg hover:bg-brand-dark transition-colors mb-2"
                            >
                                {continueLabel}
                            </button>
                            <button
                                onClick={() => {
                                    setStoneShapeModalSelection(null);
                                    setRingConfiguration(prev => {
                                        const current = prev['stoneShape'];
                                        const arr = Array.isArray(current) ? current : (current ? [current as string] : []);
                                        const hasColored = arr.includes('colored-stone');
                                        return { ...prev, stoneShape: hasColored ? ['colored-stone'] : null };
                                    });
                                    setStoneShapeModalOpen(false);
                                }}
                                className="w-full py-2 text-gray-400 text-sm font-medium hover:text-gray-600 transition-colors"
                            >
                                I'll decide later
                            </button>
                        </div>
                    </div>
                );
            })()}

            {buildFromScratchPhotoModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex justify-center items-start md:items-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-fade-in-up relative my-8 md:my-auto">
                        <h3 className="text-xl font-bold text-[#232429] mb-1">Attach Inspiration Photos</h3>
                        <p className="text-sm text-gray-500 mb-5">Upload any reference images that capture your vision — sketches, screenshots, or rings you love. This is optional and you can always attach photos later on the summary page.</p>

                        <div
                            className={`flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md relative transition-colors ${bfsIsDragging ? 'border-brand bg-brand-light bg-opacity-20' : 'border-gray-300 hover:border-brand bg-gray-50'}`}
                            onDragOver={(e) => { e.preventDefault(); setBfsIsDragging(true); }}
                            onDragLeave={(e) => { e.preventDefault(); setBfsIsDragging(false); }}
                            onDrop={(e) => {
                                e.preventDefault();
                                setBfsIsDragging(false);
                                const dropped = Array.from(e.dataTransfer.files).filter((f: any) => f.type.startsWith('image/'));
                                if (buildFromScratchFiles.length + dropped.length > 5) { alert('Maximum 5 files allowed'); return; }
                                setBuildFromScratchFiles(prev => [...prev, ...dropped]);
                            }}
                        >
                            <div className="space-y-1 text-center pointer-events-none">
                                <svg className={`mx-auto h-10 w-10 ${bfsIsDragging ? 'text-brand' : 'text-gray-400'}`} stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <div className="flex text-sm text-gray-600 justify-center pointer-events-auto">
                                    <label htmlFor="bfs-file-upload" className="relative cursor-pointer rounded-md font-medium text-brand hover:text-brand-dark px-1">
                                        <span>Upload a file</span>
                                        <input id="bfs-file-upload" type="file" className="sr-only" multiple accept="image/*" onChange={(e) => {
                                            const selected = Array.from(e.target.files || []);
                                            if (buildFromScratchFiles.length + selected.length > 5) { alert('Maximum 5 files allowed'); return; }
                                            setBuildFromScratchFiles(prev => [...prev, ...selected]);
                                            e.target.value = '';
                                        }} />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 10MB (max 5)</p>
                            </div>
                        </div>

                        {buildFromScratchFiles.length > 0 && (
                            <div className="mt-3 grid grid-cols-2 gap-2">
                                {buildFromScratchFiles.map((file, idx) => (
                                    <div key={idx} className="relative border rounded p-1 bg-gray-50 flex items-center gap-1">
                                        <p className="text-xs truncate flex-1 text-gray-600 px-1">{file.name}</p>
                                        <button type="button" onClick={() => setBuildFromScratchFiles(prev => prev.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700 bg-white rounded-full shrink-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex flex-col gap-3 mt-5">
                            <button
                                onClick={() => setBuildFromScratchPhotoModalOpen(false)}
                                className="w-full py-2.5 bg-brand text-white font-bold rounded-lg hover:bg-brand-dark transition-colors"
                            >
                                {buildFromScratchFiles.length > 0 ? `Continue with ${buildFromScratchFiles.length} photo${buildFromScratchFiles.length > 1 ? 's' : ''}` : 'Continue'}
                            </button>
                            <button
                                onClick={() => { setBuildFromScratchFiles([]); setBuildFromScratchPhotoModalOpen(false); }}
                                className="w-full py-2 text-gray-400 text-sm font-medium hover:text-gray-600 transition-colors"
                            >
                                Skip — attach photos later
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {otherShapeModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex justify-center items-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-fade-in-up relative">
                        <button
                            onClick={() => {
                                setRingConfiguration(prev => {
                                    const shapeArr = Array.isArray(prev['stoneShape']) ? prev['stoneShape'] as string[] : (prev['stoneShape'] ? [prev['stoneShape'] as string] : []);
                                    const hasPriorDiamondShape = shapeArr.some(s => s !== 'colored-stone' && s !== 'other');
                                    return { ...prev, stoneOption: hasPriorDiamondShape ? 'diamond' : null, otherShapeText: null };
                                });
                                setOtherShapeText('');
                                setOtherShapeModalOpen(false);
                            }}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label="Close and deselect"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <h3 className="text-xl font-bold text-center text-[#232429] mb-2">What diamond shape do you have in mind?</h3>
                        <p className="text-sm text-gray-500 text-center mb-5">Describe the shape or style you're looking for — we'll help you find it.</p>
                        <textarea
                            className="w-full border border-gray-300 rounded-lg p-3 text-sm text-[#232429] resize-none focus:outline-none focus:ring-2 focus:ring-brand"
                            rows={3}
                            placeholder="e.g. hexagonal, kite, trapezoid, fancy cut, old mine cut..."
                            value={otherShapeText}
                            onChange={e => setOtherShapeText(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey && otherShapeText.trim()) {
                                    e.preventDefault();
                                    setRingConfiguration(prev => ({ ...prev, otherShapeText: otherShapeText || null }));
                                    setOtherShapeModalOpen(false);
                                }
                            }}
                            autoFocus
                        />
                        <button
                            onClick={() => {
                                setRingConfiguration(prev => ({ ...prev, otherShapeText: otherShapeText || null }));
                                setOtherShapeModalOpen(false);
                            }}
                            disabled={!otherShapeText.trim()}
                            className="w-full mt-4 py-2.5 bg-brand text-white font-bold rounded-lg hover:bg-brand-dark transition-colors disabled:bg-brand-light disabled:cursor-not-allowed mb-2"
                        >
                            Save
                        </button>
                        <button
                            onClick={() => setOtherShapeModalOpen(false)}
                            className="w-full py-2 text-gray-400 text-sm font-medium hover:text-gray-600 transition-colors"
                        >
                            Skip
                        </button>
                    </div>
                </div>
            )}

            {baseRingModalOption && (
                <BaseRingDetailModal
                    option={baseRingModalOption}
                    fullDescription={QUESTIONS.find(q => q.id === 'baseRing')?.info?.optionsInfo?.find(oi => oi.id === baseRingModalOption.id)?.description}
                    onClose={() => setBaseRingModalOption(null)}
                    onSelect={(optionId, variant) => {
                        setRingConfiguration(prev => ({ ...prev, baseRing: optionId, baseRingLabGrown: null, baseRingVariant: variant || null }));
                        const existing = ringConfiguration['stoneShape'];
                        const existingArr = Array.isArray(existing) ? existing : (existing ? [existing as string] : []);
                        setStoneShapeModalSelection(existingArr.find(s => s !== 'colored-stone') ?? null);
                        setStoneShapeModalOpen(true);
                    }}
                    onSelectLabGrown={(optionId, variant) => {
                        setRingConfiguration(prev => ({ ...prev, baseRing: optionId, baseRingLabGrown: 'true', baseRingVariant: variant || null }));
                        const existing = ringConfiguration['stoneShape'];
                        const existingArr = Array.isArray(existing) ? existing : (existing ? [existing as string] : []);
                        setStoneShapeModalSelection(existingArr.find(s => s !== 'colored-stone') ?? null);
                        setStoneShapeModalOpen(true);
                    }}
                />
            )}

            {/* Budget overlay */}
            {showBudgetOverlay && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center px-5">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 animate-fade-in-up">
                        <h3 className="text-xl font-bold text-center text-[#232429] mb-2">Do you have a budget in mind?</h3>
                        <p className="text-sm text-gray-500 text-center mb-6">This helps us tailor options for you — no pressure if you're not sure yet.</p>
                        {!budgetOverlayExpanded ? (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setBudgetOverlayExpanded(true)}
                                    className="flex-1 py-3 bg-brand text-white font-bold rounded-lg hover:bg-brand-dark transition-colors"
                                >
                                    Yes
                                </button>
                                <button
                                    onClick={() => {
                                        updateSelection('budget', '');
                                        setShowBudgetOverlay(false);
                                        setBudgetOverlayExpanded(false);
                                        setCurrentStep(FORM_STEPS.length);
                                    }}
                                    className="flex-1 py-3 border border-gray-300 text-gray-600 font-bold rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Not yet
                                </button>
                            </div>
                        ) : (
                            <>
                                <select
                                    onChange={e => updateSelection('budget', e.target.value)}
                                    defaultValue=""
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 mb-4 text-base focus:outline-none focus:ring-1 focus:ring-brand"
                                >
                                    <option value="" disabled>Select a range...</option>
                                    {BUDGET_OPTIONS.map(o => (
                                        <option key={o.id} value={o.id}>{o.name}</option>
                                    ))}
                                </select>
                                <button
                                    disabled={!ringConfiguration['budget']}
                                    onClick={() => {
                                        setShowBudgetOverlay(false);
                                        setBudgetOverlayExpanded(false);
                                        setCurrentStep(currentStep >= FORM_STEPS.length ? FORM_STEPS.length : 4);
                                    }}
                                    className="w-full py-3 bg-brand text-white font-bold rounded-lg hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Continue
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const App: React.FC = () => (
    <RingBuilder />
);

export default App;
