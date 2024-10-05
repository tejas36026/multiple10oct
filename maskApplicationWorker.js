self.onmessage = function(e) {
    const { imageData, maskData, opacity } = e.data;
    const width = imageData.width;
    const height = imageData.height;
    const newImageData = new ImageData(width, height);

    for (let i = 0; i < imageData.data.length; i += 4) {
        const maskAlpha = maskData.data[i + 3] / 255 * opacity;
        newImageData.data[i] = imageData.data[i] * (1 - maskAlpha) + maskData.data[i] * maskAlpha;
        newImageData.data[i + 1] = imageData.data[i + 1] * (1 - maskAlpha) + maskData.data[i + 1] * maskAlpha;
        newImageData.data[i + 2] = imageData.data[i + 2] * (1 - maskAlpha) + maskData.data[i + 2] * maskAlpha;
        newImageData.data[i + 3] = imageData.data[i + 3];
    }

    self.postMessage({ imageData: newImageData });
};