var app        = require('express');
var router     = app.Router();
var jsonParser = require('body-parser').json();
var calc       = require('../../libs/calc');

/* GET csv handling site. */
router.post('/', jsonParser, function (req, res) {
  var data     = req.body,
  numNodes = data.nodeWeights ? data.nodeWeights.length : 0,
  result   = [];

  for(var i = 0; i < numNodes; i++) {
    for(var j = 0; j < numNodes; j++) if (i !== j ) {
      var neighboursI = calc.getNeighbours(data.links, i),
          neighboursJ = calc.getNeighbours(data.links, j),
          weightsI    = calc.getWeights(neighboursI, data.linkWeights),
          weightsJ    = calc.getWeights(neighboursJ, data.linkWeights),
          score       = calc.calcPower(neighboursI, weightsI) * calc.calcPower(neighboursJ, weightsJ);

      result.push({source: i, target: j, score: score});
    }
  }

  res.status(200).json(result);
});

module.exports = router;
