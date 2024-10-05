self.onmessage = function(e) {
    const { maskData, thresholds } = e.data;
    const width = maskData.width;
    const height = maskData.height;
    
    const masks = {};
    
    // Create masks based on intensity thresholds
    for (let t = 0; t < thresholds.length; t++) {
        masks[t] = new ImageData(width, height);
        for (let i = 0; i < maskData.data.length; i += 4) {
            const intensity = (maskData.data[i] + maskData.data[i+1] + maskData.data[i+2]) / 3;
            if (intensity > thresholds[t]) {
                masks[t].data[i] = masks[t].data[i+1] = masks[t].data[i+2] = 255;
                masks[t].data[i+3] = 255;
            }
        }
    }
    
    self.postMessage({ masks });
};

function connectedComponentLabeling(binaryMask, width, height) {
    const labeledMask = new Uint32Array(binaryMask.length);
    let currentLabel = 1;
    const equivalences = {};

    // First pass
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = y * width + x;
            if (binaryMask[index] === 0) continue;

            const left = x > 0 ? labeledMask[index - 1] : 0;
            const up = y > 0 ? labeledMask[index - width] : 0;

            if (left === 0 && up === 0) {
                labeledMask[index] = currentLabel++;
            } else if (left !== 0 && up === 0) {
                labeledMask[index] = left;
            } else if (left === 0 && up !== 0) {
                labeledMask[index] = up;
            } else {
                labeledMask[index] = Math.min(left, up);
                updateEquivalences(equivalences, left, up);
            }
        }
    }

    // Resolve equivalences
    const finalLabels = resolveEquivalences(equivalences);

    // Second pass
    for (let i = 0; i < labeledMask.length; i++) {
        if (labeledMask[i] !== 0) {
            labeledMask[i] = finalLabels[labeledMask[i]];
        }
    }

    return labeledMask;
}

function updateEquivalences(equivalences, label1, label2) {
    const root1 = findRoot(equivalences, label1);
    const root2 = findRoot(equivalences, label2);
    if (root1 !== root2) {
        equivalences[Math.max(root1, root2)] = Math.min(root1, root2);
    }
}

function findRoot(equivalences, label) {
    while (equivalences[label] !== undefined) {
        label = equivalences[label];
    }
    return label;
}

function resolveEquivalences(equivalences) {
    const finalLabels = {};
    for (const label in equivalences) {
        finalLabels[label] = findRoot(equivalences, parseInt(label));
    }
    return finalLabels;
}