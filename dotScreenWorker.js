self.onmessage = function(e) {
    const { imageData, value, index } = e.data;
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const angle = Math.PI / 4;
    const scale = value;

    const tempData = new Uint8ClampedArray(data);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const sourceIndex = (y * width + x) * 4;
            const intensity = (tempData[sourceIndex] + tempData[sourceIndex + 1] + tempData[sourceIndex + 2]) / 3;

            const pattern = Math.sin(x * scale * Math.cos(angle) + y * scale * Math.sin(angle)) * Math.sin(x * scale * Math.sin(angle) - y * scale * Math.cos(angle));
            const dotSize = 0.5 + 0.5 * pattern;
            const dotIntensity = intensity > 128 ? 255 : 0;

            data[sourceIndex] = data[sourceIndex + 1] = data[sourceIndex + 2] = dotIntensity * dotSize;
        }
    }

    self.postMessage({ imageData, index, value });
};