// magicWandWorker.js
self.onmessage = function(e) {
    const { imageData, startX, startY, tolerance } = e.data;
    const selectedRegion = magicWand(imageData, startX, startY, tolerance);
    self.postMessage({ selectedRegion });
};

function magicWand(imageData, startX, startY, tolerance) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const startIndex = (startY * width + startX) * 4;
    const startColor = {
        r: data[startIndex],
        g: data[startIndex + 1],
        b: data[startIndex + 2]
    };

    const queue = [[startX, startY]];
    const visited = new Set();
    const selectedRegion = [];

    while (queue.length > 0) {
        const [x, y] = queue.pop();
        const index = (y * width + x) * 4;

        if (visited.has(index)) continue;
        visited.add(index);

        const currentColor = {
            r: data[index],
            g: data[index + 1],
            b: data[index + 2]
        };

        if (colorDistance(startColor, currentColor) <= tolerance) {
            selectedRegion.push(y * width + x);

            if (x > 0) queue.push([x - 1, y]);
            if (x < width - 1) queue.push([x + 1, y]);
            if (y > 0) queue.push([x, y - 1]);
            if (y < height - 1) queue.push([x, y + 1]);
        }
    }

    return selectedRegion;
}

function colorDistance(color1, color2) {
    return Math.sqrt(
        Math.pow(color1.r - color2.r, 2) +
        Math.pow(color1.g - color2.g, 2) +
        Math.pow(color1.b - color2.b, 2)
    );
}