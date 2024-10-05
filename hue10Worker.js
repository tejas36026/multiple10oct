// self.onmessage = function(e) {
//     const {
//         imageData,
//         selectedRegions,
//         imageCount,
//         maxBrightness, // This could be repurposed as maxHueShift
//         value1,
//         value2,
//         value3,
//         value4,
//         value5,
//         clickedPoints,
//         lines
//     } = e.data;

//     const segmentedImages = [];

//     for (let i = 0; i < imageCount; i++) {
//         // Create a copy of the original image data
//         const newImageData = new ImageData(
//             new Uint8ClampedArray(imageData.data),
//             imageData.width,
//             imageData.height
//         );

//         // Calculate hue shift for this image
//         const hueShift = (i / (imageCount - 1)) * 360; // Full hue rotation

//         // Apply hue shift to selected regions
//         for (const region of selectedRegions) {
//             for (const pixelIndex of region) {
//                 const x = pixelIndex % imageData.width;
//                 const y = Math.floor(pixelIndex / imageData.width);
//                 const index = (y * imageData.width + x) * 4;

//                 const [h, s, l] = rgbToHsl(
//                     newImageData.data[index],
//                     newImageData.data[index + 1],
//                     newImageData.data[index + 2]
//                 );

//                 const newHue = (h + hueShift) % 360;
//                 const [r, g, b] = hslToRgb(newHue, s, l);

//                 newImageData.data[index] = r;
//                 newImageData.data[index + 1] = g;
//                 newImageData.data[index + 2] = b;
//             }
//         }
//         applyAdditionalEffects(newImageData, value1, value2, value3, value4, value5);

//         segmentedImages.push(newImageData);
//     }

//     self.postMessage({ segmentedImages: segmentedImages });
// };

// function applyAdditionalEffects(imageData, value1, value2, value3, value4, value5) {
//     // This function can be customized to apply additional effects based on the input values
//     // For example, you could use these values to adjust saturation, lightness, etc.
    
//     const saturationAdjustment = value1 / 100; // Assuming value1 is a percentage

//     for (let i = 0; i < imageData.data.length; i += 4) {
//         const [h, s, l] = rgbToHsl(
//             imageData.data[i],
//             imageData.data[i + 1],
//             imageData.data[i + 2]
//         );

//         const newSaturation = Math.min(1, Math.max(0, s * (1 + saturationAdjustment)));
//         const [r, g, b] = hslToRgb(h, newSaturation, l);

//         imageData.data[i] = r;
//         imageData.data[i + 1] = g;
//         imageData.data[i + 2] = b;
//     }

//     // You can add more effects using the other values (value2, value3, etc.)
// }

// // Helper functions for color conversion
// function rgbToHsl(r, g, b) {
//     r /= 255, g /= 255, b /= 255;
//     const max = Math.max(r, g, b), min = Math.min(r, g, b);
//     let h, s, l = (max + min) / 2;

//     if (max === min) {
//         h = s = 0; // achromatic
//     } else {
//         const d = max - min;
//         s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
//         switch (max) {
//             case r: h = (g - b) / d + (g < b ? 6 : 0); break;
//             case g: h = (b - r) / d + 2; break;
//             case b: h = (r - g) / d + 4; break;
//         }
//         h /= 6;
//     }

//     return [h * 360, s, l];
// }

// function hslToRgb(h, s, l) {
//     h /= 360;
//     let r, g, b;

//     if (s === 0) {
//         r = g = b = l; // achromatic
//     } else {
//         const hue2rgb = (p, q, t) => {
//             if (t < 0) t += 1;
//             if (t > 1) t -= 1;
//             if (t < 1/6) return p + (q - p) * 6 * t;
//             if (t < 1/2) return q;
//             if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
//             return p;
//         };

//         const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
//         const p = 2 * l - q;
//         r = hue2rgb(p, q, h + 1/3);
//         g = hue2rgb(p, q, h);
//         b = hue2rgb(p, q, h - 1/3);
//     }

//     return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
// }


// self.onmessage = function(e) {
//     const { imageData, selectedRegions } = e.data;
//     const width = imageData.width;
//     const height = imageData.height;
    
//     const totalIterations = 10;
//     let allSegmentedImages = [];
//     console.log(totalIterations);

//     for (let i = 0; i < totalIterations; i++) {
//         const newImageData = new ImageData(new Uint8ClampedArray(imageData.data), width, height);
        
