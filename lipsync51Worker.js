self.onmessage = function(e) {
    const { imageData, selectedRegions, imageCount: initialImageCount } = e.data;
    
    const totalImageCount = initialImageCount * 64 * 16;
    const mouthShapes = {
        
        'Neutral': { openness: 0.2, width: 1.0, squeeze: 0, cupidsBow: 0.2, lowerLipFullness: 0.5 },
        'Smile': { openness: 0.3, width: 1.2, squeeze: 0.1, cupidsBow: 0.4, lowerLipFullness: 0.6 },
        'Pucker': { openness: 0.1, width: 0.8, squeeze: 0.3, cupidsBow: 0.1, lowerLipFullness: 0.7 },
        'WideOpen': { openness: 1.0, width: 1.1, squeeze: -0.1, cupidsBow: 0.3, lowerLipFullness: 0.4 },
        'Frown': { openness: 0.2, width: 0.9, squeeze: 0.2, cupidsBow: 0.1, lowerLipFullness: 0.5 },
        'AE': { openness: 0.7, width: 1.01, squeeze: 0, cupidsBow: 0.3, lowerLipFullness: 0.5 },
        'Ah': { openness: 1, width: 1, squeeze: 0, cupidsBow: 0.2, lowerLipFullness: 0.6 },
        'BMP': { openness: 0, width: 0.9, squeeze: 0.1, cupidsBow: 0.1, lowerLipFullness: 0.7 },
        'ChJ': { openness: 0.3, width: 1.02, squeeze: 0, cupidsBow: 0.3, lowerLipFullness: 0.5 },
        'EE': { openness: 0.3, width: 1.03, squeeze: 0, cupidsBow: 0.4, lowerLipFullness: 0.4 },
        'Er': { openness: 0.4, width: 1, squeeze: 0.1, cupidsBow: 0.2, lowerLipFullness: 0.5 },
        'FV': { openness: 0.2, width: 1.01, squeeze: 0.2, cupidsBow: 0.3, lowerLipFullness: 0.6 },
        'Ih': { openness: 0.4, width: 1.02, squeeze: 0, cupidsBow: 0.3, lowerLipFullness: 0.5 },
        'KGHNG': { openness: 0.5, width: 1, squeeze: 0.1, cupidsBow: 0.2, lowerLipFullness: 0.5 },
        'Oh': { openness: 0.8, width: 0.9, squeeze: 0, cupidsBow: 0.2, lowerLipFullness: 0.7 },
        'R': { openness: 0.4, width: 1.01, squeeze: 0.1, cupidsBow: 0.3, lowerLipFullness: 0.5 },
        'SZ': { openness: 0.2, width: 1.02, squeeze: 0, cupidsBow: 0.3, lowerLipFullness: 0.5 },
        'TLDN': { openness: 0.3, width: 1.01, squeeze: 0.1, cupidsBow: 0.3, lowerLipFullness: 0.5 },
        'Th': { openness: 0.2, width: 1.01, squeeze: 0.1, cupidsBow: 0.3, lowerLipFullness: 0.6 },
        'WOO': { openness: 0.3, width: 0.8, squeeze: 0.2, cupidsBow: 0.1, lowerLipFullness: 0.7 }
    
    };
    const lipRegion = new Set(selectedRegions.flat());
    
    let [minY, maxY, minX, maxX] = [Infinity, -Infinity, Infinity, -Infinity];    
    for (let pixelIndex of lipRegion) {
        const x = pixelIndex % imageData.width;
        const y = Math.floor(pixelIndex / imageData.width);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
    }


    // Add these functions at the beginning of lipsync5Worker.js

function collectBackgroundPixels(imageData, selectedPixels, width, height) {
    // const backgroundPixels = [];
    const backgroundPixels = collectBackgroundPixels(imageData, lipRegion, imageData.width, imageData.height);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const pixelIndex = y * width + x;
            if (!selectedPixels.has(pixelIndex)) {
                const i = pixelIndex * 4;
                backgroundPixels.push([
                    imageData.data[i],
                    imageData.data[i + 1],
                    imageData.data[i + 2],
                    imageData.data[i + 3]
                ]);
            }
        }
    }
    return backgroundPixels;
}

