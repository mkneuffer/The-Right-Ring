import React, { useEffect, useRef, useState } from 'react';
import { RingConfiguration, Diamond } from '../types';
import {
    trackFormStart, trackDepositInitiated,
    trackInquirySubmitted, trackPaymentSuccess,
} from '../analytics';
import { QUESTIONS, FORM_STEPS } from '../constants';
import { getDiamonds } from '../services/diamondApi';
import { calculateDiamondPrice } from '../utils';

interface SummaryProps {
    configuration: RingConfiguration;
    onRestart: () => void;
    onEditStep: (stepIndex: number, overlay?: string) => void;
}

const getBaseRingLabGrownName = (optionName: string, labGrownPrice: string): string => {
    const nameMatch = optionName.match(/^(.*?)\s*-\s*(.*?)\s*-\s*\$.*$/);
    if (nameMatch) {
        return `${nameMatch[1]} - ${nameMatch[2]} - with Lab Grown Side Diamonds ${labGrownPrice}`;
    }
    return optionName;
};

const TACORIE_VARIANT_LABELS: Record<string, { label: string; price: string }> = {
    'pink-natural':    { label: 'with natural pink diamonds (as shown)', price: '$18,500' },
    'clear-natural':   { label: 'with all natural clear diamonds',        price: '$4,000'  },
    'clear-lab-grown': { label: 'with all clear Lab Grown diamonds',      price: '$3,300'  },
    'pink-lab-grown':  { label: 'with Lab Grown pink diamonds (as shown)', price: '$3,500' },
};

const applyBaseRingVariant = (name: string, configuration: RingConfiguration, optionId: string): string => {
    const variant = configuration['baseRingVariant'] as string | null;
    if (optionId !== 'tacorie-style') {
        // non-tacorie: legacy lab grown label
        if (configuration['baseRingLabGrown'] === 'true') {
            const option = QUESTIONS.find(q => q.id === 'baseRing')?.options.find(o => o.id === optionId);
            if (option?.labGrownPrice) return getBaseRingLabGrownName(name, option.labGrownPrice);
        }
        return name;
    }
    // tacorie
    if (variant && TACORIE_VARIANT_LABELS[variant]) {
        const v = TACORIE_VARIANT_LABELS[variant];
        const baseName = name.match(/^(.*?)\s*-/)?.[1]?.trim() || name;
        return `${baseName} - ${v.label} (${v.price})`;
    }
    return name;
};

const getSelectionDetails = (questionId: string, selection: string | string[] | null) => {
    if (!selection) return { name: 'Not selected', imageUrl: '' };

    const question = QUESTIONS.find(q => q.id === questionId);

    if (Array.isArray(selection)) {
        if (selection.length === 0) return { name: 'Not selected', imageUrl: '' };
        const selectedOptions = question?.options.filter(o => selection.includes(o.id)) || [];
        const names = selectedOptions.map(o => o.name).join(', ');
        const imageUrl = selectedOptions[0]?.imageUrl || '';
        return { name: names, imageUrl };
    }

    const option = question?.options.find(o => o.id === selection);

    return option
        ? { name: option.name, imageUrl: option.imageUrl || '' }
        : { name: 'Unknown Selection', imageUrl: '' };
};

const BudgetIcon = () => (
    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-md bg-brand-light flex items-center justify-center text-brand-dark shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 sm:w-8 sm:h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
    </div>
);

const ColoredStoneIcon = () => (
    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-md bg-brand-light flex items-center justify-center text-brand-dark shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6 sm:w-8 sm:h-8">
            <polygon points="12,2 20,8 17,18 7,18 4,8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            <polygon points="12,2 20,8 12,6 4,8" fill="currentColor" opacity="0.3"/>
            <polygon points="12,6 20,8 17,18 7,18 4,8" fill="currentColor" opacity="0.15"/>
        </svg>
    </div>
);

