// perspectiveFisheyeWorker.js
self.onmessage = function(e) {
    const { imageData, value } = e.data;
    const width = imageData.width;
    const height = imageData.height;
    const pixels = imageData.data;

    const newImageData = new ImageData(width, height);
    const newPixels = newImageData.data;

    const fisheyeIntensity = 1 - value * 0.8; // Inverted and adjusted range
    const centerX = width / 2;
    const centerY = height / 2;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const dx = (x - centerX) / centerX;
            const dy = (y - centerY) / centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance <= 1) {
                const newDistance = Math.pow(distance, fisheyeIntensity) / distance;
                const sourceX = centerX + dx * newDistance * centerX;
                const sourceY = centerY + dy * newDistance * centerY;

                if (sourceX >= 0 && sourceX < width - 1 && sourceY >= 0 && sourceY < height - 1) {
                    const x1 = Math.floor(sourceX);
                    const y1 = Math.floor(sourceY);
                    const x2 = x1 + 1;
                    const y2 = y1 + 1;

                    const wx = sourceX - x1;
                    const wy = sourceY - y1;

                    const targetIndex = (y * width + x) * 4;

                    for (let i = 0; i < 4; i++) {
                        const topLeft = pixels[(y1 * width + x1) * 4 + i];
                        const topRight = pixels[(y1 * width + x2) * 4 + i];
                        const bottomLeft = pixels[(y2 * width + x1) * 4 + i];
                        const bottomRight = pixels[(y2 * width + x2) * 4 + i];

                        const interpolatedValue = 
                            topLeft * (1 - wx) * (1 - wy) +
                            topRight * wx * (1 - wy) +
                            bottomLeft * (1 - wx) * wy +
                            bottomRight * wx * wy;

                        newPixels[targetIndex + i] = interpolatedValue;
                    }
                }
            }
        }
    }

    self.postMessage({ imageData: newImageData });
};