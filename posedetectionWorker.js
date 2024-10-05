// importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs');
// importScripts('https://cdn.jsdelivr.net/npm/@tensorflow-models/posenet');

// let net;

// async function loadPoseNet() {
//   net = await posenet.load();
// }

// loadPoseNet();

// self.onmessage = async function(e) {
//   const { imageData, selectedRegions, imageCount, maxBrightness } = e.data;
  
//   if (!net) {
//     await loadPoseNet();
//   }

//   const width = imageData.width;
//   const height = imageData.height;

//   const segmentedImages = [];

//   for (let i = 0; i < imageCount; i++) {
//     const tempCanvas = new OffscreenCanvas(width, height);
//     const tempCtx = tempCanvas.getContext('2d');
//     tempCtx.putImageData(imageData, 0, 0);

//     const pose = await net.estimateSinglePose(tempCanvas, {
//       flipHorizontal: false
//     });

//     // Draw keypoints and skeleton
//     pose.keypoints.forEach(keypoint => {
//       if (keypoint.score > 0.2) {
//         const { x, y } = keypoint.position;
//         tempCtx.beginPath();
//         tempCtx.arc(x, y, 5, 0, 2 * Math.PI);
//         tempCtx.fillStyle = 'red';
//         tempCtx.fill();
//         tempCtx.stroke();

//         tempCtx.font = '12px Arial';
//         tempCtx.fillStyle = 'black';
//         tempCtx.fillText(keypoint.part, x + 10, y);
//       }
//     });

//     const adjacentKeyPoints = posenet.getAdjacentKeyPoints(pose.keypoints, 0.2);
//     adjacentKeyPoints.forEach(keypoints => {
//       tempCtx.beginPath();
//       tempCtx.moveTo(keypoints[0].position.x, keypoints[0].position.y);
//       tempCtx.lineTo(keypoints[1].position.x, keypoints[1].position.y);
//       tempCtx.strokeStyle = 'green';
//       tempCtx.stroke();
//     });

//     const newImageData = tempCtx.getImageData(0, 0, width, height);
//     segmentedImages.push(newImageData);

//     // Report progress
//     self.postMessage({
//       segmentedImages: [newImageData],
//       isComplete: false
//     });
//   }

//   // Send final message
//   self.postMessage({
//     segmentedImages,
//     isComplete: true
//   });
// };


importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs');
importScripts('https://cdn.jsdelivr.net/npm/@tensorflow-models/posenet');

let net;

async function loadPoseNet() {
  net = await posenet.load();
}

loadPoseNet();

self.onmessage = async function(e) {
  const { imageData, selectedRegions, imageCount, maxBrightness } = e.data;
  
  if (!net) {
    await loadPoseNet();
  }

  const width = imageData.width;
  const height = imageData.height;

  const segmentedImages = [];

  for (let i = 0; i < imageCount; i++) {
    const tempCanvas = new OffscreenCanvas(width, height);
    const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
    tempCtx.putImageData(imageData, 0, 0);

    const pose = await net.estimateSinglePose(tempCanvas, {
      flipHorizontal: false
    });

    // Draw keypoints and skeleton
    pose.keypoints.forEach(keypoint => {
      if (keypoint.score > 0.2) {
        const { x, y } = keypoint.position;
        tempCtx.beginPath();
        tempCtx.arc(x, y, 5, 0, 2 * Math.PI);
        tempCtx.fillStyle = 'red';
        tempCtx.fill();
        tempCtx.stroke();

        tempCtx.font = '12px Arial';
        tempCtx.fillStyle = 'black';
        tempCtx.fillText(keypoint.part, x + 10, y);
      }
    });

    const adjacentKeyPoints = posenet.getAdjacentKeyPoints(pose.keypoints, 0.2);
    adjacentKeyPoints.forEach(keypoints => {
      tempCtx.beginPath();
      tempCtx.moveTo(keypoints[0].position.x, keypoints[0].position.y);
      tempCtx.lineTo(keypoints[1].position.x, keypoints[1].position.y);
      tempCtx.strokeStyle = 'green';
      tempCtx.stroke();
    });

    const newImageData = tempCtx.getImageData(0, 0, width, height);
    segmentedImages.push(newImageData);

    // Report progress
    self.postMessage({
      segmentedImages: [newImageData],
      isComplete: false
    });
  }

  // Send final message
  self.postMessage({
    segmentedImages,
    isComplete: true
  });
};