
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const directory = '/var/www/html/TheRightRing/public/images/metals';

fs.readdir(directory, (err, files) => {
    if (err) {
        return console.error('Unable to scan directory: ' + err);
    }

    files.forEach((file) => {
        if (file.match(/\.(jpg|jpeg|png)$/i)) {
            const inputPath = path.join(directory, file);
            const outputPath = path.join(directory, path.parse(file).name + '.webp');

            sharp(inputPath)
                .toFormat('webp')
                .toFile(outputPath)
                .then(() => {
                    console.log(`Converted: ${file} -> ${path.basename(outputPath)}`);
                })
                .catch(err => {
                    console.error(`Error converting ${file}:`, err);
                });
        }
    });
});
