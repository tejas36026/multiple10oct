self.onmessage = function(e) {
    const imageData = e.data.imageData;
    const circles = detectCircles(imageData);
    self.postMessage({ circles: circles });
};

function detectCircles(imageData) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const circles = [];

    // Simple circle detection algorithm
    // This is a basic implementation and may not be very accurate
    for (let y = 0; y < height; y += 5) {
        for (let x = 0; x < width; x += 5) {
            if (isEdgePixel(x, y, data, width, height)) {
                const radius = findCircleRadius(x, y, data, width, height);
                if (radius > 50) {
                    circles.push({ x, y, radius });
                }
            }
        }
    }

    return circles;
}

function isEdgePixel(x, y, data, width, height) {
    const idx = (y * width + x) * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    return r + g + b < 128; // Assuming edges are darker
}

function findCircleRadius(x, y, data, width, height) {
    let radius = 0;
    while (isEdgePixel(x + radius, y, data, width, height) && radius < Math.min(width, height) / 2) {
        radius++;
    }
    return radius;
}


