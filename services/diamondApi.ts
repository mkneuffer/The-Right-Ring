
import { Diamond } from '../types';

export const MOCK_DIAMONDS: Diamond[] = [
    // Rounds
    { id: 'd001', shape: 'round', carat: 1.01, cut: 'Ideal', color: 'F', clarity: 'VS1', price: 8500, imageUrl: 'https://picsum.photos/seed/d001/100/100' },
    { id: 'd002', shape: 'round', carat: 1.23, cut: 'Super Ideal', color: 'D', clarity: 'VVS2', price: 15000, imageUrl: 'https://picsum.photos/seed/d002/100/100' },
    { id: 'd003', shape: 'round', carat: 0.90, cut: 'Very Good', color: 'G', clarity: 'VS2', price: 6000, imageUrl: 'https://picsum.photos/seed/d003/100/100' },

    // Princess
    { id: 'd004', shape: 'princess', carat: 1.05, cut: 'Very Good', color: 'E', clarity: 'VVS1', price: 9200, imageUrl: 'https://picsum.photos/seed/d004/100/100' },
    { id: 'd005', shape: 'princess', carat: 1.15, cut: 'Ideal', color: 'G', clarity: 'VS1', price: 10500, imageUrl: 'https://picsum.photos/seed/d005/100/100' },

    // Oval
    { id: 'd006', shape: 'oval', carat: 1.51, cut: 'Ideal', color: 'F', clarity: 'IF', price: 22000, imageUrl: 'https://picsum.photos/seed/d006/100/100' },
    { id: 'd007', shape: 'oval', carat: 1.30, cut: 'Very Good', color: 'H', clarity: 'VS2', price: 11500, imageUrl: 'https://picsum.photos/seed/d007/100/100' },

    // Marquise
    { id: 'd008', shape: 'marquise', carat: 1.10, cut: 'Good', color: 'G', clarity: 'VS1', price: 8900, imageUrl: 'https://picsum.photos/seed/d008/100/100' },

    // Pear
    { id: 'd009', shape: 'pear', carat: 1.42, cut: 'Ideal', color: 'E', clarity: 'VVS2', price: 18000, imageUrl: 'https://picsum.photos/seed/d009/100/100' },
];

interface DiamondFilters {
    shape: Diamond['shape'];
}

export const fetchDiamonds = (filters: DiamondFilters): Promise<Diamond[]> => {
    console.log('Fetching diamonds with filters:', filters);
    return new Promise(resolve => {
        setTimeout(() => {
            const filteredDiamonds = MOCK_DIAMONDS.filter(
                diamond => diamond.shape === filters.shape
            );
            resolve(filteredDiamonds);
        }, 1000); // Simulate network delay
    });
};
