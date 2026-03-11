import { Question } from './types';

export const QUESTIONS: Question[] = [
    {
        id: 'baseRing',
        text: 'Step 1: Choose Your Base Ring',
        options: [
            { id: 'build-from-scratch', name: 'Build from scratch', imageUrl: '/images/base-rings/build-from-scratch.webp' },
            { id: 'nelson-style', name: 'Nelson Style - Solitaire - $1,900 (setting only)', imageUrl: '/images/base-rings/nelson-style.webp', videoUrl: '/images/Base ring videos/Nelson Style.MP4' },
            { id: 'wright-style', name: 'Wright Style -Solitaire Hidden Halo- $2,300 (with hidden halo natural diamonds)', imageUrl: '/images/base-rings/wright-style.webp' },
            { id: 'martini-style', name: 'Martini Style - Solitaire - $1,900 (setting only)', imageUrl: '/images/base-rings/martini-style.webp', videoUrl: '/images/Base ring videos/Martini Style.MP4' },
            { id: 'tulip-style', name: 'Tulip Style - Solitaire - $1,900 (setting only)', imageUrl: '/images/base-rings/tulip-style.webp' },
            { id: 'hall-style', name: 'Hall Style - Diamonds Down the Band - $3,400 (with side natural diamonds)', imageUrl: '/images/base-rings/hall-style.webp', videoUrl: '/images/Base ring videos/Hall Style.MP4', labGrownPrice: '$2,900' },
            { id: 'don-style', name: 'Don Style - Diamonds Down the Band - $2,900 (with side natural diamonds)', imageUrl: '/images/base-rings/don-style.webp', videoUrl: '/images/Base ring videos/Don Style.MP4', labGrownPrice: '$2,400' },
            { id: 'freeman-style', name: 'Freeman Style - Three Stone - $3,700 (with side natural diamonds)', imageUrl: '/images/base-rings/freeman-style.webp', videoUrl: '/images/Base ring videos/Freeman Style.MP4', labGrownPrice: '$2,700' },
            { id: 'mackisey-style', name: 'Mackisey Style - Three Stone - $4,000 (with side natural diamonds)', imageUrl: '/images/base-rings/mackisey-style.webp', videoUrl: '/images/Base ring videos/Mackisey Style.MP4', labGrownPrice: '$2,500' },
            { id: 'ryan-style', name: 'Ryan Style - Diamond Cluster - $3,800 (with all side natural diamonds)', imageUrl: '/images/base-rings/ryan-style.webp', videoUrl: '/images/Base ring videos/Ryan Style.MP4', labGrownPrice: '$2,800' },
            { id: 'kyle-style', name: 'Kyle Style - Diamond Halo - $4,100 (with side natural diamonds)', imageUrl: '/images/base-rings/kyle-style.webp', videoUrl: '/images/Base ring videos/Kyle Style.mp4', labGrownPrice: '$3,100' },
            { id: 'maverick-style', name: 'Maverick Style - Three Stone (prongs) - $3,500 (with side natural diamonds)', imageUrl: '/images/base-rings/maverick-style.webp', videoUrl: '/images/Base ring videos/Maverick Style.MP4', labGrownPrice: '$2,500' },
            { id: 'mcneel-style', name: 'McNeel Style - Three Stone (half moon bezels) - $3,500 (with side natural diamonds)', imageUrl: '/images/base-rings/mc-neel-style.webp', videoUrl: '/images/Base ring videos/McNeel Style.MP4', labGrownPrice: '$2,500' },
            { id: 'tacorie-style', name: 'Tacorie Style - 3 Stone & channel set diamonds - ($18,500 with pink natural diamonds), ($4,000 with all clear natural diamonds)', imageUrl: '/images/base-rings/tacorie-style.webp', videoUrl: '/images/Base ring videos/Tacorie Style.MP4', labGrownPrice: '$3,300' },
            { id: 'brett-style', name: 'Brett Style - Non-Symmetrical Cluster - $7,000 (with all natural diamonds*)', imageUrl: '/images/base-rings/brett-style.webp', videoUrl: '/images/Base ring videos/Brett Style.mp4', labGrownPrice: '$4,500' },
            { id: 'sloan-style', name: 'Sloan Style - 3 Stone (alternating) - $3,700 (with side natural diamonds)', imageUrl: '/images/base-rings/sloan-style.webp', labGrownPrice: '$2,700' },
            { id: 'emma-style', name: 'Emma Style - East West Solitaire - $3,000 (setting only)', imageUrl: '/images/base-rings/emma-style.webp', videoUrl: '/images/Base ring videos/Emma Style.mp4' },
            { id: 'garrett-style', name: 'Garrett Style - Square Halo - $3,800 (with side natural diamonds)', imageUrl: '/images/base-rings/garrett-style.webp', videoUrl: '/images/Base ring videos/Garrett Style.MP4', labGrownPrice: '$3,000' },
            { id: 'melissa-style', name: 'Melissa Style - Three Stone (bezel set) - $3,900 (with side natural diamonds)', imageUrl: '/images/base-rings/melissa-style.webp', videoUrl: '/images/Base ring videos/Melissa Style.mp4', labGrownPrice: '$3,100' },
            { id: 'stephens-style', name: 'Stephens Style - Solitaire (bezel set) - $3,000 (setting only)', imageUrl: '/images/base-rings/stephens-style.webp', videoUrl: '/images/Base ring videos/Stephens Style.MP4' },
            { id: 'sarah-style', name: 'Sarah Style - Five Stone - $3,700 (with side natural diamonds)', imageUrl: '/images/base-rings/sarah-style.webp', labGrownPrice: '$2,800' },
            { id: 'christine-style', name: 'Christine Style - Cluster (alternating metals) - $4,000 (with side natural diamonds)', imageUrl: '/images/base-rings/christine-style.webp', videoUrl: '/images/Base ring videos/Christine Style 1.MP4', labGrownPrice: '$3,000' },
        ],
        info: {
            title: "Understanding Base Ring Styles",
            description: "The base ring, or setting, is the foundation of your ring's design. It holds the center stone and defines the overall aesthetic.",
            optionsInfo: [
                { id: 'build-from-scratch', name: 'Build from scratch', description: 'Start with a blank canvas and design your ring from the ground up.' },
                { id: 'nelson-style', name: 'Nelson Style - Solitaire - $1,900 (setting only)', description: 'A simple solitaire with a single center stone' },
                { id: 'wright-style', name: 'Wright Style -Solitaire Hidden Halo- $2,300 (with hidden halo natural diamonds)', description: 'A simple solitaire with a single center stone, and a row of diamonds underneath the center stone' },
                { id: 'martini-style', name: 'Martini Style - Solitaire - $1,900 (setting only)', description: 'A simple solitaire with a single center stone with a 6 prong head' },
                { id: 'tulip-style', name: 'Tulip Style - Solitaire - $1,900 (setting only)', description: 'A simple solitaire with a single center stone with a tulip 6 prong head' },
                { id: 'hall-style', name: 'Hall Style - Diamonds Down the Band - $3,400 (with side natural diamonds)', description: 'A center diamond with diamonds down the side ending 1/2 way down the band. Side diamonds are all G-H color, VS clarity, adding to 0.43 ct of round brilliant cut diamonds' },
                { id: 'don-style', name: 'Don Style - Diamonds Down the Band - $2,900 (with side natural diamonds)', description: 'A center diamond with diamonds down the side ending 1/2 way down the band. The side diamonds add to 0.21 ct, are G-H color, VS clarity, and inversely graduated in size from smaller on top to larger on bottom.' },
                { id: 'freeman-style', name: 'Freeman Style - Three Stone - $3,700 (with side natural diamonds)', description: 'A center diamond accompanied by two round diamonds on either side. The side diamonds add to 0.50 ct of G-H color, VS clarity round brilliant cut diamonds (4 mm each).' },
                { id: 'mackisey-style', name: 'Mackisey Style - Three Stone - $4,000 (with side natural diamonds)', description: 'A center diamond accompanied by two emerald cut diamonds on either side. The side diamonds add to 0.70 ct of G-H color, VS clarity emerald cut diamonds (5X3.2 mm each).' },
                { id: 'ryan-style', name: 'Ryan Style - Diamond Cluster - $3,800 (with all side natural diamonds)', description: 'A center stone accompanied by two round diamonds, and a pear shape diamond on each side. The side diamonds add to 0.62 ct of G-H color, VS clarity round and pear shape diamonds (2.8 mm round diamonds, 4.5 X 2.75 mm pear shape).' },
                { id: 'kyle-style', name: 'Kyle Style - Diamond Halo - $4,100 (with side natural diamonds)', description: 'A center stone accompanied by a halo with round diamonds around the center and diamonds down the side ending 1/2 way down the band. The side diamonds add to 0.63 ct and are G-H color, VS clarity round brilliant cut diamonds (1.8 mm each).' },
                { id: 'maverick-style', name: 'Maverick Style - Three Stone (prongs) - $3,500 (with side natural diamonds)', description: 'A center stone accompanied by two trillion shaped diamonds. The side diamonds add to 0.50 ct of G-H color, VS clarity trillion (triangles with rounded edges) cut diamonds (5.5X5 mm each).' },
                { id: 'mcneel-style', name: 'McNeel Style - Three Stone (half moon bezels) - $3,500 (with side natural diamonds)', description: 'A center stone accompanied by two trillion shaped diamonds, set with half moon bezels' },
                { id: 'tacorie-style', name: 'Tacorie Style - 3 Stone & channel set diamonds - ($18,500 with pink natural diamonds), ($4,000 with all clear natural diamonds)', description: 'A center stone accompanied by two round diamonds on either side, set with half moon bezels, and a row of diamonds down the side ending 3/4 of the way down the band' },
                { id: 'brett-style', name: 'Brett Style - Non-Symmetrical Cluster - $7,000 (with all natural diamonds*)', description: 'A cluster of stones arranged in a non-symmetrical style' },
                { id: 'sloan-style', name: 'Sloan Style - 3 Stone (alternating) - $3,700 (with side natural diamonds)', description: 'A center stone accompanied by two round diamonds on either side, set with half moon bezels' },
                { id: 'emma-style', name: 'Emma Style - East West Solitaire - $3,000 (setting only)', description: 'A center solitaire stone sitting east west style' },
                { id: 'garrett-style', name: 'Garrett Style - Square Halo - $3,800 (with side natural diamonds)', description: 'A center stone accompanied by a square halo with round diamonds around the center and diamonds down the side ending 3/4 of the way down the band' },
                { id: 'melissa-style', name: 'Melissa Style - Three Stone (bezel set) - $3,900 (with side natural diamonds)', description: 'A center stone accompanied by two round diamonds on either side, set in full bezels' },
                { id: 'stephens-style', name: 'Stephens Style - Solitaire (bezel set) - $3,000 (setting only)', description: 'A simple solitaire with a single center stone, with a tapered band, and set in a full bezel' },
                { id: 'sarah-style', name: 'Sarah Style - Five Stone - $3,700 (with side natural diamonds)', description: 'A center stone accompanied by two round diamonds on each side, set in prongs' },
                { id: 'christine-style', name: 'Christine Style - Cluster (alternating metals) - $4,000 (with side natural diamonds)', description: 'A center stone accompanied by three round diamonds, in a cluster on each side' },
            ]
        }
    },
    {
        id: 'stoneShape',
        text: 'Select a Stone Shape',
        multiSelect: true,
        options: [
            { id: 'round', name: 'Round', imageUrl: '/images/Stones/Round.webp' },
            { id: 'princess', name: 'Princess', imageUrl: '/images/Stones/Princess.webp' },
            { id: 'oval', name: 'Oval', imageUrl: '/images/Stones/Oval.avif' },
            { id: 'marquise', name: 'Marquise', imageUrl: '/images/Stones/Marquise.avif' },
            { id: 'pear', name: 'Pear', imageUrl: '/images/Stones/Pear.avif' },
            { id: 'cushion', name: 'Cushion', imageUrl: '/images/Stones/Cushion.webp' },
            { id: 'emerald', name: 'Emerald', imageUrl: '/images/Stones/Emerald.webp' },
            { id: 'radiant', name: 'Radiant', imageUrl: '/images/Stones/Radiant.avif' },
            { id: 'other', name: 'Other Diamond Shape' },
            { id: 'colored-stone', name: 'I want a colored stone in my ring' },
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
                { id: 'other', name: 'Other Diamond Shape', description: 'Looking for something else? Let us know what diamond shape you have in mind.' },
                { id: 'colored-stone', name: 'I want a colored stone in my ring', description: 'Interested in a sapphire, ruby, emerald, or other colored gemstone? Let us know and we\'ll help you find the perfect stone.' },
            ]
        }
    },
    {
        id: 'metalType',
        text: 'Select a Metal Type',
        options: [
            { id: 'yellow-gold', name: 'Yellow Gold', imageUrl: '/images/metals/yellow-gold.png' },
            { id: 'yellow-gold-platinum-head', name: 'Yellow Gold with a Platinum Head', imageUrl: '/images/metals/yellow-gold-platinum-head.png' },
            { id: 'rose-gold', name: 'Rose Gold', imageUrl: '/images/metals/rose-gold.png' },
            { id: 'platinum', name: 'Platinum', imageUrl: '/images/metals/platinum.png' },
        ],
        info: {
            title: "Selecting Your Metal",
            description: "The metal choice affects the ring's color, durability, and price. It sets the tone for the entire piece.",
            optionsInfo: [
                { id: 'yellow-gold', name: 'Yellow Gold', description: 'The traditional and timeless choice, offering a warm, classic glow that complements all skin tones.' },
                { id: 'yellow-gold-platinum-head', name: 'Yellow Gold with a Platinum Head', description: 'The traditional warmth of yellow gold for the band, combined with the strength and pure white color of a platinum head to securely hold your diamond.' },
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
            { id: 'tapered', name: 'V Tapered', imageUrl: '/images/Bands/Tapered.png' },
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
                { id: 'tapered', name: 'V Tapered', description: 'Gradually narrows in a V shape towards the center, accentuating the main stone.' },
                { id: 'twist', name: 'Twist', description: 'Intertwining strands create a dynamic and romantic spiral effect.' },
            ]
        }
    },
    {
        id: 'features',
        text: 'Select Any Added Features',
        multiSelect: true,
        options: [
            { id: 'claw-prongs-arrow', name: 'Claw Prongs', subtitle: '(no additional cost)', imageUrl: '/images/AddedFeature/Claw prongs with arrow.webp' },
            { id: 'tulip-head', name: 'Tulip Head', subtitle: '(no additional cost)', imageUrl: '/images/AddedFeature/Tulip head new.jpg' },
            { id: 'hidden-stone-outside', name: 'Hidden Stone (Outside)', subtitle: '($100 per diamond, $80 per colored stone)', imageUrl: '/images/AddedFeature/hidden stone on the outside.webp' },
            { id: 'hidden-stone-inside', name: 'Hidden Stone (Inside)', subtitle: '($100 per diamond, $80 per colored stone)', imageUrl: '/images/AddedFeature/Hidden stone on the inside of the band.webp' },
            { id: 'hidden-stone-head', name: 'Hidden Stone (Head)', subtitle: '($100 per diamond, $80 per colored stone)', imageUrl: '/images/AddedFeature/Hidden Stone (Head).png' },
            { id: 'half-moon-bezel-gold', name: 'Half Moon Bezel (Gold)', subtitle: '(no additional cost)', imageUrl: '/images/AddedFeature/Half moon bezel [Gold].webp' },
            { id: 'half-moon-bezel-platinum', name: 'Half Moon Bezel (Platinum)', subtitle: '(no additional cost)', imageUrl: '/images/AddedFeature/Half moon bezel [Platinum].webp' },
            { id: 'half-moon-bezel-side-diamond', name: 'Half Moon Bezels (Side Diamonds)', subtitle: '(no additional cost)', imageUrl: '/images/AddedFeature/Half moon bezel side diamond.jpg' },
            { id: 'full-bezel-yellow', name: 'Full Bezel (Yellow)', subtitle: '(no additional cost)', imageUrl: '/images/AddedFeature/Full Bezel yellow.JPG' },
            { id: 'full-bezel-platinum', name: 'Full Bezel (Platinum)', subtitle: '(no additional cost)', imageUrl: '/images/AddedFeature/Full bezel platinum.jpg' },
            { id: 'written-engraving', name: 'Written Engraving', subtitle: '(no additional cost)', imageUrl: '/images/AddedFeature/Written engraving.webp' },
            { id: 'pattern-engraving', name: 'Pattern Engraving', subtitle: '($100 - $300)', imageUrl: '/images/AddedFeature/Pattern Engraving [1].webp' },
            { id: 'cutouts', name: 'Cutouts', subtitle: '(no additional cost)', imageUrl: '/images/AddedFeature/Top of the Band Cutout.jpg' },
            { id: 'elongated-cutouts', name: 'Elongated Cutouts', subtitle: '(no additional cost)', imageUrl: '/images/AddedFeature/Elongated cutouts.webp' },
            { id: 'filagree-cutouts', name: 'Filagree Cutouts', subtitle: '($300 - $400)', imageUrl: '/images/AddedFeature/Filagree Cutout.JPEG' },
            { id: 'top-band-cutout', name: 'Top of the Band Cutout', subtitle: '(no additional cost)', imageUrl: '/images/AddedFeature/Cutouts.jpg' },
            { id: 'shared-prongs', name: 'Shared Prongs', subtitle: '(no additional cost)', imageUrl: '/images/AddedFeature/Shared prongs new.jpg' },
            { id: 'channel-setting', name: 'Channel Setting', subtitle: '(no additional cost)', imageUrl: '/images/AddedFeature/Channel setting.webp' },
            { id: 'pave-style', name: 'Pave Style', subtitle: '(no additional cost)', imageUrl: '/images/AddedFeature/Pave style.webp' },
            { id: 'ushaped-rails', name: 'U-Shaped Rails (Platinum)', subtitle: '(no additional cost)', imageUrl: '/images/AddedFeature/Ushaped rails.webp' },
            { id: 'cathedral-setting', name: 'Cathedral Setting', subtitle: '(no additional cost)', imageUrl: '/images/AddedFeature/Cathedral setting.webp' },
            { id: 'milgrain', name: 'Milgrain', subtitle: '($250)', imageUrl: '/images/AddedFeature/milgrain new.png' },
            { id: 'non-symmetrical-design', name: 'Non-Symmetrical Design', subtitle: '(cost will be estimated)' },
            { id: 'stone-higher', name: 'Stone Higher', subtitle: '(no additional cost)', imageUrl: '/images/AddedFeature/Stone Higher.JPG' },
            { id: 'stone-lower', name: 'Stone Lower', subtitle: '(no additional cost)', imageUrl: '/images/AddedFeature/Stone Lower.JPG' },
            { id: 'thicker-band', name: 'Thicker Band', subtitle: '(costs will be estimated based on width thickness)', imageUrl: '/images/AddedFeature/Thicker Band.JPG' },
            { id: 'hidden-halo', name: 'Hidden Halo', subtitle: '($350)', imageUrl: '/images/AddedFeature/hidden halo zoom.jpg' },
            { id: 'alternating-stone-type', name: 'Alternating Stone Type', subtitle: '(cost will be estimated)', imageUrl: '/images/AddedFeature/alternting stone type.jpg' },
            { id: 'yellow-diamond', name: 'Yellow Diamond (on ends)', subtitle: '($250)', imageUrl: '/images/AddedFeature/Yellow diamond.webp' },
            { id: 'woodgrain-vines', name: 'Woodgrain and Vines', subtitle: '(wood grain: $500, vines: $300)', imageUrl: '/images/AddedFeature/Woodgrain and vines.webp' },
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
        description: 'Start by selecting the foundational style of your ring. The style you choose resembles the basic outline of your ideal ring.',
        questionIds: ['baseRing'],
        requiredQuestions: ['baseRing'],
    },
    {
        title: 'Customize Your Ring',
        description: 'Define the core characteristics of your ring. Select an option in each category to continue.',
        questionIds: ['stoneShape', 'metalType', 'band'],
        requiredQuestions: ['stoneShape', 'metalType', 'band'],
    },
    {
        title: 'Add Customization Options',
        description: '',
        questionIds: ['features'],
        requiredQuestions: [],
    },
    {
        title: 'Set Your Budget',
        description: 'Help us find the perfect ring within your price range.\n(this choice is only applicable if you choose to have our jewelry professionals select a stone for you)',
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