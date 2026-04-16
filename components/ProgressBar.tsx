import React from 'react';
import { FORM_STEPS } from '../constants';

interface ProgressBarProps {
    currentStep: number;
    totalSteps: number;
    onStepClick?: (step: number) => void;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps, onStepClick }) => {
    const progressPercentage = currentStep > totalSteps ? 100 : (currentStep / totalSteps) * 100;

    return (
        <div className="w-full">
            <div className="flex justify-between mb-2">
                {FORM_STEPS.map((step, index) => {
                    const reachable = index < currentStep;
                    return (
                        <div
                            key={index}
                            className={`text-center w-1/4 ${reachable ? 'cursor-pointer group' : ''}`}
                            onClick={() => reachable && onStepClick?.(index)}
                        >
                            <div className={`text-xs md:text-sm font-semibold ${index <= currentStep ? 'text-brand-dark' : 'text-gray-400'} ${reachable ? 'group-hover:underline' : ''}`}>
                                Step {index + 1}
                            </div>
                            <div className={`text-xs text-gray-500 hidden sm:block ${index <= currentStep ? 'font-medium' : ''} ${reachable ? 'group-hover:underline' : ''}`}>{step.title}</div>
                        </div>
                    );
                })}
                <div
                    className={`text-center w-1/4 ${currentStep > totalSteps - 1 && currentStep > totalSteps - 1 ? '' : currentStep >= totalSteps ? 'cursor-pointer group' : ''}`}
                    onClick={() => currentStep > totalSteps && onStepClick?.(totalSteps)}
                >
                    <div className={`text-xs md:text-sm font-semibold ${currentStep > totalSteps - 1 ? 'text-brand-dark' : 'text-gray-400'}`}>
                        Summary
                    </div>
                    <div className={`text-xs text-gray-500 hidden sm:block ${currentStep > totalSteps - 1 ? 'font-medium' : ''}`}>Review</div>
                </div>
            </div>
            <div className="relative w-full">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                        className="bg-brand h-2.5 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>
                {currentStep >= totalSteps ? (
                    <div className="mt-1 text-center sm:text-left sm:transition-all sm:duration-500 sm:ease-out"
                        style={{ paddingLeft: window?.innerWidth >= 640 ? `${Math.min(progressPercentage, 88)}%` : 0 }}>
                        <span className="text-xs font-semibold text-brand-dark whitespace-nowrap">
                            Almost done!
                        </span>
                    </div>
                ) : (
                    <div
                        className="transition-all duration-500 ease-out mt-1"
                        style={{ paddingLeft: `${Math.min(progressPercentage, 92)}%` }}
                    >
                        <span className="text-base font-semibold text-brand-dark whitespace-nowrap">
                            {Math.round(progressPercentage)}%
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};