import { Question } from './types';

export const QUESTIONS: Question[] = [
    {
        id: 'baseRing',
        text: 'Step 1: Choose Your Base Ring',
        options: [
            { id: 'build-from-scratch', name: 'Build from scratch', imageUrl: '/images/base-rings/build-from-scratch.webp' },
            { id: 'nelson-style', name: 'Nelson Style - Solitaire - $1,400 (setting only)', imageUrl: '/images/base-rings/nelson-style.webp' },
            { id: 'wright-style', name: 'Wright Style -Solitaire Hidden Halo- $1,800 (with hidden halo diamonds)', imageUrl: '/images/base-rings/wright-style.webp' },
            { id: 'martini-style', name: 'Martini Style - Solitaire - $1,400 (setting only)', imageUrl: '/images/base-rings/martini-style.webp' },
            { id: 'tulip-style', name: 'Tulip Style - Solitaire - $1,400 (setting only)', imageUrl: '/images/base-rings/tulip-style.webp' },
            { id: 'hall-style', name: 'Hall Style - Diamonds Down the Band - $2,900 (with side diamonds)', imageUrl: '/images/base-rings/hall-style.webp' },
            { id: 'don-style', name: 'Don Style - Diamonds Down the Band - $2,750 (with side diamonds)', imageUrl: '/images/base-rings/don-style.webp' },
            { id: 'freeman-style', name: 'Freeman Style - Three Stone - $3,200 (with side diamonds)', imageUrl: '/images/base-rings/freeman-style.webp' },
            { id: 'mackisey-style', name: 'Mackisey Style - Three Stone - $3,500 (with side diamonds)', imageUrl: '/images/base-rings/mackisey-style.webp' },
            { id: 'ryan-style', name: 'Ryan Style - Diamond Cluster - $3,300 (with all side diamonds)', imageUrl: '/images/base-rings/ryan-style.webp' },
            { id: 'kyle-style', name: 'Kyle Style - Diamond Halo - $3,600 (with side diamonds)', imageUrl: '/images/base-rings/kyle-style.webp' },
            { id: 'maverick-style', name: 'Maverick Style - Three Stone (prongs) - $3,000 (with side diamonds)', imageUrl: '/images/base-rings/maverick-style.webp' },
            { id: 'mcneel-style', name: 'McNeel Style - Three Stone (half moon bezels) - $3,000 (with side diamonds)', imageUrl: '/images/base-rings/mc-neel-style.webp' },
            { id: 'tacorie-style', name: 'Tacorie Style - 3 Stone & channel set diamonds - ($18,000 with pink diamonds), ($3,200 with all clear diamonds)', imageUrl: '/images/base-rings/tacorie-style.webp' },
            { id: 'brett-style', name: 'Brett Style - Non-Symmetrical Cluster - $6,500 (with all diamonds*)', imageUrl: '/images/base-rings/brett-style.webp' },
            { id: 'sloan-style', name: 'Sloan Style - 3 Stone (alternating) - $3,200 (with side diamonds)', imageUrl: '/images/base-rings/sloan-style.webp' },
            { id: 'emma-style', name: 'Emma Style - East West Solitaire - $2,500 (setting only)', imageUrl: '/images/base-rings/emma-style.webp' },
            { id: 'garrett-style', name: 'Garrett Style - Square Halo - $3,500 (with side diamonds)', imageUrl: '/images/base-rings/garrett-style.webp' },
            { id: 'melissa-style', name: 'Melissa Style - Three Stone (bezel set) - $3,200 (with side diamonds)', imageUrl: '/images/base-rings/melissa-style.webp' },
            { id: 'stephens-style', name: 'Stephens Style - Solitaire (bezel set) - $2,500 (setting only)', imageUrl: '/images/base-rings/stephens-style.webp' },
            { id: 'sarah-style', name: 'Sarah Style - Five Stone - $3,200 (with side diamonds)', imageUrl: '/images/base-rings/sarah-style.webp' },
            { id: 'christine-style', name: 'Christine Style - Cluster (alternating metals) - $3,500 (with side diamonds)', imageUrl: '/images/base-rings/christine-style.webp' },
        ],
        info: {
            title: "Understanding Base Ring Styles",
            description: "The base ring, or setting, is the foundation of your ring's design. It holds the center stone and defines the overall aesthetic.",
            optionsInfo: [
                { id: 'build-from-scratch', name: 'Build from scratch', description: 'Start with a blank canvas and design your ring from the ground up.' },
                { id: 'nelson-style', name: 'Nelson Style - Solitaire - $1,400 (setting only)', description: 'A unique and elegant setting style.' },
                { id: 'wright-style', name: 'Wright Style -Solitaire Hidden Halo- $1,800 (with hidden halo diamonds)', description: 'A unique and elegant setting style.' },
                { id: 'martini-style', name: 'Martini Style - Solitaire - $1,400 (setting only)', description: 'A unique and elegant setting style.' },
                { id: 'tulip-style', name: 'Tulip Style - Solitaire - $1,400 (setting only)', description: 'A unique and elegant setting style.' },
                { id: 'hall-style', name: 'Hall Style - Diamonds Down the Band - $2,900 (with side diamonds)', description: 'A unique and elegant setting style.' },
                { id: 'don-style', name: 'Don Style - Diamonds Down the Band - $2,750 (with side diamonds)', description: 'A unique and elegant setting style.' },
                { id: 'freeman-style', name: 'Freeman Style - Three Stone - $3,200 (with side diamonds)', description: 'A unique and elegant setting style.' },
                { id: 'mackisey-style', name: 'Mackisey Style - Three Stone - $3,500 (with side diamonds)', description: 'A unique and elegant setting style.' },
                { id: 'ryan-style', name: 'Ryan Style - Diamond Cluster - $3,300 (with all side diamonds)', description: 'A unique and elegant setting style.' },
                { id: 'kyle-style', name: 'Kyle Style - Diamond Halo - $3,600 (with side diamonds)', description: 'A unique and elegant setting style.' },
                { id: 'maverick-style', name: 'Maverick Style - Three Stone (prongs) - $3,000 (with side diamonds)', description: 'A unique and elegant setting style.' },
                { id: 'mcneel-style', name: 'McNeel Style - Three Stone (half moon bezels) - $3,000 (with side diamonds)', description: 'A unique and elegant setting style.' },
                { id: 'tacorie-style', name: 'Tacorie Style - 3 Stone & channel set diamonds - ($18,000 with pink diamonds), ($3,200 with all clear diamonds)', description: 'A unique and elegant setting style.' },
                { id: 'brett-style', name: 'Brett Style - Non-Symmetrical Cluster - $6,500 (with all diamonds*)', description: 'A unique and elegant setting style.' },
                { id: 'sloan-style', name: 'Sloan Style - 3 Stone (alternating) - $3,200 (with side diamonds)', description: 'A unique and elegant setting style.' },
                { id: 'emma-style', name: 'Emma Style - East West Solitaire - $2,500 (setting only)', description: 'A unique and elegant setting style.' },
                { id: 'garrett-style', name: 'Garrett Style - Square Halo - $3,500 (with side diamonds)', description: 'A unique and elegant setting style.' },
                { id: 'melissa-style', name: 'Melissa Style - Three Stone (bezel set) - $3,200 (with side diamonds)', description: 'A unique and elegant setting style.' },
                { id: 'stephens-style', name: 'Stephens Style - Solitaire (bezel set) - $2,500 (setting only)', description: 'A unique and elegant setting style.' },
                { id: 'sarah-style', name: 'Sarah Style - Five Stone - $3,200 (with side diamonds)', description: 'A unique and elegant setting style.' },
                { id: 'christine-style', name: 'Christine Style - Cluster (alternating metals) - $3,500 (with side diamonds)', description: 'A unique and elegant setting style.' },
            ]
        }
    },
    {
        id: 'stoneShape',
        text: 'Select a Stone Shape',
        options: [
            { id: 'round', name: 'Round', imageUrl: '/images/Stones/Round.webp' },
            { id: 'princess', name: 'Princess', imageUrl: '/images/Stones/Princess.webp' },
            { id: 'oval', name: 'Oval', imageUrl: '/images/Stones/Oval.avif' },
            { id: 'marquise', name: 'Marquise', imageUrl: '/images/Stones/Marquise.avif' },
            { id: 'pear', name: 'Pear', imageUrl: '/images/Stones/Pear.avif' },
            { id: 'cushion', name: 'Cushion', imageUrl: '/images/Stones/Cushion.webp' },
            { id: 'emerald', name: 'Emerald', imageUrl: '/images/Stones/Emerald.webp' },
            { id: 'radiant', name: 'Radiant', imageUrl: '/images/Stones/Radiant.avif' },
            { id: 'other', name: 'Other' },
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
                { id: 'cushion', name: 'Cushion', description: 'A square or rectangular cut with rounded corners, combining the brilliance of a round diamond with a romantic vintage feel.' },
                { id: 'emerald', name: 'Emerald', description: 'A rectangular step-cut diamond with distinctive rows of facets and cropped corners, known for its elegant hall-of-mirrors effect.' },
                { id: 'radiant', name: 'Radiant', description: 'Combines the silhouette of an emerald cut with the brilliance of a round diamond, featuring trimmed corners.' },
                { id: 'other', name: 'Other', description: 'Looking for something else? Let us know what shape you have in mind.' },
            ]
        }
    },
    {
        id: 'metalType',
        text: 'Select a Metal Type',
        options: [
            { id: 'yellow-gold', name: 'Yellow Gold', imageUrl: '/images/metals/yellow-gold.png' },
            { id: 'rose-gold', name: 'Rose Gold', imageUrl: '/images/metals/rose-gold.png' },
            { id: 'platinum', name: 'Platinum', imageUrl: '/images/metals/platinum.png' },
        ],
        info: {
            title: "Selecting Your Metal",
            description: "The metal choice affects the ring's color, durability, and price. It sets the tone for the entire piece.",
            optionsInfo: [
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
            { id: 'european-shank', name: 'European Shank', imageUrl: '/images/Bands/European Shank.png' },
            { id: 'knife-edge', name: 'Knife Edge', imageUrl: '/images/Bands/Knife Edge.png' },
            { id: 'straight-band', name: 'Straight Band', imageUrl: '/images/Bands/Straight Band.png' },
            { id: 'straight-taper', name: 'Straight Taper', imageUrl: '/images/Bands/Straight Taper.png' },
            { id: 'tapered', name: 'Tapered', imageUrl: '/images/Bands/Tapered.png' },
            { id: 'twist', name: 'Twist', imageUrl: '/images/Bands/Twist.png' },
        ],
        info: {
            title: "Choosing a Band Style",
            description: "The band's design adds character and personality to the ring, from simple and classic to intricate and detailed.",
            optionsInfo: [
                { id: 'european-shank', name: 'European Shank', description: 'Features a flattened bottom to prevent spinning and maximize comfort.' },
                { id: 'knife-edge', name: 'Knife Edge', description: 'A sleek design with a sharp edge running along the center of the band.' },
                { id: 'straight-band', name: 'Straight Band', description: 'A timeless, uniform band that maintains a consistent width.' },
                { id: 'straight-taper', name: 'Straight Taper', description: 'Tapers in straight lines towards the center stone for a focused look.' },
                { id: 'tapered', name: 'Tapered', description: 'Gradually narrows towards the center, accentuating the main stone.' },
                { id: 'twist', name: 'Twist', description: 'Intertwining strands create a dynamic and romantic spiral effect.' },
            ]
        }
    },
    {
        id: 'features',
        text: 'Select Any Added Features',
        multiSelect: true,
        options: [
            { id: 'cathedral-setting', name: 'Cathedral Setting', subtitle: '(no additional cost)', imageUrl: '/images/AddedFeature/Cathedral setting.webp' },
            { id: 'channel-setting', name: 'Channel Setting', subtitle: '(no additional cost)', imageUrl: '/images/AddedFeature/Channel setting.webp' },
            { id: 'claw-prongs-arrow', name: 'Claw Prongs', subtitle: '(no additional cost)', imageUrl: '/images/AddedFeature/Claw prongs with arrow.webp' },
            { id: 'elongated-cutouts', name: 'Elongated Cutouts', subtitle: '(no additional cost)', imageUrl: '/images/AddedFeature/Elongated cutouts.webp' },
            { id: 'half-moon-bezel-gold', name: 'Half Moon Bezel (Gold)', subtitle: '(no additional cost)', imageUrl: '/images/AddedFeature/Half moon bezel [Gold].webp' },
            { id: 'half-moon-bezel-platinum', name: 'Half Moon Bezel (Platinum)', subtitle: '(no additional cost)', imageUrl: '/images/AddedFeature/Half moon bezel [Platinum].webp' },
            { id: 'hidden-stone-inside', name: 'Hidden Stone (Inside)', subtitle: '($100 per diamond, $80 per colored stone)', imageUrl: '/images/AddedFeature/Hidden stone on the inside of the band.webp' },
            { id: 'hidden-stone-outside', name: 'Hidden Stone (Outside)', subtitle: '($100 per diamond, $80 per colored stone)', imageUrl: '/images/AddedFeature/hidden stone on the outside.webp' },
            { id: 'hidden-stone-head', name: 'Hidden Stone (Head)', subtitle: '(no additional cost)', imageUrl: '/images/AddedFeature/Hidden stone on the side of the head.webp' },
            { id: 'milgrain', name: 'Milgrain', subtitle: '($250)', imageUrl: '/images/AddedFeature/Milgrain [2].webp' },
            { id: 'pattern-engraving', name: 'Pattern Engraving', subtitle: '($100 - $300)', imageUrl: '/images/AddedFeature/Pattern Engraving [1].webp' },
            { id: 'pave-style', name: 'Pave Style', subtitle: '(no additional cost)', imageUrl: '/images/AddedFeature/Pave style.webp' },
            { id: 'ushaped-rails', name: 'U-Shaped Rails', subtitle: '(no additional cost)', imageUrl: '/images/AddedFeature/Ushaped rails.webp' },
            { id: 'woodgrain-vines', name: 'Woodgrain and Vines', subtitle: '(no additional cost)', imageUrl: '/images/AddedFeature/Woodgrain and vines.webp' },
            { id: 'written-engraving', name: 'Written Engraving', subtitle: '(no additional cost)', imageUrl: '/images/AddedFeature/Written engraving.webp' },
            { id: 'yellow-diamond', name: 'Yellow Diamond (on ends)', subtitle: '($250)', imageUrl: '/images/AddedFeature/Yellow diamond.webp' },
            { id: 'non-symmetrical-design', name: 'Non-Symmetrical Design', subtitle: '(cost will be estimated)' },
            { id: 'filagree-cutouts', name: 'Filagree Cutouts', subtitle: '(no additional cost)', imageUrl: '/images/AddedFeature/Filagree Cutout.JPEG' },
            { id: 'top-band-cutout', name: 'Top of the Band Cutout', subtitle: '(no additional cost)', imageUrl: '/images/AddedFeature/Top of the Band Cutout.jpg' },
            { id: 'cutouts', name: 'Cutouts', subtitle: '(no additional cost)', imageUrl: '/images/AddedFeature/Cutouts.jpg' },
            { id: 'hidden-halo', name: 'Hidden Halo', subtitle: '(no additional cost)', imageUrl: '/images/AddedFeature/Hidden halo.jpg' },
            { id: 'stone-higher', name: 'Stone Higher', subtitle: '(no additional cost)', imageUrl: '/images/AddedFeature/Stone Higher.JPG' },
            { id: 'stone-lower', name: 'Stone Lower', subtitle: '(no additional cost)', imageUrl: '/images/AddedFeature/Stone Lower.JPG' },
            { id: 'thicker-band', name: 'Thicker Band', subtitle: '(no additional cost)', imageUrl: '/images/AddedFeature/Thicker Band.JPG' },
        ],
        info: {
            title: "Adding Special Features",
            description: "Personalize your ring with unique details that add a hidden layer of meaning and sparkle. You can select multiple features.",
            optionsInfo: []
        }
    },
    {
        id: 'budget',
        text: 'What is your budget?',
        options: [
            { id: '3000-4000', name: '$3,000 - $4,000' },
            { id: '4000-5000', name: '$4,000 - $5,000' },
            { id: '5000-6000', name: '$5,000 - $6,000' },
            { id: '6000-7000', name: '$6,000 - $7,000' },
            { id: '8000-9000', name: '$8,000 - $9,000' },
            { id: '9000-10000', name: '$9,000 - $10,000' },
            { id: '10000-12500', name: '$10,000 - $12,500' },
            { id: '12500-15000', name: '$12,500 - $15,000' },
            { id: '15000-17500', name: '$15,000 - $17,500' },
            { id: '17500-20000', name: '$17,500 - $20,000' },
            { id: '20000-25000', name: '$20,000 - $25,000' },
            { id: '25000-30000', name: '$25,000 - $30,000' },
            { id: '30000+', name: '$30,000+' },
            { id: 'unknown', name: 'I don\'t know my budget' },
        ],
        info: {
            title: "Setting Your Budget",
            description: "Establishing a budget helps us recommend the best diamonds and settings within your price range.",
            optionsInfo: []
        }
    },

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
        title: 'Add Customization Options',
        description: 'Personalize your ring with unique, elegant details.',
        questionIds: ['features'],
        requiredQuestions: ['features'],
    },
    {
        title: 'Set Your Budget',
        description: 'Help us find the perfect ring within your price range.',
        questionIds: ['budget'],
        requiredQuestions: ['budget'],
    },
    {
        title: 'Select Your Diamond',
        description: 'Choose the perfect diamond that matches your criteria.',
        component: 'DiamondSelector',
        questionIds: [], // Component handles its own logic
        requiredQuestions: ['diamond'],
    },
];