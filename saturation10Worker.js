self.onmessage = function(e) {
    const { imageData, selectedRegions } = e.data;
    const width = imageData.width;
    const height = imageData.height;
    
    const totalIterations = 10;
    let allSegmentedImages = [];
    console.log(totalIterations);
  
    for (let i = 0; i < totalIterations; i++) {
        const newImageData = new ImageData(new Uint8ClampedArray(imageData.data), width, height);
        
        const saturationAdjustment = (100 / totalIterations) * i;
    
        applySaturationEffect(imageData, newImageData, saturationAdjustment, selectedRegions, width, height);
        
        allSegmentedImages.push(newImageData);
        
        if (i % 30 === 0) {
            self.postMessage({
                progress: (i / totalIterations) * 100,
                segmentedImages: allSegmentedImages
            });
            allSegmentedImages = []; // Clear the array to save memory
        }
    }
    
    self.postMessage({ segmentedImages: allSegmentedImages, isComplete: true });
  };
  
  function applySaturationEffect(sourceImageData, targetImageData, saturationAdjustment, selectedRegions, width, height) {
  
    const selectedPixels = new Set(selectedRegions.flat());
  
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            
            // Only process pixels in the selected region
            if (selectedPixels.has(y * width + x)) {
                const [r, g, b] = [
                    sourceImageData.data[index],
                    sourceImageData.data[index + 1],
                    sourceImageData.data[index + 2]
                ];
                
                // Convert RGB to HSL
                let [h, s, l] = rgbToHsl(r, g, b);
                
                // Adjust the saturation
                s = (s + saturationAdjustment) % 100;
                
                // Convert back to RGB
                const [newR, newG, newB] = hslToRgb(h, s, l);
                
                targetImageData.data[index] = newR;
                targetImageData.data[index + 1] = newG;
                targetImageData.data[index + 2] = newB;
                targetImageData.data[index + 3] = sourceImageData.data[index + 3]; // Keep alpha unchanged
            } else {
                // For unselected regions, copy the original pixel
                targetImageData.data[index] = sourceImageData.data[index];
                targetImageData.data[index + 1] = sourceImageData.data[index + 1];
                targetImageData.data[index + 2] = sourceImageData.data[index + 2];
                targetImageData.data[index + 3] = sourceImageData.data[index + 3];
            }
        }
    }
}
     
  function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
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
  
    return [h * 360, s * 100, l * 100];
  }
  
  // Helper function to convert HSL to RGB
  function hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
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