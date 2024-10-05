self.onmessage = function(e) {
    const { imageData, value, index } = e.data;
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];
        data[i + 1] = 255 - data[i + 1];
        data[i + 2] = 255 - data[i + 2];
    }

    self.postMessage({ imageData, index, value });
};