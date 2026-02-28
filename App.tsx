import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { ProgressBar } from './components/ProgressBar';
import { QuestionCard } from './components/QuestionCard';
import { DiamondSelector } from './components/DiamondSelector';
import { Summary } from './components/Summary';
import { InfoModal } from './components/InfoModal';
import { FORM_STEPS, QUESTIONS } from './constants';
import { RingConfiguration, Question } from './types';
import { useCookie } from './hooks/useCookie';

const RingBuilder: React.FC = () => {
    const [currentStep, setCurrentStep] = useCookie('ringBuilder_currentStep', 0);
    const [ringConfiguration, setRingConfiguration] = useCookie<RingConfiguration>('ringBuilder_configuration', {});
    const [infoContent, setInfoContent] = useState<Question['info'] | null>(null);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [currentStep]);

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

    const handleNext = () => {
        if (currentStep < FORM_STEPS.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
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
        return requiredQuestions.some(qId => !ringConfiguration[qId]);
    }, [currentStep, ringConfiguration]);

    const isFormComplete = useMemo(() => {
        return FORM_STEPS.every(step =>
            step.requiredQuestions.every(qId => ringConfiguration[qId])
        );
    }, [ringConfiguration]);

    const renderStepContent = () => {
        if (currentStep >= FORM_STEPS.length) {
            return <Summary configuration={ringConfiguration} onRestart={restart} onEditStep={(stepIndex) => setCurrentStep(stepIndex)} />;
        }

        const stepInfo = FORM_STEPS[currentStep];
        const questionIds = stepInfo.questionIds;

        if (stepInfo.component === 'DiamondSelector') {
            return <DiamondSelector
                stoneShapeId={ringConfiguration['stoneShape'] ?? ''}
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
                        <QuestionCard
                            key={question.id}
                            question={question}
                            selectedValue={ringConfiguration[question.id] ?? null}
                            onSelect={(optionId) => updateSelection(question.id, optionId)}
                            onShowInfo={(info) => setInfoContent(info)}
                        />
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
                        <h2 className="text-4xl md:text-5xl font-bold text-center text-[#232429] mb-2 tracking-wide">
                            {currentStep < FORM_STEPS.length ? FORM_STEPS[currentStep].title : 'Your Custom Ring'}
                        </h2>
                        <p className="text-gray-500 text-center mb-10">
                            {currentStep < FORM_STEPS.length ? FORM_STEPS[currentStep].description : 'Review your masterpiece.'}
                        </p>
                        {renderStepContent()}
                    </div>
                </div>
            </main>

            <footer className="sticky bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-gray-200 z-50">
                <div className="container mx-auto px-4 py-4 max-w-5xl">
                    <div className="flex justify-between items-center">
                        <button
                            onClick={handleBack}
                            disabled={currentStep === 0}
                            className="px-6 py-3 bg-white text-gray-700 border border-gray-300 font-semibold rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-opacity-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-300"
                        >
                            Back
                        </button>
                        {currentStep < FORM_STEPS.length && (
                            <button
                                onClick={handleNext}
                                disabled={isNextDisabled}
                                className="px-8 py-3 bg-brand text-white font-bold rounded-lg shadow-md hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand focus:ring-opacity-75 disabled:bg-brand-light disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                            >
                                Next
                            </button>
                        )}
                        {isFormComplete && currentStep < FORM_STEPS.length && (
                            <button
                                onClick={() => setCurrentStep(FORM_STEPS.length)}
                                className="ml-4 px-6 py-3 bg-brand text-white font-bold rounded-lg shadow-md hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand focus:ring-opacity-75 transition-all duration-300 transform hover:scale-105"
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
        </div>
    );
};

const App: React.FC = () => (
    <RingBuilder />
);

export default App;
