// perspectiveTwistWorker.js
self.onmessage = function(e) {
    const { imageData, value } = e.data;
    const width = imageData.width;
    const height = imageData.height;
    const pixels = imageData.data;

    const newImageData = new ImageData(width, height);
    const newPixels = newImageData.data;

    const twistAngle = value * Math.PI * 2;
    const centerX = width / 2;
    const centerY = height / 2;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const dx = x - centerX;
            const dy = y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
            
            const angle = Math.atan2(dy, dx) + twistAngle * (1 - distance / maxDistance);
            
            const sourceX = centerX + distance * Math.cos(angle);
            const sourceY = centerY + distance * Math.sin(angle);

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

    self.postMessage({ imageData: newImageData });
};