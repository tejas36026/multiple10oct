self.onmessage = function(e) {
    const { imageData, selectedRegions, imageCount: initialImageCount, maxBrightness, value1, value2, value3, value4, value5, clickedPoints, lines, useMouthShapeSet } = e.data;
    
    console.log('initialImageCount :>> ', initialImageCount);
    const totalImageCount = initialImageCount * 64;

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

    function performLipSync(imageData, selectedRegions, phoneme) {
        const shape = mouthShapes[phoneme] || mouthShapes['Neutral'];
        const lipRegion = [...new Set(selectedRegions.flat())];
        let minY = Infinity, maxY = -Infinity, minX = Infinity, maxX = -Infinity;
    
        // Find the bounding box of the lip region
        for (let pixelIndex of lipRegion) {
            const x = pixelIndex % imageData.width;
            const y = Math.floor(pixelIndex / imageData.width);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
        }
    
        const lipCenterY = (minY + maxY) / 2;
        const lipCenterX = (minX + maxX) / 2;
        const lipHeight = maxY - minY;
        const lipWidth = maxX - minX;
    
        // Create a new image data with the same dimensions as the original
        let frameData = new ImageData(imageData.width, imageData.height);
        
        // Copy the original image data
        frameData.data.set(imageData.data);
    
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                const pixelIndex = y * imageData.width + x;
                if (!lipRegion.includes(pixelIndex)) continue;
    
                let newY = y;
                let newX = x;    
    
                // Apply transformations (same as before)
                if (y >= lipCenterY) {
                    newY += (y - lipCenterY) * (shape.openness - 1) * (1 + (y - lipCenterY) / lipHeight);
                } else {
                    newY -= (lipCenterY - y) * (shape.openness - 1) * (1 + (lipCenterY - y) / lipHeight);
                }
    
                const horizontalFactor = Math.pow((x - lipCenterX) / (lipWidth / 2), 3);
                newX = lipCenterX + (x - lipCenterX) * shape.width;
                newX += horizontalFactor * lipWidth * shape.squeeze * (y >= lipCenterY ? -0.8 : 0.5);
    
                if (y < lipCenterY) {
                    const bowFactor = Math.sin((x - minX) / lipWidth * Math.PI);
                    newY -= bowFactor * shape.cupidsBow * lipHeight / 5;
                }
    
                if (y > lipCenterY) {
                    const fullnessFactor = Math.sin((x - minX) / lipWidth * Math.PI);
                    newY += fullnessFactor * shape.lowerLipFullness * lipHeight / 5;
                }
    
                // Bilinear interpolation
                const x1 = Math.floor(newX);
                const x2 = Math.min(x1 + 1, imageData.width - 1);
                const y1 = Math.floor(newY);
                const y2 = Math.min(y1 + 1, imageData.height - 1);
                
                const wx = newX - x1;
                const wy = newY - y1;
    
                for (let c = 0; c < 4; c++) {
                    const oldIndex = pixelIndex * 4 + c;
                    const newIndex = (y * imageData.width + x) * 4 + c;
    
                    const topLeft = imageData.data[(y1 * imageData.width + x1) * 4 + c];
                    const topRight = imageData.data[(y1 * imageData.width + x2) * 4 + c];
                    const bottomLeft = imageData.data[(y2 * imageData.width + x1) * 4 + c];
                    const bottomRight = imageData.data[(y2 * imageData.width + x2) * 4 + c];
    
                    const interpolatedValue = 
                        topLeft * (1 - wx) * (1 - wy) +
                        topRight * wx * (1 - wy) +
                        bottomLeft * (1 - wx) * wy +
                        bottomRight * wx * wy;
    
                    frameData.data[newIndex] = interpolatedValue;
                }
            }
        }
    
        return frameData;
    }
    
    try {
        const phonemes = Object.keys(mouthShapes);
        const segmentedImages = [];
        let batchNumber = 1;
        let batchPhonemes = [];

        for (let i = 0; i < totalImageCount; i++) {
            const phoneme = phonemes[i % phonemes.length];
            batchPhonemes.push(phoneme);

            const lipSyncFrame = performLipSync(imageData, selectedRegions, phoneme);
            
            segmentedImages.push(lipSyncFrame);

            if ((i + 1) % 10 === 0 || i === totalImageCount - 1) {
                console.log(`Batch ${batchNumber} phonemes:`, batchPhonemes);

                self.postMessage({
                    segmentedImages: segmentedImages,
                    isComplete: i === totalImageCount - 1
                });
                segmentedImages.length = 0; // Clear the array after sending           
                batchPhonemes = []; // Clear the batch phonemes
                batchNumber++;
            }
        }

    } catch (error) {
        console.error('Error in lip sync processing:', error);
        self.postMessage({
            error: error.message,
            isComplete: true
        });
    }
};