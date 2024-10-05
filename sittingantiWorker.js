// antiSittingWorker.js
self.onmessage = function(e) {
    const { imageData, value } = e.data;
    const antiSittingImageData = applyAntiSitting(imageData, value);
    self.postMessage({ imageData: antiSittingImageData });
  };
  
  function applyAntiSitting(imageData, value) {
    const canvas = new OffscreenCanvas(imageData.width, imageData.height);
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);
  
    const tempCanvas = new OffscreenCanvas(imageData.width, imageData.height);
    const tempCtx = tempCanvas.getContext('2d');
  
    // Reverse the sitting effect by stretching the bottom half of the image
    const stretchFactor = 1 / (1 - value * 0.3);
    const midPoint = imageData.height / 2;
  
    tempCtx.drawImage(canvas, 0, 0, imageData.width, midPoint, 0, 0, imageData.width, midPoint);
    tempCtx.drawImage(canvas, 0, midPoint, imageData.width, midPoint * (1 - value * 0.3), 0, midPoint, imageData.width, midPoint);
  
    return tempCtx.getImageData(0, 0, imageData.width, imageData.height);
  }