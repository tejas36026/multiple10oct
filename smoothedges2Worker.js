self.onmessage = function(e) {

    const imageData = e.data.imageData;
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;

    applyEssentialClassic(data);

    applyLowFidelityPhoto(data, width, height);

    self.postMessage({
        processedImageData: imageData
    });

};

function applyEssentialClassic(data) {

    for (let i = 0; i < data.length; i += 4) {

        data[i] = Math.min(255, Math.max(0, (data[i] - 128) * 1.2 + 128));
        data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * 1.2 + 128));
        data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * 1.2 + 128));
    }

}

function applyLowFidelityPhoto(data, width, height) {
    const tempData = new Uint8ClampedArray(data);
    const pixelSize = 4; // Adjust this value to change the pixelation effect
    const colorLevels = 4; // Adjust this value to change the number of color levels

    for (let y = 0; y < height; y += pixelSize) {
        for (let x = 0; x < width; x += pixelSize) {
            const i = (y * width + x) * 4;
            const r = quantizeColor(tempData[i], colorLevels);
            const g = quantizeColor(tempData[i + 1], colorLevels);
            const b = quantizeColor(tempData[i + 2], colorLevels);
            const a = tempData[i + 3];

            for (let dy = 0; dy < pixelSize && y + dy < height; dy++) {
                for (let dx = 0; dx < pixelSize && x + dx < width; dx++) {
                    const j = ((y + dy) * width + (x + dx)) * 4;
                    data[j] = r;
                    data[j + 1] = g;
                    data[j + 2] = b;
                    data[j + 3] = a;
                }
            }
        }
    }
}

function quantizeColor(value, levels) {
    const step = 255 / (levels - 1);
    return Math.round(Math.round(value / step) * step);
}