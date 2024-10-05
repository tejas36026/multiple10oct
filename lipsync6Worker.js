self.onmessage = function(e) {
    const { imageData, selectedRegions, imageCount: initialImageCount } = e.data;
    
    const totalImageCount = initialImageCount * 64;
    const mouthShapes = {
        'FullyClosed': { openness: -1.0, width: 0.8, squeeze: 0.3, cupidsBow: 0.05, lowerLipFullness: 0.4 },
        'SlightlyOpen': { openness: 0.2, width: 1.0, squeeze: 0.1, cupidsBow: 0.2, lowerLipFullness: 0.5 },
        'MediumOpen': { openness: 0.5, width: 1.1, squeeze: 0, cupidsBow: 0.3, lowerLipFullness: 0.6 },
        'WideOpen': { openness: 1.0, width: 1.2, squeeze: -0.1, cupidsBow: 0.4, lowerLipFullness: 0.7 },
    
        'Closed': { openness: 0.9, width: 1.0, squeeze: 0.1, cupidsBow: 0.1, lowerLipFullness: 0.5 },
        'VeryClosed': { openness: 1.2, width: 0.8, squeeze: 0.1, cupidsBow: 0.05, lowerLipFullness: 0.4 },
        'ExtremelyClosedA1': { openness: -1.2, width: 0.7, squeeze: 0.4, cupidsBow: 0.05, lowerLipFullness: 0.4 },
        'ExtremelyClosedB1': { openness: -1.5, width: 0.6, squeeze: 0.5, cupidsBow: 0.05, lowerLipFullness: 0.4 },
        'ExtremelyClosedA': { openness: -0.5, width: 0.7, squeeze: 0.3, cupidsBow: 0.05, lowerLipFullness: 0.4 },
        'ExtremelyClosedB': { openness: -0.8, width: 0.6, squeeze: 0.4, cupidsBow: 0.05, lowerLipFullness: 0.4 },
        'VeryClosed31': { openness: -0.3, width: 0.8, squeeze: 0.2, cupidsBow: 0.05, lowerLipFullness: 0.4 },
        'VeryClosed21': { openness: -0.2, width: 0.8, squeeze: 0.2, cupidsBow: 0.05, lowerLipFullness: 0.4 },
        'VeryClosed11': { openness: -0.1, width: 0.8, squeeze: 0.2, cupidsBow: 0.05, lowerLipFullness: 0.4 },
        'VeryClosed3': { openness: 1.9, width: 0.8, squeeze: 0.1, cupidsBow: 0.05, lowerLipFullness: 0.4 },
        'VeryClosed2': { openness: 1.5, width: 0.8, squeeze: 0.1, cupidsBow: 0.05, lowerLipFullness: 0.4 },
        'VeryClosed1': { openness: 1.4, width: 0.8, squeeze: 0.1, cupidsBow: 0.05, lowerLipFullness: 0.4 },
        'Closed': { openness: 0.9, width: 1.0, squeeze: 0.1, cupidsBow: 0.1, lowerLipFullness: 0.5 },
        'VeryClosed': { openness: 1.2, width: 0.8, squeeze: 0.1, cupidsBow: 0.05, lowerLipFullness: 0.4 },
        'WideOpen': { openness: 1.2, width: 1.1, squeeze: -0.2, cupidsBow: 0.4, lowerLipFullness: 0.3 },
        'Closed': { openness: -0.9, width: 1.0, squeeze: 0.1, cupidsBow: 0.1, lowerLipFullness: 0.5 },
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

    const lipCenterY = (minY + maxY) / 2;
    const lipCenterX = (minX + maxX) / 2;
    const lipHeight = maxY - minY;
    const lipWidth = maxX - minX;

    const lipWidthHalf = lipWidth / 2;
    const lipHeightFifth = lipHeight / 5;

    const teethMask = createTeethMask(imageData, lipRegion, minX, minY, maxX, maxY);

    function performLipSync(shape) {
        const frameData = new Uint8ClampedArray(imageData.data);
    
        // Define gravity factor
        const gravityFactor = 0.3;
    
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                const pixelIndex = y * imageData.width + x;
                if (!lipRegion.has(pixelIndex)) continue;
    
                const idx = pixelIndex * 4;
                const r = imageData.data[idx];
                const g = imageData.data[idx + 1];
                const b = imageData.data[idx + 2];
                if ((r > 240 && g > 240 && b > 240) || (r < 15 && g < 15 && b < 15)) {
                    continue; // Skip white and black pixels
                }
    
                let [newY, newX] = [y, x];
    
                const isUpperLip = y < lipCenterY;
                const lipFactor = isUpperLip ? 0.7 : 1.0; // Upper lip moves less
            

                // Vertical transformation with gravity
                const verticalOffset = (y - lipCenterY) / lipHeight;
                const opennessFactor = y < lipCenterY ? 0.6 : 0.4; // Adjust these values
                // newY += Math.max(-lipHeight * 0.3, Math.min(lipHeight * 0.3, verticalOffset * shape.openness * lipHeight * opennessFactor));
                // newY += Math.max(-lipHeight * 0.5, Math.min(lipHeight * 0.5, verticalOffset * shape.openness * lipHeight * opennessFactor));

                // newY += Math.max(-lipHeight * 0.4, Math.min(lipHeight * 0.4, verticalOffset * shape.openness * lipHeight * opennessFactor));
                newY += Math.max(-lipHeight * 0.5, Math.min(lipHeight * 0.5, 
                    verticalOffset * shape.openness * lipHeight * lipFactor));
                
                    if (isUpperLip && newY > lipCenterY) {
                        newY = lipCenterY;
                    } else if (!isUpperLip && newY < lipCenterY) {
                        newY = lipCenterY;
                    }

                // Apply gravity to upper lip
                const minLipDistance = lipHeight * 0.1; // Adjust this value as needed
                if (newY > lipCenterY && (newY - lipCenterY) < minLipDistance) {
                    newY = lipCenterY + minLipDistance;
                }
                if (y > lipCenterY && shape.openness < 0) {
                    newY -= (y - lipCenterY) * gravityFactor * Math.abs(shape.openness);
                }

//                 const snapThreshold = lipHeight * 0.15;
// if (Math.abs(newY - lipCenterY) < snapThreshold) {
//     newY = lipCenterY;
// }

newY += Math.max(-lipHeight * 0.5, Math.min(lipHeight * 0.5, 
    verticalOffset * shape.openness * lipHeight * lipFactor));


                // Horizontal transformation
                const horizontalOffset = (x - lipCenterX) / lipWidthHalf;
                newX = lipCenterX + horizontalOffset * shape.width * lipWidthHalf;
    
                // Squeeze effect
                newX += (lipCenterX - newX) * shape.squeeze;
    
                // Ensure we stay within bounds
                newY = Math.max(minY, Math.min(maxY, newY));
                newX = Math.max(minX, Math.min(maxX, newX));
    
                // Bilinear interpolation
                const [x1, y1] = [Math.floor(newX), Math.floor(newY)];
                const [wx, wy] = [newX - x1, newY - y1];
    
                const x2 = Math.min(x1 + 1, imageData.width - 1);
                const y2 = Math.min(y1 + 1, imageData.height - 1);
    
                const [w1, w2, w3, w4] = [(1 - wx) * (1 - wy), wx * (1 - wy), (1 - wx) * wy, wx * wy];
    
                const idx1 = (y * imageData.width + x) * 4;
                for (let c = 0; c < 4; c++) {
                    const [c1, c2, c3, c4] = [
                        imageData.data[(y1 * imageData.width + x1) * 4 + c],
                        imageData.data[(y1 * imageData.width + x2) * 4 + c],
                        imageData.data[(y2 * imageData.width + x1) * 4 + c],
                        imageData.data[(y2 * imageData.width + x2) * 4 + c]
                    ];
                    frameData[idx1 + c] = w1 * c1 + w2 * c2 + w3 * c3 + w4 * c4;
                }
            }
        }
    
        return new ImageData(frameData, imageData.width, imageData.height);
    }

    function createTeethMask(imageData, lipRegion, minX, minY, maxX, maxY) {
        const teethMask = new Set();
        const data = imageData.data;
        const brightnessThreshold = 200;
        const saturationThreshold = 30;
        const teethY = lipCenterY + lipHeight * 0.1; // Approximate teeth position
    
        for (let y = Math.max(minY, teethY - lipHeight * 0.2); y <= Math.min(maxY, teethY + lipHeight * 0.2); y++) {
            for (let x = minX; x <= maxX; x++) {
                const pixelIndex = y * imageData.width + x;
                if (!lipRegion.has(pixelIndex)) continue;
    
                const i = pixelIndex * 4;
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
    
                const brightness = (r + g + b) / 3;
                const saturation = Math.max(r, g, b) - Math.min(r, g, b);
    
                if (brightness > brightnessThreshold && saturation < saturationThreshold) {
                    teethMask.add(pixelIndex);
                }
            }
        }
    
        return teethMask;
    }
    
    

    const phonemes = Object.keys(mouthShapes);
    // const phonemes = ['Closed', ...Object.keys(mouthShapes), 'Closed'];


    const segmentedImages = [];
    const interpolationSteps = 4;
    for (let i = 0; i < totalImageCount * interpolationSteps; i++) {
        // const phonemeIndex = i % phonemes.length;
        const phonemeIndex = Math.floor(i / interpolationSteps) % phonemes.length;

        const phoneme = phonemes[phonemeIndex];
        const nextPhoneme = phonemes[(phonemeIndex + 1) % phonemes.length];
        
        // Interpolate between current and next shape for smoother transition
        // const t = (i % phonemes.length) / phonemes.length;
        const t = (i % interpolationSteps) / interpolationSteps;


        const interpolatedShape = interpolateShapes(mouthShapes[phoneme], mouthShapes[nextPhoneme], t);
        // if (interpolatedShape.openness > -0.5) {
        //     interpolatedShape.openness -= 0.3; // Increase bias towards more closed shapes
        // }
        
        
        const lipSyncFrame = performLipSync(interpolatedShape);
        console.log(`Frame ${i}: Phoneme ${phoneme}, Shape:`, interpolatedShape);

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


function interpolateShapes(shape1, shape2, t) {
    const easeT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // Ease in-out quadratic
    return {
        openness: shape1.openness * (1 - easeT) + shape2.openness * easeT,
        width: shape1.width * (1 - easeT) + shape2.width * easeT,
        squeeze: shape1.squeeze * (1 - easeT) + shape2.squeeze * easeT,
        cupidsBow: shape1.cupidsBow * (1 - easeT) + shape2.cupidsBow * easeT,
        lowerLipFullness: shape1.lowerLipFullness * (1 - easeT) + shape2.lowerLipFullness * easeT
    };
}