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
    const variationsPerOrientation = 25; // New variable to control the number of variations

    const orientations = [
        { name: "Center", getValue: () => ({ x: value1 / 100, y: value1 / 100 }), value: value1 },
        { name: "Top", getValue: () => ({ x: value2 / 100, y: 0.2 }), value: value2 },
        { name: "Bottom", getValue: () => ({ x: value3 / 100, y: 0.8 }), value: value3 },
        { name: "Left", getValue: () => ({ x: 0.2, y: value4 / 100 }), value: value4 },
        { name: "Right", getValue: () => ({ x: 0.8, y: value5 / 100 }), value: value5 },
        { name: "TopLeft", getValue: () => ({ x: value6 / 100, y: value6 / 100 }), value: value6 },
        { name: "TopRight", getValue: () => ({ x: 1 - value7 / 100, y: value7 / 100 }), value: value7 },
        { name: "BottomLeft", getValue: () => ({ x: value8 / 100, y: 1 - value8 / 100 }), value: value8 }
    ];

    for (let i = 0; i < variationsPerOrientation; i++) {
        for (let j = 0; j < orientations.length; j++) {
            const newImageData = new ImageData(
                new Uint8ClampedArray(imageData.data),
                imageData.width,
                imageData.height
            );

            applyColorAdjustments(newImageData, selectedRegions, i, variationsPerOrientation);

            const orientation = orientations[j];
            const { x, y } = orientation.getValue();
            const centerX = x === 0 ? Math.random() * imageData.width : x * imageData.width;
            const centerY = y === 0 ? Math.random() * imageData.height : y * imageData.height;
            const radius = Math.min(imageData.width, imageData.height) * 0.3;
            const strength = ((orientation.value / 100) * 2 - 1) * (i + 1) / imageCount;

            applyBulgePinch(newImageData, centerX, centerY, radius, strength, selectedRegions);
            applyAdditionalEffects(newImageData, value1, value2, value3, value4, value5, selectedRegions);
            segmentedImages.push(newImageData);
        }
    }

    self.postMessage({ segmentedImages: segmentedImages });
};

function applyColorAdjustments(imageData, selectedRegions, index, totalCount) {
    

    
}

function applyBulgePinch(imageData, centerX, centerY, radius, strength, selectedRegions) {
    for (const region of selectedRegions) {
        for (const pixelIndex of region) {
            const x = pixelIndex % imageData.width;
            const y = Math.floor(pixelIndex / imageData.width);
            const dx = x - centerX;
            const dy = y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < radius) {
                const factor = 1 + strength * (1 - distance / radius);
                const newX = centerX + dx * factor;
                const newY = centerY + dy * factor;

                if (newX >= 0 && newX < imageData.width && newY >= 0 && newY < imageData.height) {
                    const newIndex = (Math.floor(newY) * imageData.width + Math.floor(newX)) * 4;
                    const index = (y * imageData.width + x) * 4;
                    imageData.data[index] = imageData.data[newIndex];
                    imageData.data[index + 1] = imageData.data[newIndex + 1];
                    imageData.data[index + 2] = imageData.data[newIndex + 2];
                    imageData.data[index + 3] = imageData.data[newIndex + 3];
                }
            }
        }
    }
}



function applyAdditionalEffects(imageData, value1, value2, value3, value4, value5, selectedRegions) {
    const saturationAdjustment = value1 / 100; // Assuming value1 is a percentage

    for (const region of selectedRegions) {
        for (const pixelIndex of region) {
            const index = pixelIndex * 4;
            const [h, s, l] = rgbToHsl(
                imageData.data[index],
                imageData.data[index + 1],
                imageData.data[index + 2]
            );

            const newSaturation = Math.min(1, Math.max(0, s * (1 + saturationAdjustment)));
            const [r, g, b] = hslToRgb(h, newSaturation, l);

            imageData.data[index] = r;
            imageData.data[index + 1] = g;
            imageData.data[index + 2] = b;
        }
    }

    // You can add more effects using the other values (value2, value3, etc.)
}

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