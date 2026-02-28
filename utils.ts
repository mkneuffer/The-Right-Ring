import { Diamond } from './types';

export const calculateDiamondPrice = (diamond: Diamond): number => {
    const weight = parseFloat(diamond.Weight) || 0;

    if (diamond.Diamond_Type === 'Lab Grown' && diamond.COD_Buy_Price) {
        const codPrice = parseFloat(diamond.COD_Buy_Price);
        if (isNaN(codPrice)) return 0;

        let calculatedPrice = codPrice * 2;

        if (weight >= 3.0) {
            if (codPrice <= 2000) {
                calculatedPrice += 1600;
            }
            // If weight >= 3.0 and codPrice > 2000, we add 0 (just COD * 2)
        } else if (weight >= 2.5) {
            calculatedPrice += 1300;
        } else if (weight >= 2.0) {
            calculatedPrice += 1100;
        } else if (weight >= 1.5) {
            calculatedPrice += 900;
        } else if (weight >= 1.0) {
            calculatedPrice += 700;
        } else if (weight >= 0.5) {
            calculatedPrice += 500;
        }

        return calculatedPrice;
    }

    // Natural Diamonds
    const rapPrice = parseInt(diamond.Rap_Price) || 0;
    return rapPrice * weight;
};