//         // Calculate hue adjustment based on the current iteration
//         // This will create a transition through the entire hue spectrum
//         const hueAdjustment = (360 / totalIterations) * i;
        
//         if (i === 0) {
//             console.log(`Initial hue adjustment: ${hueAdjustment}`);
//         }
//         if (i === totalIterations - 1) {
//             console.log(`Final hue adjustment: ${hueAdjustment}`);
//         }
        
//         applyHueEffect(imageData, newImageData, hueAdjustment, selectedRegions, width, height);
        
//         allSegmentedImages.push(newImageData);
        
//         if (i % 30 === 0) {
//             self.postMessage({
//                 progress: (i / totalIterations) * 100,
//                 segmentedImages: allSegmentedImages
//             });
//             allSegmentedImages = []; // Clear the array to save memory
//         }
//     }
    
//     // Send the final batch of processed images back to the main thread
//     self.postMessage({ segmentedImages: allSegmentedImages, isComplete: true });
// };

// function applyHueEffect(sourceImageData, targetImageData, hueAdjustment, selectedRegions, width, height) {
//     // Create a Set for faster lookup of selected pixels
//     const selectedPixels = new Set(selectedRegions.flat());

//     for (let y = 0; y < height; y++) {
//         for (let x = 0; x < width; x++) {
//             const index = (y * width + x) * 4;
            
//             // Only process pixels in the selected region
//             if (selectedPixels.has(y * width + x)) {
//                 const [r, g, b] = [
//                     sourceImageData.data[index],
//                     sourceImageData.data[index + 1],
//                     sourceImageData.data[index + 2]
//                 ];
                
//                 // Convert RGB to HSL
//                 let [h, s, l] = rgbToHsl(r, g, b);
                
//                 // Adjust the hue
//                 h = (h + hueAdjustment) % 360;
                
//                 // Convert back to RGB
//                 const [newR, newG, newB] = hslToRgb(h, s, l);
                
//                 targetImageData.data[index] = newR;
//                 targetImageData.data[index + 1] = newG;
//                 targetImageData.data[index + 2] = newB;
//                 targetImageData.data[index + 3] = sourceImageData.data[index + 3]; // Keep alpha unchanged
//             } else {
//                 // For unselected regions, copy the original pixel
//                 targetImageData.data[index] = sourceImageData.data[index];
//                 targetImageData.data[index + 1] = sourceImageData.data[index + 1];
//                 targetImageData.data[index + 2] = sourceImageData.data[index + 2];
//                 targetImageData.data[index + 3] = sourceImageData.data[index + 3];
//             }
//         }
//     }
// }

// // Helper function to convert RGB to HSL
// function rgbToHsl(r, g, b) {
//     r /= 255;
//     g /= 255;
//     b /= 255;
//     const max = Math.max(r, g, b);
//     const min = Math.min(r, g, b);
//     let h, s, l = (max + min) / 2;

//     if (max === min) {
//         h = s = 0; // achromatic
//     } else {
//         const d = max - min;
//         s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
//         switch (max) {
//             case r: h = (g - b) / d + (g < b ? 6 : 0); break;
//             case g: h = (b - r) / d + 2; break;
//             case b: h = (r - g) / d + 4; break;
//         }
//         h /= 6;
//     }

//     return [h * 360, s * 100, l * 100];
// }

// // Helper function to convert HSL to RGB
// function hslToRgb(h, s, l) {
//     h /= 360;
//     s /= 100;
//     l /= 100;
//     let r, g, b;

//     if (s === 0) {
//         r = g = b = l; // achromatic
//     } else {
//         const hue2rgb = (p, q, t) => {
//             if (t < 0) t += 1;
//             if (t > 1) t -= 1;
//             if (t < 1/6) return p + (q - p) * 6 * t;
//             if (t < 1/2) return q;
//             if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
//             return p;
//         };
//         const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
//         const p = 2 * l - q;
//         r = hue2rgb(p, q, h + 1/3);
//         g = hue2rgb(p, q, h);
//         b = hue2rgb(p, q, h - 1/3);
//     }

