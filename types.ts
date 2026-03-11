export interface Option {
    id: string;
    name: string;
    subtitle?: string;
    imageUrl?: string;
    videoUrl?: string;
    labGrownPrice?: string;
}

export interface Question {
    id: string;
    text: string;
    multiSelect?: boolean;
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
    [questionId: string]: string | string[] | null;
}

export interface Diamond {
    Stock_No: string;
    Availability: string;
    Shape: string;
    Weight: string; // API returns string
    Color: string;
    Clarity: string;
    Cut_Grade: string;
    Polish: string;
    Symmetry: string;
    Fluorescence_Intensity: string;
    Fluorescence_Color: string;
    Measurements: string;
    Lab: string;
    Rap_Price: string; // API returns string
    COD_Buy_Price?: string; // API returns string
    Diamond_Type?: string; // 'Natural Diamond' or 'Lab Grown'
    ImageLink: string;
    VideoLink?: string;
    Video_HTML?: string;
    CertificateLink?: string;
    [key: string]: any; // Allow other properties
}

export interface User {
    id: string;
    email: string;
}