function getRandomBackgroundPixel(backgroundPixels) {
    if (backgroundPixels.length === 0) {
        return [128, 128, 128, 255]; // Fallback to gray if no background pixels
    }
    return backgroundPixels[Math.floor(Math.random() * backgroundPixels.length)];
}

    const lipCenterY = (minY + maxY) / 2;
    const lipCenterX = (minX + maxX) / 2;
    const lipHeight = maxY - minY;
    const lipWidth = maxX - minX;

    const lipWidthHalf = lipWidth / 2;
    const lipHeightFifth = lipHeight / 5;
    const backgroundPixels = collectBackgroundPixels(imageData, lipRegion, imageData.width, imageData.height);

    function performLipSync(shape) {
        const frameData = new Uint8ClampedArray(imageData.data);
   for (let y = 0; y < imageData.height; y++) {
            for (let x = 0; x < imageData.width; x++) {
                const pixelIndex = y * imageData.width + x;
                if (!lipRegion.has(pixelIndex)) {
                    const backgroundColor = getRandomBackgroundPixel(backgroundPixels);
                    const idx = pixelIndex * 4;
                    frameData[idx] = backgroundColor[0];
                    frameData[idx + 1] = backgroundColor[1];
                    frameData[idx + 2] = backgroundColor[2];
                    frameData[idx + 3] = backgroundColor[3];
                }
            }
        }
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                const pixelIndex = y * imageData.width + x;
                    if (!lipRegion.has(pixelIndex)) continue;
                    
                let [newY, newX] = [y, x];

                const verticalOffset = (y - lipCenterY) / lipHeight;
                newY += verticalOffset * shape.openness * lipHeight * 0.5;
                const horizontalOffset = (x - lipCenterX) / lipWidthHalf;
                newX = lipCenterX + horizontalOffset * lipWidthHalf + (shape.width - 1) * horizontalOffset * lipWidthHalf;
                
                if (y < lipCenterY) {
                    const bowFactor = Math.sin((x - minX) / lipWidth * Math.PI);
                    newY -= bowFactor * shape.cupidsBow * lipHeightFifth * 0.5;
                } else {
                    const fullnessFactor = Math.sin((x - minX) / lipWidth * Math.PI);
                    newY += fullnessFactor * shape.lowerLipFullness * lipHeightFifth * 0.5;
                }

                newY = Math.max(minY, Math.min(maxY, newY));
                newX = Math.max(minX, Math.min(maxX, newX));

                const [x1, y1] = [Math.floor(newX), Math.floor(newY)];
                const [wx, wy] = [newX - x1, newY - y1];

                const x2 = Math.min(x1 + 1, imageData.width - 1);
                const y2 = Math.min(y1 + 1, imageData.height - 1);

                const [w1, w2, w3, w4] = [(1 - wx) * (1 - wy), wx * (1 - wy), (1 - wx) * wy, wx * wy];

                const idx = (y * imageData.width + x) * 4;
                for (let c = 0; c < 4; c++) {
                    const [c1, c2, c3, c4] = [
                        imageData.data[(y1 * imageData.width + x1) * 4 + c],
                        imageData.data[(y1 * imageData.width + x2) * 4 + c],
                        imageData.data[(y2 * imageData.width + x1) * 4 + c],
                        imageData.data[(y2 * imageData.width + x2) * 4 + c]
                    ];
                    frameData[idx + c] = w1 * c1 + w2 * c2 + w3 * c3 + w4 * c4;
                }
            }
        }

        return new ImageData(frameData, imageData.width, imageData.height);
    }

    const phonemes = Object.keys(mouthShapes);
    const segmentedImages = [];
    const parameters = [
        'openness',
         'squeeze', 
         'cupidsBow',
          'lowerLipFullness'
        ];
 
    for (let i = 0; i < totalImageCount; i++) {
        const phoneme = phonemes[i % phonemes.length];
        const baseShape = { ...mouthShapes[phoneme] };
        
        const paramIndex = Math.floor(i / (50 * initialImageCount));
        const iterationWithinParam = (i % (50 * initialImageCount)) / initialImageCount;
        
        const param = parameters[paramIndex];
        baseShape[param] = iterationWithinParam;

        const lipSyncFrame = performLipSync(baseShape);
        segmentedImages.push(lipSyncFrame);

        if ((i + 1) % 20 === 0 || i === totalImageCount - 1) {
            self.postMessage({
                segmentedImages: segmentedImages,
                isComplete: i === totalImageCount - 1
            });
            segmentedImages.length = 0; // Clear the array after sending
        }
    }

};