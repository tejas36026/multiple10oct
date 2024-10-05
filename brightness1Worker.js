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

    const segmentedImages = generateBrightnessVariations(
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
    );

    self.postMessage({ segmentedImages });
};

function generateBrightnessVariations(
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
) {
    const segmentedImages = [];
    const step = (maxBrightness * 2) / (imageCount - 1);

    for (let i = 0; i < imageCount; i++) {
        const brightness = -maxBrightness + (step * i);
        const adjustedImageData = adjustImageBrightness(
            imageData, 
            selectedRegions, 
            brightness, 
            value1, 
            value2, 
            value3, 
            value4, 
            value5, 
            clickedPoints, 
            lines
        );
        segmentedImages.push(adjustedImageData);
    }

    return segmentedImages;
}


function adjustImageBrightness(
    imageData, 
    selectedRegions, 
    brightness, 
    value1, 
    value2, 
    value3, 
    value4, 
    value5, 
    clickedPoints, 
    lines
) {
    const adjustedData = new ImageData(new Uint8ClampedArray(imageData.data), imageData.width, imageData.height);

    const selectedPixels = new Set(selectedRegions.flat());

    for (let i = 0; i < adjustedData.data.length; i += 4) {
        const pixelIndex = i / 4;
        if (selectedPixels.has(pixelIndex)) {
            for (let j = 0; j < 3; j++) {
                adjustedData.data[i + j] = clamp(imageData.data[i + j] + brightness);
            }
        } else {
            // For pixels not in the selected region, keep the original color
            adjustedData.data[i] = imageData.data[i];
            adjustedData.data[i + 1] = imageData.data[i + 1];
            adjustedData.data[i + 2] = imageData.data[i + 2];
        }
        adjustedData.data[i + 3] = imageData.data[i + 3]; // Keep original alpha
    }

    return adjustedData;
}
function clamp(value) {
    return Math.max(0, Math.min(255, Math.round(value)));
}