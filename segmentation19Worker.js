self.onmessage = function(e) {
    const { imageData, value } = e.data;
    const threshold = 30 + (value * 100);

    try {
        const backgroundRemovedData = removeBackground(imageData, threshold);

        const segmentedData = segmentImage(backgroundRemovedData, value);

        self.postMessage({
            imageData: segmentedImageData,
            segments: segmentedSegments
        });
    } catch (error) {
        self.postMessage({
            error: error.message,
            imageData: null,
            segments: []
        });
    }
};

function removeBackground(imageData, threshold) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    
    const bgColors = [
        {r: data[0], g: data[1], b: data[2]},                   // Top-left
        {r: data[(width-1)*4], g: data[(width-1)*4+1], b: data[(width-1)*4+2]},  // Top-right
        {r: data[(height-1)*width*4], g: data[(height-1)*width*4+1], b: data[(height-1)*width*4+2]},  // Bottom-left
        {r: data[(height*width-1)*4], g: data[(height*width-1)*4+1], b: data[(height*width-1)*4+2]}   // Bottom-right
    ];
    
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        if (bgColors.some(bgColor => colorDistance(r, g, b, bgColor.r, bgColor.g, bgColor.b) < threshold)) {
            data[i + 3] = 0;
        }
    }
    
    return imageData;
}

function colorDistance(r1, g1, b1, r2, g2, b2) {
    return Math.sqrt(
        Math.pow(r1 - r2, 2) +
        Math.pow(g1 - g2, 2) +
        Math.pow(b1 - b2, 2)
    );
}

function segmentImage(imageData, threshold = 30) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const segmentedData = new Uint8ClampedArray(data.length);
    const visited = new Uint8Array(width * height);
    const segments = [];

    const hueThreshold = 60; 
    const saturationThreshold = 0.95; 
    const valueThreshold = 0.96; 

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = y * width + x;
            if (!visited[index] && data[index * 4 + 3] !== 0) { // Only process non-transparent pixels
                const segment = floodFill(data, segmentedData, width, height, x, y, hueThreshold, saturationThreshold, valueThreshold, visited);
                if (segment.length >= 1450) {
                    segments.push(segment);
                }
            }
        }
    }

    segments.forEach((segment) => {
        const color = new Uint8Array([
            Math.floor(Math.random() * 256),
            Math.floor(Math.random() * 256),
            Math.floor(Math.random() * 256),
            255
        ]);
        for (let i = 0; i < segment.length; i++) {
            const idx = segment[i] * 4;
            segmentedData.set(color, idx);
        }
    });

    // Copy original alpha values
    for (let i = 3; i < data.length; i += 4) {
        segmentedData[i] = data[i];
    }

    return new ImageData(segmentedData, width, height);
}


function floodFill(data, segmentedData, width, height, x, y, hueThreshold, saturationThreshold, valueThreshold, visited) {
    const stack = [[x, y]];
    const segment = [];
    const baseColor = new Uint8Array([
        data[(y * width + x) * 4],
        data[(y * width + x) * 4 + 1],
        data[(y * width + x) * 4 + 2]
    ]);
    const baseHSV = rgbToHsv(baseColor[0], baseColor[1], baseColor[2]);

    for (let i = 0; i < width; i++) {
        copyPixel(data, segmentedData, i, 0, width);
        copyPixel(data, segmentedData, i, height - 1, width);
    }
    for (let i = 1; i < height - 1; i++) {
        copyPixel(data, segmentedData, 0, i, width);
        copyPixel(data, segmentedData, width - 1, i, width);
    }

    while (stack.length) {
        const [cx, cy] = stack.pop();
        const index = cy * width + cx;

        if (visited[index]) continue;
        visited[index] = 1;

        const pixelIndex = index * 4;
        const currentColor = [data[pixelIndex], data[pixelIndex + 1], data[pixelIndex + 2]];
        const currentHSV = rgbToHsv(currentColor[0], currentColor[1], currentColor[2]);

        if (isColorSimilarHSV(baseHSV, currentHSV, hueThreshold, saturationThreshold, valueThreshold)) {
            segment.push(index);

            if (cx > 0) stack.push([cx - 1, cy]);
            if (cx < width - 1) stack.push([cx + 1, cy]);
            if (cy > 0) stack.push([cx, cy - 1]);
            if (cy < height - 1) stack.push([cx, cy + 1]);
        }
    }

    return segment;
}

// Helper function to copy a pixel from source to destination
function copyPixel(sourceData, destData, x, y, width) {
    const index = (y * width + x) * 4;
    destData.set(sourceData.slice(index, index + 4), index);
}

function isColorSimilarHSV(hsv1, hsv2, hueThreshold, saturationThreshold, valueThreshold) {
    const hueDiff = Math.abs(hsv1[0] - hsv2[0]);
    const hueDiffWrapped = Math.min(hueDiff, 360 - hueDiff);
    const saturationDiff = Math.abs(hsv1[1] - hsv2[1]);
    const valueDiff = Math.abs(hsv1[2] - hsv2[2]);

    return hueDiffWrapped <= hueThreshold &&
           saturationDiff <= saturationThreshold &&
           valueDiff <= valueThreshold * Math.max(hsv1[2], hsv2[2]); // Adjust value threshold based on brightness
}


function rgbToHsv(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    
    let h, s, v = max;

    s = max === 0 ? 0 : diff / max;

    if (max === min) {
        h = 0;
    } else {
        switch (max) {
            case r:
                h = (g - b) / diff + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / diff + 2;
                break;
            case b:
                h = (r - g) / diff + 4;
                break;
        }
        h /= 6;
    }

    return [h * 360, s, v];
}


function segmentImage(imageData, threshold = 30) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const segmentedData = new Uint8ClampedArray(data.length);
    const visited = new Uint8Array(width * height);
    const segments = [];

    const hueThreshold = 60; 
    const saturationThreshold = 0.95; 
    const valueThreshold = 0.96; 

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = y * width + x;
            if (!visited[index]) {
                const segment = floodFill(data, segmentedData, width, height, x, y, hueThreshold, saturationThreshold, valueThreshold, visited);
                if (segment.length >= 1450) {
                    segments.push(segment);
                }
            }
        }
    }

    segments.forEach((segment) => {
        const color = new Uint8Array([
            Math.floor(Math.random() * 256),
            Math.floor(Math.random() * 256),
            Math.floor(Math.random() * 256),
            255
        ]);
        for (let i = 0; i < segment.length; i++) {
            const idx = segment[i] * 4;
            segmentedData.set(color, idx);
        }
    });

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            if (segmentedData[index + 3] === 0) {
                const nearestColor = findNearestSegmentedColor(segmentedData, width, height, x, y);
                segmentedData.set(nearestColor, index);
            }
        }
    }

    return new ImageData(segmentedData, width, height);

}

function findNearestSegmentedColor(segmentedData, width, height, x, y) {
    const maxDistance = Math.max(width, height);
    for (let d = 1; d < maxDistance; d++) {
        for (let i = -d; i <= d; i++) {
            for (let j = -d; j <= d; j++) {
                if (Math.abs(i) === d || Math.abs(j) === d) {
                    const nx = x + i;
                    const ny = y + j;
                    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                        const index = (ny * width + nx) * 4;
                        if (segmentedData[index + 3] !== 0) {
                            return segmentedData.slice(index, index + 4);
                        }
                    }
                }
            }
        }
    }
    return new Uint8Array([0, 0, 0, 255]); // Default to black if no segmented pixel is found
}