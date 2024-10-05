self.onmessage = function(e) {
    const {
        imageData,
        selectedRegions,
        imageCount,
        value1,
        value2,
        value3,
        value4,
        value5
    } = e.data;

    let segmentedImages = [];

    try {
        // Optimize: Find edge pixels once for all regions
        const edgePixels = findAllEdgePixels(imageData, selectedRegions);

        // Apply smooth edges to the selected regions
        const smoothedImageData = smoothEdgesForSelectedRegions(imageData, edgePixels);

        for (let i = 0; i < imageCount; i++) {
            const newImageData = new ImageData(
                new Uint8ClampedArray(smoothedImageData.data),
                smoothedImageData.width,
                smoothedImageData.height
            );

            applyAdditionalEffects(newImageData, edgePixels, value1, value2, value3, value4, value5);

            segmentedImages.push(newImageData);
        }
    } catch (error) {
        console.error('Error in smooth edges worker:', error);
        segmentedImages = [];
    }

    // Ensure segmentedImages is always an array
    if (!Array.isArray(segmentedImages)) {
        segmentedImages = [];
    }

    // Send the processed images back to the main script
    self.postMessage({ segmentedImages: segmentedImages, effect: 'SmoothEdges' });
};

function findAllEdgePixels(imageData, selectedRegions) {
    const edgePixels = new Set();
    for (const region of selectedRegions) {
        for (const pixelIndex of region) {
            const x = pixelIndex % imageData.width;
            const y = Math.floor(pixelIndex / imageData.width);
            if (isEdgePixel(imageData, x, y)) {
                edgePixels.add(pixelIndex);
            }
        }
    }
    return Array.from(edgePixels);
}

// Include all the functions from the smooth edges code here


function smoothEdgesForSelectedRegions(imageData, edgePixels) {
    const newImageData = new ImageData(
        new Uint8ClampedArray(imageData.data),
        imageData.width,
        imageData.height
    );

    for (const pixelIndex of edgePixels) {
        const x = pixelIndex % newImageData.width;
        const y = Math.floor(pixelIndex / newImageData.width);
        gaussianBlur(newImageData, x, y, 3);
    }

    return newImageData;
}

function smoothEdgePixels(imageData, edgePixels) {
    for (const pixelIndex of edgePixels) {
        const x = pixelIndex % imageData.width;
        const y = Math.floor(pixelIndex / imageData.width);
        gaussianBlur(imageData, x, y, 3);
    }
}


function findEdgePixels(imageData, region) {
    const edgePixels = [];
    for (const pixelIndex of region) {
        const x = pixelIndex % imageData.width;
        const y = Math.floor(pixelIndex / imageData.width);
        if (isEdgePixel(imageData, x, y)) {
            edgePixels.push(pixelIndex);
        }
    }
    return edgePixels;
}


function smoothEdges(imageData, selectedRegions) {

    console.log("object");
    const newImageData = new ImageData(
        new Uint8ClampedArray(imageData.data),
        imageData.width,
        imageData.height
    );
console.log("object");
    manualRefinement(newImageData, selectedRegions);
    smoothSelection(newImageData, selectedRegions);

    console.log("object");
    featherEdges(newImageData, selectedRegions);
    adjustContrast(newImageData, selectedRegions);
    shiftEdges(newImageData, selectedRegions);
    console.log("object");

    return newImageData;
}

function manualRefinement(imageData, selectedRegions) {
    for (const pixelIndex of selectedRegions[0]) {
        const x = pixelIndex % imageData.width;
        const y = Math.floor(pixelIndex / imageData.width);
        if (isEdgePixel(imageData, x, y)) {
            averageWithNeighbors(imageData, x, y);
        }
    }
}



function smoothSelection(imageData, selectedRegions) {
    for (const pixelIndex of selectedRegions[0]) {
        const x = pixelIndex % imageData.width;
        const y = Math.floor(pixelIndex / imageData.width);
        boxBlur(imageData, x, y, 3);
    }
}

function featherEdges(imageData, selectedRegions) {
    for (const pixelIndex of selectedRegions[0]) {
        const x = pixelIndex % imageData.width;
        const y = Math.floor(pixelIndex / imageData.width);
        if (isEdgePixel(imageData, x, y)) {
            gaussianBlur(imageData, x, y, 5);
        }
    }
}


function adjustContrast(imageData, selectedRegions) {
    const contrastFactor = 1.2;
    for (const pixelIndex of selectedRegions[0]) {
        const x = pixelIndex % imageData.width;
        const y = Math.floor(pixelIndex / imageData.width);
        if (isEdgePixel(imageData, x, y)) {
            const idx = (y * imageData.width + x) * 4;
            for (let c = 0; c < 3; c++) {
                let color = imageData.data[idx + c];
                color = ((color / 255 - 0.5) * contrastFactor + 0.5) * 255;
                imageData.data[idx + c] = Math.max(0, Math.min(255, color));
            }
        }
    }
}

