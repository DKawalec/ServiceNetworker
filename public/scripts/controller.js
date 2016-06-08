app.controller('NoSViewController', ['$scope', '$document', 'FilesService', function($scope, $document, FilesService) {
  $scope.hideForms = false;
  $scope.hideTimeframes = true;
  $scope.hideAlgorithms = true;

  $scope.statsNoS = true;
  $scope.statsDNoS = false;
  $scope.statsPrediction = false;

  $scope.xmlData = {};
  $scope.csvData = {};

  $scope.nos = {
      graph: {}
  };
  $scope.dnos = {
    connections: [],
    currentConnections: undefined
  };

  $scope.stats = {};

  $scope.numberOfTimeframes = 1;
  $scope.availableTimeframes = [1, 5, 10, 25, 100, 250];

  $scope.availableAlgorithms = null;
  $scope.repeatComputation = false;

  FilesService.getNoSArchive().then(function(response) {
    $scope.availableNoS = response.data.map(function(e) {
      return e.split('.')[0];
    });
  }, function(error) {
    console.log(error);
  });

  FilesService.getDNoSArchive().then(function(response) {
    $scope.availableDNoS = response.data.map(function(e) {
      return e.split('.')[0];
    });
  }, function(error) {
    console.log(error);
  });

  FilesService.getAlgorithms().then(function(response) {
    $scope.availableAlgorithms = response.data;
  }, function(error) {
    console.log(error);
  });

  function duplicateRemover(arrayOfObjects) {
    var uniques = [], weights = [];

    function isSame(obj1, obj2) {
      if (Object.keys(obj1).length !== Object.keys(obj2).length) return false;
      for (var i in obj1) if (obj1.hasOwnProperty(i)) if (obj1[i] !== obj2[i]) return false;
      return true;
    }

    return { values: arrayOfObjects.filter(function(e) {
      var exists = false;

      for (var i = 0; i < uniques.length && !exists; i++)
        if (isSame(e, uniques[i])) {
          exists = true;
          weights[i]++;
        }
        
      if (!exists) {
        uniques.push(e);
        weights.push(1);
      }
      return !exists;
    }), counter: weights };
  }

  function calculateNoSStats() {
    var nodes = $scope.nos.graph.nodes,
      inputs = Array.concat.apply([], nodes.map(function(e, i) {
        return e.functionalDescription.inputs.map(function(f) {
          return { data: f, nodeId: e.nodeId, number: i };
        });
      })),
      outputs = Array.concat.apply([], nodes.map(function(e, i) {
        return e.functionalDescription.outputs.map(function(f) {
          return { data: f, nodeId: e.nodeId, number: i };
        });
      })),
      connections = [];
    outputs.forEach(function(e) {
      var i = e.number;
      connections = connections.concat(inputs.map(function(f) {
        return { source: i, target: f.number, dataType: f.data.dataType }
      }).filter(function(f) {
        return f.dataType === e.data.dataType;
      }));      
    });

    $scope.stats = {};
    $scope.stats.numberOfServices = nodes.length;
    $scope.stats.inputsTotal = inputs.length;
    $scope.stats.inputsAverage = inputs.length/nodes.length;
    $scope.stats.outputsTotal = outputs.length;
    $scope.stats.outputsAverage = outputs.length/nodes.length;
    $scope.stats.connectionsTotal = connections.length;
    $scope.stats.connectionsAverage = connections.length/nodes.length;
    
    $scope.nos.graph.connections = connections;
    $scope.nos.nodeIds = nodes.map(function(e) {
      return e.nodeId;
    });
  }

  function calculateDNoSStats() {
    var times, first, last;
    $scope.dnos.connections = $scope.dnos.all.filter(function(e) {
      return $scope.nos.nodeIds.some(function(f) {
        return e.sources.indexOf(f) !== -1 || e.targets.indexOf(f) !== -1;
      });
    });
    times = $scope.dnos.connections.map(function(e) {
      return parseInt(e.startTime, 10);
    }),
    first = times.reduce(function (e, f) {
      return e < f ? e : f;
    }),
    last = times.reduce(function (e, f) {
      return e > f ? e : f;
    });
    
    $scope.stats.totalCalls = $scope.dnos.all.length;
    $scope.stats.repositoryCalls = $scope.dnos.connections.length;
    $scope.stats.usableData = Math.floor($scope.stats.repositoryCalls/$scope.stats.totalCalls * 100) + '%';
    $scope.stats.totalTime = (last-first);
    $scope.stats.timeframeLength = Math.floor($scope.stats.totalTime / $scope.numberOfTimeframes);

    $scope.timeStart = $scope.first = first;
    $scope.timeEnd = $scope.last = last;

    $scope.$watch('numberOfTimeframes', function(newVals, oldVals) {
      $scope.stats.timeframeLength = Math.floor($scope.stats.totalTime / newVals);
    }, true);
  }

  function getDnosTimewindow(start, end) {
    var current = $scope.dnos.connections.filter(function(e) {
        return parseInt(e.startTime, 10) >= start && parseInt(e.startTime, 10) <= end;
      }),
      nodeWeights = $scope.nos.nodeIds.map(function(e) {
        return current.filter(function(f) {
          return f.nodeId === e;
        }).length;
      }),
      totalWeight = nodeWeights.reduce(function(a, b) {
        return a + b;
      }),
      links = Array.concat.apply([], current.map(function(e) {
        var result = [];
        e.targets.forEach(function(f) {
          result.push({ source: $scope.nos.nodeIds.indexOf(e.nodeId), target: $scope.nos.nodeIds.indexOf(f)})
        });
        return result;
      })).filter(function(e) {
        return e.target !== -1 && e.source !== -1;
      }),
      cleanLinks = duplicateRemover(links);
    return {
      nodeWeights: nodeWeights,
      totalWeight: totalWeight,
      links: cleanLinks.values,
      linkWeights: cleanLinks.counter,
      linksTotal: links.length
    };
  }

  $scope.applyTimeframe = function() {
    $scope.dnos.currentConnections = getDnosTimewindow($scope.timeStart, $scope.timeEnd)
  };

  $scope.uploadXML = function() {
    $scope.xmlData.files = document.querySelectorAll('#xmlFile')[0].files;
    FilesService.uploadXML($scope.xmlData)
    .then(function(response) {
      $scope.nos = response.data;
      calculateNoSStats();
    }).catch(function(error) {
      console.log(error);
    });
  };

  $scope.uploadCSV = function() {
    $scope.csvData.files = document.querySelectorAll('#csvFile')[0].files;
    FilesService.uploadCSV($scope.csvData)
    .then(function(response) {
      $scope.dnos.all = response.data;
      calculateDNoSStats();
      $scope.hideForms = true;
      $scope.hideArchives = true;
      $scope.hideTimeframes = false;
    }).catch(function(error) {
      console.log(error);
    });
  };

  $scope.loadNoS = function() {
    FilesService.getNoS($scope.nosArchiveSelection)
    .then(function(response) {
      $scope.nos = response.data;
      $scope.dnos = {
        connections: [],
        currentConnections: undefined
      };
      calculateNoSStats();
    }).catch(function(error) {
      console.log(error);
    });
  };
  $scope.loadDNoS = function() {
    FilesService.getDNoS($scope.dnosArchivesSelection)
    .then(function(response) {
      $scope.dnos.all = response.data;
      calculateDNoSStats();
      $scope.hideForms = true;
      $scope.hideArchives = true;
      $scope.hideTimeframes = false;
    }).catch(function(error) {
      console.log(error);
    });
  };

  $scope.runComputation = function() {
    console.log($scope.dnos, $scope.repeatComputation)
    if ($scope.repeatComputation) {

    }
    else FilesService.predict($scope.algorithmSelection.endpoint, $scope.dnos.currentConnections || {})
    .then(function(response) {
      console.log(response);
    }).catch(function(error) {
      console.log(error);
    });
  };

  $scope.showStats = function(toShow) {
    $scope.statsNoS = false;
    $scope.statsDNoS = false;
    $scope.statsPrediction = false;
    $scope[toShow] = true;
  };
}]);