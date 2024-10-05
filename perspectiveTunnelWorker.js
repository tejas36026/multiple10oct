self.onmessage = function(e) {
    const { imageData, value } = e.data;
    const tunnelStrength = value * 0.5; // Adjust this multiplier to control the effect strength

    const width = imageData.width;
    const height = imageData.height;
    const centerX = width / 2;
    const centerY = height / 2;

    const newImageData = new ImageData(width, height);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const dx = x - centerX;
            const dy = y - centerY;

            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);
            const r = distance / (1 + tunnelStrength * (distance / Math.max(width, height)));

            const sourceX = Math.round(centerX + r * Math.cos(angle));
            const sourceY = Math.round(centerY + r * Math.sin(angle));

            if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
                const oldIndex = (sourceY * width + sourceX) * 4;
                const newIndex = (y * width + x) * 4;

                newImageData.data[newIndex] = imageData.data[oldIndex];
                newImageData.data[newIndex + 1] = imageData.data[oldIndex + 1];
                newImageData.data[newIndex + 2] = imageData.data[oldIndex + 2];
                newImageData.data[newIndex + 3] = imageData.data[oldIndex + 3];
            }
        }
    }

    self.postMessage({ imageData: newImageData });
};