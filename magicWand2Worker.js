self.onmessage = function(e) {
    const { imageData, startX, startY, tolerance, fuzziness } = e.data;
    const selectedRegion = magicWand(imageData, startX, startY, tolerance, fuzziness);
    self.postMessage({ selectedRegion });
};

function magicWand(imageData, startX, startY, tolerance, fuzziness) {
    const width = imageData.width;
    const height = imageData.height;
    const data = new Uint32Array(imageData.data.buffer);
    
    const targetColor = data[startY * width + startX];
    const visited = new Uint8Array(width * height);
    const selectedRegion = [];
    
    const queue = [{x: startX, y: startY, distance: 0}];
    visited[startY * width + startX] = 1;
    
    const baseTolerance = tolerance * tolerance * 3; // For RGB comparison
    const maxDistance = Math.max(width, height) / 2; // Maximum distance to consider
    
    while (queue.length > 0) {
        const {x, y, distance} = queue.shift();
        const index = y * width + x;
        
        const currentTolerance = baseTolerance + (fuzziness * distance * distance);
        
        if (colorMatch(data[index], targetColor, currentTolerance)) {
            selectedRegion.push(index);
            
            // Check 4 neighboring pixels
            checkNeighbor(x + 1, y, distance + 1);
            checkNeighbor(x - 1, y, distance + 1);
            checkNeighbor(x, y + 1, distance + 1);
            checkNeighbor(x, y - 1, distance + 1);
        }
    }
    
    function checkNeighbor(x, y, distance) {
        if (x >= 0 && x < width && y >= 0 && y < height && distance <= maxDistance) {
            const index = y * width + x;
            if (!visited[index]) {
                visited[index] = 1;
                queue.push({x, y, distance});
            }
        }
    }
    
    return selectedRegion;
}

function colorMatch(c1, c2, toleranceSq) {
    const r1 = c1 & 0xff;
    const g1 = (c1 >> 8) & 0xff;
    const b1 = (c1 >> 16) & 0xff;
    const r2 = c2 & 0xff;
    const g2 = (c2 >> 8) & 0xff;
    const b2 = (c2 >> 16) & 0xff;
    const dr = r1 - r2;
    const dg = g1 - g2;
    const db = b1 - b2;
    return (dr * dr + dg * dg + db * db) <= toleranceSq;
}