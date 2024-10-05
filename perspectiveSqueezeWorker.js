// perspectiveSqueezeWorker.js
self.onmessage = function(e) {
    const { imageData, value } = e.data;
    const width = imageData.width;
    const height = imageData.height;
    const pixels = imageData.data;

    const squeeze = 1 - value * 0.9; // Increased range for more dramatic effect
    const newImageData = new ImageData(width, height);
    const newPixels = newImageData.data;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const normalizedX = (x / width - 0.5) * 2;
            const normalizedY = (y / height - 0.5) * 2;
            
            // Apply squeeze effect with vertical variation
            const squeezeFactor = squeeze + (1 - squeeze) * Math.abs(normalizedY);
            const sourceX = (normalizedX * squeezeFactor + 1) * width / 2;
            
            if (sourceX >= 0 && sourceX < width - 1) {
                const x1 = Math.floor(sourceX);
                const x2 = x1 + 1;
                const wx = sourceX - x1;

                const targetIndex = (y * width + x) * 4;

                for (let i = 0; i < 4; i++) {
                    const left = pixels[(y * width + x1) * 4 + i];
                    const right = pixels[(y * width + x2) * 4 + i];
                    
                    // Linear interpolation
                    const interpolatedValue = left * (1 - wx) + right * wx;
                    
                    newPixels[targetIndex + i] = interpolatedValue;
                }
            }
        }
    }

    self.postMessage({ imageData: newImageData });
};