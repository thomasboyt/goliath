var SpriteLoader = require('./SpriteLoader');
var drawSprite = require('./drawSprite');

var spriteLoader = new SpriteLoader('./data/csg1i.dat', './data/CSG1.dat');

module.exports = {
  getSprite: function(spriteIdx, paletteIdx) {
    var sprite = spriteLoader.loadSprite(spriteIdx, paletteIdx);
    sprite.canvas = drawSprite(sprite.pixelMap);
    return sprite;
  },
};
