self.onmessage = function(e) {
    const { imageData, imageCount } = e.data;
    const segmentedImages = [];

    function getPixel(imageData, x, y) {
        const index = (y * imageData.width + x) * 4;
        return {
            r: imageData.data[index],
            g: imageData.data[index + 1],
            b: imageData.data[index + 2],
            a: imageData.data[index + 3]
        };
    }

    function setPixel(imageData, x, y, r, g, b, a) {
        const index = (y * imageData.width + x) * 4;
        imageData.data[index] = r;
        imageData.data[index + 1] = g;
        imageData.data[index + 2] = b;
        imageData.data[index + 3] = a;
    }

    function createRedOverlay(sourceImageData, progress) {
        const newImageData = new ImageData(new Uint8ClampedArray(sourceImageData.data), sourceImageData.width, sourceImageData.height);

        const overlayStartY = Math.floor(sourceImageData.height * 0.6);
        const overlayEndY = Math.floor(sourceImageData.height * 0.9);
        const overlayWidth = Math.floor(sourceImageData.width * progress);

        for (let y = overlayStartY; y < overlayEndY; y++) {
            for (let x = 0; x < overlayWidth; x++) {
                const originalPixel = getPixel(sourceImageData, x, y);
                // Blend with red
                setPixel(newImageData, x, y, 
                    Math.min(255, originalPixel.r + 100),
                    originalPixel.g * 0.5,
                    originalPixel.b * 0.5,
                    originalPixel.a
                );
            }
        }

        return newImageData;
    }

    for (let i = 0; i < imageCount; i++) {
        const progress = i / (imageCount - 1);
        const redOverlayImage = createRedOverlay(imageData, progress);
        segmentedImages.push(redOverlayImage);
    }

    self.postMessage({ segmentedImages, isComplete: true });
};