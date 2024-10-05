importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs');
importScripts('https://cdn.jsdelivr.net/npm/@tensorflow-models/knn-classifier');

let knnClassifier;

async function loadKNNClassifier() {
    console.log('knnClassifier :>> ', knnClassifier);
  if (!knnClassifier) {
    console.log('knnClassifier :>> ', knnClassifier);
    knnClassifier = await knnClassifier.create();
    console.log("working");
  }
}

self.onmessage = async function(e) {
  const { imageData, selectedRegions, imageCount, maxBrightness } = e.data;
  
  if (!knnClassifier) {
    await loadKNNClassifier();
  }

  const width = imageData.width;
  const height = imageData.height;

  const segmentedImages = [];

  for (let i = 0; i < imageCount; i++) {
    const tempCanvas = new OffscreenCanvas(width, height);
    const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
    tempCtx.putImageData(imageData, 0, 0);

    const tensor = tf.browser.fromPixels(tempCanvas);
    const resizedTensor = tf.image.resizeBilinear(tensor, [224, 224]);
    const normalizedTensor = resizedTensor.div(255);

    // Assuming you have already added some examples to the classifier
    const predictions = await knnClassifier.predictClass(normalizedTensor);
    console.log(predictions);

    // Draw predictions on the canvas
    tempCtx.font = '12px Arial';
    tempCtx.fillStyle = 'red';
    if (predictions.confidences) {
      Object.keys(predictions.confidences).forEach((label, index) => {
        tempCtx.fillText(`${label}: ${predictions.confidences[label].toFixed(2)}`, 10, 20 + index * 20);
      });
    }

    const newImageData = tempCtx.getImageData(0, 0, width, height);
    segmentedImages.push(newImageData);

    // Report progress
    self.postMessage({
      segmentedImages: [newImageData],
      isComplete: false
    });

    tensor.dispose();
    resizedTensor.dispose();
    normalizedTensor.dispose();
  }

  // Send final message
  self.postMessage({
    segmentedImages,
    isComplete: true
  });
};