const EngravingIcon = () => (
    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-md bg-brand-light flex items-center justify-center text-brand-dark shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 sm:w-8 sm:h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
        </svg>
    </div>
);

const BIRTHSTONE_COLORS: Record<string, string> = {
    Garnet: '#c41e3a', Amethyst: '#9b59b6', Aquamarine: '#7fffd4',
    Diamond: '#e0e0e0', Emerald: '#50c878', Alexandrite: '#4b0082',
    Ruby: '#e0115f', Peridot: '#b5b42c', Sapphire: '#0f52ba',
    Tourmaline: '#ff69b4', Citrine: '#e4a010', Topaz: '#00688b',
    Tanzanite: '#4d5aaf',
};

const HIDDEN_STONE_OPTIONS = [
    { id: 'hidden-stone-inside', label: 'Hidden Stone (Inside)' },
    { id: 'hidden-stone-outside', label: 'Hidden Stone (Outside)' },
    { id: 'hidden-stone-head', label: 'Hidden Stone (Head)' },
];

const HiddenStoneIcon = ({ color }: { color?: string }) => (
    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-md bg-brand-light flex items-center justify-center text-brand-dark relative shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6 sm:w-8 sm:h-8">
            <polygon points="12,2 20,8 17,18 7,18 4,8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            <polygon points="12,2 20,8 12,6 4,8" fill="currentColor" opacity="0.3"/>
            <polygon points="12,6 20,8 17,18 7,18 4,8" fill={color || 'currentColor'} opacity={color ? '0.8' : '0.15'}/>
        </svg>
    </div>
);

const OtherDiamondIcon = () => (
    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-md bg-brand-light flex items-center justify-center text-brand-dark shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6 sm:w-8 sm:h-8">
            <polygon points="12,2 20,8 17,18 7,18 4,8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            <polygon points="12,2 20,8 12,6 4,8" fill="currentColor" opacity="0.3"/>
            <polygon points="12,6 20,8 17,18 7,18 4,8" fill="currentColor" opacity="0.15"/>
            <text x="12" y="14.5" textAnchor="middle" fontSize="7" fontWeight="bold" fill="currentColor" fontFamily="sans-serif">?</text>
        </svg>
    </div>
);

