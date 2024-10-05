const axios = require('axios');
const fs = require('fs');
const Jimp = require('jimp');

const tokenAccess = "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";
const headers = { "Authorization": `Bearer ${tokenAccess}` };
const API_URL = "https://api-inference.huggingface.co/models/ciasimbaya/ObjectDetection";

const query = async (filename) => {
  const data = fs.readFileSync(filename);
  const response = await axios.post(API_URL, data, { headers });
  return response.data;
};

const drawBoundingBoxes = async (filename, predictions) => {
    const image = await Jimp.read(filename);
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
  
    predictions.forEach(({ label, box }) => {
      const { xmin, ymin, xmax, ymax } = box;
      image.print(
        font,
        xmin,
        ymin,
        {
          text: label,
          alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT,
          alignmentY: Jimp.VERTICAL_ALIGN_TOP
        },
        image.getWidth(),
        image.getHeight()
      );
  
      for (let x = xmin; x < xmax; x++) {
        image.setPixelColor(0xFF0000FF, x, ymin);
        image.setPixelColor(0xFF0000FF, x, ymax - 1);
      }
  
      for (let y = ymin; y < ymax; y++) {
        image.setPixelColor(0xFF0000FF, xmin, y);
        image.setPixelColor(0xFF0000FF, xmax - 1, y);
      }
    });
  
    const outputFile = `${filename.split('.')[0]}_annotated.jpg`;
    await image.writeAsync(outputFile);
    console.log(`Annotated image saved to ${outputFile}`);
};

const main = async () => {
  const filename = "golumolu.jpg";
  const predictions = await query(filename);
  await drawBoundingBoxes(filename, predictions);
};

main();