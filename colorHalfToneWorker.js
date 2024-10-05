self.onmessage = function(e) {
    const { imageData, value, index } = e.data;
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const scale = value;
    const angles = [Math.PI / 8, Math.PI / 4, 0, -Math.PI / 4];

    const tempData = new Uint8ClampedArray(data);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const sourceIndex = (y * width + x) * 4;
            const cmyk = [
                1 - tempData[sourceIndex] / 255,
                1 - tempData[sourceIndex + 1] / 255,
                1 - tempData[sourceIndex + 2] / 255,
                0  // Key (black) component
            ];

            for (let i = 0; i < 4; i++) {
                const angle = angles[i];
                const pattern = Math.sin(x * scale * Math.cos(angle) + y * scale * Math.sin(angle)) * Math.sin(x * scale * Math.sin(angle) - y * scale * Math.cos(angle));
                const dotSize = 0.5 + 0.5 * pattern;
                cmyk[i] = cmyk[i] > dotSize ? 1 : 0;
            }

            data[sourceIndex] = 255 * (1 - cmyk[0]) * (1 - cmyk[3]);
            data[sourceIndex + 1] = 255 * (1 - cmyk[1]) * (1 - cmyk[3]);
            data[sourceIndex + 2] = 255 * (1 - cmyk[2]) * (1 - cmyk[3]);
        }
    }

    self.postMessage({ imageData, index, value });
};