export const Summary: React.FC<SummaryProps> = ({ configuration, onRestart, onEditStep }) => {
    const [selectedDiamond, setSelectedDiamond] = useState<Diamond | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isModalOpen]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        ringSize: '',
        address: '',
        info: ''
    });
    const formStartedRef = useRef(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<{ success: boolean; message: string } | null>(null);
    const [files, setFiles] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    const allQuestionIds = [...QUESTIONS.map(q => q.id), 'diamond'];

    useEffect(() => {
        const fetchDiamond = async () => {
            const diamondId = configuration['diamond'];
            if (diamondId && diamondId !== 'EXPERT_SELECTION' && diamondId !== 'CUSTOMER_STONE') {
                const diamonds = await getDiamonds();

                // Find the diamond directly by ID
                const found = diamonds.find(d => d.Stock_No === diamondId);
                if (found) {
                    setSelectedDiamond(found);
                }
            }
        };
        fetchDiamond();
    }, [configuration]);

    const [pendingConfirmation, setPendingConfirmation] = useState(false);

    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        if (query.get('payment_success') === 'true') {
            const savedData = localStorage.getItem('ring_formData');
            if (savedData) {
                const parsed = JSON.parse(savedData);
                setFormData(parsed); // Restore UI
                setPendingConfirmation(true);
            }
        }
    }, []);

    useEffect(() => {
        if (pendingConfirmation) {
            // Check if diamond logic is ready
            const needsDiamond = configuration['diamond'] && configuration['diamond'] !== 'EXPERT_SELECTION' && configuration['diamond'] !== 'CUSTOMER_STONE';
            if (needsDiamond && !selectedDiamond) {
                // Diamond data is still fetching... wait.
                return;
            }

            const savedData = localStorage.getItem('ring_formData');
            if (savedData) {
                const parsed = JSON.parse(savedData);
                handleSubmit('confirmation_email', parsed);
                localStorage.removeItem('ring_formData');
                // Clean URL
                window.history.replaceState({}, document.title, window.location.pathname);
            }
            setPendingConfirmation(false);
        }
    }, [pendingConfirmation, selectedDiamond, configuration]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!formStartedRef.current) {
            formStartedRef.current = true;
            trackFormStart();
        }
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFiles = Array.from(e.dataTransfer.files).filter((file: any) => file.type.startsWith('image/'));
        if (files.length + droppedFiles.length > 5) {
            alert('Maximum 5 files allowed');
            return;
        }
        setFiles(prev => [...prev, ...droppedFiles]);
    };

    const handleSubmit = async (paymentMode: 'deposit' | 'inquiry' | 'confirmation_email', dataOverride?: typeof formData) => {
        const data = dataOverride || formData;

        setIsSubmitting(true);
        setSubmitStatus(null);

        // Build detailed selections with images
        const selections = allQuestionIds.map(questionId => {
            const selection = configuration[questionId];
            if (!selection) return null;

            if (questionId === 'diamond') {
                if (selection === 'EXPERT_SELECTION') {
                    return {
                        questionId,
                        questionText: 'Diamond',
                        name: 'Expert Selection Requested',
                        imageUrl: 'https://via.placeholder.com/150?text=Expert+Help', // Or a specific asset
                        details: 'Our gem experts will contact you with curated options.',
                        diamondData: null // No specific diamond data
                    };
                } else if (selection === 'CUSTOMER_STONE') {
                    return {
                        questionId,
                        questionText: 'Diamond',
                        name: 'Customer Provided Stone',
                        imageUrl: 'https://via.placeholder.com/150?text=Own+Stone', // Or a specific asset
                        details: 'I have a stone I would like to use.',
                        diamondData: null
                    };
                } else if (selectedDiamond) {
                    const weight = parseFloat(selectedDiamond.Weight) || 0;
                    const price = calculateDiamondPrice(selectedDiamond);
                    return {
                        questionId,
                        questionText: 'Diamond',
                        name: `${weight.toFixed(2)} Carat ${selectedDiamond.Shape} Diamond`,
                        imageUrl: selectedDiamond.ImageLink || '',
                        details: `$${price.toLocaleString()} - ${selectedDiamond.Color} Color, ${selectedDiamond.Clarity} Clarity`,
                        diamondData: {
                            stockNo: selectedDiamond.Stock_No,
                            weight: weight,
                            shape: selectedDiamond.Shape,
                            color: selectedDiamond.Color,
                            clarity: selectedDiamond.Clarity,
                            cut: selectedDiamond.Cut_Grade,
                            price: price,
                            imageLink: selectedDiamond.ImageLink,
                            videoLink: selectedDiamond.VideoLink,
                            certificateLink: selectedDiamond.CertificateLink
                        }
                    };
                }
                return null;
            } else {
                const details = getSelectionDetails(questionId, selection);
                let displayName = details.name;
                if (questionId === 'baseRing' && typeof selection === 'string') {
                    displayName = applyBaseRingVariant(details.name, configuration, selection);
                }
                const questionText = QUESTIONS.find(q => q.id === questionId)?.text.replace(/Step \d+: /, '') || questionId;
                return {
                    questionId,
                    questionText,
                    name: displayName,
                    imageUrl: details.imageUrl,
                    details: ''
                };
            }
        }).filter(s => s !== null);

        const stoneShapeConfig = configuration['stoneShape'];
        const stoneShapeConfigArr = Array.isArray(stoneShapeConfig) ? stoneShapeConfig : (stoneShapeConfig ? [stoneShapeConfig as string] : []);
        if (stoneShapeConfigArr.includes('colored-stone') && configuration['coloredStoneType']) {
            const stoneType = configuration['coloredStoneType'] as string;
            const stoneVariety = configuration['coloredStoneVariety'] as string;
            selections.push({
                questionId: 'coloredStoneSelection',
                questionText: 'Colored Stone',
                name: stoneVariety || stoneType,
                imageUrl: '',
                details: stoneVariety ? stoneType : ''
            });
        }

        if (data.ringSize) {
            selections.push({
                questionId: 'ringSize',
                questionText: 'Ring Size',
                name: data.ringSize,
                imageUrl: '',
                details: ''
            });
        }

        if (configuration['engravingText']) {
            selections.push({
                questionId: 'engravingText',
                questionText: 'Written Engraving',
                name: configuration['engravingText'] as string,
                imageUrl: '',
                details: `Font: ${configuration['engravingFont'] || 'Arial'}`
            });
        }

        HIDDEN_STONE_OPTIONS.forEach(({ id, label }) => {
            const stoneType = configuration[`hiddenStoneType_${id}`] as string;
            if (stoneType) {
                const stoneColor = configuration[`hiddenStoneColor_${id}`] as string;
                selections.push({
                    questionId: `hiddenStone_${id}`,
                    questionText: label,
                    name: stoneType === 'diamond' ? 'Diamond' : stoneColor,
                    imageUrl: '',
                    details: stoneType === 'colored-stone' ? 'Colored Stone (Birthstone)' : 'Natural/Lab Diamond'
                });
            }
        });

        if (configuration['woodgrainVinesChoice']) {
            const choice = configuration['woodgrainVinesChoice'] as string;
            selections.push({
                questionId: 'woodgrainVinesChoice',
                questionText: 'Woodgrain and Vines',
                name: choice === 'woodgrain' ? 'Woodgrain' : choice === 'vines' ? 'Vines' : 'Both (Woodgrain & Vines)',
                imageUrl: '',
                details: choice === 'woodgrain' ? '$500' : choice === 'vines' ? '$300' : '$800'
            });
        }

        console.log('Selections being sent:', selections);
        console.log('Configuration:', configuration);

        try {
            // 1. Submit design to backend (always)
            const formDataToSend = new FormData();

            // Append all non-file data as a JSON string
            formDataToSend.append('payload', JSON.stringify({
                ...data,
                design: configuration,
                selections: selections,
                paymentMode: paymentMode
            }));

            // Append files
            files.forEach((file, index) => {
                formDataToSend.append(`attachments[]`, file);
            });

            const response = await fetch('/submit_design.php', {
                method: 'POST',
                body: formDataToSend,
            });

            const result = await response.json();
            console.log('Server response:', result);

            if (result.success) {
                if (paymentMode === 'deposit') {
                    trackDepositInitiated();
                    // Save data before redirect
                    localStorage.setItem('ring_formData', JSON.stringify(data));

                    // 2. If deposit, initiate Stripe Checkout
                    const stripeResponse = await fetch('/create_payment_session.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            email: data.email,
                            name: data.name
                        }),
                    });

                    const stripeResult = await stripeResponse.json();

                    if (stripeResult.success && stripeResult.url) {
                        window.location.href = stripeResult.url;
                    } else {
                        setSubmitStatus({ success: false, message: stripeResult.message || 'Payment initiation failed. Your design was saved.' });
                    }

                } else if (paymentMode === 'confirmation_email') {
                    // 3b. Post-payment confirmation
                    trackPaymentSuccess();
                    setSubmitStatus({ success: true, message: 'Payment confirmed! Your design has been submitted successfully. Check your email.' });
                    setIsModalOpen(true); // Ensure modal is open to show message
                    setTimeout(() => {
                        setIsModalOpen(false);
                        onRestart();
                    }, 5000);
                } else {
                    // 3. If inquiry, standard success
                    trackInquirySubmitted();
                    setSubmitStatus({ success: true, message: 'Thank you! Your design has been submitted successfully. Check your email for a summary.' });
                    setTimeout(() => {
                        setIsModalOpen(false);
                        onRestart();
                    }, 3000);
                }
            } else {
                setSubmitStatus({ success: false, message: result.message || 'Something went wrong. Please try again.' });
            }
        } catch (error) {
            console.error('Submission error:', error);
            setSubmitStatus({ success: false, message: 'Network error. Please try again later.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl shadow-sm border border-gray-200 animate-fade-in">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-brand-dark mb-6 sm:mb-8">Your Right Ring</h3>
            <div className="space-y-4">
                {allQuestionIds.map(questionId => {
                    const selection = configuration[questionId];
                    if (!selection) return null;

                    let details: { name: string; imageUrl: string; details?: string } = { name: '', imageUrl: '' };

                    if (questionId === 'diamond') {
                        if (selection === 'EXPERT_SELECTION') {
                            details = {
                                name: 'Expert Selection',
                                imageUrl: '', // Can be empty or placeholder
                                details: 'Our experts will help you find the perfect diamond.'
                            };
                        } else if (selection === 'CUSTOMER_STONE') {
                            details = {
                                name: 'Own Stone',
                                imageUrl: '',
                                details: 'Using customer provided stone.'
                            };
                        } else if (selectedDiamond) {
                            const weight = parseFloat(selectedDiamond.Weight) || 0;
                            const price = calculateDiamondPrice(selectedDiamond);
                            details = {
                                name: `${weight.toFixed(2)} Carat ${selectedDiamond.Shape} Diamond`,
                                imageUrl: selectedDiamond.ImageLink || 'https://via.placeholder.com/150',
                                details: `$${price.toLocaleString()} - ${selectedDiamond.Color} Color, ${selectedDiamond.Clarity} Clarity`
                            };
                        } else {
                            details = { name: 'Loading Diamond...', imageUrl: '' };
                        }
                    } else {
                        if (questionId === 'stoneShape' && Array.isArray(selection)) {
                            // Show only the diamond shapes, not 'colored-stone'
                            const diamondShapes = selection.filter(s => s !== 'colored-stone');
                            details = getSelectionDetails(questionId, diamondShapes.length > 0 ? diamondShapes : selection);
                        } else {
                            details = getSelectionDetails(questionId, selection);
                        }
                        if (questionId === 'baseRing' && typeof selection === 'string') {
                            details = { ...details, name: applyBaseRingVariant(details.name, configuration, selection) };
                        }
                    }

                    const questionText = QUESTIONS.find(q => q.id === questionId)?.text.replace(/Step \d+: /, '') || 'Diamond';

                    const stepIndex = FORM_STEPS.findIndex(step =>
                        step.questionIds.includes(questionId) || (questionId === 'diamond' && step.component === 'DiamondSelector')
                    );

                    const featuresStepIndex = FORM_STEPS.findIndex(step => step.questionIds?.includes('features'));

                    const mainRow = (
                        <div
                            onClick={() => stepIndex !== -1 && onEditStep(stepIndex)}
                            className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:border-brand hover:shadow-md transition-all duration-200"
                        >
                            <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                                {questionId === 'budget' ? (
                                    <BudgetIcon />
                                ) : (questionId === 'stoneShape' && Array.isArray(selection) && selection.every(s => s === 'colored-stone')) ? (
                                    <ColoredStoneIcon />
                                ) : (questionId === 'stoneShape' && (selection === 'other' || (Array.isArray(selection) && selection.includes('other') && !selection.some(s => s !== 'other' && s !== 'colored-stone')))) ? (
                                    <OtherDiamondIcon />
                                ) : (questionId === 'diamond' && (selection === 'EXPERT_SELECTION' || selection === 'CUSTOMER_STONE')) ? (
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-md bg-brand-light flex items-center justify-center text-brand-dark shrink-0">
                                        {selection === 'EXPERT_SELECTION' ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 sm:w-8 sm:h-8">
                                                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 sm:w-8 sm:h-8">
                                                <path d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 9a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25V15a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25V9z" />
                                            </svg>
                                        )}
                                    </div>
                                ) : (
                                    <img
                                        src={details.imageUrl}
                                        alt={details.name}
                                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-md object-cover bg-gray-200 shrink-0"
                                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Image'; }}
                                    />
                                )}
                                <div className="min-w-0">
                                    <p className="text-xs sm:text-sm text-gray-500 font-semibold">{questionText}</p>
                                    <p className="font-bold text-sm sm:text-lg text-[#232429] break-words">{details.name}</p>
                                    {details.details && <p className="text-[10px] sm:text-xs text-gray-500">{details.details}</p>}
                                </div>
                            </div>
                        </div>
                    );

                    const stoneShapeArr = Array.isArray(selection) ? selection : (selection ? [selection as string] : []);
                    if (questionId === 'stoneShape' && stoneShapeArr.includes('colored-stone') && configuration['coloredStoneType']) {
                        const stoneType = configuration['coloredStoneType'] as string;
                        const stoneVariety = configuration['coloredStoneVariety'] as string;
                        const stoneStepIndex = stepIndex;
                        return (
                            <React.Fragment key={questionId}>
                                {mainRow}
                                <div
                                    onClick={() => stoneStepIndex !== -1 && onEditStep(stoneStepIndex)}
                                    className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:border-brand hover:shadow-md transition-all duration-200"
                                >
                                    <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                                        <ColoredStoneIcon />
                                        <div className="min-w-0">
                                            <p className="text-xs sm:text-sm text-gray-500 font-semibold">Colored Stone Selection</p>
                                            <p className="font-bold text-sm sm:text-lg text-[#232429]">{stoneVariety || stoneType}</p>
                                            {stoneVariety && <p className="text-[10px] sm:text-xs text-gray-500">{stoneType}</p>}
                                        </div>
                                    </div>
                                </div>
                            </React.Fragment>
                        );
                    }

                    if (questionId !== 'features') return <React.Fragment key={questionId}>{mainRow}</React.Fragment>;

                    // Render overlay-configured feature details right after the features row
                    return (
                        <React.Fragment key={questionId}>
                            {mainRow}

                            {configuration['engravingText'] && (
                                <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:border-brand hover:shadow-md transition-all duration-200"
                                    onClick={() => onEditStep(featuresStepIndex, 'written-engraving')}
                                >
                                    <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                                        <EngravingIcon />
                                        <div className="min-w-0">
                                            <p className="text-xs sm:text-sm text-gray-500 font-semibold">Written Engraving</p>
                                            <p className="font-bold text-sm sm:text-lg text-[#232429] break-words" style={{ fontFamily: configuration['engravingFont'] as string || 'Arial' }}>
                                                {configuration['engravingText'] as string}
                                            </p>
                                            <p className="text-[10px] sm:text-xs text-gray-500">Font: {configuration['engravingFont'] as string || 'Arial'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {HIDDEN_STONE_OPTIONS.map(({ id, label }) => {
                                const stoneType = configuration[`hiddenStoneType_${id}`] as string;
                                if (!stoneType) return null;
                                const stoneColor = configuration[`hiddenStoneColor_${id}`] as string;
                                const color = stoneType === 'colored-stone' ? BIRTHSTONE_COLORS[stoneColor] : undefined;
                                return (
                                    <div
                                        key={id}
                                        onClick={() => onEditStep(featuresStepIndex, id)}
                                        className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:border-brand hover:shadow-md transition-all duration-200"
                                    >
                                        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                                            <HiddenStoneIcon color={color} />
                                            <div className="min-w-0">
                                                <p className="text-xs sm:text-sm text-gray-500 font-semibold">{label}</p>
                                                <p className="font-bold text-sm sm:text-lg text-[#232429] flex items-center gap-2">
                                                    {stoneType === 'colored-stone' && (
                                                        <span className="inline-block w-3 h-3 rounded-full shrink-0 border border-gray-300" style={{ backgroundColor: color }} />
                                                    )}
                                                    {stoneType === 'diamond' ? 'Diamond' : stoneColor}
                                                </p>
                                                <p className="text-[10px] sm:text-xs text-gray-500">{stoneType === 'colored-stone' ? 'Colored Stone (Birthstone)' : 'Natural/Lab Diamond'}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {configuration['woodgrainVinesChoice'] && (() => {
                                const choice = configuration['woodgrainVinesChoice'] as string;
                                return (
                                    <div
                                        onClick={() => onEditStep(featuresStepIndex, 'woodgrain-vines')}
                                        className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:border-brand hover:shadow-md transition-all duration-200"
                                    >
                                        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                                            <EngravingIcon />
                                            <div className="min-w-0">
                                                <p className="text-xs sm:text-sm text-gray-500 font-semibold">Woodgrain and Vines</p>
                                                <p className="font-bold text-sm sm:text-lg text-[#232429]">
                                                    {choice === 'woodgrain' ? 'Woodgrain' : choice === 'vines' ? 'Vines' : 'Both (Woodgrain & Vines)'}
                                                </p>
                                                <p className="text-[10px] sm:text-xs text-gray-500">{choice === 'woodgrain' ? '$500' : choice === 'vines' ? '$300' : '$800'}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </React.Fragment>
                    );
                })}
            </div>
            <div className="mt-8 text-center">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-8 py-3 bg-brand text-white font-bold rounded-lg shadow-md hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand focus:ring-opacity-75 transition-all duration-300 transform hover:scale-105"
                >
                    Submit Your Design
                </button>
            </div>

            {/* Submission Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex justify-center items-start overflow-hidden">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg relative animate-fade-in-up my-6 mx-5 sm:mx-8 overflow-y-auto overscroll-contain" style={{WebkitOverflowScrolling: 'touch', maxHeight: 'calc(100dvh - 3rem)'}}><div className="p-6 pb-16 sm:pb-6">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <h3 className="text-2xl font-bold text-center mb-6">Finalize Your Design</h3>

                        {submitStatus && (
                            <div className={`mb-4 p-3 rounded text-sm ${submitStatus.success ? 'bg-brand-light text-brand-dark' : 'bg-red-100 text-red-700'}`}>
                                {submitStatus.message}
                            </div>
                        )}

                        {!submitStatus?.success && (
                            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        autoComplete="name"
                                        required
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand text-base"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        autoComplete="email"
                                        required
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand text-base"
                                        placeholder="john@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        autoComplete="tel"
                                        required
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand text-base"
                                        placeholder="(555) 123-4567"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                    <input
                                        type="text"
                                        name="address"
                                        autoComplete="street-address"
                                        required
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand text-base"
                                        placeholder="123 Main St, City, State, ZIP"
                                    />
                                </div>
                                <p className="text-sm text-gray-500 italic text-center">(nothing will be sent without your approval)</p>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ring Size <span className="text-gray-400 font-normal">(optional)</span></label>
                                    <select
                                        name="ringSize"
                                        value={formData.ringSize}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand bg-white text-base"
                                    >
                                        <option value="">Select a ring size</option>
                                        <option value="I don't know the ring size yet">I don't know the ring size yet</option>
                                        <option value="Send me a free plastic ring sizer">Send me a free plastic ring sizer</option>
                                        {(() => {
                                            const sizes = [];
                                            const fractions = ['', ' 1/8', ' 1/4', ' 3/8', ' 1/2', ' 5/8', ' 3/4', ' 7/8'];
                                            for (let i = 24; i <= 96; i++) {
                                                const whole = Math.floor(i / 8);
                                                const eighth = i % 8;
                                                if (eighth === 0 && i > 24) {
                                                    sizes.push(<option key={`sep-${i}`} disabled value="">──────</option>);
                                                }
                                                sizes.push(<option key={i} value={`${whole}${fractions[eighth]}`}>{whole}{fractions[eighth]}</option>);
                                            }
                                            return sizes;
                                        })()}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Additional Information</label>
                                    <textarea
                                        name="info"
                                        rows={3}
                                        value={formData.info}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand text-base"
                                        placeholder="Any specific requests or questions? Write your engraving text here"
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Upload Inspiration Photos</label>
                                    <div
                                        className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md relative transition-colors ${isDragging
                                            ? 'border-brand bg-brand-light bg-opacity-20'
                                            : 'border-gray-300 hover:border-brand bg-gray-50'
                                            }`}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                    >
                                        <div className="space-y-1 text-center pointer-events-none">
                                            <svg className={`mx-auto h-12 w-12 ${isDragging ? 'text-brand' : 'text-gray-400'}`} stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            <div className="flex text-sm text-gray-600 justify-center pointer-events-auto">
                                                <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-brand hover:text-brand-dark focus-within:outline-none px-1">
                                                    <span>Upload a file</span>
                                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple accept="image/*" onChange={(e) => {
                                                        const selectedFiles = Array.from(e.target.files || []);
                                                        if (files.length + selectedFiles.length > 5) {
                                                            alert('Maximum 5 files allowed');
                                                            return;
                                                        }
                                                        setFiles([...files, ...selectedFiles]);
                                                    }} />
                                                </label>
                                                <p className="pl-1">or drag and drop</p>
                                            </div>
                                            <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 10MB</p>
                                        </div>
                                    </div>

                                    {files.length > 0 && (
                                        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {files.map((file, idx) => (
                                                <div key={idx} className="relative group border rounded p-1 bg-gray-50">
                                                    <p className="text-xs truncate w-full pr-6 text-gray-600 pt-1 pb-1 px-1">{file.name}</p>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFiles(files.filter((_, i) => i !== idx))}
                                                        className="absolute top-1 right-1 text-red-500 hover:text-red-700 bg-white rounded-full"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <h4 className="font-semibold text-lg text-gray-900 mb-2">Design Deposit</h4>
                                    <p className="text-sm text-gray-600 mb-4">
                                        A <strong>$500 deposit</strong> is required to begin the custom design process for your unique ring. This standard deposit ensures our designers can prioritize your vision. In the rare case of a cancellation the design fee portion ($250) is non-refundable. The deposit payment goes toward your final payment. Let us bring your design to life!
                                    </p>
                                    <p className="text-sm text-gray-500 mb-6 italic">
                                        Note: If you prefer to submit an inquiry without a deposit, our team will contact you to discuss your ideas; however, design work will not commence until the deposit is received.
                                    </p>

                                    <div className="flex flex-col gap-3">
                                        <button
                                            type="button"
                                            onClick={() => handleSubmit('deposit')}
                                            disabled={isSubmitting || !formData.name || !formData.email || !formData.phone}
                                            className="w-full py-4 bg-brand-dark text-white font-extrabold text-lg rounded-xl shadow-lg hover:bg-brand focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 ring-2 ring-brand ring-offset-2"
                                        >
                                            {isSubmitting ? (
                                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            ) : (
                                                <>
                                                    <span>Submit & Pay $500 Deposit</span>
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                                                    </svg>
                                                </>

                                            )}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleSubmit('inquiry')}
                                            disabled={isSubmitting || !formData.name || !formData.email || !formData.phone}
                                            className="w-full py-2 bg-transparent text-gray-400 text-sm font-medium hover:text-gray-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Submit Inquiry Only (No Deposit)
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}
                    </div></div>
                </div>
            )}
        </div>
    );
};