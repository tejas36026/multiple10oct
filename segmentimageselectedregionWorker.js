importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs');
importScripts('https://cdn.jsdelivr.net/npm/@tensorflow-models/body-pix');

let net;

async function loadModel() {
  net = await bodyPix.load();
}

loadModel();
console.log("Model loaded");

self.onmessage = async function(e) {
  const { imageData, imageCount, maxBrightness, selectedRegions } = e.data;

  if (!net) {
    await loadModel();
  }

  const segmentedImages = [];
  const allColoredPixels = new Set();

  for (let i = 0; i < imageCount; i++) {
    const offscreen = new OffscreenCanvas(imageData.width, imageData.height);
    const ctx = offscreen.getContext('2d');
    ctx.putImageData(imageData, 0, 0);

    const segmentation = await net.segmentPersonParts(offscreen);
    console.log(`Segmentation for image ${i} completed`);

    const coloredPartImage = bodyPix.toColoredPartMask(segmentation);
    console.log(`Colored mask for image ${i} created`);

    bodyPix.drawMask(
      offscreen, offscreen, coloredPartImage, 0.7, 0, true
    );

    const segmentedImageData = ctx.getImageData(0, 0, offscreen.width, offscreen.height);
    
    // Extract unique colored segments
    const newSegments = extractUniqueColoredSegments(segmentedImageData, allColoredPixels);
    
    // Add new segments to segmentedImages
    segmentedImages.push(...newSegments);
    
    // Update selected regions based on new segments
    updateSelectedRegions(newSegments, selectedRegions);
  }

  // Combine all colored segments into one main image
  const mainSegmentedImage = combineColoredSegments(imageData, allColoredPixels);
  segmentedImages.unshift(mainSegmentedImage);

  self.postMessage({ segmentedImages, selectedRegions, isComplete: true });

  setTimeout(() => {
    self.postMessage({ newregionneedtosend: selectedRegions, isComplete: false });
  }, 4000);
};

function extractUniqueColoredSegments(imageData, allColoredPixels) {
  const width = imageData.width;
  const height = imageData.height;
  const segments = new Map();

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      const r = imageData.data[index];
      const g = imageData.data[index + 1];
      const b = imageData.data[index + 2];
      const a = imageData.data[index + 3];

      if (r !== 0 || g !== 0 || b !== 0) {
        const pixelKey = `${x},${y}`;
        if (!allColoredPixels.has(pixelKey)) {
          allColoredPixels.add(pixelKey);
          const colorKey = `${r},${g},${b}`;
          if (!segments.has(colorKey)) {
            segments.set(colorKey, new ImageData(width, height));
          }
          const segmentData = segments.get(colorKey).data;
          segmentData[index] = r;
          segmentData[index + 1] = g;
          segmentData[index + 2] = b;
          segmentData[index + 3] = a;
        }
      }
    }
  }

  return Array.from(segments.values());
}

function updateSelectedRegions(newSegments, selectedRegions) {
  newSegments.forEach(segment => {
    const pixelIndices = [];
    const width = segment.width;
    for (let i = 0; i < segment.data.length; i += 4) {
      if (segment.data[i + 3] > 0) {
        const x = (i / 4) % width;
        const y = Math.floor((i / 4) / width);
        pixelIndices.push(y * width + x);
      }
    }
    if (pixelIndices.length > 0) {
      selectedRegions.push(pixelIndices);
    }
  });
}

function combineColoredSegments(originalImageData, coloredPixels) {
  const combinedImage = new ImageData(
    new Uint8ClampedArray(originalImageData.data),
    originalImageData.width,
    originalImageData.height
  );

  for (const pixelKey of coloredPixels) {
    const [x, y] = pixelKey.split(',').map(Number);
    const index = (y * originalImageData.width + x) * 4;
    combinedImage.data[index] = originalImageData.data[index];
    combinedImage.data[index + 1] = originalImageData.data[index + 1];
    combinedImage.data[index + 2] = originalImageData.data[index + 2];
    combinedImage.data[index + 3] = originalImageData.data[index + 3];
  }

  return combinedImage;
}