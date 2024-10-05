self.onmessage = function(e) {
    const { imageData, selectedRegions, value1 } = e.data;
    const chunkSize = 10000; // Process 10000 pixels at a time
    let processedPixels = 0;

    const smoothedImageData = new ImageData(
        new Uint8ClampedArray(imageData.data),
        imageData.width,
        imageData.height
    );

    function processChunk() {
        const endPixel = Math.min(processedPixels + chunkSize, selectedRegions[0].length);
        for (let i = processedPixels; i < endPixel; i++) {
            const pixelIndex = selectedRegions[0][i];
            const x = pixelIndex % imageData.width;
            const y = Math.floor(pixelIndex / imageData.width);
            if (isEdgePixel(smoothedImageData, x, y)) {
                gaussianBlur(smoothedImageData, x, y, 3);
                applyAdditionalEffects(smoothedImageData, x, y, value1);
            }
        }
        processedPixels = endPixel;

        if (processedPixels < selectedRegions[0].length) {
            self.postMessage({ progress: processedPixels / selectedRegions[0].length });
            setTimeout(processChunk, 0);
        } else {
            self.postMessage({ segmentedImages: [smoothedImageData], effect: 'SmoothEdges' });
        }
    }

    processChunk();
};

function isEdgePixel(imageData, x, y) {
    // Implement a simple edge detection
    const idx = (y * imageData.width + x) * 4;
    const leftIdx = idx - 4;
    const rightIdx = idx + 4;
    const topIdx = ((y - 1) * imageData.width + x) * 4;
    const bottomIdx = ((y + 1) * imageData.width + x) * 4;
    
    for (let c = 0; c < 3; c++) {
        if (Math.abs(imageData.data[leftIdx + c] - imageData.data[rightIdx + c]) > 30 ||
            Math.abs(imageData.data[topIdx + c] - imageData.data[bottomIdx + c]) > 30) {
            return true;
        }
    }
    return false;
}

function gaussianBlur(imageData, x, y, radius) {
    // Implement a simple blur
    let r = 0, g = 0, b = 0, count = 0;
    for (let i = -radius; i <= radius; i++) {
        for (let j = -radius; j <= radius; j++) {
            const newX = Math.min(Math.max(x + i, 0), imageData.width - 1);
            const newY = Math.min(Math.max(y + j, 0), imageData.height - 1);
            const idx = (newY * imageData.width + newX) * 4;
            r += imageData.data[idx];
            g += imageData.data[idx + 1];
            b += imageData.data[idx + 2];
            count++;
        }
    }
    const resultIdx = (y * imageData.width + x) * 4;
    imageData.data[resultIdx] = r / count;
    imageData.data[resultIdx + 1] = g / count;
    imageData.data[resultIdx + 2] = b / count;
}

function applyAdditionalEffects(imageData, x, y, value1) {
    const idx = (y * imageData.width + x) * 4;
    const factor = 1 + value1 / 100;
    for (let i = 0; i < 3; i++) {
        imageData.data[idx + i] = Math.min(255, imageData.data[idx + i] * factor);
    }
}
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

