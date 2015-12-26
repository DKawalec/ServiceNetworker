app.controller('NoSViewController', ['$scope', '$document', 'FilesService', function($scope, $document, FilesService) {
  $scope.xmlData = {};
  $scope.csvData = {};

  $scope.nos = {};

  $scope.stats = {};

  function calculateStats() {
    var nodes = $scope.nos.graph.nodes,
      inputs = Array.concat.apply([], nodes.map(function(e) {
        return e.functionalDescription.inputs;
      })),
      outputs = Array.concat.apply([], nodes.map(function(e) {
        return e.functionalDescription.outputs;
      })),
      connections = 0;
    inputs.forEach(function(e) {
      connections += outputs.filter(function(f) {
        return f.dataType === e.dataType;
      }).length;
    });

    $scope.stats.numberOfServices = nodes.length;
    $scope.stats.inputsTotal = inputs.length;
    $scope.stats.inputsAverage = inputs.length/nodes.length;
    $scope.stats.outputsTotal = outputs.length;
    $scope.stats.outputsAverage = outputs.length/nodes.length;
    $scope.stats.connectionsTotal = connections;
    $scope.stats.connectionsAverage = connections/nodes.length;
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