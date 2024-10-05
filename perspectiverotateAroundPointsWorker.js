// self.onmessage = function(e) {
//     const { imageData, value, clickedPoints } = e.data;
//     console.log("Worker received:", { rotation: value.rotation, points: clickedPoints.length });
    
//     const result = applyRotationAroundPoints(imageData, value, clickedPoints);
//     self.postMessage({ imageData: result });
// };

// function applyRotationAroundPoints(imageData, value, clickedPoints) {
//     const { width, height, data } = imageData;
//     const newData = new Uint8ClampedArray(data.length);

//     for (let y = 0; y < height; y++) {
//         for (let x = 0; x < width; x++) {
//             let maxRotation = 0;
//             let closestPointDistance = Infinity;

//             clickedPoints.forEach(point => {
//                 const dx = x - point.x;
//                 const dy = y - point.y;
//                 const distance = Math.sqrt(dx * dx + dy * dy);
                
//                 if (distance < closestPointDistance) {
//                     closestPointDistance = distance;
//                     maxRotation = value.rotation * Math.exp(-distance * 0.005); // Adjust this factor to control the area of influence
//                 }
//             });

//             if (maxRotation !== 0) {
//                 // Apply rotation around the closest point
//                 const closestPoint = clickedPoints.reduce((closest, point) => {
//                     const dx = x - point.x;
//                     const dy = y - point.y;
//                     const distance = Math.sqrt(dx * dx + dy * dy);
//                     return distance < closest.distance ? { point, distance } : closest;
//                 }, { point: null, distance: Infinity }).point;

//                 const angle = maxRotation * Math.PI / 180; // Convert to radians

//                 const relativeX = x - closestPoint.x;
//                 const relativeY = y - closestPoint.y;

//                 const rotatedX = relativeX * Math.cos(angle) - relativeY * Math.sin(angle);
//                 const rotatedY = relativeX * Math.sin(angle) + relativeY * Math.cos(angle);
  
//                 const sourceX = Math.round(rotatedX + closestPoint.x);
//                 const sourceY = Math.round(rotatedY + closestPoint.y);

//                 if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
//                     const targetIndex = (y * width + x) * 4;
//                     const sourceIndex = (sourceY * width + sourceX) * 4;

//                     for (let i = 0; i < 4; i++) {
//                         newData[targetIndex + i] = data[sourceIndex + i];
//                     }
//                 } else {
//                     // If the rotated point is outside the image, keep the original pixel
//                     const index = (y * width + x) * 4;
//                     for (let i = 0; i < 4; i++) {
//                         newData[index + i] = data[index + i];
//                     }
//                 }
//             } else {
//                 // If the pixel is far from all clicked points, keep it unchanged
//                 const index = (y * width + x) * 4;
//                 for (let i = 0; i < 4; i++) {
//                     newData[index + i] = data[index + i];
//                 }
//             }
//         }
//     }
//     return new ImageData(newData, width, height);
// }


self.onmessage = function(e) {
    console.log("Worker received message:", e.data);

    const { imageData, value, clickedPoints, lines, debugMode } = e.data;
    const processedImageData = applyRotationAroundPointsAndLines(imageData, value, clickedPoints, lines, debugMode);
    self.postMessage({ imageData: processedImageData });
};


function applyRotationAroundPointsAndLines(imageData, value, clickedPoints, lines, debugMode) {
    const { width, height, data } = imageData;
    const newData = new Uint8ClampedArray(data.length);
    console.log("Applying rotation with:", { value, clickedPoints, lines, debugMode });

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let totalInfluence = 0;
            let closestPointDistance = Infinity;
            let closestLineDistance = Infinity;

            // Process points
            clickedPoints.forEach(point => {
                const dx = x - point.x;
                const dy = y - point.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                closestPointDistance = Math.min(closestPointDistance, distance);
            });

            // Process lines
            lines.forEach(line => {
                const distance = distancePointToLine(x, y, line.start, line.end);
                closestLineDistance = Math.min(closestLineDistance, distance);
            });

            const pointInfluence = Math.exp(-closestPointDistance * 0.01);
            const lineInfluence = Math.exp(-closestLineDistance * 0.01);
            totalInfluence = Math.max(pointInfluence, lineInfluence);

            const targetIndex = (y * width + x) * 4;
            if (debugMode && totalInfluence > 0.1) {  // Only apply debug visuals if debugMode is true
                // Color based on influence (red for points, blue for lines)
                newData[targetIndex] = Math.round(255 * pointInfluence);  // R
                newData[targetIndex + 1] = 0;  // G
                newData[targetIndex + 2] = Math.round(255 * lineInfluence);  // B
                newData[targetIndex + 3] = 255;  // A
            } else {
                // Apply the actual effect here when not in debug mode
                // For now, we'll just copy the original pixel
                for (let i = 0; i < 4; i++) {
                    newData[targetIndex + i] = data[targetIndex + i];
                }
            }
        }
    }

    return new ImageData(newData, width, height);
}

function distancePointToLine(x, y, lineStart, lineEnd) {
    const A = x - lineStart.x;
    const B = y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    if (lenSq != 0) param = dot / lenSq;

    let xx, yy;

    if (param < 0) {
        xx = lineStart.x;
        yy = lineStart.y;
    }
    else if (param > 1) {
        xx = lineEnd.x;
        yy = lineEnd.y;
    }
    else {
        xx = lineStart.x + param * C;
        yy = lineStart.y + param * D;
    }

    const dx = x - xx;
    const dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy);
}