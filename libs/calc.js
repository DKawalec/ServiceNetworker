module.exports = {
  isNoLink: function (links, i, j) {
    return !links.some(function (e) {
      return (e.source === i || e.source === j) && (e.target === i || e.target === j);
    });
  },

  // returns node indexes
  getNeighbours: function (links, nodeIndex) {
    return links.filter(function (e, i) {
      e.index = i;
      return e.source === nodeIndex || e.target === nodeIndex;
    }).map(function(e) {
      return { node: e.source === nodeIndex ? e.target : e.source, index: e.index};
    });
  },

  // links = array of INDEXES
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

  calcPower: function (weights) {
    var totalWeight = weights.length ? weights.reduce(function(e, f) {
          return e + f;
        }) : 0, 
        result   = Math.log(1 + totalWeight);

    return result;
  }
};