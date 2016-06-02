var app    = require('express');
// var path = require('path');
var router = app.Router();
var csv    = require('csv');
var fs     = require('fs');

/* GET csv handling site. */
router.get('/', function (req, res, next) {
  res.render('csv', {});
});

/* POST csv users listing for conversion. */
router.post('/convert', function (req, res, next) {
  if (req.files && req.files.csvFile) { 
    var filePath = req.files.csvFile.path;
    if (req.files.csvFile.extension === 'csv') {
      var fileName = req.files.csvFile.name;
      
      fs.readFile(filePath, {encoding: 'utf-8'}, function (err, data) {
        if (err) res.status(400).render('error', { message: 'Error processing file', error: err });
        else {
          csv.parse(data, {comment: '//', delimiter: ';', rowDelimiter: '\n'}, function (err, output) {
            if (err) res.status(400).render('error', { message: 'Error parsing CSV file. Check file syntax before trying again', error: err });
            else {
              var transformedData = transformData(output); 
              csv.stringify(transformedData, {}, function (err, output) {
                if (err) res.status(400).render('error', { message: 'The CSV file seemed fine, but data transformation failed. Check file formatting or contact the developer', error: err });
                else {
                  var resultFilePath,
                    path = filePath.split('\\');
                  path[1] = 'result_'+path[1];
                  resultFilePath = path.join('//');
                  fs.writeFile(resultFilePath, output, function (err) {
                    if (err) res.status(400).render('error', { message: 'Error writing results file. This is embarassing.', error: err });
                    else {
                      res.status(200).download(resultFilePath, 'result.csv');
                      fs.unlinkSync(filePath);
                    }
                  });
                }
              })
            }
          });
        }
      });
    } else {
      res.status(400).render('error', { message: 'Wrong file type! Only CSV files are accepted.', error: { status: 400 } });
      fs.unlinkSync(filePath);
    }
  } else res.status(400).render('error', { message: 'No file was sent.', error: { status: 400 } });
});

function transformData(array) {
  var chunk,
    result = [],
    i;
  for (i = 0; i < array.length; i++) {
    if (array[i].length === 3) chunk = [];
    chunk.push(array[i]);
    if (array[i].length === 2) result = result.concat(parseChunk(chunk));
  }
  return result;
}

function parseChunk(chunk) {
  var user, servId,
    result = [],
    topRow = chunk[0],
    servName, servTime, commTime, inputSize, outputSize,
    i, j, k;
  user = topRow[0];
  servId = topRow[1];
  for (i = 1; i < chunk.length-1; i++) {
    servName = chunk[i][0];
    inputSize = parseInt(chunk[i][2]);
    j = 3 + inputSize;
    outputSize = parseInt(chunk[i][j]);
    servTime = chunk[i][j+outputSize+1];
    commTime = chunk[i][j+outputSize+2];
    /* remember kids, this is the BAD way to code */
    for (outputSize += j; j < outputSize; j++)
      if (chunk[i][j+1] !== '#End')
        result.push([servName, chunk[i][j+1], servTime, undefined, commTime, servId, user]);
    /* check all results and add service execution time if needed */
    for (k = 0; k < result.length; k++)
      if (result[k][1] === servName) result[k][3] = servTime;
  }
  return result;
};

/* POST csv users listing to get JSON usage data. */
router.post('/', function (req, res, next) {
  var save = JSON.parse(req.body.data);
  if (req.files && req.files.csvFile) { 
    var filePath = req.files.csvFile.path;
    if (req.files.csvFile.extension === 'csv') {
      var fileName = req.files.csvFile.name;
      
      fs.readFile(filePath, {encoding: 'utf-8'}, function (err, data) {
        if (err) res.status(400).render('error', { message: 'Error processing file', error: err });
        else {
          csv.parse(data, {comment: '//', delimiter: ';', rowDelimiter: '\n'}, function (err, output) {
            if (err) res.status(400).render('error', { message: 'Error parsing CSV file. Check file syntax before trying again', error: err });
            else {
              var endResult = extractData(output);
              if (save.archive && save.archiveName) fs.writeFile((process.env.OPENSHIFT_DATA_DIR || 'archive') + '\\dnos\\' + save.archiveName + '.json', JSON.stringify(endResult), function(err) {
                res.status(200).json(endResult);
              });
              else res.status(200).json(endResult);
              fs.unlinkSync(filePath);
            }
          });
        }
      });
    } else {
      res.status(400).render('error', { message: 'Wrong file type! Only CSV files are accepted.', error: { status: 400 } });
      fs.unlinkSync(filePath);
    }
  } else res.status(400).render('error', { message: 'No file was sent.', error: { status: 400 } });
});

// array of arrays
function extractData(array) {
  return array.filter(function(e) {
    return e instanceof Array && e.length >= 8;
  }).map(function(e, i) {
    var numberOfInputs = parseInt(e[2]),
      numberOfOutputs = parseInt(e[3+numberOfInputs]),
      offsetTotal = numberOfInputs+numberOfOutputs;
    return {
      nodeId: e[0],
      startTime: e[1],
      sources: e.slice(3, 3+numberOfInputs),
      targets: e.slice(4+numberOfInputs, 4+offsetTotal),
      duration: parseInt(e[4+offsetTotal], 10) + parseInt(e[5+offsetTotal], 10)
    };
  });
}

module.exports = router;
