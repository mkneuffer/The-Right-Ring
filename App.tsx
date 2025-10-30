import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { ProgressBar } from './components/ProgressBar';
import { QuestionCard } from './components/QuestionCard';
import { DiamondSelector } from './components/DiamondSelector';
import { Summary } from './components/Summary';
import { InfoModal } from './components/InfoModal';
import { FORM_STEPS, QUESTIONS } from './constants';
import { RingConfiguration, Question } from './types';
import { AuthProvider, useAuth } from './hooks/useAuth';

const RingBuilder: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [ringConfiguration, setRingConfiguration] = useState<RingConfiguration>({});
    const [infoContent, setInfoContent] = useState<Question['info'] | null>(null);
    const { isAuthenticated } = useAuth();

    const updateSelection = (questionId: string, optionId: string | null) => {
        setRingConfiguration(prev => ({
            ...prev,
            [questionId]: optionId
        }));
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

    const renderStepContent = () => {
        if (currentStep >= FORM_STEPS.length) {
            return <Summary configuration={ringConfiguration} onRestart={restart} />;
        }
        
        const stepInfo = FORM_STEPS[currentStep];
        const questionIds = stepInfo.questionIds;

        if (stepInfo.component === 'DiamondSelector') {
            return <DiamondSelector 
                        stoneShapeId={ringConfiguration['stoneShape'] ?? ''} 
                        selectedDiamondId={ringConfiguration['diamond'] ?? null}
                        onSelectDiamond={(diamondId) => updateSelection('diamond', diamondId)}
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
            
            <footer className="sticky bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-gray-200">
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
                         {currentStep >= FORM_STEPS.length && (
                            <div className="text-sm text-gray-500">
                                {isAuthenticated ? "Your design is saved to your account." : "Create an account to save your design."}
                            </div>
                        )}
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
    <AuthProvider>
        <RingBuilder />
    </AuthProvider>
);

export default App;