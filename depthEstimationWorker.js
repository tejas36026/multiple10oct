// depthEstimationWorker.js

self.onmessage = function(e) {
    const { imageData, value } = e.data;
    const depthMap = estimateDepth(imageData);
    const result = applyDepthEffect(imageData, depthMap, value);
    self.postMessage({ imageData: result });
};

function estimateDepth(imageData) {
    const width = imageData.width;
    const height = imageData.height;
    const depthMap = new Uint8ClampedArray(width * height);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            const r = imageData.data[i];
            const g = imageData.data[i + 1];
            const b = imageData.data[i + 2];

            // Simple depth estimation based on pixel brightness
            // Brighter pixels are considered "closer" in this simple model
            const brightness = (r + g + b) / 3;
            depthMap[y * width + x] = brightness;
        }
    }

    return depthMap;
}

function applyDepthEffect(imageData, depthMap, intensity) {
    const width = imageData.width;
    const height = imageData.height;
    const result = new ImageData(new Uint8ClampedArray(imageData.data), width, height);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            const depth = depthMap[y * width + x] / 255; // Normalize depth to 0-1

            // Apply a simple depth-based effect
            // Here, we're adjusting brightness based on depth
            const factor = 1 + (depth - 0.5) * intensity;

            result.data[i] = Math.min(255, imageData.data[i] * factor);
            result.data[i + 1] = Math.min(255, imageData.data[i + 1] * factor);
            result.data[i + 2] = Math.min(255, imageData.data[i + 2] * factor);
        }
    }

    return result;
}