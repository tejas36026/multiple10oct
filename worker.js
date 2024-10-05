// worker.js
self.onmessage = function(event) {
    const { imageData, width, height } = event.data;
    const masks = generateMasks(width, height);
    self.postMessage(masks);
};

function generateMasks(width, height) {
    const numMasks = 3 + Math.floor(Math.random() * 3); // Generate 3 to 5 masks
    const masks = [];

    for (let i = 0; i < numMasks; i++) {
        const maskData = new Uint8ClampedArray(width * height * 4);
        const color = [
            Math.floor(Math.random() * 256),
            Math.floor(Math.random() * 256),
            Math.floor(Math.random() * 256),
            255
        ];

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = (y * width + x) * 4;
                if (Math.random() > 0.5) {
                    maskData[index] = color[0];
                    maskData[index + 1] = color[1];
                    maskData[index + 2] = color[2];
                    maskData[index + 3] = color[3];
                } else {
                    maskData[index + 3] = 0;
                }
            }
        }

        masks.push({
            width: width,
            height: height,
            data: maskData.buffer
        });
    }

    return masks;
}