self.onmessage = function(e) {
    const {
        imageData,
        selectedRegions,
        imageCount,
        hexSize,
        value1,
        value2,
        value3,
        value4,
        value5,
        clickedPoints,
        lines
    } = e.data;

    const segmentedImages = [];

    for (let i = 0; i < imageCount; i++) {
        // Create a copy of the original image data
        const newImageData = new ImageData(
            new Uint8ClampedArray(imageData.data),
            imageData.width,
            imageData.height
        );

        // Apply hexagonal effect to selected regions
        for (const region of selectedRegions) {
            applyHexagonalEffect(newImageData, region, hexSize);
        }

        // Apply additional effects based on value1, value2, etc.
        applyAdditionalEffects(newImageData, value1, value2, value3, value4, value5);

        segmentedImages.push(newImageData);
    }

    // Send the processed images back to the main script
    self.postMessage({ segmentedImages: segmentedImages });
};

function applyHexagonalEffect(imageData, region, hexSize) {
    const width = imageData.width;
    const height = imageData.height;
    const hexColors = new Map();

    for (const pixelIndex of region) {
        const x = pixelIndex % width;
        const y = Math.floor(pixelIndex / width);

        const hexCenterX = Math.floor(x / hexSize) * hexSize + hexSize / 2;
        const hexCenterY = Math.floor(y / hexSize) * hexSize + (Math.floor(x / hexSize) % 2 ? hexSize / 2 : 0);

        const hexKey = `${hexCenterX},${hexCenterY}`;

        if (!hexColors.has(hexKey)) {
            const colorSum = [0, 0, 0];
            let count = 0;

            // Calculate average color for the hexagon
            for (let dx = -hexSize / 2; dx < hexSize / 2; dx++) {
                for (let dy = -hexSize / 2; dy < hexSize / 2; dy++) {
                    const hx = Math.floor(hexCenterX + dx);
                    const hy = Math.floor(hexCenterY + dy);
                    if (hx >= 0 && hx < width && hy >= 0 && hy < height && isInsideHexagon(hx, hy, hexCenterX, hexCenterY, hexSize)) {
                        const index = (hy * width + hx) * 4;
                        for (let c = 0; c < 3; c++) {
                            colorSum[c] += imageData.data[index + c];
                        }
                        count++;
                    }
                }
            }

            if (count > 0) {
                const avgColor = colorSum.map(sum => Math.round(sum / count));
                hexColors.set(hexKey, avgColor);
            } else {
                // If no pixels were found in the hexagon, use the original pixel color
                const originalIndex = (y * width + x) * 4;
                hexColors.set(hexKey, [
                    imageData.data[originalIndex],
                    imageData.data[originalIndex + 1],
                    imageData.data[originalIndex + 2]
                ]);
            }
        }

        const avgColor = hexColors.get(hexKey);
        const index = pixelIndex * 4;
        for (let c = 0; c < 3; c++) {
            imageData.data[index + c] = avgColor[c];
        }
        // Preserve the original alpha value
        imageData.data[index + 3] = imageData.data[index + 3];
    }
}

function isInsideHexagon(x, y, centerX, centerY, size) {
    const dx = Math.abs(x - centerX) / (size / 2);
    const dy = Math.abs(y - centerY) / (size * Math.sqrt(3) / 2);
    return dx <= 1 && dy <= 1 && dx + dy <= 1.5;
}


function applyAdditionalEffects(imageData, value1, value2, value3, value4, value5) {
    // This is a placeholder function. You can implement additional effects here.
    // For example, you could use these values to adjust contrast, saturation, etc.

    // Here's a simple example that adjusts the red channel based on value1:
    const redAdjustment = value1 / 100; // Assuming value1 is a percentage

    for (let i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i] = Math.min(255, Math.max(0, imageData.data[i] * (1 + redAdjustment)));
    }

    // You can add more effects using the other values (value2, value3, etc.)
}