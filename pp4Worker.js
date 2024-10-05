self.onmessage = function(e) {
    const data = e.data;
    console.log('e.data :>> ', e.data);
    const imageData = data.imageData;
    const selectedRegions = data.selectedRegions;
    const baseImageCount = data.imageCount || 5;
    const totalImageCount = baseImageCount * 64 * 16;
    const baseValue1 = data.value1 || 180;

    let processedCount = 0;
    let segmentedImages = [];

    function processNextImage() {
        if (processedCount >= totalImageCount) {
            // All images processed, send final message
            self.postMessage({
                segmentedImages: segmentedImages,
                isComplete: true
            });
            return;
        }

        const newImageData = new ImageData(
            new Uint8ClampedArray(imageData.data),
            imageData.width,
            imageData.height
        );

        const moveX = (Math.random() - 0.5) * 2 * baseValue1;
        const moveY = (Math.random() - 0.5) * 2 * baseValue1;

        for (let j = 0; j < newImageData.data.length; j += 4) {
            newImageData.data[j + 3] = 0;
        }

        for (const region of selectedRegions) {
            for (const pixelIndex of region) {
                const x = pixelIndex % imageData.width;
                const y = Math.floor(pixelIndex / imageData.width);
                
                const newX = Math.round(x + moveX);
                const newY = Math.round(y + moveY);

                if (newX >= 0 && newX < imageData.width && newY >= 0 && newY < imageData.height) {
                    const oldIndex = (y * imageData.width + x) * 4;
                    const newIndex = (newY * imageData.width + newX) * 4;

                    for (let c = 0; c < 4; c++) {
                        newImageData.data[newIndex + c] = imageData.data[oldIndex + c];
                    }
                }
            }
        }

        segmentedImages.push(newImageData);
        processedCount++;

        if (segmentedImages.length >= 10 || processedCount >= totalImageCount) {

            self.postMessage({

                segmentedImages: segmentedImages,
                isComplete: processedCount >= totalImageCount
            });
            segmentedImages = []; 

        }

        setTimeout(processNextImage, 0);
    }

    processNextImage();
};

function getRandomValue(baseValue, index, seed) {
    const random = seededRandom(index * 5 + seed);
    return (random() - 0.5) * 2 * baseValue;
}

function seededRandom(seed) {
    const m = 2 ** 35 - 31;
    const a = 185852;
    let s = seed % m;
    return function() {
        return (s = s * a % m) / m;
    };
}

function getAverageColor(imageData, selectedRegions) {
    let r = 0, g = 0, b = 0, count = 0;
    const borderPixels = new Set();

    for (const region of selectedRegions) {
        for (const pixelIndex of region) {
            const x = pixelIndex % imageData.width;
            const y = Math.floor(pixelIndex / imageData.width);
            
    
            if (x === 0 || x === imageData.width - 1 || y === 0 || y === imageData.height - 1 ||
                !region.includes((y-1) * imageData.width + x) ||
                !region.includes((y+1) * imageData.width + x) ||
                !region.includes(y * imageData.width + x - 1) ||
                !region.includes(y * imageData.width + x + 1)) {
                borderPixels.add(pixelIndex);
            }
        }
    }

    for (const pixelIndex of borderPixels) {
        const i = pixelIndex * 4;
        r += imageData.data[i];
        g += imageData.data[i + 1];
        b += imageData.data[i + 2];
        count++;
    }

    if (count > 0) {
        return [Math.round(r / count), Math.round(g / count), Math.round(b / count)];
    } else {
        return [0, 0, 0]; // Default to black if no border pixels
    }
}
