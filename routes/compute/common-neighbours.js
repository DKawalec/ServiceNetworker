var app        = require('express');
var router     = app.Router();
var jsonParser = require('body-parser').json();

/* GET csv handling site. */
router.post('/', jsonParser, function (req, res) {
  var data     = req.body,
      numNodes = data.nodeWeights ? data.nodeWeights.length : 0,
      result   = [];

  for(var i = 0; i < numNodes; i++) {
    for(var j = 0; j < numNodes; j++) if (i !== j ) {
      var commonNeighbours = findCommonNeighbours(data.links, i, j),
          neighbourWeights = data.linkWeights.filter(function(e, i) {
            return commonNeighbours.indexOf(i) !== -1;
          });

      result.push({source: i, target: j, score: calcPower(commonNeighbours, neighbourWeights)});
    }
  }

  res.status(200).json(result);
});

function isNoLink(links, i, j) {
  return !links.some(function (e) {
    return (e.source === i || e.source === j) && (e.target === i || e.target === j);
  });
}

// returns link indices
function getNeighbours(links, nodeIndex) {
  return links.map(function(e, i) {
    return i;
  }).filter(function (e, i) {
    return links[i].source === nodeIndex || links[i].target === nodeIndex;
  });
}

function getCommonPart(array1, array2) {
  return array1.filter(function (e) {
    return array2.indexOf(e) !== -1;
  }).concat(array2.filter(function (e) {
    return array1.indexOf(e) !== -1;
  }));
}

function duplicateRemoval(array) {
  var result = [];

  array.forEach(function (e) {
    if (result.indexOf(e) === -1) result.push(e);
  });

  return result;
}

function findCommonNeighbours(links, i, j) {
  var neighI = getNeighbours(links, i),
      neighJ = getNeighbours(links, j);

  return duplicateRemoval(getCommonPart(neighI, neighJ));
}

function calcPower(links, weights) {
  var totalWeight = weights.length ? weights.reduce(function(e, f) {
        return e + f;
      }) : 0, 
      avgWeight   = links.length ? totalWeight / links.length : 0;

  return avgWeight;
}

module.exports = router;
