import React from 'react';
import { RingConfiguration } from '../types';
import { QUESTIONS } from '../constants';
import { MOCK_DIAMONDS } from '../services/diamondApi';

interface SummaryProps {
    configuration: RingConfiguration;
    onRestart: () => void;
}

const getSelectionDetails = (questionId: string, optionId: string | null) => {
    if (!optionId) return { name: 'Not selected', imageUrl: '' };
    
    if (questionId === 'diamond') {
        const diamond = MOCK_DIAMONDS.find(d => d.id === optionId);
        return diamond 
            ? { name: `${diamond.carat}ct ${diamond.shape} Diamond`, imageUrl: diamond.imageUrl, details: `Cut: ${diamond.cut}, Color: ${diamond.color}, Clarity: ${diamond.clarity}` }
            : { name: 'Unknown Diamond', imageUrl: '' };
    }

    const question = QUESTIONS.find(q => q.id === questionId);
    const option = question?.options.find(o => o.id === optionId);

    return option
        ? { name: option.name, imageUrl: option.imageUrl }
        : { name: 'Unknown Selection', imageUrl: '' };
};


export const Summary: React.FC<SummaryProps> = ({ configuration, onRestart }) => {
    const allQuestionIds = [...QUESTIONS.map(q => q.id), 'diamond'];

    return (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 animate-fade-in">
            <h3 className="text-4xl font-bold text-center text-brand-dark mb-8">Your Right Ring</h3>
            <div className="space-y-4">
                {allQuestionIds.map(questionId => {
                    const selection = configuration[questionId];
                    if (!selection) return null;

                    const details = getSelectionDetails(questionId, selection);
                    const questionText = QUESTIONS.find(q => q.id === questionId)?.text.replace(/Step \d+: /, '') || 'Diamond';
                    
                    return (
                        <div key={questionId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                           <div className="flex items-center space-x-4">
                               <img src={details.imageUrl} alt={details.name} className="w-16 h-16 rounded-md object-cover bg-gray-200"/>
                               <div>
                                    <p className="text-sm text-gray-500 font-semibold">{questionText}</p>
                                    <p className="font-bold text-lg text-[#232429]">{details.name}</p>
                                    { 'details' in details && <p className="text-xs text-gray-500">{details.details}</p> }
                               </div>
                           </div>
                        </div>
                    );
                })}
            </div>
            <div className="mt-8 text-center">
                 <button 
                    onClick={onRestart}
                    className="px-8 py-3 bg-brand text-white font-bold rounded-lg shadow-md hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand focus:ring-opacity-75 transition-all duration-300 transform hover:scale-105"
                 >
                    Start a New Design
                 </button>
            </div>
        </div>
    );
};