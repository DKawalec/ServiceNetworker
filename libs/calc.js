module.exports = {
  isNoLink: function (links, i, j) {
    return !links.some(function (e) {
      return (e.source === i || e.source === j) && (e.target === i || e.target === j);
    });
  },

  // returns link indexes
  getNeighbours: function (links, nodeIndex) {
    return links.map(function(e, i) {
      return i;
    }).filter(function (e, i) {
      return links[i].source === nodeIndex || links[i].target === nodeIndex;
    });
  },

  // links = array of INDEXES
  getWeights: function(links, weights) {
    return weights.filter(function(e, i) {
      return links.indexOf(i) !== -1;
    })
  },

  getCommonPart: function (array1, array2) {
    return array1.filter(function (e) {
      return array2.indexOf(e) !== -1;
    }).concat(array2.filter(function (e) {
      return array1.indexOf(e) !== -1;
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

    return this.duplicateRemoval(this.getCommonPart(neighI, neighJ));
  },

  calcPower: function (links, weights) {
    var totalWeight = weights.length ? weights.reduce(function(e, f) {
          return e + f;
        }) : 0, 
        result   = Math.log(1 + totalWeight);

    return result;
  }
};