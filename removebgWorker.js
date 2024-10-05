self.onmessage = function(e) {
    const { imageData, value } = e.data;
    const threshold = 30 + (value * 100); 
    const result = removeBackground(imageData, threshold);
    self.postMessage({ imageData: result });
};


function removeBackground(imageData, baseThreshold) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const bgColor = {
        r: data[0],
        g: data[1],
        b: data[2]
    };

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            const gradientFactor = x / width; // Creates a left-to-right gradient
            const threshold = baseThreshold + (gradientFactor * 50); // Adjust the 50 to control gradient strength

            if (colorDistance(r, g, b, bgColor.r, bgColor.g, bgColor.b) < threshold) {
                data[i + 3] = 0;
            }
        }
    }
    return imageData;
}

function colorDistance(r1, g1, b1, r2, g2, b2) {
    return Math.sqrt(
        Math.pow(r1 - r2, 2) +
        Math.pow(g1 - g2, 2) +
        Math.pow(b1 - b2, 2)
    );
}

function animateBackgroundRemoval(imageData, progress) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const bgColor = {
        r: data[0],
        g: data[1],
        b: data[2]
    };
    const threshold = 30;
    const removeUpTo = Math.floor(width * progress);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < removeUpTo; x++) {
            const i = (y * width + x) * 4;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            if (colorDistance(r, g, b, bgColor.r, bgColor.g, bgColor.b) < threshold) {
                data[i + 3] = 0;
            }
        }
    }
    return imageData;
}

function removeBackground(imageData, threshold) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    
    const bgColors = [
        {r: data[0], g: data[1], b: data[2]},                    // Top-left
        {r: data[(width-1)*4], g: data[(width-1)*4+1], b: data[(width-1)*4+2]},  // Top-right
        {r: data[(height-1)*width*4], g: data[(height-1)*width*4+1], b: data[(height-1)*width*4+2]},  // Bottom-left
        {r: data[(height*width-1)*4], g: data[(height*width-1)*4+1], b: data[(height*width-1)*4+2]}   // Bottom-right
    ];

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        if (bgColors.some(bgColor => colorDistance(r, g, b, bgColor.r, bgColor.g, bgColor.b) < threshold)) {
            data[i + 3] = 0;
        }
    }

    return imageData;
}