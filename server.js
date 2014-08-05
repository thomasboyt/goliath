var express = require('express');

var drawSprite = require('./src/drawSprite');

var app = express();

app.get('/sprites/:id', function(req, res) {
  var canvas = drawSprite(req.params.id);
  res.render('viewer.hbs', { dataURL: canvas.toDataURL() });
});

app.listen(3000);
