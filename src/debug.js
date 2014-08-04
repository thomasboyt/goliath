module.exports = {
  asciify: function(p) {
    var a = [];
    var row = [];

    for (var i = 0; i < p.length; i++) {
      row.push(p[i] > 0 ? 'X' : ' ');
      if ((i+1) % sd.width === 0) {
        a.push(row.join(''));
        row = [];
      }
    }

    return a.join('\n');
  }
};
