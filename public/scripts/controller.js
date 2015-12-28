app.controller('NoSViewController', ['$scope', '$document', 'FilesService', function($scope, $document, FilesService) {
  $scope.xmlData = {};
  $scope.csvData = {};

  $scope.nos = {
      graph: {}
  };
  $scope.dnos = {
    connections: []
  };

  $scope.stats = {};

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
    $scope.stats.totalTime = Math.floor((last-first) / 1000) + ' seconds';
  }

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
    }).catch(function(error) {
      console.log(error);
    });
  };
}]);