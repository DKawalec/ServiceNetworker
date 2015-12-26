app.service('FilesService', function($http) {
    
    this.uploadXML = function(input) {
      var fd = new FormData();
      for (var i = 0; i < input.files.length; i++) fd.append('xmlFile', input.files[i]);
      delete input.files;
      fd.append('data', JSON.stringify(input));

      return $http.post('/xmlupload', fd, {
        withCredentials : false,
        headers : {
          'Content-Type' : undefined
        },
        transformRequest : angular.identity
      });
    };

    this.uploadCSV = function() {
      var fd = new FormData();
      for (var i = 0; i < input.files.length; i++) fd.append('csvFile', input.files[i]);
      delete input.files;
      fd.append('data', JSON.stringify(input));

      return $http.post('/csvupload', fd, {
        withCredentials : false,
        headers : {
          'Content-Type' : undefined
        },
        transformRequest : angular.identity
      });
    };
  });