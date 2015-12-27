app.controller('NoSViewController', ['$scope', '$document', 'FilesService', function($scope, $document, FilesService) {
  $scope.xmlData = {};
  $scope.csvData = {};

  $scope.nos = {
      graph: {}
  };

  $scope.stats = {};

  function calculateStats() {
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

    $scope.stats.numberOfServices = nodes.length;
    $scope.stats.inputsTotal = inputs.length;
    $scope.stats.inputsAverage = inputs.length/nodes.length;
    $scope.stats.outputsTotal = outputs.length;
    $scope.stats.outputsAverage = outputs.length/nodes.length;
    $scope.stats.connectionsTotal = connections.length;
    $scope.stats.connectionsAverage = connections.length/nodes.length;
    
    $scope.nos.graph.connections = connections;
  }

  $scope.uploadXML = function() {
    $scope.xmlData.files = document.querySelectorAll('#xmlFile')[0].files;
    FilesService.uploadXML($scope.xmlData)
    .then(function(response) {
      $scope.nos = response.data;
      calculateStats();
    }).catch(function(error) {
      console.log(error);
    });
  };

  $scope.uploadCSV = function() {
    $scope.csvData.files = document.querySelectorAll('#csvFile')[0].files;
    FilesService.uploadCSV($scope.csvData)
    .then(function(response) {
      console.log(response);
    }).catch(function(error) {
      console.log(error);
    });
  };
}]);