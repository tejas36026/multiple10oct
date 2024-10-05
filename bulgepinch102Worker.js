self.onmessage = function(e) {
    const {
        imageData,
        selectedRegions,
        imageCount,
        value1,
        value2,
        value3,
        value4,
        value5,
        value6,
        value7,
        value8
    } = e.data;

    const segmentedImages = [];

    // Calculate the bounding box of selected regions
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const region of selectedRegions) {
        for (const pixelIndex of region) {
            const x = pixelIndex % imageData.width;
            const y = Math.floor(pixelIndex / imageData.width);
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
        }
    }

    const regionWidth = maxX - minX;
    const regionHeight = maxY - minY;
    const regionCenterX = minX + regionWidth / 2;
    const regionCenterY = minY + regionHeight / 2;

    const orientations = [
        { name: "Center", centerX: regionCenterX, centerY: regionCenterY, value: value1 },
        { name: "Top", centerX: regionCenterX, centerY: minY + regionHeight * 0.2, value: value2 },
        { name: "Bottom", centerX: regionCenterX, centerY: minY + regionHeight * 0.8, value: value3 },
        { name: "Left", centerX: minX + regionWidth * 0.2, centerY: regionCenterY, value: value4 },
        { name: "Right", centerX: minX + regionWidth * 0.8, centerY: regionCenterY, value: value5 },
        { name: "TopLeft", centerX: minX + regionWidth * 0.2, centerY: minY + regionHeight * 0.2, value: value6 },
        { name: "TopRight", centerX: minX + regionWidth * 0.8, centerY: minY + regionHeight * 0.2, value: value7 },
        { name: "BottomLeft", centerX: minX + regionWidth * 0.2, centerY: minY + regionHeight * 0.8, value: value8 }
    ];

    const variationCount = 10; // Number of variations per orientation

    for (let j = 0; j < orientations.length; j++) {
        const orientation = orientations[j];
        const centerX = orientation.centerX;
        const centerY = orientation.centerY;
        const radius = Math.min(regionWidth, regionHeight) * 0.3;
        const strength = ((orientation.value / 100) * 2 - 1);

        for (let k = 0; k < variationCount; k++) {
            const newImageData = new ImageData(
                new Uint8ClampedArray(imageData.data),
                imageData.width,
                imageData.height
            );

            // Apply slight variation to centerX and centerY
            const variationX = (Math.random() - 0.5) * regionWidth * 0.1;
            const variationY = (Math.random() - 0.5) * regionHeight * 0.1;
            const newCenterX = centerX + variationX;
            const newCenterY = centerY + variationY;

            // Apply bulge/pinch effect
            applyBulgePinch(newImageData, newCenterX, newCenterY, radius, strength, selectedRegions);

            segmentedImages.push(newImageData);
            console.log(segmentedImages.length);
        }
    }

    self.postMessage({ segmentedImages: segmentedImages, isComplete: true });
};

function applyBulgePinch(imageData, centerX, centerY, radius, strength, selectedRegions) {
    const { width, height } = imageData;
    const tempData = new Uint8ClampedArray(imageData.data);

    for (const region of selectedRegions) {
        for (const pixelIndex of region) {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);

            const dx = x - centerX;
            const dy = y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < radius) {
                const amount = (radius - distance) / radius * strength;
                const newX = x + dx * amount;
                const newY = y + dy * amount;

                if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
                    const srcIndex = pixelIndex * 4;
                    const destIndex = (Math.floor(newY) * width + Math.floor(newX)) * 4;

                    imageData.data[destIndex] = tempData[srcIndex];
                    imageData.data[destIndex + 1] = tempData[srcIndex + 1];
                    imageData.data[destIndex + 2] = tempData[srcIndex + 2];
                    imageData.data[destIndex + 3] = tempData[srcIndex + 3];
                }
            }
        }
    }
}