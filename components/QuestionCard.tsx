import React from 'react';
import { Question } from '../types';

interface QuestionCardProps {
    question: Question;
    selectedValue: string | null;
    onSelect: (optionId: string) => void;
    onShowInfo: (info: Question['info']) => void;
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
        default:
            return 'grid-cols-1 sm:grid-cols-3';
    }
};

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, selectedValue, onSelect, onShowInfo }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-center gap-2 mb-6">
                 <h3 className="text-2xl font-semibold text-[#232429] text-center">{question.text}</h3>
                 {question.info && (
                    <button onClick={() => onShowInfo(question.info)} className="text-gray-400 hover:text-brand-dark transition-colors" aria-label={`More info about ${question.text}`}>
                        <InfoIcon className="w-6 h-6"/>
                    </button>
                 )}
            </div>
           
            <div className={`grid ${getOptionGridClass(question.options.length)} gap-4`}>
                {question.options.map(option => (
                    <div
                        key={option.id}
                        onClick={() => onSelect(option.id)}
                        className={`cursor-pointer group rounded-lg overflow-hidden transition-all duration-300 transform hover:-translate-y-1 ${selectedValue === option.id ? 'ring-2 ring-brand shadow-lg' : 'ring-1 ring-gray-200 hover:ring-brand'}`}
                    >
                        <div className="aspect-square bg-gray-100">
                           <img src={option.imageUrl} alt={option.name} className="w-full h-full object-cover" />
                        </div>
                        <div className={`p-3 text-center transition-colors duration-300 ${selectedValue === option.id ? 'bg-brand' : 'bg-white group-hover:bg-gray-50'}`}>
                            <h4 className={`font-medium text-base ${selectedValue === option.id ? 'text-white' : 'text-[#232429]'}`}>{option.name}</h4>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};