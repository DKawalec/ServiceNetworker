app.service('FilesService', function($http) {
    
    this.getNoSArchive = function() {
      return $http.get('/archive/nos');
    };

    this.getDNoSArchive = function() {
      return $http.get('/archive/dnos');
    };

    this.getNoS = function(name) {
      return $http.get('/archive/nos/' + name);
    };

    this.getDNoS = function(name) {
      return $http.get('/archive/dnos/' + name);
    };

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

    this.uploadCSV = function(input) {
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