function shiftEdges(imageData, selectedRegions) {
    // Adjust selection edges inward or outward                console.log("object");

    console.log("object");

    // This is a complex operation that would require sophisticated edge detection and manipulation
    // A simplified version might involve expanding or contracting the selection
    const shiftAmount = 1; // Positive to expand, negative to contract
    for (let region of selectedRegions) {
        let { x, y, width, height } = region;
        x -= shiftAmount;
        y -= shiftAmount;
        width += 2 * shiftAmount;
        height += 2 * shiftAmount;
        // Ensure we don't go out of bounds

        console.log("object");
        x = Math.max(0, x);
        y = Math.max(0, y);
        width = Math.min(width, imageData.width - x);
        height = Math.min(height, imageData.height - y);
        // Update the region
        region.x = x;
        region.y = y;
        region.width = width;
        region.height = height;
    }
}

// Helper functions

function isEdgePixel(imageData, x, y) {
    const threshold = 30;
    const idx = (y * imageData.width + x) * 4;
    const leftIdx = idx - 4;
    const rightIdx = idx + 4;
    const topIdx = ((y - 1) * imageData.width + x) * 4;
    const bottomIdx = ((y + 1) * imageData.width + x) * 4;

    for (let c = 0; c < 3; c++) {
        if (Math.abs(imageData.data[leftIdx + c] - imageData.data[rightIdx + c]) > threshold ||
            Math.abs(imageData.data[topIdx + c] - imageData.data[bottomIdx + c]) > threshold) {
            return true;
        }
    }
    return false;
}


function averageWithNeighbors(imageData, x, y) {
    console.log("object");

    let idx = (y * imageData.width + x) * 4;
    for (let c = 0; c < 3; c++) {
        let sum = 0;
        let count = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                let newX = x + i;
                let newY = y + j;
                if (newX >= 0 && newX < imageData.width && newY >= 0 && newY < imageData.height) {
                    sum += imageData.data[(newY * imageData.width + newX) * 4 + c];
                    count++;
                }
            }
        }
        imageData.data[idx + c] = sum / count;
    }
}

function boxBlur(imageData, x, y, size) {
    console.log("object");

    let idx = (y * imageData.width + x) * 4;
    for (let c = 0; c < 3; c++) {
        let sum = 0;
        let count = 0;
        for (let i = -Math.floor(size/2); i <= Math.floor(size/2); i++) {
            console.log("object");
            for (let j = -Math.floor(size/2); j <= Math.floor(size/2); j++) {
                let newX = x + i;
                let newY = y + j;
                if (newX >= 0 && newX < imageData.width && newY >= 0 && newY < imageData.height) {
                    sum += imageData.data[(newY * imageData.width + newX) * 4 + c];
                    count++;
                }
            }
        }
        imageData.data[idx + c] = sum / count;
    }
}

function gaussianBlur(imageData, x, y, radius) {
    const sigma = radius / 3;
    let r = 0, g = 0, b = 0, a = 0, weight = 0;

    for (let i = -radius; i <= radius; i++) {
        for (let j = -radius; j <= radius; j++) {
            const newX = Math.min(Math.max(x + i, 0), imageData.width - 1);
            const newY = Math.min(Math.max(y + j, 0), imageData.height - 1);
            const idx = (newY * imageData.width + newX) * 4;
            const gaussianWeight = Math.exp(-(i*i + j*j) / (2 * sigma * sigma));

            r += imageData.data[idx] * gaussianWeight;
            g += imageData.data[idx + 1] * gaussianWeight;
            b += imageData.data[idx + 2] * gaussianWeight;
            a += imageData.data[idx + 3] * gaussianWeight;
            weight += gaussianWeight;
        }
    }

    const resultIdx = (y * imageData.width + x) * 4;
    imageData.data[resultIdx] = r / weight;
    imageData.data[resultIdx + 1] = g / weight;
    imageData.data[resultIdx + 2] = b / weight;
    imageData.data[resultIdx + 3] = a / weight;
}

function applyAdditionalEffects(imageData, edgePixels, value1, value2, value3, value4, value5) {
    const adjustmentFactor = value1 / 100;
    for (const pixelIndex of edgePixels) {
        const idx = pixelIndex * 4;
        for (let j = 0; j < 3; j++) {
            imageData.data[idx + j] = Math.min(255, Math.max(0, imageData.data[idx + j] * (1 + adjustmentFactor)));
        }
    }
    // Add more effects using value2, value3, etc. if needed
}
