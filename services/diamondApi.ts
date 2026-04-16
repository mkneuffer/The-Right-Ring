import { Diamond } from '../types';

export interface DiamondPageResult {
    diamonds: Diamond[];
    total: number;
    page: number;
    hasMore: boolean;
}

export interface PagedFilter {
    shape: string;           // required - lowercase
    type?: 'natural' | 'lab' | 'all';
    colorRange?: [number, number];
    clarityRange?: [number, number];
    cutRange?: [number, number];
    polishRange?: [number, number];
    symmetryRange?: [number, number];
    priceRange?: [number, number];
    caratRange?: [number, number];
}

export const getDiamondsPage = async (
    filter: PagedFilter,
    page: number = 1,
    limit: number = 20
): Promise<DiamondPageResult> => {
    const params = new URLSearchParams();
    params.set('shape', filter.shape.toLowerCase());
    params.set('type',  filter.type ?? 'natural');
    params.set('page',  String(page));
    params.set('limit', String(limit));

    if (filter.colorRange) {
        params.set('color_min', String(filter.colorRange[0]));
        params.set('color_max', String(filter.colorRange[1]));
    }
    if (filter.clarityRange) {
        params.set('clarity_min', String(filter.clarityRange[0]));
        params.set('clarity_max', String(filter.clarityRange[1]));
    }
    if (filter.cutRange) {
        params.set('cut_min', String(filter.cutRange[0]));
        params.set('cut_max', String(filter.cutRange[1]));
    }
    if (filter.polishRange) {
        params.set('polish_min', String(filter.polishRange[0]));
        params.set('polish_max', String(filter.polishRange[1]));
    }
    if (filter.symmetryRange) {
        params.set('symmetry_min', String(filter.symmetryRange[0]));
        params.set('symmetry_max', String(filter.symmetryRange[1]));
    }
    if (filter.priceRange) {
        params.set('price_min', String(filter.priceRange[0]));
        params.set('price_max', String(filter.priceRange[1]));
    }
    if (filter.caratRange) {
        params.set('carat_min', String(filter.caratRange[0]));
        params.set('carat_max', String(filter.caratRange[1]));
    }

    const response = await fetch(`/api/diamonds.php?${params}`);
    if (!response.ok) {
        throw new Error('Failed to load diamond data');
    }
    return await response.json();
};

export const getDiamondById = async (stockNo: string): Promise<Diamond | null> => {
    try {
        const response = await fetch(`/api/diamond.php?id=${encodeURIComponent(stockNo)}`);
        if (!response.ok) return null;
        const data = await response.json();
        return data.diamond ?? null;
    } catch (error) {
        console.error('Error loading diamond by ID:', error);
        return null;
    }
};
