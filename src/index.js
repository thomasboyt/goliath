/* jshint loopfunc: true */

var fs = require('fs');
var dataBuf = fs.readFileSync('./data/csg1i.dat');
var spriteBuf = fs.readFileSync('./data/CSG1.dat');
var _ = require('lodash');

var readSpriteData = require('./readSpriteData');

function loadDirect(sprite) {
  var pixels = [];

  var start = sprite.startAddress;
  for (var i = 0; i < sprite.width * sprite.height; i++) {
    var offset = start + i;
    pixels.push(spriteBuf[offset]);
  }

  return pixels;
}

function readScanElement(buf, offset, acc) {
  if (!acc) { acc = []; }

  var numBytes = buf[offset];  // first byte = number of bytes of data in element

  var flag = buf[offset] & parseInt('10000000', 2);

  // scan element begins at this offset from left edge of the graphic
  var offsetValue = buf[offset+1];

  var pixels = _.range(numBytes).map(function(i) {
    return buf[offset + 2 + i];
  });

  var el = {
    xoffset: buf[offset+1],
    pixels: pixels
  };

  if (flag) {
    // last scan element
    return acc.concat(el);
  } else {
    // there will be a scan element after on this row
    return readScanElement(buf, offset+2+numBytes, acc.concat(el));
  }
}

function loadCompacted(sprite) {
  console.log(sprite);

  // create 2D array of pixels
  // (the most efficient data structure ever, obviously)
  var spriteMap = _.range(sprite.height).map(function() {
    return _.range(sprite.width).map(function() { return null; });
  });

  var firstRow = spriteBuf.readUInt16LE(sprite.startAddress);  // "at startAddress+first, we'll read the first row..."
  var rowPointers = _.range(sprite.startAddress, sprite.startAddress + firstRow, 2).map(function(address) {
    return spriteBuf.readUInt16LE(address);
  });

  var rowAddresses = rowPointers.map(function(pointer) {
    return sprite.startAddress + pointer;
  });

  var elList = rowAddresses.map(function(rowAddress) {
    return readScanElement(spriteBuf, rowAddress);
  });
  console.log(elList);
}

function loadPalette(sprite) {
  var palette = {
    colors: [],  // colors in rgb format
    startingIndex: sprite.xoffset
  };
  var numEntries = sprite.width;

  var startOffset = sprite.startAddress;

  for (var i = 0; i < numEntries; i++) {
    var offset = startOffset + (i * 3);

    var bgr = [offset, offset+1, offset+2].map(function(offset) {
      return spriteBuf.readUInt8(offset);
    });

    palette.colors.push(bgr);
  }

  return palette;
}

var sprites = readSpriteData(dataBuf);

var direct = sprites.filter(function(sprite) { return sprite.flags === 1; });
var compact = sprites.filter(function(sprite) { return sprite.flags === 5; });
var palettes = sprites.filter(function(sprite) { return sprite.flags === 8; });

// console.log(palettes.length);
//
// var p = loadPalette(palettes[0]);
// console.log(p);


sd = sprites[5187];
loadCompacted(sd);

// var sd = sprites.filter(function(sprite) {
//   return sprite.flags === 1;
// })[229];
//
// var p = loadDirect(sd);

