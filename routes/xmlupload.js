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
  var save = JSON.parse(req.body.data);
  if (req.files && req.files.xmlFile) { 
    var xmlFiles = req.files.xmlFile instanceof Array ?
      req.files.xmlFile.filter(function(e) {
        return e.extension === 'xml';
      }) :
      req.files.xmlFile.extension === 'xml' ?
        [req.files.xmlFile] : [],
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
              else {
                deferred.resolve(result);
              }
            });
          }
          fs.unlinkSync(filePath);
        });

      });

      q.all(promises).then(function(result) {
        var endResult = flattenJSONs(cleanDataset(aggregateJSONs(result)));
        if (save.archive && save.archiveName) fs.writeFile((process.env.OPENSHIFT_DATA_DIR || 'archive') + '\\nos\\' + save.archiveName + '.json', JSON.stringify(endResult), function(err) {
          res.status(200).json({graph: { nodes: endResult } });
        });
        else res.status(200).json({graph: { nodes: endResult } });
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

function cleanDataset(arr) {
  var noControls = arr.filter(function(e) {
      return !(e.nodeType[0] === 'Control' && e.controlType[0] === '#start' || e.controlType[0] === '#end');
    }),
    usedIds = [];

  return noControls.filter(function(e) {
    var result = usedIds.indexOf(e.nodeId[0]) === -1;
    if (result) usedIds.push(e.nodeId[0]);
    return result;
  });
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
          if (e[j].length === 1) {
            var el = e[j][0];
            if (el instanceof Object && Object.keys(el).length === 1) {
              var propNames = [j.substring(0, j.length-1), j.substring(0, j.length-2)];
              if (el.hasOwnProperty(propNames[0])) a[i][j] = flattenJSONs(el[propNames[0]]);
              else if (el.hasOwnProperty(propNames[1])) a[i][j] = flattenJSONs(el[propNames[1]]);
            }   
            else a[i][j] = flattenJSONs(e[j])[0];
          }
          else a[i][j] = flattenJSONs(e[j]);
        }
      }
    }
  });
  return jsons;
}

module.exports = router;
