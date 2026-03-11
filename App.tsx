import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { ProgressBar } from './components/ProgressBar';
import { QuestionCard } from './components/QuestionCard';
import { DiamondSelector } from './components/DiamondSelector';
import { Summary } from './components/Summary';
import { InfoModal } from './components/InfoModal';
import { BaseRingDetailModal } from './components/BaseRingDetailModal';
import { FORM_STEPS, QUESTIONS } from './constants';
import { RingConfiguration, Question, Option } from './types';
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

    const COLORED_STONES: { name: string; color: string; gradient?: string; varieties: { name: string; color: string; gradient?: string }[] }[] = [
        { name: 'Ruby',        color: '#e0115f', varieties: [
            { name: 'Light Pink Ruby',    color: '#f892b0' },
            { name: 'Medium Ruby',        color: '#e0115f' },
            { name: 'Pigeon Blood',       color: '#9B0000' },
        ]},
        { name: 'Sapphire',    color: '#0f52ba', varieties: [
            { name: 'Royal Blue',        color: '#0a2d8f' },
            { name: 'Deep Blue',         color: '#003580' },
            { name: 'Medium Blue',       color: '#1560bd' },
            { name: 'Light Blue',        color: '#6fa8dc' },
            { name: 'Cornflower Blue',   color: '#6495ed' },
            { name: 'Montana Sapphire',  color: '#4a7b9d' },
            { name: 'Pink Sapphire',     color: '#f4a7b9' },
            { name: 'Yellow Sapphire',   color: '#ffd700' },
            { name: 'Padparadscha',      color: '#f5855a', gradient: 'linear-gradient(135deg, #f57c00 50%, #f48fb1 50%)' },
            { name: 'Green Sapphire',    color: '#4a7c59' },
            { name: 'Purple Sapphire',   color: '#7b2d8b' },
            { name: 'Orange Sapphire',   color: '#f57c00' },
        ]},
        { name: 'Emerald',     color: '#50c878', varieties: [] },
        { name: 'Garnet',      color: '#8B0000', varieties: [
            { name: 'Pyrope Garnet',      color: '#8B0000' },
            { name: 'Rhodolite Garnet',   color: '#C2485A' },
            { name: 'Spessartine Garnet', color: '#D2542E' },
            { name: 'Tsavorite Garnet',   color: '#138808' },
            { name: 'Demantoid Garnet',   color: '#50C878' },
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
            { name: 'Imperial Topaz', color: '#e68a2e' },
            { name: 'London Blue',    color: '#00688b' },
            { name: 'Blue Topaz',     color: '#87ceeb' },
        ]},
        { name: 'Citrine',     color: '#e4a010', varieties: [] },
        { name: 'Alexandrite', color: '#4b0082', gradient: 'linear-gradient(135deg, #2e8b57 50%, #7b2d8b 50%)', varieties: [
            { name: 'Blue-Green (Daylight)',       color: '#2e8b57', gradient: 'linear-gradient(135deg, #1a7a4a 50%, #4169e1 50%)' },
            { name: 'Purple-Red (Incandescent)',   color: '#7b2d8b', gradient: 'linear-gradient(135deg, #7b2d8b 50%, #c0392b 50%)' },
        ]},
        { name: 'Peridot',     color: '#b5b42c', varieties: [] },
        { name: 'Zircon',      color: '#5BA4C7', varieties: [] },
    ];

    const HIDDEN_STONE_IDS = ['hidden-stone-inside', 'hidden-stone-outside', 'hidden-stone-head'];

    useEffect(() => {
        window.scrollTo(0, 0);
        const isSummary = currentStep >= FORM_STEPS.length;
        const title = isSummary ? 'Your Custom Ring' : FORM_STEPS[currentStep]?.title ?? '';
        trackStepView(currentStep, title);
        if (isSummary) trackSummaryView();
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

        if (questionId === 'stoneShape' && optionId !== 'colored-stone') {
            setRingConfiguration(prev => {
                const current = prev['stoneShape'];
                const currentArray = Array.isArray(current) ? current : (current ? [current as string] : []);
                const hasColoredStone = currentArray.includes('colored-stone');
                if (currentArray.includes(optionId)) {
                    // Deselect this shape, keep colored-stone if present
                    const next = hasColoredStone ? ['colored-stone'] : [];
                    return { ...prev, stoneShape: next.length > 0 ? next : null };
                }
                // Replace any existing shape, keep colored-stone
                const next = hasColoredStone ? ['colored-stone', optionId] : [optionId];
                return { ...prev, stoneShape: next };
            });
            return;
        }

        if (questionId === 'stoneShape' && optionId === 'colored-stone') {
            const current = ringConfiguration['stoneShape'];
            const currentArray = Array.isArray(current) ? current : (current ? [current as string] : []);
            if (currentArray.includes('colored-stone')) {
                // Already selected — reopen modal pre-filled
                setColoredStoneType((ringConfiguration['coloredStoneType'] as string) || '');
                setColoredStoneVariety((ringConfiguration['coloredStoneVariety'] as string) || '');
                trackModalOpen('colored_stone', 'colored-stone');
                setColoredStoneModalOpen(true);
            } else {
                updateSelection(questionId, optionId);
                setColoredStoneType('');
                setColoredStoneVariety('');
                trackModalOpen('colored_stone', 'colored-stone');
                setColoredStoneModalOpen(true);
            }
            return;
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

    const handleNext = () => {
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
        const hasColoredStone = stoneShapeArr.includes('colored-stone');
        const hasDiamondShape = stoneShapeArr.some(s => s !== 'colored-stone');
        // Skip diamond requirement only if colored stone selected AND no diamond shape selected
        const skipDiamond = hasColoredStone && !hasDiamondShape;
        return requiredQuestions.some(qId => {
            if (qId === 'diamond' && skipDiamond) return false;
            return !ringConfiguration[qId];
        });
    }, [currentStep, ringConfiguration]);

    const isFormComplete = useMemo(() => {
        const ssVal = ringConfiguration['stoneShape'];
        const ssArr = Array.isArray(ssVal) ? ssVal : (ssVal ? [ssVal as string] : []);
        const skipDiamond = ssArr.includes('colored-stone') && !ssArr.some(s => s !== 'colored-stone');
        return FORM_STEPS.every(step =>
            step.requiredQuestions.every(qId => {
                if (qId === 'diamond' && skipDiamond) return true;
                return !!ringConfiguration[qId];
            })
        );
    }, [ringConfiguration]);

    const renderStepContent = () => {
        if (currentStep >= FORM_STEPS.length) {
            return <Summary configuration={ringConfiguration} onRestart={restart} onEditStep={(stepIndex, overlay) => { setCurrentStep(stepIndex); if (overlay) setPendingOverlay(overlay); }} />;
        }

        const stepInfo = FORM_STEPS[currentStep];
        const questionIds = stepInfo.questionIds;

        if (stepInfo.component === 'DiamondSelector') {
            return <DiamondSelector
                stoneShapeId={(() => { const v = ringConfiguration['stoneShape']; const arr = Array.isArray(v) ? v : (v ? [v as string] : []); return arr.find(s => s !== 'colored-stone') ?? ''; })()}
                selectedDiamondId={ringConfiguration['diamond'] ?? null}
                onSelectDiamond={(diamondId) => updateSelection('diamond', diamondId)}
                onNext={handleNext}
            />;
        }

        return (
            <div className="space-y-12">
                {questionIds.map(qId => {
                    const question = QUESTIONS.find(q => q.id === qId);
                    if (!question) return null;
                    return (
                        <div key={question.id}>
                            {question.id === 'features' && (
                                <p className="text-center text-gray-500 text-sm mb-6">Each selection will override base ring specifications. Leaving this page blank will keep your base ring as is.</p>
                            )}
                            <QuestionCard
                                question={question}
                                selectedValue={ringConfiguration[question.id] ?? null}
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
                            />
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="bg-[#F7F7F7] min-h-screen text-[#232429]">
            <Header />
            <main className="container mx-auto px-4 py-8 md:py-16">
                <div className="max-w-5xl mx-auto">
                    <ProgressBar currentStep={currentStep} totalSteps={FORM_STEPS.length} />
                    <div className="mt-8 md:mt-12">
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

            <footer className="sticky bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-gray-200 z-50">
                <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 max-w-5xl">
                    <div className="flex justify-between items-center">
                        <button
                            onClick={handleBack}
                            disabled={currentStep === 0}
                            className="px-4 sm:px-6 py-2.5 sm:py-3 bg-white text-gray-700 border border-gray-300 font-semibold rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-opacity-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-300 text-sm sm:text-base"
                        >
                            Back
                        </button>
                        {currentStep < FORM_STEPS.length && (
                            <button
                                onClick={handleNext}
                                disabled={isNextDisabled}
                                className="px-6 sm:px-8 py-2.5 sm:py-3 bg-brand text-white font-bold rounded-lg shadow-md hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand focus:ring-opacity-75 disabled:bg-brand-light disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
                            >
                                Next
                            </button>
                        )}
                        {isFormComplete && currentStep < FORM_STEPS.length && (
                            <button
                                onClick={() => setCurrentStep(FORM_STEPS.length)}
                                className="ml-2 sm:ml-4 px-4 sm:px-6 py-2.5 sm:py-3 bg-brand text-white font-bold rounded-lg shadow-md hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand focus:ring-opacity-75 transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
                            >
                                Finish
                            </button>
                        )}
                        <div className="text-sm text-gray-500 hidden md:block">
                            Your design is automatically saved.
                        </div>
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
                                    { value: 'French Script MT', label: 'French Script MT' },
                                    { value: 'Edwardian Script ITC', label: 'Edwardian Script ITC' },
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
                        <h3 className="text-xl font-bold text-[#232429] mb-1">Hidden Stone Options</h3>
                        <p className="text-sm text-gray-500 mb-5">You can always update this later in the Additional Information field on the Summary Review page or when in contact with your jewelry professional.</p>

                        <div className="mb-5">
                            <p className="block text-sm font-medium text-gray-700 mb-2">Stone Type</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setHiddenStoneType('diamond')}
                                    className={`flex-1 py-2.5 rounded-lg font-semibold border-2 transition-colors ${hiddenStoneType === 'diamond' ? 'bg-brand text-white border-brand' : 'bg-white text-gray-700 border-gray-300 hover:border-brand'}`}
                                >
                                    Diamond
                                </button>
                                <button
                                    onClick={() => setHiddenStoneType('colored-stone')}
                                    className={`flex-1 py-2.5 rounded-lg font-semibold border-2 transition-colors ${hiddenStoneType === 'colored-stone' ? 'bg-brand text-white border-brand' : 'bg-white text-gray-700 border-gray-300 hover:border-brand'}`}
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

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => {
                                    if (hiddenStoneType) {
                                        setRingConfiguration(prev => ({
                                            ...prev,
                                            [`hiddenStoneType_${hiddenStoneModalOptionId}`]: hiddenStoneType,
                                            [`hiddenStoneColor_${hiddenStoneModalOptionId}`]: hiddenStoneType === 'colored-stone' ? hiddenStoneColor : '',
                                        }));
                                    }
                                    setHiddenStoneModalOptionId(null);
                                }}
                                className="w-full py-2.5 bg-brand text-white font-bold rounded-lg hover:bg-brand-dark transition-colors"
                            >
                                Save Hidden Stone Options
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
                                Decide on hidden stone options later
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
                                        className={`flex-1 py-2.5 rounded-lg font-semibold border-2 transition-colors text-sm ${woodgrainVinesChoice === opt.value ? 'bg-brand text-white border-brand' : 'bg-white text-gray-700 border-gray-300 hover:border-brand'}`}
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

            {baseRingModalOption && (
                <BaseRingDetailModal
                    option={baseRingModalOption}
                    fullDescription={QUESTIONS.find(q => q.id === 'baseRing')?.info?.optionsInfo?.find(oi => oi.id === baseRingModalOption.id)?.description}
                    onClose={() => setBaseRingModalOption(null)}
                    onSelect={(optionId, variant) => {
                        setRingConfiguration(prev => ({ ...prev, baseRing: optionId, baseRingLabGrown: null, baseRingVariant: variant || null }));
                    }}
                    onSelectLabGrown={(optionId, variant) => {
                        setRingConfiguration(prev => ({ ...prev, baseRing: optionId, baseRingLabGrown: 'true', baseRingVariant: variant || null }));
                    }}
                />
            )}
        </div>
    );
};

const App: React.FC = () => (
    <RingBuilder />
);

export default App;
