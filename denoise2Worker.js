self.onmessage = function(e) {
    const {
        imageData,
        sigma,
        step1BlkSize,
        step2BlkSize,
        step1BlkStep,
        step2BlkStep,
        step1MaxMatchedCnt,
        step2MaxMatchedCnt,
        step1SearchWindow,
        step2SearchWindow,
        step1MatchThreshold,
        step2MatchThreshold,
        betaKaiser
    } = e.data;

    const denoisedImage = BM3D(imageData, sigma, step1BlkSize, step2BlkSize, step1BlkStep, step2BlkStep,
                               step1MaxMatchedCnt, step2MaxMatchedCnt, step1SearchWindow, step2SearchWindow,
                               step1MatchThreshold, step2MatchThreshold, betaKaiser);

    const psnr = calculatePSNR(imageData, denoisedImage);

    self.postMessage({ denoisedImage, psnr });
};

function BM3D(imageData, sigma, step1BlkSize, step2BlkSize, step1BlkStep, step2BlkStep,
              step1MaxMatchedCnt, step2MaxMatchedCnt, step1SearchWindow, step2SearchWindow,
              step1MatchThreshold, step2MatchThreshold, betaKaiser) {
    const basicImg = BM3D1stStep(imageData, sigma, step1BlkSize, step1BlkStep, step1MaxMatchedCnt,
                                 step1SearchWindow, step1MatchThreshold, betaKaiser);
    const finalImg = BM3D2ndStep(basicImg, imageData, sigma, step2BlkSize, step2BlkStep, step2MaxMatchedCnt,
                                 step2SearchWindow, step2MatchThreshold, betaKaiser);
    return finalImg;
}

function BM3D1stStep(imageData, sigma, blkSize, blkStep, maxMatchedCnt, searchWindow, matchThreshold, betaKaiser) {
    const { width, height } = imageData;
    const basicImg = new ImageData(new Uint8ClampedArray(imageData.data), width, height);
    const weightImg = new ImageData(new Uint8ClampedArray(width * height * 4), width, height);
    const kaiserWindow = createKaiserWindow(blkSize, betaKaiser);

    for (let i = 0; i < width - blkSize + 1; i += blkStep) {
        for (let j = 0; j < height - blkSize + 1; j += blkStep) {
            const blockPoint = [i, j];
            const similarBlocks = findSimilarBlocks(imageData, blockPoint, blkSize, searchWindow, matchThreshold, maxMatchedCnt);
            const filteredBlocks = hardThreshold3DTransform(similarBlocks, sigma);
            aggregateBlocks(basicImg, weightImg, filteredBlocks, blockPoint, kaiserWindow);
        }
    }

    normalizeImage(basicImg, weightImg);
    return basicImg;
}

function BM3D2ndStep(basicImg, noisyImg, sigma, blkSize, blkStep, maxMatchedCnt, searchWindow, matchThreshold, betaKaiser) {
    const { width, height } = basicImg;
    const finalImg = new ImageData(new Uint8ClampedArray(basicImg.data), width, height);
    const weightImg = new ImageData(new Uint8ClampedArray(width * height * 4), width, height);
    const kaiserWindow = createKaiserWindow(blkSize, betaKaiser);

    for (let i = 0; i < width - blkSize + 1; i += blkStep) {
        for (let j = 0; j < height - blkSize + 1; j += blkStep) {
            const blockPoint = [i, j];
            const [similarBasicBlocks, similarNoisyBlocks] = findSimilarBlocks2Step(basicImg, noisyImg, blockPoint, blkSize, searchWindow, matchThreshold, maxMatchedCnt);
            const [filteredBlocks, wienerWeights] = wienerFilter3DTransform(similarBasicBlocks, similarNoisyBlocks, sigma);
            aggregateBlocksWiener(finalImg, weightImg, filteredBlocks, wienerWeights, blockPoint, kaiserWindow);
        }
    }

    normalizeImage(finalImg, weightImg);
    return finalImg;
}

function findSimilarBlocks(imageData, blockPoint, blkSize, searchWindow, threshold, maxMatchedCnt) {
    // Implementation of block matching
}

function findSimilarBlocks2Step(basicImg, noisyImg, blockPoint, blkSize, searchWindow, threshold, maxMatchedCnt) {
    // Implementation of block matching for the second step
}

function hardThreshold3DTransform(similarBlocks, sigma) {
    // Implementation of 3D transform and hard thresholding
}

function wienerFilter3DTransform(similarBasicBlocks, similarNoisyBlocks, sigma) {
    // Implementation of 3D Wiener filtering
}

function aggregateBlocks(targetImg, weightImg, filteredBlocks, blockPoint, kaiserWindow) {
    // Implementation of block aggregation
}

function aggregateBlocksWiener(targetImg, weightImg, filteredBlocks, wienerWeights, blockPoint, kaiserWindow) {
    // Implementation of block aggregation with Wiener weights
}

function normalizeImage(targetImg, weightImg) {
    // Normalize the image by dividing by the weight
}

function createKaiserWindow(size, beta) {
    // Create a Kaiser window
}

function calculatePSNR(img1, img2) {
    const mse = calculateMSE(img1, img2);
    return 10 * Math.log10(255 * 255 / mse);
}

function calculateMSE(img1, img2) {
    let sum = 0;
    for (let i = 0; i < img1.data.length; i += 4) {
        const diff = img1.data[i] - img2.data[i];
        sum += diff * diff;
    }
    return sum / (img1.width * img1.height);
}