self.onmessage = function(e) {
    const { imageData, value } = e.data;
    const result = createDepthMap(imageData, value);
    self.postMessage({ imageData: result });
};

function createDepthMap(imageData, intensity) {
    const width = imageData.width;
    const height = imageData.height;
    const result = new ImageData(new Uint8ClampedArray(imageData.data), width, height);
    const edgeMap = detectEdges(imageData);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;

            const r = imageData.data[i];
            const g = imageData.data[i + 1];
            const b = imageData.data[i + 2];
            const brightness = (r + g + b) / 3;

            const edge = edgeMap[y * width + x];

            const depthValue = Math.floor((brightness * (1 - edge) + edge * 255) * intensity);

            result.data[i] = depthValue;
            result.data[i + 1] = depthValue;
            result.data[i + 2] = depthValue;
            result.data[i + 3] = 255;
        }
    }

    return result;
}

function detectEdges(imageData) {
    const width = imageData.width;
    const height = imageData.height;
    const edges = new Uint8ClampedArray(width * height);

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const i = (y * width + x) * 4;
            
            const gx = 
                -imageData.data[i - 4 - width * 4] +
                imageData.data[i + 4 - width * 4] +
                -2 * imageData.data[i - 4] +
                2 * imageData.data[i + 4] +
                -imageData.data[i - 4 + width * 4] +
                imageData.data[i + 4 + width * 4];

            const gy = 
                -imageData.data[i - width * 4 - 4] +
                -2 * imageData.data[i - width * 4] +
                -imageData.data[i - width * 4 + 4] +
                imageData.data[i + width * 4 - 4] +
                2 * imageData.data[i + width * 4] +
                imageData.data[i + width * 4 + 4];

            const edgeStrength = Math.sqrt(gx * gx + gy * gy);
            edges[y * width + x] = Math.min(255, edgeStrength) / 255;
        }
    }

    return edges;
}