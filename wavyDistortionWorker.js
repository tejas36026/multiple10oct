self.onmessage = function(e) {
    const { imageData, value } = e.data;
    const [xAmplitude, yAmplitude, frequency] = value;
    const width = imageData.width;
    const height = imageData.height;

    const newImageData = new ImageData(width, height);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const xOffset = Math.sin(y * frequency / height) * xAmplitude;
            const yOffset = Math.sin(x * frequency / width) * yAmplitude;

            const sourceX = Math.round(x + xOffset);
            const sourceY = Math.round(y + yOffset);

            if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
                const sourceIndex = (sourceY * width + sourceX) * 4;
                const targetIndex = (y * width + x) * 4;
                for (let i = 0; i < 4; i++) {
                    newImageData.data[targetIndex + i] = imageData.data[sourceIndex + i];
                }
            }
        }
    }

    self.postMessage({ imageData: newImageData });
};