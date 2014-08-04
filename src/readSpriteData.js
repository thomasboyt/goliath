function maskFlags(flags) {
  return flags & parseInt('0000000000001111', 2);
}

function readChunk(data, offset) {
  var sprite = {};

  // 32-bit unsigned int
  sprite.startAddress = data.readUInt32LE(offset);

  // 16-bit signed ints
  sprite.width = data.readInt16LE(offset + 4);
  sprite.height = data.readInt16LE(offset + 6);
  sprite.xoffset = data.readInt16LE(offset + 8);
  sprite.yoffset = data.readInt16LE(offset + 10);

  // 16-bit unsigned int
  sprite.flags = maskFlags(data.readUInt16LE(offset + 12));

  // ...and another 16-bit unsigned int for padding

  return sprite;
}

function hexDict(o) {
  var op = {};
  for (var k in o) {
    op[k] = '0x' + o[k].toString(16);
  }
  return op;
}

module.exports = function(data) {
  var sprites = [];

  for (var i = 0; i < data.length; i+= 16) {
    sprites.push(readChunk(data, i));
  }
  return sprites;
};
