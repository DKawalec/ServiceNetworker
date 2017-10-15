module.exports = {
  isNoLink: function (links, i, j) {
    return !links.some(function (e) {
      return (e.source === i || e.source === j) && (e.target === i || e.target === j);
    });
  },

  // returns node and link indexes
  getNeighbours: function (links, nodeIndex) {
    return links.filter(function (e, i) {
      e.index = i;
      return e.source === nodeIndex || e.target === nodeIndex;
    }).map(function(e) {
      return { node: e.source === nodeIndex ? e.target : e.source, index: e.index};
    });
  },

  // checking with link indexes
  getWeights: function(links, weights) {
    return weights.filter(function(e, i) {
      return links.some(function(f) {
        return f.index === i;
      });
    })
  },

  getCommonPart: function (array1, array2) {
    return array1.filter(function (e) {
      return array2.some(function(f) {
        return f.node === e.node;
      });
    }).concat(array2.filter(function (e) {
      return array1.some(function(f) {
        return f.node === e.node;
      });
    }));
  },

  duplicateRemoval: function (array) {
    var result = [];

    array.forEach(function (e) {
      if (result.indexOf(e) === -1) result.push(e);
    });

    return result;
  },

  findCommonNeighbours: function (links, i, j) {
    var neighI = this.getNeighbours(links, i),
        neighJ = this.getNeighbours(links, j);

    return this.getCommonPart(neighI, neighJ);
  },

  findFarNeighbours: function (links, i, j) {
    var self = this,
        commonNeighbours = self.duplicateRemoval(self.findCommonNeighbours(links, i, j).map(function(e) { return e.node })),
        farNeighbours = [];

    commonNeighbours.forEach(function(e) {
      farNeighbours.push(self.getNeighbours(links, e));
    });

    return farNeighbours;
  },

  // links - array of arrays (see above function)
  calcFarNeighbourScores: function (links, weights) {
    var self = this,
        result = [];

    if (links.length) {
      links.forEach(function(e) {
        result.push(self.getWeights(e, weights));
      });

      return result.map(function (e) {
        var pow = self.calcPower(e);
        return pow ? 1 / pow : 0;
      });
    } else return false;
  },

  calcPower: function (weights) {
    var totalWeight = weights.length ? weights.reduce(function(e, f) {
          return e + f;
        }) : 0, 
        result   = Math.log(1 + totalWeight);

    return result;
  }
};