self.onmessage = function(e) {
    const {
        imageData,
        selectedRegions
    } = e.data;

    if (!imageData || !selectedRegions) {
        self.postMessage({
            error: "Missing required data. Please provide both imageData and selectedRegions.",
            isComplete: true
        });
        return;
    }

    const width = imageData.width;
    const height = imageData.height;

    if (!width || !height) {
        self.postMessage({
            error: "Invalid image data. Width or height is missing.",
            isComplete: true
        });
        return;
    }

    try {
        const newImageData = new ImageData(new Uint8ClampedArray(imageData.data), width, height);

        // Create a map of selected pixels for faster lookups
        const selectedPixels = new Set(selectedRegions.flat());

        // Collect background pixels
        const backgroundPixels = collectBackgroundPixels(imageData, selectedPixels, width, height);

        // Process the image
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const pixelIndex = y * width + x;
                if (selectedPixels.has(pixelIndex)) {
                    const backgroundColor = getRandomBackgroundPixel(backgroundPixels);
                    const i = pixelIndex * 4;
                    newImageData.data[i] = backgroundColor[0];
                    newImageData.data[i + 1] = backgroundColor[1];
                    newImageData.data[i + 2] = backgroundColor[2];
                    newImageData.data[i + 3] = backgroundColor[3];
                }
            }
        }

        self.postMessage({
            segmentedImages: [newImageData],
            isComplete: true
        });
    } catch (error) {
        self.postMessage({
            error: "An error occurred during processing: " + error.message,
            isComplete: true
        });
    }
};

function collectBackgroundPixels(imageData, selectedPixels, width, height) {
    const backgroundPixels = [];
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const pixelIndex = y * width + x;
            if (!selectedPixels.has(pixelIndex)) {
                const i = pixelIndex * 4;
                backgroundPixels.push([
                    imageData.data[i],
                    imageData.data[i + 1],
                    imageData.data[i + 2],
                    imageData.data[i + 3]
                ]);
            }
        }
    }
    return backgroundPixels;
}

function getRandomBackgroundPixel(backgroundPixels) {
    if (backgroundPixels.length === 0) {
        return [128, 128, 128, 255]; // Fallback to gray if no background pixels
    }
    return backgroundPixels[Math.floor(Math.random() * backgroundPixels.length)];
}