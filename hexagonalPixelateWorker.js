self.onmessage = function(e) {
    const {
        imageData,
        selectedRegions,
        imageCount,
        maxBrightness,
        value1,
        value2,
        value3,
        value4,
        value5,
        clickedPoints,
        lines
    } = e.data;

    const segmentedImages = [];

    const minCellSize = Math.max(1, parseInt(value1) || 5);
    const maxCellSize = Math.min(50, minCellSize + imageCount - 1);

    for (let i = 0; i < imageCount; i++) {
        const newImageData = new ImageData(
            new Uint8ClampedArray(imageData.data),
            imageData.width,
            imageData.height
        );

        const cellSize = minCellSize + i * 2;

        // Apply hexagonal pixelate effect with varying cell size
        applyHexagonalPixelateToRegions(newImageData, selectedRegions, cellSize);

        // Apply additional effects (color adjustments only)
        applyAdditionalEffects(newImageData, selectedRegions, value2, value3, value4, value5);

        segmentedImages.push(newImageData);
    }

    console.log(`Generated ${segmentedImages.length} images with varying pixel sizes`);
    
    self.postMessage({ segmentedImages: segmentedImages });
};

function applyHexagonalPixelateToRegions(imageData, selectedRegions, cellSize) {
    const width = imageData.width;
    const height = imageData.height;
    const halfHeight = cellSize * Math.sqrt(3) / 2;
    const selectedPixels = new Set(selectedRegions.flat());

    for (let y = 0; y < height; y += halfHeight) {
        const offset = (Math.floor(y / halfHeight) % 2) * 0.5;
        for (let x = 0; x < width; x += cellSize) {
            const centerX = Math.floor(x + cellSize * offset);
            const centerY = Math.floor(y);
            if (centerX < 0 || centerX >= width || centerY < 0 || centerY >= height) continue;

            const centerIndex = centerY * width + centerX;
            if (!selectedPixels.has(centerIndex)) continue;

            const centerColorIndex = centerIndex * 4;
            const r = imageData.data[centerColorIndex];
            const g = imageData.data[centerColorIndex + 1];
            const b = imageData.data[centerColorIndex + 2];

            for (let dy = -halfHeight; dy < halfHeight; dy++) {
                for (let dx = -cellSize / 2; dx < cellSize / 2; dx++) {
                    const px = Math.floor(centerX + dx);
                    const py = Math.floor(centerY + dy);
                    if (px < 0 || px >= width || py < 0 || py >= height) continue;

                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance > cellSize / 2) continue;

                    const pixelIndex = py * width + px;
                    if (!selectedPixels.has(pixelIndex)) continue;

                    const colorIndex = pixelIndex * 4;
                    imageData.data[colorIndex] = r;
                    imageData.data[colorIndex + 1] = g;
                    imageData.data[colorIndex + 2] = b;
                }
            }
        }
    }
}

function applyAdditionalEffects(imageData, selectedRegions, value2, value3, value4, value5) {
    const selectedPixels = new Set(selectedRegions.flat());
    const redAdjustment = value3 / 100;
    const greenAdjustment = value4 / 100;
    const blueAdjustment = value5 / 100;

    for (let i = 0; i < imageData.data.length; i += 4) {
        const pixelIndex = i / 4;
        if (selectedPixels.has(pixelIndex)) {
            // Apply color adjustments
            imageData.data[i] = Math.min(255, Math.max(0, imageData.data[i] * (1 + redAdjustment)));
            imageData.data[i + 1] = Math.min(255, Math.max(0, imageData.data[i + 1] * (1 + greenAdjustment)));
            imageData.data[i + 2] = Math.min(255, Math.max(0, imageData.data[i + 2] * (1 + blueAdjustment)));
        }
    }
}