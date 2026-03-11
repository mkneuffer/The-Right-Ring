import React from 'react';
import { Question } from '../types';

const BIRTHSTONE_COLORS: Record<string, string> = {
    Garnet: '#c41e3a', Amethyst: '#9b59b6', Aquamarine: '#7fffd4',
    Diamond: '#e0e0e0', Emerald: '#50c878', Alexandrite: '#4b0082',
    Ruby: '#e0115f', Peridot: '#b5b42c', Sapphire: '#0f52ba',
    Tourmaline: '#ff69b4', Citrine: '#e4a010', Topaz: '#00688b',
    Tanzanite: '#4d5aaf',
};

const HIDDEN_STONE_IDS = ['hidden-stone-inside', 'hidden-stone-outside', 'hidden-stone-head'];

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

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, selectedValue, onSelect, onShowInfo, labGrownOptionId, engravingText, engravingFont, hiddenStoneConfig, woodgrainVinesChoice, baseRingVariant, coloredStoneType, coloredStoneVariety }) => {
    return (
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-center gap-2 mb-6">
                <h3 className="text-2xl font-semibold text-[#232429] text-center">{question.text}</h3>
                {question.info && (
                    <button onClick={() => onShowInfo(question.info)} className="text-gray-400 hover:text-brand-dark transition-colors" aria-label={`More info about ${question.text}`}>
                        <InfoIcon className="w-6 h-6" />
                    </button>
                )}
            </div>

            <div className={`grid ${getOptionGridClass(question.options.length)} gap-4`}>
                {question.options.map(option => {
                    const isSelected = Array.isArray(selectedValue)
                        ? selectedValue.includes(option.id)
                        : selectedValue === option.id;

                    return (
                        <div
                            key={option.id}
                            onClick={() => onSelect(option.id)}
                            className={`cursor-pointer group rounded-lg overflow-hidden transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full ${isSelected ? 'ring-2 ring-brand shadow-lg' : 'ring-1 ring-gray-200 hover:ring-brand'}`}
                        >
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
                                            className={`w-full h-full object-cover transition-transform duration-300 ${option.id === 'yellow-gold-platinum-head' ? 'scale-[1.5]' : option.id === 'nelson-style' ? 'scale-[1.8]' : option.id === 'don-style' ? 'scale-[1.6]' : option.id === 'brett-style' ? 'scale-[1.3]' : option.id === 'stephens-style' ? 'scale-[1.3]' : option.id === 'shared-prongs' ? 'scale-[1.4]' : option.id === 'full-bezel-yellow' ? 'scale-[1.4]' : option.id === 'alternating-stone-type' ? 'scale-[1.4]' : option.id === 'full-bezel-platinum' ? 'object-center' : option.id === 'half-moon-bezel-side-diamond' ? 'object-center' : ''}`}
                                        />
                                    )}
                                </div>
                            )}
                            <div className={`p-2 sm:p-3 text-center transition-colors duration-300 flex-grow flex flex-col justify-center ${!option.imageUrl ? 'min-h-[3.5rem] sm:min-h-[4.5rem] py-3 sm:py-4' : ''} ${isSelected ? 'bg-brand' : 'bg-white group-hover:bg-gray-50'}`}>
                                <h4 className={`font-medium text-sm sm:text-base ${isSelected ? 'text-white' : 'text-[#232429]'}`}>{labGrownOptionId && option.id === labGrownOptionId && option.labGrownPrice ? option.name.replace(/\$[\d,]+/, option.labGrownPrice).replace(/with side natural diamonds/i, 'with lab grown side diamonds') : option.name}</h4>
                                {option.subtitle && (
                                    <p className={`text-[10px] sm:text-xs mt-0.5 sm:mt-1 ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>{option.subtitle}</p>
                                )}
                                {option.id === 'written-engraving' && isSelected && engravingText && (
                                    <p className={`text-xs sm:text-sm mt-1 ${isSelected ? 'text-white' : 'text-gray-700'}`} style={{ fontFamily: engravingFont || 'Arial' }}>
                                        {engravingText}
                                    </p>
                                )}
                                {HIDDEN_STONE_IDS.includes(option.id) && isSelected && hiddenStoneConfig?.[`hiddenStoneType_${option.id}`] && (
                                    <div className="flex items-center justify-center gap-1.5 mt-1">
                                        {hiddenStoneConfig[`hiddenStoneType_${option.id}`] === 'colored-stone' && (
                                            <span className="inline-block w-3 h-3 rounded-full shrink-0 border border-white border-opacity-50" style={{ backgroundColor: BIRTHSTONE_COLORS[hiddenStoneConfig[`hiddenStoneColor_${option.id}`]] || '#ccc' }} />
                                        )}
                                        <p className="text-xs text-white">
                                            {hiddenStoneConfig[`hiddenStoneType_${option.id}`] === 'diamond' ? 'Diamond' : hiddenStoneConfig[`hiddenStoneColor_${option.id}`]}
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
                                {option.id === 'colored-stone' && isSelected && coloredStoneType && (
                                    <p className="text-xs text-white mt-1">{coloredStoneVariety || coloredStoneType}</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};