self.onmessage = function(e) {
    const { imageData, strength } = e.data;
    const denoised = simpleDenoising(imageData, strength);
    console.log('denoised :>> ', denoised);
    self.postMessage({ result: denoised });
};

function simpleDenoising(imageData, strength) {
    const width = imageData.width;
    const height = imageData.height;
    const newImageData = new ImageData(new Uint8ClampedArray(imageData.data), width, height);

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            for (let c = 0; c < 3; c++) {  // For each color channel (R, G, B)
                const idx = (y * width + x) * 4 + c;
                
                // Simple box blur
                let sum = 0;
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        const neighborIdx = ((y + dy) * width + (x + dx)) * 4 + c;
                        sum += imageData.data[neighborIdx];
                    }
                }
                const average = sum / 9;

                // Mix original and blurred based on strength
                newImageData.data[idx] = Math.round(
                    imageData.data[idx] * (1 - strength) + average * strength
                );
            }
            // Keep alpha channel unchanged
            newImageData.data[(y * width + x) * 4 + 3] = imageData.data[(y * width + x) * 4 + 3];
        }
    }

    return newImageData;
}

// // main.js
// const worker = new Worker('simpleDenoisingWorker.js');

// function createNoisyImage(width, height, noiseStrength) {
//     const canvas = document.createElement('canvas');
//     canvas.width = width;
//     canvas.height = height;
//     const ctx = canvas.getContext('2d');
    
//     const imageData = ctx.createImageData(width, height);
//     for (let i = 0; i < imageData.data.length; i += 4) {
//         const value = Math.random() * 255;
//         imageData.data[i] = value + (Math.random() - 0.5) * noiseStrength;     // R
//         imageData.data[i + 1] = value + (Math.random() - 0.5) * noiseStrength; // G
//         imageData.data[i + 2] = value + (Math.random() - 0.5) * noiseStrength; // B
//         imageData.data[i + 3] = 255; // Alpha
//     }
    
//     return imageData;
// }

// function displayImage(imageData, canvasId) {
//     const canvas = document.getElementById(canvasId);
//     canvas.width = imageData.width;
//     canvas.height = imageData.height;
//     const ctx = canvas.getContext('2d');
//     ctx.putImageData(imageData, 0, 0);
// }

// // Create and display noisy image
// const width = 300, height = 200;
// const noisyImage = createNoisyImage(width, height, 100);
// displayImage(noisyImage, 'originalCanvas');

// // Process image with worker
// worker.onmessage = function(e) {
//     const result = e.data.result;
//     displayImage(result, 'denoisedCanvas');
//     console.log('Denoising complete');
// };

// worker.postMessage({
//     imageData: noisyImage,
//     strength: 0.5  // Adjust this value between 0 and 1
// });
