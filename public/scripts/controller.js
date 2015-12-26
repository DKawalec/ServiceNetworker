app.controller('NoSViewController', ['$scope', '$document', 'FilesService', function($scope, $document, FilesService) {
  $scope.xmlData = {};
  $scope.csvData = {};

  $scope.nos = {};

  $scope.stats = {};

  function calculateStats() {
    $scope.stats.numberOfServices = $scope.nos.graph.nodes.length;
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