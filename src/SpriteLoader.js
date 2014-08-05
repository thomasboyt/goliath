/* jshint loopfunc: true */

var fs = require('fs');
var _ = require('lodash');

var readSpriteData = require('./readSpriteData');

function SpriteLoader(metaFile, dataFile) {
  // load list of sprites
  var metaBuf = fs.readFileSync(metaFile);
  this._sprites = readSpriteData(metaBuf);

  // load sprite data
  this._spriteBuf = fs.readFileSync(dataFile);

  // load palettes
  this._palettes = this._sprites.filter(function(sprite) {
    return sprite.flags === 8;
  }).map(this._loadPalette.bind(this));
}

SpriteLoader.prototype._loadPalette = function(sprite) {
  var palette = {
    colors: [],  // colors in rgb format
    startingIndex: sprite.xoffset
  };

  // TODO: clean up
  palette.colors = _.range(palette.startingIndex).map(function() { return undefined; });

  var numEntries = sprite.width;

  var startOffset = sprite.startAddress;

  for (var i = 0; i < numEntries; i++) {
    var offset = startOffset + (i * 3);

    var bgr = [offset, offset+1, offset+2].map(function(offset) {
      return this._spriteBuf.readUInt8(offset);
    }.bind(this));

    palette.colors.push(bgr);
  }

  return palette;
};

SpriteLoader.prototype._loadDirect = function(sprite) {
  var pixels = [];

  var start = sprite.startAddress;
  for (var i = 0; i < sprite.width * sprite.height; i++) {
    var offset = start + i;
    pixels.push(this._spriteBuf[offset]);
  }

  return pixels;
};

function readScanElement(buf, offset, acc) {
  if (!acc) { acc = []; }

  var flag = buf[offset] & parseInt('10000000', 2);  // flag indicating if this is the last el or not
  var numBytes = buf[offset] & parseInt('01111111', 2);  // number of bytes (pixels) to read

  // scan element begins at this offset from left edge of the graphic
  var offsetValue = buf[offset+1];

  var pixels = _.range(numBytes).map(function(i) {
    return buf[offset + 2 + i];
  });

  var el = {
    xoffset: offsetValue,
    pixels: pixels
  };

  if (flag) {
    // last scan element
    return acc.concat(el);
  } else {
    // there will be a scan element after on this row
    return readScanElement(buf, offset + 2 + numBytes, acc.concat(el));
  }
}

SpriteLoader.prototype._loadCompacted = function(sprite) {
  // create 2D array of pixels
  // (the most efficient data structure ever, obviously)
  var pixelMap = _.range(sprite.height).map(function() {
    return _.range(sprite.width).map(function() { return null; });
  });

  var firstRow = this._spriteBuf.readUInt16LE(sprite.startAddress);  // "at startAddress+first, we'll read the first row..."
  var rowPointers = _.range(sprite.startAddress, sprite.startAddress + firstRow, 2).map(function(address) {
    return this._spriteBuf.readUInt16LE(address);
  }.bind(this));

  var rowAddresses = rowPointers.map(function(pointer) {
    return sprite.startAddress + pointer;
  });

  var rows = rowAddresses.map(function(rowAddress) {
    return readScanElement(this._spriteBuf, rowAddress);
  }.bind(this));

  // transform the crazy list of elements into the pixelMap
  rows.forEach(function(row, y) {
    row.forEach(function(el) {
      el.pixels.forEach(function(pixel, i) {
        pixelMap[y][el.xoffset + i] = pixel;
      });
    });
  });

  return pixelMap;
};

SpriteLoader.prototype._applyPalette = function(pixelMap, palette) {
  return pixelMap.map(function(col) {
    return col.map(function(pixel) {
      if ( pixel === null ) { return null; }
      return palette.colors[pixel];
    });
  });
};

SpriteLoader.prototype.loadSprite = function(spriteIdx, paletteIdx) {
  var sprite = this._sprites[spriteIdx];

  var pixelMap;
  if (sprite.flags === 1) {
    pixelMap = this._loadDirect(sprite);
  } else if (sprite.flags === 5) {
    pixelMap = this._loadCompacted(sprite);
  }

  pixelMap = this._applyPalette(pixelMap, this._palettes[paletteIdx]);

  return {
    meta: sprite,
    pixelMap: pixelMap
  };
};

module.exports = SpriteLoader;
