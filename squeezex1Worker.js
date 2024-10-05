// antiSqueezeXWorker.js
self.onmessage = function(e) {
    const { imageData, value } = e.data;
    const antiSqueezedImageData = applyAntiSqueeze(imageData, value, 'x');
    self.postMessage({ imageData: antiSqueezedImageData });
  };
  
  function applyAntiSqueeze(imageData, value, axis) {
    const canvas = new OffscreenCanvas(imageData.width, imageData.height);
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);
  
    const tempCanvas = new OffscreenCanvas(imageData.width, imageData.height);
    const tempCtx = tempCanvas.getContext('2d');
  
    // Calculate anti-squeeze factor (1 = no anti-squeeze, 2 = double width, 0.5 = half width)
    const antiSqueezeFactor = 1 / (1 + (value - 0.5));
  
    if (axis === 'x') {
      const newWidth = imageData.width * antiSqueezeFactor;
      tempCtx.drawImage(canvas, 0, 0, imageData.width, imageData.height, (imageData.width - newWidth) / 2, 0, newWidth, imageData.height);
    }
  
    return tempCtx.getImageData(0, 0, imageData.width, imageData.height);
  }