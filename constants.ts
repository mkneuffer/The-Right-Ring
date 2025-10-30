import { Question } from './types';

export const QUESTIONS: Question[] = [
    {
        id: 'baseRing',
        text: 'Step 1: Choose Your Base Ring',
        options: [
            { id: 'solitaire', name: 'Classic Solitaire', imageUrl: 'https://picsum.photos/seed/solitaire/400/400' },
            { id: 'pave', name: 'Pave Band', imageUrl: 'https://picsum.photos/seed/pave/400/400' },
            { id: 'halo', name: 'Halo Setting', imageUrl: 'https://picsum.photos/seed/halo/400/400' },
        ],
        info: {
            title: "Understanding Base Ring Styles",
            description: "The base ring, or setting, is the foundation of your ring's design. It holds the center stone and defines the overall aesthetic.",
            optionsInfo: [
                { id: 'solitaire', name: 'Classic Solitaire', description: 'A timeless choice featuring a single center diamond on a simple band. It emphasizes the beauty of the main stone.' },
                { id: 'pave', name: 'Pave Band', description: 'The band is encrusted with small diamonds, creating a continuous sparkle that complements the center stone.' },
                { id: 'halo', name: 'Halo Setting', description: 'A circle of small diamonds surrounds the center stone, making it appear larger and adding significant brilliance.' },
            ]
        }
    },
    {
        id: 'stoneShape',
        text: 'Select a Stone Shape',
        options: [
            { id: 'round', name: 'Round', imageUrl: 'https://picsum.photos/seed/round/400/400' },
            { id: 'princess', name: 'Princess', imageUrl: 'https://picsum.photos/seed/princess/400/400' },
            { id: 'oval', name: 'Oval', imageUrl: 'https://picsum.photos/seed/oval/400/400' },
            { id: 'marquise', name: 'Marquise', imageUrl: 'https://picsum.photos/seed/marquise/400/400' },
            { id: 'pear', name: 'Pear', imageUrl: 'https://picsum.photos/seed/pear/400/400' },
        ],
        info: {
            title: "Choosing a Diamond Shape",
            description: "The shape of the diamond (or 'cut') is its most defining characteristic. Each shape has unique qualities and reflects light differently.",
            optionsInfo: [
                { id: 'round', name: 'Round Brilliant', description: 'The most popular shape, known for its exceptional fire and brilliance. A versatile and classic choice.' },
                { id: 'princess', name: 'Princess', description: 'A square shape with sharp corners and brilliant facets, offering a modern and elegant look.' },
                { id: 'oval', name: 'Oval', description: 'An elongated version of the round brilliant, which can make fingers appear longer and slimmer.' },
                { id: 'marquise', name: 'Marquise', description: 'A football-shaped cut with pointed ends. Its long, narrow shape maximizes carat weight.' },
                { id: 'pear', name: 'Pear', description: 'A hybrid of the round and marquise cuts, resembling a teardrop. It offers a unique, sophisticated style.' },
            ]
        }
    },
    {
        id: 'metalType',
        text: 'Select a Metal Type',
        options: [
            { id: 'white-gold', name: 'White Gold', imageUrl: 'https://picsum.photos/seed/whitegold/400/400' },
            { id: 'yellow-gold', name: 'Yellow Gold', imageUrl: 'https://picsum.photos/seed/yellowgold/400/400' },
            { id: 'rose-gold', name: 'Rose Gold', imageUrl: 'https://picsum.photos/seed/rosegold/400/400' },
            { id: 'platinum', name: 'Platinum', imageUrl: 'https://picsum.photos/seed/platinum/400/400' },
        ],
        info: {
            title: "Selecting Your Metal",
            description: "The metal choice affects the ring's color, durability, and price. It sets the tone for the entire piece.",
            optionsInfo: [
                { id: 'white-gold', name: 'White Gold', description: 'A popular choice with a silvery-white appearance, similar to platinum but more affordable. It is plated with rhodium for durability.' },
                { id: 'yellow-gold', name: 'Yellow Gold', description: 'The traditional and timeless choice, offering a warm, classic glow that complements all skin tones.' },
                { id: 'rose-gold', name: 'Rose Gold', description: 'A romantic, pink-hued metal made by alloying gold with copper. It offers a unique, vintage appeal.' },
                { id: 'platinum', name: 'Platinum', description: 'The most durable and prestigious metal. It is naturally white, hypoallergenic, and develops a beautiful patina over time.' },
            ]
        }
    },
    {
        id: 'band',
        text: 'Select a Band for Your Ring',
        options: [
            { id: 'classic', name: 'Classic Band', imageUrl: 'https://picsum.photos/seed/classicband/400/400' },
            { id: 'twisted', name: 'Twisted Band', imageUrl: 'https://picsum.photos/seed/twistedband/400/400' },
            { id: 'vintage', name: 'Vintage Band', imageUrl: 'https://picsum.photos/seed/vintageband/400/400' },
        ],
        info: {
            title: "Choosing a Band Style",
            description: "The band's design adds character and personality to the ring, from simple and classic to intricate and detailed.",
            optionsInfo: [
                { id: 'classic', name: 'Classic Band', description: 'A smooth, simple band that places all the focus on the center stone and setting.' },
                { id: 'twisted', name: 'Twisted Band', description: 'Intertwining strands of metal create a symbolic and visually interesting design, representing unity.' },
                { id: 'vintage', name: 'Vintage Band', description: 'Features intricate details like milgrain, filigree, or engraving, inspired by antique designs.' },
            ]
        }
    },
    {
        id: 'features',
        text: 'Select Any Added Features',
        options: [
            { id: 'engraving', name: 'Engraving', imageUrl: 'https://picsum.photos/seed/engraving/400/400' },
            { id: 'hidden-halo', name: 'Hidden Halo', imageUrl: 'https://picsum.photos/seed/hiddenhalo/400/400' },
            { id: 'side-stones', name: 'Side Stones', imageUrl: 'https://picsum.photos/seed/sidestones/400/400' },
        ],
        info: {
            title: "Adding Special Features",
            description: "Personalize your ring with unique details that add a hidden layer of meaning and sparkle.",
             optionsInfo: [
                { id: 'engraving', name: 'Engraving', description: 'Add a personal message, date, or symbol to the inside of the band for a sentimental touch.' },
                { id: 'hidden-halo', name: 'Hidden Halo', description: 'A secret circle of diamonds below the main stone, visible from the side profile, adding a delightful surprise.' },
                { id: 'side-stones', name: 'Side Stones', description: 'Smaller diamonds or gemstones that flank the center stone, enhancing its brilliance and adding complexity to the design.' },
            ]
        }
    }
];

export const FORM_STEPS = [
    { 
        title: 'Choose Your Base Ring',
        description: 'Start by selecting the foundational style of your ring.',
        questionIds: ['baseRing'],
        requiredQuestions: ['baseRing'],
    },
    { 
        title: 'Customize Your Ring',
        description: 'Define the core characteristics of your ring.',
        questionIds: ['stoneShape', 'metalType', 'band'],
        requiredQuestions: ['stoneShape', 'metalType', 'band'],
    },
    { 
        title: 'Add Special Features',
        description: 'Personalize your ring with unique, elegant details.',
        questionIds: ['features'],
        requiredQuestions: ['features'],
    },
    { 
        title: 'Select Your Diamond',
        description: 'Choose the perfect diamond that matches your criteria.',
        component: 'DiamondSelector',
        questionIds: [], // Component handles its own logic
        requiredQuestions: ['diamond'],
    },
];