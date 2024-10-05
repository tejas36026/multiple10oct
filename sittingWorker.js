// sittingWorker.js
self.onmessage = function(e) {
    const { imageData, value } = e.data;
    const sittingImageData = applySitting(imageData, value);
    self.postMessage({ imageData: sittingImageData });
  };
  
  function applySitting(imageData, value) {
    const canvas = new OffscreenCanvas(imageData.width, imageData.height);
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);
  
    const tempCanvas = new OffscreenCanvas(imageData.width, imageData.height);
    const tempCtx = tempCanvas.getContext('2d');
  
    // Simulate sitting by compressing the bottom half of the image
    const compressionFactor = 1 - value * 0.3;
    const midPoint = imageData.height / 2;
  
    tempCtx.drawImage(canvas, 0, 0, imageData.width, midPoint, 0, 0, imageData.width, midPoint);
    tempCtx.drawImage(canvas, 0, midPoint, imageData.width, midPoint, 0, midPoint, imageData.width, midPoint * compressionFactor);
  
    return tempCtx.getImageData(0, 0, imageData.width, imageData.height);
  }