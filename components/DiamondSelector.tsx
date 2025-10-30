import React, { useState, useEffect } from 'react';
import { Diamond } from '../types';
import { fetchDiamonds } from '../services/diamondApi';
import { DiamondDetailModal } from './DiamondDetailModal';

interface DiamondSelectorProps {
    stoneShapeId: string;
    selectedDiamondId: string | null;
    onSelectDiamond: (diamondId: string) => void;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-brand"></div>
    </div>
);

export const DiamondSelector: React.FC<DiamondSelectorProps> = ({ stoneShapeId, selectedDiamondId, onSelectDiamond }) => {
    const [diamonds, setDiamonds] = useState<Diamond[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewingDiamond, setViewingDiamond] = useState<Diamond | null>(null);

    useEffect(() => {
        const getDiamonds = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const shape = stoneShapeId as Diamond['shape'];
                const result = await fetchDiamonds({ shape });
                setDiamonds(result);
            } catch (err) {
                setError('Failed to fetch diamonds. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        if (stoneShapeId) {
            getDiamonds();
        } else {
            setDiamonds([]);
        }
    }, [stoneShapeId]);

    const handleSelectAndClose = (diamondId: string) => {
        onSelectDiamond(diamondId);
        setViewingDiamond(null);
    };

    if (!stoneShapeId) {
        return (
            <div className="text-center bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-amber-600">Please Select a Stone Shape First</h3>
                <p className="text-gray-500 mt-2">Go back to the previous step to choose a stone shape to see available diamonds.</p>
            </div>
        );
    }

    if (isLoading) return <LoadingSpinner />;
    if (error) return <div className="text-center text-red-500">{error}</div>;

    return (
        <>
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-xl font-semibold text-[#232429] mb-6 text-center">Available {stoneShapeId.charAt(0).toUpperCase() + stoneShapeId.slice(1)} Diamonds</h3>
                {diamonds.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {diamonds.map(diamond => (
                            <div 
                                key={diamond.id}
                                onClick={() => setViewingDiamond(diamond)}
                                className={`cursor-pointer group rounded-lg overflow-hidden border transition-all duration-300 ${selectedDiamondId === diamond.id ? 'border-brand ring-2 ring-brand' : 'border-gray-200 hover:shadow-md hover:border-brand'}`}
                            >
                                <div className="bg-gray-100 p-2">
                                    <img src={diamond.imageUrl} alt={`${diamond.shape} diamond`} className="w-full h-auto object-cover rounded-md"/>
                                </div>
                                <div className="p-4 text-sm">
                                    <p className="font-bold text-lg text-[#232429]">${diamond.price.toLocaleString()}</p>
                                    <p className="text-gray-600">{diamond.carat.toFixed(2)} Carat, {diamond.cut} Cut</p>
                                    <p className="text-gray-500">Color: {diamond.color}, Clarity: {diamond.clarity}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        No diamonds found for the selected shape.
                    </div>
                )}
            </div>
            <DiamondDetailModal
                diamond={viewingDiamond}
                onClose={() => setViewingDiamond(null)}
                onSelect={handleSelectAndClose}
            />
        </>
    );
};