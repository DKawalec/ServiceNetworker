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
      var commonNeighbours = calc.findCommonNeighbours(data.links, i, j),
          neighbourWeights = data.linkWeights.filter(function(e, i) {
            return commonNeighbours.indexOf(i) !== -1;
          });

      result.push({source: i, target: j, score: calc.calcPower(commonNeighbours, neighbourWeights)});
    }
  }

  res.status(200).json(result);
});

module.exports = router;
