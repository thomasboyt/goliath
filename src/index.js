var fs = require('fs');
var dataBuf = fs.readFileSync('./data/csg1i.dat');
var spriteBuf = fs.readFileSync('./data/CSG1.dat');

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

function readScanElement(buf, offset) {
  var numBytes = buf[offset];  // first byte = number of bytes of data in element
  console.log(numBytes);

  var flag = buf[offset] & parseInt('10000000', 2);
  if (flag) {
    // last scan element
  } else {
    // there will be a scan element after on this row
  }

  // scan element begins at this offset from left edge of the graphic
  var offsetValue = buf[offset+1];
}

function loadCompacted(sprite) {
  var offset = spriteBuf.readUInt16LE(sprite.startAddress);
  readScanElement(spriteBuf, sprite.startAddress + offset);
}

function loadPalette(sprite) {
  var palette = {
    colors: []  // colors
  };
  var numEntries = sprite.width;

  var startOffset = sprite.startAddress + sprite.xoffset;
  for (var i = 0; i < numEntries; i++) {
    var offset = startOffset + (i * 3);

    var rgb = [offset, offset+1, offset+2].map(function(offset) {
      return spriteBuf.readUInt8(offset);
    });
    palette.colors.push(rgb);
  }

  return palette;
}

var sprites = readSpriteData(dataBuf);

var direct = sprites.filter(function(sprite) { return sprite.flags === 1; });
var compact = sprites.filter(function(sprite) { return sprite.flags === 5; });
var palettes = sprites.filter(function(sprite) { return sprite.flags === 8; });

console.log(palettes.length);

var p = loadPalette(palettes[0]);
console.log(p);


//
// loadCompacted(sd);

// var sd = sprites.filter(function(sprite) {
//   return sprite.flags === 1;
// })[229];
//
// var p = loadDirect(sd);

