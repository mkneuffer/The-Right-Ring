import React from 'react';
import { FORM_STEPS } from '../constants';

interface ProgressBarProps {
    currentStep: number;
    totalSteps: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps }) => {
    const progressPercentage = currentStep > totalSteps ? 100 : (currentStep / totalSteps) * 100;

    return (
        <div className="w-full">
            <div className="flex justify-between mb-2">
                {FORM_STEPS.map((step, index) => (
                    <div key={index} className="text-center w-1/4">
                        <div className={`text-xs md:text-sm font-semibold ${index <= currentStep ? 'text-brand-dark' : 'text-gray-400'}`}>
                            Step {index + 1}
                        </div>
                         <div className={`text-xs text-gray-500 hidden sm:block ${index <= currentStep ? 'font-medium' : ''}`}>{step.title}</div>
                    </div>
                ))}
                 <div className="text-center w-1/4">
                    <div className={`text-xs md:text-sm font-semibold ${currentStep > totalSteps - 1 ? 'text-brand-dark' : 'text-gray-400'}`}>
                        Summary
                    </div>
                    <div className={`text-xs text-gray-500 hidden sm:block ${currentStep > totalSteps - 1 ? 'font-medium' : ''}`}>Review</div>
                </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                    className="bg-brand h-2.5 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                ></div>
            </div>
        </div>
    );
};