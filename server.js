var express = require('express');

var getSprite = require('./src').getSprite;

var app = express();

app.get('/sprites/:id', function(req, res) {
  var id = parseInt(req.params.id, 10);
  var paletteId = req.query.palette_id || 0;
  var sprite = getSprite(id, paletteId);

  res.render('viewer.hbs', {
    id: id,
    next: id + 1,
    last: id - 1,
    dataURL: sprite.canvas.toDataURL(),
    meta: {
      decAddress: sprite.meta.startAddress,
      hexAddress: sprite.meta.startAddress.toString(16)
    }
  });
});

app.listen(3000);
