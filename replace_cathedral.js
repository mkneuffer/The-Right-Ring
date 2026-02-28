
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const source = '/home/ubuntu/.gemini/antigravity/brain/d351787c-d144-45e1-b39b-22285d7b19e0/uploaded_media_1769469229413.jpg';
const dest = '/var/www/html/TheRightRing/public/images/AddedFeature/Cathedral setting.webp';

sharp(source)
    .toFormat('webp')
    .toFile(dest)
    .then(() => {
        console.log(`Successfully replaced ${dest} with user upload.`);
    })
    .catch(err => {
        console.error('Error converting/replacing image:', err);
        process.exit(1);
    });
