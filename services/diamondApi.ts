import { Diamond } from '../types';

export interface DiamondFilter {
    shape?: string[];
    minCarat?: number;
    maxCarat?: number;
    minPrice?: number;
    maxPrice?: number;
    color?: string[];
    clarity?: string[];
    cut?: string[];
    polish?: string[];
    symmetry?: string[];
}

let cachedDiamonds: Diamond[] = [];

export const getDiamonds = async (filter: DiamondFilter = {}): Promise<Diamond[]> => {
    if (cachedDiamonds.length === 0) {
        try {
            const response = await fetch('/data/diamonds.json');
            if (!response.ok) {
                throw new Error('Failed to load diamond data');
            }
            cachedDiamonds = await response.json();
        } catch (error) {
            console.error('Error loading diamonds:', error);
            return [];
        }
    }

    return cachedDiamonds.filter(diamond => {
        // Availability Filter (Only show 'G' = currently available, skip memo)
        if (diamond.Availability !== 'G') return false;
        // Shape Filter
        if (filter.shape && filter.shape.length > 0) {
            // Normalize shape names for comparison (e.g., "Round" vs "round")
            const diamondShape = diamond.Shape.toLowerCase();
            const hasMatchingShape = filter.shape.some(s => s.toLowerCase() === diamondShape);
            if (!hasMatchingShape) return false;
        }

        // Carat Filter
        const weight = parseFloat(diamond.Weight);
        if (filter.minCarat !== undefined && weight < filter.minCarat) return false;
        if (filter.maxCarat !== undefined && weight > filter.maxCarat) return false;

        // Color Filter (D-H)
        // We only want to show D-H as per requirements, but let's filter by selection
        if (filter.color && filter.color.length > 0) {
            if (!filter.color.includes(diamond.Color)) return false;
        }

        // Clarity Filter
        if (filter.clarity && filter.clarity.length > 0) {
            if (!filter.clarity.includes(diamond.Clarity)) return false;
        }

        // Cut Filter (Only for Round)
        if (diamond.Shape.toLowerCase() === 'round') {
            if (filter.cut && filter.cut.length > 0) {
                // Map API values to our filter values if needed, or assume direct match
                // API: EX, VG, G, F, P
                // Filter might be: 'Excellent', 'Very Good'
                // Let's normalize to short codes for comparison or handle mapping in UI
                // For now assuming filter passes short codes or full names matching API
                if (!filter.cut.includes(diamond.Cut_Grade)) return false;
            }
        } else {
            // Polish & Symmetry for non-round
            if (filter.polish && filter.polish.length > 0) {
                if (!filter.polish.includes(diamond.Polish)) return false;
            }
            if (filter.symmetry && filter.symmetry.length > 0) {
                if (!filter.symmetry.includes(diamond.Symmetry)) return false;
            }
        }

        return true;
    });
};

export const MOCK_DIAMONDS: Diamond[] = []; // Deprecated
