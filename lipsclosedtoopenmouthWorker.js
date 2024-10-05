self.onmessage = function(e) {
    const { imageData, selectedRegions, imageCount } = e.data;
    const width = imageData.width;
    const height = imageData.height;

    // Calculate the boundaries of the selected region
    let top = height, bottom = 0, left = width, right = 0;
    for (let pixel of selectedRegions[0]) {
        const x = pixel % width;
        const y = Math.floor(pixel / width);
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
        left = Math.min(left, x);
        right = Math.max(right, x);
    }

    const mouthHeight = bottom - top;

    function closeMouth(inputImageData, selectedRegion, closureAmount) {
        const outputImageData = new ImageData(new Uint8ClampedArray(inputImageData.data), width, height);
        const inputData = inputImageData.data;
        const outputData = outputImageData.data;

        const midY = top + Math.floor(mouthHeight * 0.7); // Assume bottom lip starts at 70% of mouth height
        
        console.log(`Closure amount: ${closureAmount}, Region: top=${top}, bottom=${bottom}, left=${left}, right=${right}, midY=${midY}`);

        for (let y = top; y <= bottom; y++) {
            for (let x = left; x <= right; x++) {
                const sourcePixel = y * width + x;
                let targetY;

                if (y < midY) {
                    // Upper lip: move down
                    targetY = Math.min(midY, y + closureAmount);
                } else {
                    // Lower lip: move up
                    targetY = Math.max(midY, y - closureAmount);
                }

                const targetPixel = targetY * width + x;
                const sourceIndex = sourcePixel * 4;
                const targetIndex = targetPixel * 4;

                // Copy pixel data
                outputData[targetIndex] = inputData[sourceIndex];
                outputData[targetIndex + 1] = inputData[sourceIndex + 1];
                outputData[targetIndex + 2] = inputData[sourceIndex + 2];
                outputData[targetIndex + 3] = inputData[sourceIndex + 3];
            }
        }

        return outputImageData;
    }

    const segmentedImages = [];
    const maxClosureAmount = Math.floor(mouthHeight * 0.3); // 30% of mouth height for maximum closure

    for (let i = 0; i < imageCount; i++) {
        const closureAmount = Math.floor((i / (imageCount - 1)) * maxClosureAmount);
        const closedMouthImage = closeMouth(imageData, selectedRegions[0], closureAmount);
        segmentedImages.push(closedMouthImage);
        console.log(`Generated image ${i + 1} with closure amount ${closureAmount}`);
    }

    self.postMessage({ segmentedImages, isComplete: true });
};