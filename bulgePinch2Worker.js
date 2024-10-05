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
        value6,
        value7,
        value8,
        clickedPoints,
        lines
    } = e.data;

    const segmentedImages = [];

    const orientations = [
        { name: "Center", centerX: 0.5, centerY: 0.5, value: value1 },
        { name: "Top", centerX: 0.5, centerY: 0.2, value: value2 },
        { name: "Bottom", centerX: 0.5, centerY: 0.8, value: value3 },
        { name: "Left", centerX: 0.2, centerY: 0.5, value: value4 },
        { name: "Right", centerX: 0.8, centerY: 0.5, value: value5 },
        { name: "TopLeft", centerX: 0.2, centerY: 0.2, value: value6 },
        { name: "TopRight", centerX: 0.8, centerY: 0.2, value: value7 },
        { name: "BottomLeft", centerX: 0.2, centerY: 0.8, value: value8 }
    ];

    for (let i = 0; i < imageCount; i++) {
        for (let j = 0; j < orientations.length; j++) {
            const newImageData = new ImageData(
                new Uint8ClampedArray(imageData.data),
                imageData.width,
                imageData.height
            );

            // Apply color adjustments
            applyColorAdjustments(newImageData, selectedRegions, i, imageCount);

            const orientation = orientations[j];
            const centerX = orientation.centerX * imageData.width;
            const centerY = orientation.centerY * imageData.height;
            const radius = Math.min(imageData.width, imageData.height) * 0.3;
            const strength = ((orientation.value / 100) * 2 - 1) * (i + 1) / imageCount;

            // Apply bulge/pinch effect
            // applyBulgePinch(newImageData, centerX, centerY, radius, strength);
            applyBulgePinch(newImageData, centerX, centerY, radius, strength, selectedRegions);


            segmentedImages.push(newImageData);
        }
    }

    self.postMessage({ segmentedImages: segmentedImages });
};


// ... rest of the functions remain the same
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


// Helper functions (rgbToHsl, hslToRgb) remain the same

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

    // You can add more effects using the other values (value2, value3, etc.)
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