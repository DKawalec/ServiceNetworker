var app  = require('express'),
  // path = require('path'),
  router = app.Router(),
  xml2js = require('xml2js'),
  fs     = require('fs'),
  q      = require('q');

/* GET xml handling site. */
router.get('/', function (req, res, next) {
  res.render('xml', {});
});

/* POST xml service description. */
router.post('/', function (req, res, next) {
  if (req.files && req.files.xmlFile) { 
    var xmlFiles = req.files.xmlFile instanceof Array ?
      req.files.xmlFile.filter(function(e) {
        return e.extension === 'xml';
      }) :
      req.files.xmlFile.extension === 'xml' ?
        [req.files.xmlFile.extension] : [],
      promises = [];
    
    if(xmlFiles.length) {
      xmlFiles.forEach(function(e, i) {
        var deferred = q.defer(),
          filePath = e.path;
        promises.push(deferred.promise);

        fs.readFile(filePath, {encoding: 'utf-8'}, function (err, data) {
          if (err) deferred.reject(err);
          else {
            var parser = new xml2js.Parser();
            parser.parseString(data, function (err, result) {
              if (err) deferred.reject(err);
              else deferred.resolve(result);
            });
          }
        });
      });

      q.all(promises).then(function(result) {

        res.status(200).send({graph: { nodes: cleanDataset(flattenJSONs(aggregateJSONs(result))) } });
      }, function (error) {
        res.status(400).render('error', { message: 'Error processing file #' + (i+1), error: err });
      });
    } else {
      res.status(400).render('error', { message: 'Wrong file type! Only XML files are accepted.', error: { status: 400 } });
    }
  } else res.status(400).render('error', { message: 'No file was sent.', error: { status: 400 } });
});

function aggregateJSONs(jsons) {
  var result = jsons.map(function(e) {
    return e.graph.nodes[0].node;
  }), temp = [];
  result.forEach(function(e) {
    temp.push.apply(temp, e);
  });
  result = temp;
  return result;
}

function flattenJSONs(jsons) {
  jsons.forEach(function(e, i, a) {
    if (e instanceof Array) {
      if (e.length === 1) a[i] = flattenJSONs(e)[0];
      else a[i] = flattenJSONs(e);
    }
    else if (e instanceof Object) {
      for (var j in e) if (e.hasOwnProperty(j)) {
        if (e[j] instanceof Array) {
          if (e[j].length === 1) a[i][j] = flattenJSONs(e[j])[0];
          else a[i][j] = flattenJSONs(e[j]);
        }   
      }
    }
  });
  return jsons;
}

function cleanDataset(arr) {
  return arr.filter(function(e) {
    return !(e.nodeType === 'Control' && e.controlType === '#start' || e.controlType === '#end');
  });
}

module.exports = router;
