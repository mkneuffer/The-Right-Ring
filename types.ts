export interface Option {
    id: string;
    name: string;
    imageUrl: string;
}

export interface Question {
    id: string;
    text: string;
    options: Option[];
    info?: {
        title: string;
        description: string;
        optionsInfo?: {
            id: string;
            name: string;
            description: string;
        }[];
    };
}

export interface RingConfiguration {
    [questionId: string]: string | null;
}

export interface Diamond {
    id: string;
    shape: 'round' | 'princess' | 'oval' | 'marquise' | 'pear';
    carat: number;
    cut: 'Good' | 'Very Good' | 'Ideal' | 'Super Ideal';
    color: 'D' | 'E' | 'F' | 'G' | 'H' | 'I';
    clarity: 'FL' | 'IF' | 'VVS1' | 'VVS2' | 'VS1' | 'VS2';
    price: number;
    imageUrl: string;
}

export interface User {
    id: string;
    email: string;
}