//     return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
// }





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

    const centerXRange = [imageData.width * 0.25, imageData.width * 0.75];
    const centerYRange = [imageData.height * 0.25, imageData.height * 0.75];
    const radiusRange = [imageData.width * 0.1, imageData.width * 0.4];
    const strengthRange = [-0.5, 0.5]; // Negative for pinch, positive for bulge

    for (let i = 0; i < imageCount; i++) {
        const newImageData = new ImageData(
            new Uint8ClampedArray(imageData.data),
            imageData.width,
            imageData.height
        );

        applyColorAdjustments(newImageData, selectedRegions, i, imageCount);

        // Calculate bulge/pinch parameters for this iteration
        const centerX = lerp(centerXRange[0], centerXRange[1], i / (imageCount - 1));
        const centerY = lerp(centerYRange[0], centerYRange[1], i / (imageCount - 1));
        const radius = lerp(radiusRange[0], radiusRange[1], i / (imageCount - 1));
        const strength = lerp(strengthRange[0], strengthRange[1], i / (imageCount - 1));

        // Calculate dynamic bias and alpha for each iteration
        const bias = 50 + i * 5; // Adjust this formula as needed
        const alpha = 128 - i * 10; // Adjust this formula as needed

        // Apply bulge/pinch effect with dynamic bias and alpha
        applyBulgePinch(newImageData, centerX, centerY, radius, strength, bias, alpha);

        applyAdditionalEffects(newImageData, value1, value2, value3, value4, value5);
        segmentedImages.push(newImageData);
    }

    console.log(segmentedImages);
    self.postMessage({ segmentedImages: segmentedImages });
};

function applyColorAdjustments(imageData, selectedRegions, index, totalCount) {
    const hueShift = (index / (totalCount - 1)) * 360;
    const saturationFactor = 1 + (index / (totalCount - 1));

    for (const region of selectedRegions) {
        for (const pixelIndex of region) {
            const x = pixelIndex % imageData.width;
            const y = Math.floor(pixelIndex / imageData.width);
            const index = (y * imageData.width + x) * 4;

            let [h, s, l] = rgbToHsl(
                imageData.data[index],
                imageData.data[index + 1],
                imageData.data[index + 2]
            );

            // Lightening
            if (l < 0.2) {
                l = Math.min(1, l + 0.4);
            } else if (l < 0.5) {
                l = Math.min(1, l + 0.3);
            }

            // Saturation increase
            s = Math.min(1, s * saturationFactor);

            // Hue shift
            const newHue = (h + hueShift) % 360;
            
            const [r, g, b] = hslToRgb(newHue, s, l);

            imageData.data[index] = r;
            imageData.data[index + 1] = g;
            imageData.data[index + 2] = b;
        }
    }
}
function applyBulgePinch(imageData, centerX, centerY, radius, strength, bias, alpha) {
    const { width, height } = imageData;
    const tempData = new Uint8ClampedArray(imageData.data);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const dx = x - centerX;
            const dy = y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < radius) {
                const amount = (radius - distance) / radius * strength;
                const newX = x + dx * amount;
                const newY = y + dy * amount;

                if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
                    const srcIndex = (y * width + x) * 4;
                    const destIndex = (Math.floor(newY) * width + Math.floor(newX)) * 4;

                    imageData.data[destIndex] = tempData[srcIndex] + bias; // Apply bias
                    imageData.data[destIndex + 1] = tempData[srcIndex + 1] + bias; // Apply bias
                    imageData.data[destIndex + 2] = tempData[srcIndex + 2] + bias; // Apply bias
                    imageData.data[destIndex + 3] = alpha; // Set alpha for transparency
                }
            }
        }
    }
}


function lerp(start, end, t) {
    return start * (1 - t) + end * t;
}

function applyAdditionalEffects(imageData, value1, value2, value3, value4, value5) {

    const saturationAdjustment = value1 / 100; // Assuming value1 is a percentage

    for (let i = 0; i < imageData.data.length; i += 4) {
        const [h, s, l] = rgbToHsl(
            imageData.data[i],
            imageData.data[i + 1],
            imageData.data[i + 2]
        );

        const newSaturation = Math.min(1, Math.max(0, s * (1 + saturationAdjustment)));
        const [r, g, b] = hslToRgb(h, newSaturation, l);

        imageData.data[i] = r;
        imageData.data[i + 1] = g;
        imageData.data[i + 2] = b;
    }
}

// Helper functions for color conversion
function rgbToHsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h * 360, s, l];
}

function hslToRgb(h, s, l) {
    h /= 360;
    let r, g, b;

    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}