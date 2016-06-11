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
      var neighboursI      = calc.getNeighbours(data.links, i),
          neighboursJ      = calc.getNeighbours(data.links, j),
          weightsI         = calc.getWeights(neighboursI, data.linkWeights),
          weightsJ         = calc.getWeights(neighboursJ, data.linkWeights),
          powI             = calc.calcPower(neighboursI, weightsI),
          powJ             = calc.calcPower(neighboursJ, weightsJ),
          commonNeighbours = calc.findCommonNeighbours(data.links, i, j),
          neighbourWeights = calc.getWeights(commonNeighbours, data.linkWeights),
          minimumPower     = Math.min(powI, powJ),
          score            = minimumPower ? calc.calcPower(commonNeighbours, neighbourWeights) / minimumPower : 0;

      result.push({source: i, target: j, score: score});
    }
  }

  res.status(200).json(result);
});

module.exports = router;
