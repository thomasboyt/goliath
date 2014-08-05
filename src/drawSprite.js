var Canvas = require('canvas');

module.exports = function(pixelMap) {
  var canvas = new Canvas(300, 300);
  var ctx = canvas.getContext('2d');

  var canvasData = ctx.createImageData(canvas.width, canvas.height);

  // painting is fun
  pixelMap.forEach(function(row, y) {
    row.forEach(function(bgr, x) {
      var idx = (x + y * canvas.width) * 4;

      if (bgr) {  // not transparent
        canvasData.data[idx+0] = bgr[2];  // r
        canvasData.data[idx+1] = bgr[1];  // g
        canvasData.data[idx+2] = bgr[0];  // b
        canvasData.data[idx+3] = 255;     // a
      }
    });
  });

  ctx.putImageData(canvasData, 0, 0);

  return canvas;
};
