// perspectiveCurveWorker.js
self.onmessage = function(e) {
    const { imageData, value } = e.data;
    const width = imageData.width;
    const height = imageData.height;
    const pixels = imageData.data;

    const curveIntensity = value * 0.5; // Increased range for more dramatic effect
    const newImageData = new ImageData(width, height);
    const newPixels = newImageData.data;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const normalizedX = (x / width - 0.5) * 2;
            const normalizedY = (y / height - 0.5) * 2;

            // Apply curve distortion
            const distortion = 1 + curveIntensity * (normalizedX * normalizedX);
            const sourceY = (normalizedY / distortion + 1) * height / 2;

            if (sourceY >= 0 && sourceY < height - 1) {
                const y1 = Math.floor(sourceY);
                const y2 = y1 + 1;
                const wy = sourceY - y1;

                const targetIndex = (y * width + x) * 4;

                for (let i = 0; i < 4; i++) {
                    const top = pixels[(y1 * width + x) * 4 + i];
                    const bottom = pixels[(y2 * width + x) * 4 + i];
                    
                    // Linear interpolation
                    const interpolatedValue = top * (1 - wy) + bottom * wy;
                    
                    newPixels[targetIndex + i] = interpolatedValue;
                }
            }
        }
    }

    self.postMessage({ imageData: newImageData });
};