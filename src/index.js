var fs = require('fs');
var dataFile = fs.readFileSync('./data/csg1i.dat');
var spriteFile = fs.readFileSync('./data/CSG1.dat');

var readSpriteData = require('./src/readSpriteData');

function loadDirect(sprite) {
}

var sprites = readSpriteData(fs.readFileSync(dataFile));

var direct = sprites.filter(function(sprite) {
  return sprite.flags === 1;
});
