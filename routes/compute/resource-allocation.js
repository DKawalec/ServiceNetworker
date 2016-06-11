var app        = require('express');
var router     = app.Router();
var jsonParser = require('body-parser').json();
var calc       = require('../../libs/calc');

router.post('/', jsonParser, function (req, res) {
  var data     = req.body,
      numNodes = data.nodeWeights ? data.nodeWeights.length : 0,
      result   = [];

  for(var i = 0; i < numNodes; i++) {
    for(var j = 0; j < numNodes; j++) if (i !== j ) {
      var farNeighbours = calc.findFarNeighbours(data.links, i, j),
          farScores     = calc.calcFarNeighbourScores(farNeighbours, data.linkWeights),
          score         = farScores ? farScores.reduce(function (e, f) { return e + f; }) : 0;

      result.push({source: i, target: j, score: score});
    }
  }

  res.status(200).json(result);
});

module.exports = router;
